import chalk from "chalk";
import { GithubClient } from "../class/GithubClient";
import { Server } from "../class/Server";

Server.GET("/download/:filename", async function(req, res) {
    
	// Get the latest release
	const release = await GithubClient.octokit.rest.repos.getLatestRelease({
		owner: GithubClient.OWNER,
		repo: GithubClient.REPO,
	}).then(response => response.data);

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

	if (asset.content_type !== "application/octet-stream") return await fetch(url)
		.then(response => response.text())
		.then(text => res.send(text));
    
	// Download the asset
	const binary = await fetch(url)
		.then(response => response.arrayBuffer());
	
	// Send the asset
	res.setHeader("Content-Disposition", `attachment; filename="${ asset.name }"`);
	res.setHeader("Content-Length", binary.byteLength.toString());
	res.send(Buffer.from(binary));
	
});