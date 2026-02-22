import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as commands from "./commands/index";
import * as config from "./core/config";
import { readJsonFile } from "./utils/files";

// To avoid messing up the JSON-RPC stdio transport, we MUST intercept all
// process.stdout/stderr writes during command execution because the CLI commands write to stdout.
let outputBuffer = "";

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

function captureOutput() {
    outputBuffer = "";
    (process.stdout as any).write = (chunk: any, encoding?: any, cb?: any) => {
        if (typeof chunk === 'string') outputBuffer += chunk;
        else if (Buffer.isBuffer(chunk)) outputBuffer += chunk.toString();
        if (typeof encoding === 'function') encoding();
        else if (typeof cb === 'function') cb();
        return true;
    };
    (process.stderr as any).write = (chunk: any, encoding?: any, cb?: any) => {
        if (typeof chunk === 'string') outputBuffer += chunk;
        else if (Buffer.isBuffer(chunk)) outputBuffer += chunk.toString();
        if (typeof encoding === 'function') encoding();
        else if (typeof cb === 'function') cb();
        return true;
    };
}

function restoreOutput() {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
}

async function runWithCapture(fn: () => Promise<void>): Promise<string> {
    captureOutput();
    try {
        await fn();
    } catch (e: any) {
        outputBuffer += `\nError: ${e.message}\n`;
    } finally {
        restoreOutput();
    }
    // Remove ANSI escape codes for cleaner LLM reading
    // eslint-disable-next-line no-control-regex
    return outputBuffer.replace(/\x1b\[[0-9;]*m/g, "");
}

// Create MCP Server
const server = new McpServer({
    name: "gdit",
    version: "3.2.0"
});

// --- Resources ---

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
                    text: "{}",
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
                    text: "{}",
                    mimeType: "application/json"
                }]
            };
        }
    }
);

// --- Tools ---

server.tool(
    "gdit_status",
    "Get the current status of the gdit repository",
    {},
    async () => {
        const output = await runWithCapture(async () => {
            await commands.handleStatus();
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_whoami",
    "Show current user info and Google Drive storage quota",
    {},
    async () => {
        const output = await runWithCapture(async () => {
            await commands.handleWhoami();
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_remote_info",
    "Show information about the remote Google Drive folder",
    {},
    async () => {
        const output = await runWithCapture(async () => {
            await commands.handleRemote();
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_log",
    "View the commit history",
    { limit: z.number().optional().describe("Number of commits to show") },
    async (args) => {
        const output = await runWithCapture(async () => {
            await commands.handleLog({ limit: args.limit });
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_add",
    "Stage files for commit",
    { files: z.array(z.string()).describe("Paths of files to stage") },
    async (args) => {
        const output = await runWithCapture(async () => {
            await commands.handleAdd(args.files);
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_commit",
    "Commit staged files",
    { message: z.string().describe("Commit message") },
    async (args) => {
        const output = await runWithCapture(async () => {
            await commands.handleCommit(args.message);
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_push",
    "Push local commits to Google Drive",
    {},
    async () => {
        const output = await runWithCapture(async () => {
            await commands.handlePush();
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_pull",
    "Pull latest changes from Google Drive",
    {
        files: z.array(z.string()).optional().describe("Specific files to pull"),
        force: z.boolean().optional().describe("Force pull without confirmation")
    },
    async (args) => {
        const output = await runWithCapture(async () => {
            await commands.handlePull({ files: args.files || [], force: args.force });
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_diff",
    "Compare local files with remote",
    {},
    async () => {
        const output = await runWithCapture(async () => {
            await commands.handleDiff();
        });
        return { content: [{ type: "text", text: output }] };
    }
);

server.tool(
    "gdit_help",
    "Show gdit help information with list of available commands",
    {},
    async () => {
        const output = await runWithCapture(async () => {
            await commands.handleHelp();
        });
        return { content: [{ type: "text", text: output }] };
    }
);

// --- Prompts ---

server.prompt(
    "gdit_summary",
    "Summarize the current state of the gdit repository",
    async () => {
        return {
            messages: [{
                role: "user",
                content: {
                    type: "text",
                    text: "Please run gdit_status and gdit_whoami, then summarize the current repository state and my available storage."
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


export async function runMcpServer() {
    // When using Stdio, disable any other logging entirely to prevent disrupting the JSON-RPC stream
    console.info = () => { };
    console.debug = () => { };

    const transport = new StdioServerTransport();
    await server.connect(transport);
}
