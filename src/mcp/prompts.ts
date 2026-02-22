import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers standardized gdit workflows as MCP prompts.
 */
export function registerPrompts(server: McpServer) {
    server.prompt(
        "gdit_summary",
        "Summarize the current state of the gdit repository",
        async () => {
            return {
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: "Please run gdit_status and gdit_whoami, then summarize the current repository state and my available storage quota."
                    }
                }]
            };
        }
    );

    server.prompt(
        "gdit_sync_guide",
        "Guide through the gdit workflow (add, commit, push)",
        async () => {
            return {
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: "I want to sync my changes. Please check gdit_status first, then help me stage (gdit_add), commit (gdit_commit), and push (gdit_push) my work."
                    }
                }]
            };
        }
    );
}
