export function detectVariables(body: string): string[] {
  const matches = body.matchAll(/\{\{\s*([a-zA-Z][a-zA-Z0-9_-]{0,40})\s*\}\}/g);
  return [...new Set([...matches].map((match) => match[1]))];
}

export function fillVariables(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_-]{0,40})\s*\}\}/g, (_match, name: string) => {
    return values[name] ?? '';
  });
}
