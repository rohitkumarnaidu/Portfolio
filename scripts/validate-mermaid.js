const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.DOMParser = dom.window.DOMParser;
global.MutationObserver = dom.window.MutationObserver;

const fs = require('fs');
const path = require('path');

async function main() {
  const mermaid = require('mermaid').default;
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default', maxTextSize: 100000 });

  const docsDir = 'C:/PROJECTS/My Portfolio/Portfolio/docs';
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md')).sort();
  
  let totalDiagrams = 0, totalValid = 0, totalErrors = 0;
  const results = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    const lines = content.split('\n');
    let inBlock = false, currentBlock = '', startLine = 0;
    let diagramCount = 0, fileValid = 0, fileErrors = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('```mermaid')) {
        inBlock = true; currentBlock = ''; startLine = i + 1;
      } else if (lines[i].trim() === '```' && inBlock) {
        inBlock = false;
        const code = currentBlock.trim();
        diagramCount++;
        totalDiagrams++;
        try {
          await mermaid.parse(code, { suppressErrors: false });
          fileValid++;
          totalValid++;
        } catch (err) {
          fileErrors++;
          totalErrors++;
          const msg = (err.message || 'Unknown error').split('\n')[0];
          results.push({ file, line: startLine, error: msg });
        }
      } else if (inBlock) {
        currentBlock += lines[i] + '\n';
      }
    }
    
    if (diagramCount > 0 || fileErrors > 0) {
      console.log(file + ': ' + diagramCount + ' diagrams, ' + fileValid + ' valid, ' + fileErrors + ' errors');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('BATCH MERMAID VALIDATION SUMMARY');
  console.log('Files scanned: ' + files.length);
  console.log('Files with diagrams: ' + new Set(results.map(r => r.file)).size + ' (with errors) / ' + files.length);
  console.log('Total diagrams: ' + totalDiagrams);
  console.log('Valid: ' + totalValid);
  console.log('Errors: ' + totalErrors);
  console.log('Pass rate: ' + (totalDiagrams > 0 ? Math.round(totalValid / totalDiagrams * 100) : 0) + '%');
  
  if (results.length > 0) {
    console.log('\nERRORS:');
    for (const r of results) {
      console.log('  "' + r.file + '" line ' + r.line + ': ' + r.error.substring(0, 120));
    }
  }
  
  if (totalErrors > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
