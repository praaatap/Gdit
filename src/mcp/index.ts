import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools";
import { registerResources } from "./resources";
import { registerPrompts } from "./prompts";
import { readJsonFile } from "../utils/files";
import path from "path";

/**
 * Main function to start the gdit MCP server.
 */
export async function runMcpServer() {
    // Disable logging to stdout to keep JSON-RPC channel clean
    console.info = () => { };
    console.debug = () => { };
    console.warn = () => { };
    // We keep console.error but ideally, errors should also be handled carefully

    // Get version from package.json
    let version = "3.3.0";
    try {
        const pkg = await readJsonFile<any>(path.join(__dirname, "../../package.json"), {});
        if (pkg.version) version = pkg.version;
    } catch {
        // Fallback to latest known
    }

    const server = new McpServer({
        name: "gdit",
        version: version
    });

    // Register all components
    registerTools(server);
    registerResources(server);
    registerPrompts(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
}
