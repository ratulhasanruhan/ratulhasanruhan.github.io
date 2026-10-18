#!/usr/bin/env python3
import asyncio
from pathlib import Path
from datetime import datetime

from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8000"
OUT_DIR = Path("docs/preview")

WIDTHS = [390, 768, 1100, 1280]
PAGES = [("/", "en"), ("/bn/", "bn")]
THEMES = [("light", False), ("dark", True)]


async def capture(page, url: str, locale: str, width: int, dark: bool):
    await page.emulate_media(color_scheme="dark" if dark else "light")
    await page.set_viewport_size({"width": width, "height": 1200})
    await page.goto(f"{BASE}{url}", wait_until="networkidle")
    # Wait a bit for JS to render projects if needed
    await page.wait_for_timeout(300)
    # Collect console errors
    errors = []
    page.on("console", lambda msg: errors.append((msg.type, msg.text)) if msg.type == "error" else None)
    # Compute scrollWidth
    scroll_w = await page.evaluate("document.scrollingElement ? document.scrollingElement.scrollWidth : document.documentElement.scrollWidth")
    inner_w = await page.evaluate("window.innerWidth")
    scroll_h = await page.evaluate("document.scrollingElement ? document.scrollingElement.scrollHeight : document.documentElement.scrollHeight")
    has_legacy = await page.evaluate("""(() => {
      const t = (document.body && document.body.innerText) || '';
      return /Show Contacts|Quick sync with Ratul/.test(t);
    })()""")
    # Screenshot
    theme = "dark" if dark else "light"
    fn = OUT_DIR / f"{'desktop' if width>=1024 else 'mobile'}-{locale}-{theme}-{width}.png"
    await page.screenshot(path=str(fn), full_page=True)
    return {
        "url": url,
        "locale": locale,
        "width": width,
        "theme": theme,
        "scrollWidth": scroll_w,
        "innerWidth": inner_w,
        "scrollHeight": scroll_h,
        "legacyStrings": has_legacy,
        "consoleErrors": errors,
    }


async def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    report_lines = []
    ts = datetime.utcnow().isoformat() + "Z"
    report_lines.append(f"# Verification Report ({ts})")
    report_lines.append("")
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()
        # Intercept responses to detect 404s
        not_founds = []
        context.on("response", lambda resp: not_founds.append(resp.url) if resp.status == 404 else None)
        results = []
        for url, locale in PAGES:
            for width in WIDTHS:
                for theme, dark in THEMES:
                    res = await capture(page, url, locale, width, dark)
                    results.append(res)
                    # Capture menu-open screenshot on mobile light only
                    if width in (390, 768) and not dark:
                        try:
                            await page.click('#menu-toggle', timeout=1000)
                            await page.wait_for_timeout(200)
                            fn = OUT_DIR / f"mobile-{locale}-menu-open-{width}.png"
                            await page.screenshot(path=str(fn), full_page=True)
                            # close menu
                            await page.click('#menu-toggle', timeout=1000)
                        except Exception:
                            pass
                    # Validate press links and award images at desktop light once
                    if width == 1280 and not dark and url == '/':
                        press_count = await page.evaluate("document.querySelectorAll('#press ol li a').length")
                        awards_imgs = await page.evaluate("document.querySelectorAll('#awards .figure img, #awards .award-images-grid img').length")
                        results.append({'url': url, 'locale': locale, 'width': width, 'theme': 'light', 'pressCount': press_count, 'awardImages': awards_imgs})
        await browser.close()
    # Summarize results
    for r in results:
        if 'scrollWidth' in r:
            ok = "OK" if r["scrollWidth"] <= r["innerWidth"] else "OVERFLOW"
            report_lines.append(
                f"- {r['url']} [{r['locale']}] {r['theme']} {r['width']} => "
                f"scrollWidth {r['scrollWidth']} / innerWidth {r['innerWidth']} — {ok}; "
                f"scrollHeight {r['scrollHeight']}; legacyStrings={r['legacyStrings']}"
            )
        elif 'pressCount' in r:
            report_lines.append(f"- metrics: pressCount={r['pressCount']}, awardImages={r['awardImages']}")
    if not_founds:
        report_lines.append("")
        report_lines.append("## 404s")
        for u in sorted(set(not_founds)):
            report_lines.append(f"- {u}")
    # Write report
    (OUT_DIR / "report.md").write_text("\n".join(report_lines), encoding="utf-8")
    print("Wrote", OUT_DIR / "report.md")


if __name__ == "__main__":
    asyncio.run(main())

