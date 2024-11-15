import { Glob } from "bun";
import { Server } from "./src/class/Server";

for await (const file of new Glob("./src/api/**/*.ts").scan()) await import(file);

await Server.start();