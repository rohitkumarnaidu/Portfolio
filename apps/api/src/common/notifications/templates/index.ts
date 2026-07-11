import * as fs from 'fs';
import * as path from 'path';

const templatesDir = path.resolve(__dirname);

const cache = new Map<string, string>();

function loadTemplate(name: string): string {
  if (cache.has(name)) return cache.get(name)!;
  const filePath = path.join(templatesDir, `${name}.html`);
  const content = fs.readFileSync(filePath, 'utf-8');
  cache.set(name, content);
  return content;
}

function render(template: string, data: Record<string, unknown>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  result = result.replace(/\{\{#if (\w+)\}\}[\s\S]*?\{{\/if\}\}/g, (match, key) => {
    return data[key] ? match.replace(new RegExp(`\\{\\{#if ${key}\\}\\}`), '').replace(/\{\{\/if\}\}/, '') : '';
  });
  result = result.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, '');
  return result;
}

export function getTemplate(name: string, data: Record<string, unknown>): string {
  const template = loadTemplate(name);
  return render(template, data);
}
