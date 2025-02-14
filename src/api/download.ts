import type { RestEndpointMethodTypes } from "@octokit/rest";
import chalk from "chalk";
import { coerce, rcompare, satisfies } from "semver";
import { GithubClient } from "../class/GithubClient";
import { Server } from "../class/Server";
import { streamToAsyncIterable } from "../utils";

const cache = {
	releases: [] as RestEndpointMethodTypes["repos"]["listReleases"]["response"]["data"],
	lastUpdated: 0,
};

async function getReleases() {
	if (cache.releases.length > 0 && Date.now() - cache.lastUpdated < 1000 * 60) return cache.releases;
	let page = 1;
	const releases = [];
	while (true) {
		const { data } = await GithubClient.octokit.repos.listReleases({
			owner: GithubClient.OWNER,
			repo: GithubClient.REPO,
			per_page: 100,
			page,
		});
		releases.push(...data);
		if (data.length < 100) break;
		page++;
	}
	cache.releases = releases;
	cache.lastUpdated = Date.now();
	return releases.filter(release => !release.draft);
}

const coerceChannel = ({ tag_name, prerelease }: Awaited<ReturnType<typeof getReleases>>[number]) => (tag_name.split("-")[1]?.split(".")[0] || prerelease ? "beta" : "stable") as string;

Server.GET("/download/:channelConstraints/:filename", async function(req, res) {

	// Get the channel and filename from the request
	const { channelConstraints, filename } = req.params;
	const [ channel, constraints = ">=0.0.0" ] = channelConstraints.split("@");

	// Get the releases from the GitHub API
	const releases = await getReleases();

	// Get the channels from the releases
	const channels = releases
		.map(release => coerceChannel(release))
		.filter((value, index, self) => self.indexOf(value) === index);
	
	// Make sure the requested channel exists
	if (!channels.includes(channel)) return res.status(404).json({
		error: "Unknown channel",
		message: `Channel '${ channel }' not found.`
	});

	// Get releases for the requested channel
	const release = releases
		.filter(release => coerceChannel(release) === channel || coerceChannel(release) === "stable")
		.filter(release => coerce(release.tag_name) && satisfies(coerce(release.tag_name)!.version, constraints))
		.sort((a, b) => rcompare(a.tag_name, b.tag_name))[0];
	
	// Make sure the release exists
	if (!release) return res.status(404).json({
		error: "No release found",
		message: `No release found for channel '${ channel }' with constraints '${ constraints }'.`
	});

	// Make sure the asset exists in the release
	const asset = release.assets.find(asset => asset.name.toLowerCase() === filename.toLowerCase());
	if (!asset) return res.status(404).json({
		error: "No asset found",
		message: `No suitable asset found for filename '${ filename }'.`
	});

	// Log the request
	console.log(chalk.blue("[INFO]"), "Serving", chalk.cyan(asset.name), "from release", chalk.cyan(release.tag_name));

	// Get the streamable url for the asset
	const { url } = await GithubClient.octokit.repos.getReleaseAsset({
		asset_id: asset.id,
		owner: GithubClient.OWNER,
		repo: GithubClient.REPO,
		headers: { accept: "application/octet-stream" },
	});

	// Serve the asset
	switch (asset.content_type) {
		
		// Text files
		default:
			res.setHeader("Content-Type", asset.content_type);
			res.setHeader("Content-Size", asset.size.toString());
			return await fetch(url)
				.then(response => response.text())
				.then(buffer => res.send(buffer));
		
		// Binary files
		case "application/octet-stream":
			res.setHeader("Content-Type", asset.content_type);
			res.setHeader("Content-Size", asset.size.toString());
			const response = await fetch(url);
			for await (const chunk of streamToAsyncIterable(response.body)) res.write(chunk);
			return res.end();

	}
	
});