import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../commands/index";
import { captureOutput } from "./output-capture";
import { ensureRepo, ensureAuth } from "./guards";

/**
 * Registers all gdit tools with the MCP server.
 * Each tool uses scoped output capture and environment guards.
 */
export function registerTools(server: McpServer) {

    // Helper to wrap commands with guards and capture
    const wrap = (fn: (...args: any[]) => Promise<void>, requirements: { repo?: boolean; auth?: boolean } = {}) => {
        return async (args: any = {}) => {
            if (requirements.repo) {
                const guard = await ensureRepo();
                if (!guard.valid) return { content: [{ type: "text" as const, text: guard.error! }], isError: true };
            }
            if (requirements.auth) {
                const guard = await ensureAuth();
                if (!guard.valid) return { content: [{ type: "text" as const, text: guard.error! }], isError: true };
            }

            const output = await captureOutput(async () => {
                await fn(args);
            });
            return { content: [{ type: "text" as const, text: output }] };
        };
    };

    // --- BASIC TOOLS ---

    server.tool("gdit_status", "Get current status of the repository", {},
        wrap(async () => await commands.handleStatus(), { repo: true }));

    server.tool("gdit_whoami", "Show current user info and Google Drive quota", {},
        wrap(async () => await commands.handleWhoami(), { auth: true }));

    server.tool("gdit_remote_info", "Show remote Google Drive folder information", {},
        wrap(async () => await commands.handleRemote(), { repo: true }));

    server.tool("gdit_help", "Show gdit help information", {},
        wrap(async () => await commands.handleHelp()));

    server.tool("gdit_list_remote", "List files directly from the linked Google Drive folder", {},
        wrap(async () => await commands.handleListRemote(), { repo: true, auth: true }));

    // --- REPO MANAGEMENT ---

    server.tool("gdit_init", "Initialize a new gdit repository in the current folder", {},
        wrap(async () => await commands.handleInit(), { auth: true }));

    server.tool("gdit_clone", "Clone a remote Google Drive folder by ID",
        { folderId: z.string().describe("The Google Drive folder ID to clone") },
        wrap(async (args) => await commands.handleClone(args.folderId), { auth: true }));

    // --- GIT-FLOW TOOLS ---

    server.tool("gdit_add", "Stage files for commit",
        { files: z.array(z.string()).describe("Paths of files to stage (use ['.'] for all)") },
        wrap(async (args) => await commands.handleAdd(args.files), { repo: true }));

    server.tool("gdit_commit", "Commit staged files",
        { message: z.string().describe("Commit message") },
        wrap(async (args) => await commands.handleCommit(args.message), { repo: true }));

    server.tool("gdit_push", "Push local commits to Google Drive", {},
        wrap(async () => await commands.handlePush(), { repo: true, auth: true }));

    server.tool("gdit_pull", "Pull latest changes from Google Drive",
        {
            files: z.array(z.string()).optional().describe("Specific files to pull"),
            force: z.boolean().optional().describe("Force pull without confirmation")
        },
        wrap(async (args) => await commands.handlePull({ files: args.files || [], force: args.force }), { repo: true, auth: true }));

    server.tool("gdit_log", "View commit history",
        { limit: z.number().optional().describe("Number of commits to show") },
        wrap(async (args) => await commands.handleLog({ limit: args.limit }), { repo: true }));

    server.tool("gdit_diff", "Compare local files with remote", {},
        wrap(async () => await commands.handleDiff(), { repo: true, auth: true }));
}
