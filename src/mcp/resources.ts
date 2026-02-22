import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as config from "../core/config";
import { readJsonFile } from "../utils/files";

/**
 * Registers standard gdit resources with the MCP server.
 */
export function registerResources(server: McpServer) {
    server.resource(
        "gdit_config",
        "gdit://config",
        async (uri) => {
            const configPath = config.getConfigPath();
            try {
                const data = await readJsonFile(configPath, {});
                return {
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify(data, null, 2),
                        mimeType: "application/json"
                    }]
                };
            } catch (e) {
                return {
                    contents: [{
                        uri: uri.href,
                        text: "{\"error\": \"Config file not found or unreadable\"}",
                        mimeType: "application/json"
                    }]
                };
            }
        }
    );

    server.resource(
        "gdit_remote",
        "gdit://remote",
        async (uri) => {
            const remotePath = config.getRemotePath();
            try {
                const data = await readJsonFile(remotePath, {});
                return {
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify(data, null, 2),
                        mimeType: "application/json"
                    }]
                };
            } catch (e) {
                return {
                    contents: [{
                        uri: uri.href,
                        text: "{\"error\": \"Remote info file not found or unreadable\"}",
                        mimeType: "application/json"
                    }]
                };
            }
        }
    );
}
