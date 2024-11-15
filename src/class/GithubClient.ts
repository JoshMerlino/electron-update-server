import { Octokit } from "@octokit/rest";

export class GithubClient {

	private static readonly TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.TOKEN || "";
	public static readonly REPO = (process.env.GITHUB_REPOSITORY || process.env.GH_REPOSITORY || process.env.REPO || process.env.REPOSITORY)?.split("/")[1] || (process.env.GITHUB_REPOSITORY || process.env.GH_REPOSITORY || process.env.REPO || process.env.REPOSITORY) || "";
	public static readonly OWNER = (process.env.GITHUB_REPOSITORY || process.env.GH_REPOSITORY || process.env.REPO || process.env.REPOSITORY)?.split("/")[0] || (process.env.GITHUB_ACTOR || process.env.GH_ACTOR || process.env.GITHUB_OWNER || process.env.GH_OWNER || process.env.OWNER) || "";
	public static readonly octokit = new Octokit({ auth: GithubClient.TOKEN });

	static {
        
		if (!GithubClient.TOKEN) throw new Error("Missing Environment Variable: `GITHUB_TOKEN`.");

		if (!GithubClient.REPO) throw new Error("Missing Environment Variable: `REPO`.");

		if (!GithubClient.OWNER) throw new Error("Missing Environment Variable: `OWNER`.");

	}

}