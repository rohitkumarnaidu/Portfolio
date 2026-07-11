/**
 * Generates a Postman collection from the running API's Swagger JSON.
 * Usage: node scripts/generate-postman.mjs
 * Requires: the API to be running at the configured URL.
 * Output: docs/postman-collection.json
 */

const API_BASE = process.env.API_URL || 'http://localhost:3001';
const SWAGGER_URL = `${API_BASE}/api/docs-json`;

async function main() {
  console.log(`Fetching Swagger spec from ${SWAGGER_URL}...`);
  const res = await fetch(SWAGGER_URL);
  if (!res.ok) throw new Error(`Failed to fetch Swagger spec: ${res.statusText}`);
  const spec = await res.json();

  const collection = {
    info: {
      name: spec.info?.title || 'Portfolio API',
      description: spec.info?.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      version: spec.info?.version || '1.0.0',
    },
    auth: {
      type: 'bearer',
      bearer: [{ key: 'token', value: '{{auth_token}}', type: 'string' }],
    },
    variable: [
      { key: 'base_url', value: API_BASE, type: 'string' },
      { key: 'auth_token', value: '', type: 'string' },
    ],
    item: [],
  };

  const tagMap = {};
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, details] of Object.entries(methods)) {
      const tags = details.tags || ['Uncategorized'];
      for (const tag of tags) {
        if (!tagMap[tag]) tagMap[tag] = { name: tag, item: [] };

        const request = {
          name: details.summary || `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Accept', value: 'application/json' },
            ],
            url: {
              raw: `{{base_url}}${path}`,
              host: ['{{base_url}}'],
              path: path.split('/').filter(Boolean),
              variable: [],
              query: [],
            },
            description: details.description || '',
          },
        };

        // Parse path parameters
        const pathParams = path.match(/\{(\w+)\}/g);
        if (pathParams) {
          for (const pp of pathParams) {
            const name = pp.slice(1, -1);
            request.request.url.variable.push({
              key: name,
              value: '',
              type: 'string',
            });
          }
        }

        // Parse query parameters
        const queryParams = details.parameters?.filter((p) => p.in === 'query') || [];
        for (const qp of queryParams) {
          request.request.url.query.push({
            key: qp.name,
            value: qp.schema?.default?.toString() || '',
            disabled: !qp.required,
          });
        }

        tagMap[tag].item.push(request);
      }
    }
  }

  collection.item = Object.values(tagMap).sort((a, b) => a.name.localeCompare(b.name));

  const fs = await import('fs');
  const outPath = new URL('../docs/postman-collection.json', import.meta.url);
  fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
  console.log(`Postman collection written to ${outPath}`);
}

main().catch(console.error);
