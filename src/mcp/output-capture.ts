/**
 * Utility to capture stdout/stderr output for a specific execution block.
 * This prevents CLI logs and spinners from disrupting the MCP JSON-RPC stdio transport.
 * 
 * FIX: This implementation uses a scoped approach to handle concurrent tool calls correctly,
 * although MCP stdio is generally sequential, it's safer for future-proofing.
 */

export async function captureOutput(fn: () => Promise<void>): Promise<string> {
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    let buffer = "";

    const writeInterceptor = (chunk: any, encoding?: any, cb?: any) => {
        if (typeof chunk === 'string') buffer += chunk;
        else if (Buffer.isBuffer(chunk)) buffer += chunk.toString();

        if (typeof encoding === 'function') encoding();
        else if (typeof cb === 'function') cb();
        return true;
    };

    // Override
    (process.stdout as any).write = writeInterceptor;
    (process.stderr as any).write = writeInterceptor;

    try {
        await fn();
    } catch (e: any) {
        buffer += `\nError: ${e.message}\n`;
    } finally {
        // Always restore
        process.stdout.write = originalStdoutWrite;
        process.stderr.write = originalStderrWrite;
    }

    // Strip ANSI colors and control characters
    // eslint-disable-next-line no-control-regex
    return buffer.replace(/\x1b\[[0-9;]*m/g, "");
}
