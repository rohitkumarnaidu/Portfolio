import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const url = process.env.RESUME_URL || 'http://localhost:3000/resume';
const dir = fileURLToPath(new URL('../public/resume/', import.meta.url));
const out = fileURLToPath(new URL('../public/resume/rohith-naidu-resume.pdf', import.meta.url));
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
