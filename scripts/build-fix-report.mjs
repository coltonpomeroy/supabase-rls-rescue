// Renders docs/fix-report.html to docs/fix-report.pdf. Run: node scripts/build-fix-report.mjs
import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL("docs/fix-report.html").href);
await page.pdf({ path: "docs/fix-report.pdf", format: "Letter", printBackground: true, preferCSSPageSize: true });
await page.setViewportSize({ width: 1280, height: 1656 });
await page.emulateMedia({ media: "print" });
await page.screenshot({ path: "docs/screenshots/fix-report-page-1.png" });
await browser.close();
