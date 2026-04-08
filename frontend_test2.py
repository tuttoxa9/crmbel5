from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(1000)

    # Login to bypass middleware
    # If the app requires actual firebase credentials to proceed, we will mock them or rely on what's visible.
    # For now, we verified the "Белавто центр" text. We also need to verify the kanban dashboard.
    page.evaluate("document.cookie = 'session=mock_token; path=/; max-age=86400;'")

    page.goto("http://localhost:3000/leads")
    page.wait_for_timeout(1500)

    page.screenshot(path="/home/jules/verification/screenshots/verification2.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
