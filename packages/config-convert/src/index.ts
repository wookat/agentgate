import { ADAPTERS } from "./clients.js";
import { ClientId } from "./model.js";

export * from "./model.js";
export { ADAPTERS } from "./clients.js";

export interface ConvertResult {
  content: string;
  warnings: string[];
}

/** Convert an MCP client config file's contents from one client format to another. */
export function convert(from: ClientId, to: ClientId, content: string): ConvertResult {
  const parsed = ADAPTERS[from].parse(content);
  const rendered = ADAPTERS[to].render(parsed.config);
  return { content: rendered.content, warnings: [...parsed.warnings, ...rendered.warnings] };
}
