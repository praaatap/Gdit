import * as config from "../core/config";
import { pathExists } from "../utils/files";
import { getAuthenticatedClient } from "../core/auth";

/**
 * Guards to ensure MCP tools are used in valid contexts.
 */

export async function ensureRepo(): Promise<{ valid: boolean; error?: string }> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        return {
            valid: false,
            error: "Not a gdit repository. Please use 'gdit_init' to create one or run 'gdit clone <id>'."
        };
    }
    return { valid: true };
}

export async function ensureAuth(): Promise<{ valid: boolean; error?: string }> {
    const auth = await getAuthenticatedClient();
    if (!auth) {
        return {
            valid: false,
            error: "Authentication required. Please run 'gdit login' in your local terminal."
        };
    }
    return { valid: true };
}
