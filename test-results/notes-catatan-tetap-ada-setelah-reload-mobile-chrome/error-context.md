# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notes.spec.js >> catatan tetap ada setelah reload
- Location: tests/e2e/notes.spec.js:10:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Tambah catatan' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "JavaScript logo" [ref=e6]
      - img "Vite logo" [ref=e7]
    - generic [ref=e8]:
      - heading "Get started" [level=1] [ref=e9]
      - paragraph [ref=e10]:
        - text: Edit
        - code [ref=e11]: src/main.js
        - text: and save to test
        - code [ref=e12]: HMR
    - button "Count is 0" [ref=e13]
  - generic [ref=e14]:
    - generic [ref=e15]:
      - heading "Documentation" [level=2] [ref=e18]
      - paragraph [ref=e19]: Your questions, answered
      - list [ref=e20]:
        - listitem [ref=e21]:
          - link "Explore Vite" [ref=e22] [cursor=pointer]:
            - /url: https://vite.dev/
        - listitem [ref=e23]:
          - link "Learn more" [ref=e24] [cursor=pointer]:
            - /url: https://developer.mozilla.org/en-US/docs/Web/JavaScript
    - generic [ref=e25]:
      - heading "Connect with us" [level=2] [ref=e28]
      - paragraph [ref=e29]: Join the Vite community
      - list [ref=e30]:
        - listitem [ref=e31]:
          - link "GitHub" [ref=e32] [cursor=pointer]:
            - /url: https://github.com/vitejs/vite
        - listitem [ref=e35]:
          - link "Discord" [ref=e36] [cursor=pointer]:
            - /url: https://chat.vite.dev/
        - listitem [ref=e39]:
          - link "X.com" [ref=e40] [cursor=pointer]:
            - /url: https://x.com/vite_js
        - listitem [ref=e43]:
          - link "Bluesky" [ref=e44] [cursor=pointer]:
            - /url: https://bsky.app/profile/vite.dev
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | // Helper: menambah satu catatan lewat UI
  3  | async function addNote(page, title, body) {
> 4  |  await page.getByRole("button", { name: "Tambah catatan" }).click();
     |                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  5  |  await page.getByLabel("Judul").fill(title);
  6  |  await page.getByLabel("Isi").fill(body);
  7  |  await page.getByRole("button", { name: "Simpan" }).click();
  8  | }
  9  | // WO-2: daftar dan editor
  10 | test("catatan tetap ada setelah reload", async ({ page }) => {
  11 |  await page.goto("/");
  12 |  await addNote(page, "Belanja", "Susu, roti");
  13 |  await page.reload(); await expect(page.getByText("Belanja")).toBeVisible();
  14 | });
  15 | test("tombol Simpan terlihat di layar 360 px", async ({ page }) => {
  16 |  await page.setViewportSize({ width: 360, height: 640 });
  17 |  await page.goto("/"); await page.getByRole("button", { name: "Tambah catatan" }).click();
  18 |  await expect(page.getByRole("button", { name: "Simpan" })).toBeInViewport();
  19 | });
```