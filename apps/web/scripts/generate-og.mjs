import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

/**
 * One-shot design-asset generator for the static social card.
 *
 * This is a build-time asset, not a runtime route — `next/og` would add a
 * server dependency for an image that never changes between deploys. The
 * template below is fully self-contained (no external fonts or network
 * requests), so regenerating it never depends on the network. This script is
 * the only place in `apps/web` allowed to hold literal hex values.
 *
 * Run with `npm run og:generate` from `apps/web` (or any cwd).
 */
const out = fileURLToPath(new URL('../public/og/og-default.png', import.meta.url));
mkdirSync(dirname(out), { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; overflow: hidden; }
      body {
        background: #0A0C10;
        color: #F2EFE9;
        font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
        position: relative;
      }
      .grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        background-size: 60px 60px;
      }
      .trace {
        position: absolute;
        inset: 0;
        width: 1200px;
        height: 630px;
      }
      .frame {
        position: absolute;
        inset: 40px;
        border: 1px solid rgba(241, 235, 226, 0.10);
      }
      .content {
        position: absolute;
        inset: 0;
        padding: 84px 96px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .eyebrow {
        display: flex;
        align-items: center;
        gap: 14px;
        font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
        font-size: 15px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: #8B9099;
      }
      .eyebrow .pip {
        width: 8px;
        height: 8px;
        background: #C1662E;
        display: inline-block;
      }
      .name {
        font-family: ui-serif, Georgia, 'Times New Roman', serif;
        font-size: 118px;
        line-height: 0.94;
        letter-spacing: -0.035em;
        font-weight: 500;
        color: #F2EFE9;
      }
      .name em {
        font-style: normal;
        color: #C1662E;
      }
      .role {
        margin-top: 22px;
        font-size: 31px;
        font-weight: 400;
        letter-spacing: 0.01em;
        color: #B7B2A8;
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .host {
        font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
        font-size: 19px;
        letter-spacing: 0.04em;
        color: #8B9099;
      }
      .host b { color: #F2EFE9; font-weight: 500; }
      .meta {
        font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
        font-size: 15px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: #6E747E;
      }
    </style>
  </head>
  <body>
    <div class="grid"></div>
    <svg class="trace" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polyline
        points="-20,470 90,470 128,470 146,452 164,488 182,470 300,470 318,470 336,430 354,512 372,470 540,470 558,470 576,444 594,496 612,470 780,470 798,470 816,410 834,530 852,470 1020,470 1038,470 1056,458 1074,482 1092,470 1220,470"
        stroke="#C1662E"
        stroke-width="10"
        stroke-linejoin="round"
        stroke-linecap="round"
        opacity="0.10"
      />
      <polyline
        points="-20,470 90,470 128,470 146,452 164,488 182,470 300,470 318,470 336,430 354,512 372,470 540,470 558,470 576,444 594,496 612,470 780,470 798,470 816,410 834,530 852,470 1020,470 1038,470 1056,458 1074,482 1092,470 1220,470"
        stroke="#C1662E"
        stroke-width="2.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <circle cx="834" cy="530" r="5" fill="#C1662E" />
      <circle cx="834" cy="530" r="12" stroke="#C1662E" stroke-width="1.5" opacity="0.4" />
    </svg>
    <div class="frame"></div>
    <div class="content">
      <div class="eyebrow"><span class="pip"></span>Portfolio / Signal trace</div>
      <div>
        <div class="name">Rohith Naidu<em>.</em></div>
        <div class="role">Software engineer</div>
      </div>
      <div class="footer">
        <div class="host"><b>rohitkumarnaidu.github.io</b>/Portfolio</div>
        <div class="meta">Applied AI · Platforms</div>
      </div>
    </div>
  </body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: out, type: 'png' });
  console.log(`Wrote ${out}`);
} finally {
  await browser.close();
}
