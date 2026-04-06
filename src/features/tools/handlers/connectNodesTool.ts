/**
 * connect_nodes Tool - Connect two TouchDesigner nodes together
 * 
 * This tool provides a direct way to connect nodes without needing
 * to write Python scripts manually.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES } from "../../../core/constants.js";
import { handleToolError } from "../../../core/errorHandling.js";
import type { ILogger } from "../../../core/logger.js";
import type { TouchDesignerClient } from "../../../tdClient/touchDesignerClient.js";
import { formatScriptResult } from "../presenter/index.js";
import { detailOnlyFormattingSchema } from "../types.js";

// Input schema for connect_nodes tool
const connectNodesToolSchema = detailOnlyFormattingSchema.extend({
    sourcePath: z.string()
        .describe("Source node path (e.g., '/project1/noise_tex')"),
    destinationPath: z.string()
        .describe("Destination node path (e.g., '/project1/blur')"),
    inputIndex: z.number()
        .int()
        .min(0)
        .default(0)
        .describe("Input index on destination node (default: 0)"),
});

type ConnectNodesToolParams = z.input<typeof connectNodesToolSchema>;

/**
 * Generate Python script for connecting nodes
 */
function generateConnectScript(
    sourcePath: string,
    destinationPath: string,
    _inputIndex: number
): string {
    return `
import td

src = td.op('${sourcePath}')
dst = td.op('${destinationPath}')

if not src:
    raise ValueError(f"Source node not found: ${sourcePath}")
    
if not dst:
    raise ValueError(f"Destination node not found: ${destinationPath}")

try:
    # Use setInputs to connect nodes
    dst.setInputs([src])
    
    # Verify connection
    if dst.inputs and dst.inputs[0] == src:
        result = f"SUCCESS: Connected ${src.name} -> {dst.name}"
    else:
        result = f"WARNING: Connection may have failed. Please verify manually."
        
except Exception as e:
    error_msg = str(e)
    if "list assignment index out of range" in error_msg:
        raise ValueError(
            f"Cannot connect ${sourcePath} to ${destinationPath}.\\n" +
            f"The destination node may not have available input ports.\\n" +
            f"Try checking if ${destinationPath} is a TOP/CHOP/SOP that accepts inputs.\\n" +
            f"Original error: {error_msg}"
        )
    else:
        raise
`;
}

/**
 * Create a tool result with compatibility notice if present
 */
function createToolResult(tdClient: TouchDesignerClient, text: string) {
    const additionalContent = tdClient.getAdditionalToolResultContents();
    if (additionalContent) {
        return {
            content: [...additionalContent, { text, type: "text" as const }],
        };
    }
    return {
        content: [{ text, type: "text" as const }],
    };
}

/**
 * Register connect_nodes tool handler
 */
export function registerConnectNodesTool(
    server: McpServer,
    logger: ILogger,
    tdClient: TouchDesignerClient
): void {
    server.tool(
        TOOL_NAMES.CONNECT_TD_NODES,
        "Connect two TouchDesigner nodes together. " +
        "Use this to wire nodes in the TouchDesigner network. " +
        "Example: connect audio_in to noise_tex",
        connectNodesToolSchema.strict().shape,
        async (params: ConnectNodesToolParams) => {
            try {
                const { sourcePath, destinationPath, inputIndex, detailLevel, responseFormat } = params;
                
                const script = generateConnectScript(sourcePath, destinationPath, inputIndex);
                
                logger.sendLog({
                    data: `Connecting nodes: ${sourcePath} -> ${destinationPath}`,
                    level: "debug",
                });
                
                const result = await tdClient.execPythonScript({ script });
                
                if (!result.success) {
                    throw result.error;
                }
                
                const formattedText = formatScriptResult(result, script, {
                    detailLevel: detailLevel ?? "summary",
                    responseFormat,
                });
                
                return createToolResult(tdClient, formattedText);
                
            } catch (error) {
                return handleToolError(error, logger, TOOL_NAMES.CONNECT_TD_NODES);
            }
        }
    );
}
