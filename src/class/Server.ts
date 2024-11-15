import chalk from "chalk";
import express, { type Application } from "express";

export class Server {

	// The instance of the express server
	protected static readonly app = express();

	// The listener for the server
	protected static listener: ReturnType<typeof Server.app.listen>;
    
	// The port to listen on
	protected static PORT = parseInt(process.env.PORT ?? "8000");

	// The host to listen on
	protected static HOST = process.env.HOST ?? "0.0.0.0";

	/**
	 * Start the Bubble server
	 */
	public static async start() {

		// Start the bubble server
		return new Promise<void>(function(resolve, reject: (error: string) => void) {

			Server.listener = Server.app

				// Attempt to start the server
				// .listen(Server.PORT, Server.HOST, () => resolve({ HOST: Server.HOST, PORT: Server.PORT }))
				.listen(Server.PORT, Server.HOST, function() {
					console.log(chalk.blue("[INFO]"), "Server started on", chalk.cyan(`http://${ Server.HOST }:${ Server.PORT }`));
					resolve();
				})

				// If the server fails to start, 
				.on("error", (error: { code: string }) => reject(error.code));

		});
		
	}

	/**
	 * Stop the Bubble server
	 */
	public static stop() {
		return new Promise<void>(function(resolve) {
			console.log("Server shutting down");
			Server.listener.close(() => resolve());
		});
	}

	/**
	 * Wrap an express method to catch errors asynchronously
	 * @param method The express method to wrap
	 */
	private static wrap(method: typeof Server.app.use) {
		return function(path: string, handler: (req: express.Request, res: express.Response, next: express.NextFunction) => unknown) {
			method.call(Server.app, path, async function(req, res, next) {
				try {
					await handler(req, res, next);
				} catch (error) {
					next(error);
				}
			} as Application);
		};
	}
    
	public static DELETE = Server.wrap(Server.app.delete);
	public static GET = Server.wrap(Server.app.get);
	public static PATCH = Server.wrap(Server.app.patch);
	public static POST = Server.wrap(Server.app.post);
	public static PUT = Server.wrap(Server.app.put);
    
}