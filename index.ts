// Start an http server on port 8000

import { serve } from "bun";

serve({
	port: 8000,
	fetch(req) {
		const url = new URL(req.url);
		if (url.pathname === "/") return new Response("Home page");
		return new Response("404!");
	},
});