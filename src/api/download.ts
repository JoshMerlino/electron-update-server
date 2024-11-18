import chalk from "chalk";
import semver from "semver";
import { GithubClient } from "../class/GithubClient";
import { Server } from "../class/Server";
import { streamToAsyncIterable } from "../utils";

Server.GET("/download/:filename", async function(req, res) {
	
	const release = await GithubClient.octokit.rest.repos.listReleases({
		owner: GithubClient.OWNER,
		repo: GithubClient.REPO,
	}).then(response => response.data)
		.then(releases => releases.sort((a, b) => semver.rcompare(a.tag_name, b.tag_name)))
		.then(releases => releases.find(release => release.assets.some(asset => asset.name.toLowerCase() === req.params.filename.toLowerCase())));
	
	if (!release) return res.status(404).json({ error: "No release found" });

	// Get the release manifest
	const asset = release.assets.find(asset => asset.name.toLowerCase() === req.params.filename.toLowerCase());
	if (!asset) throw new Error("No manifest found");
		
	const url = await GithubClient.octokit.repos.getReleaseAsset({
		asset_id: asset.id,
		owner: GithubClient.OWNER,
		repo: GithubClient.REPO,
		headers: { accept: "application/octet-stream" },
	}).then(response => response.url);

	console.log(chalk.blue("[INFO]"), "Serving asset", chalk.cyan(asset.name), "from", chalk.cyan(release.tag_name));

	res.setHeader("Content-Type", asset.content_type);
	res.setHeader("Content-Size", asset.size.toString());

	if (asset.content_type !== "application/octet-stream") return await fetch(url)
		.then(response => response.text())
		.then(text => res.send(text));
    
	// Download the asset
	const response = await fetch(url);
	for await (const chunk of streamToAsyncIterable(response.body)) res.write(chunk);
	res.end();
	
});