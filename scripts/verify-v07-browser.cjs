// Run against the production server. Supply Playwright via PLAYWRIGHT_MODULE if needed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
const url = process.argv[2] || "http://localhost:3020/",
  R = path.resolve(process.argv[3] || ".local/v07-browser");
fs.mkdirSync(path.join(R, "evidence"), { recursive: true });
const results = [],
  errors = [],
  requests = [];
let browser;
const test = async (name, ids, fn) => {
  try {
    const details = await fn();
    results.push({ name, ids, result: "PASS", details: details || null });
    console.log("PASS", name);
  } catch (e) {
    results.push({ name, ids, result: "FAIL", error: e.message });
    console.log("FAIL", name, e.message);
  }
};
const state = (p) => p.evaluate(() => window.__arcanumPrototype.getState());
const chapter = async (p, n) => {
  await p.evaluate(
    (id) => window.__arcanumPrototype.goChapter(id, false),
    "AX4-0" + n,
  );
  await p.waitForTimeout(80);
};
const close = async (p, how = "button") => {
  if (how === "back") await p.goBack();
  else if (how === "escape") await p.keyboard.press("Escape");
  else await p.locator("#close-panel").click();
  await p.waitForFunction(() => !document.querySelector("#panel").open);
};
(async () => {
  browser = await chromium.launch({ headless: true, channel: "chrome" });
  browser.on("disconnected", () => {});
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  ctx.setDefaultTimeout(6000);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("request", (r) => {
    if (
      /^https?:/.test(r.url()) &&
      new URL(r.url()).origin !== new URL(url).origin
    )
      requests.push(r.url());
  });
  await p.goto(url);
  await p.waitForFunction(() => !!window.__arcanumPrototype);
  await test(
    "Circular center and same persistent SVG across all seven scenes",
    ["T01", "T02"],
    async () => {
      const handle = await p.locator("#living-geometry").elementHandle();
      for (const width of [320, 390, 1440]) {
        await p.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
        for (let n = 1; n <= 7; n++) {
          await chapter(p, n);
          const a = await p.locator("#original-center").boundingBox();
          assert(Math.abs(a.width - a.height) < 0.1);
          assert(
            await handle.evaluate(
              (e) => e === document.querySelector("#living-geometry"),
            ),
          );
          assert.equal(await p.locator("#living-geometry").count(), 1);
          assert.equal(
            await p.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
          );
        }
      }
      await p.setViewportSize({ width: 390, height: 844 });
      return "320, 390 and 1440 px; one unchanged SVG node and circle.";
    },
  );
  await test(
    "Fading copy leaves fixed navigation accessible",
    ["T03"],
    async () => {
      await chapter(p, 2);
      await p.evaluate(() => window.__arcanumPrototype.seek(3, 0.01));
      await p.waitForTimeout(100);
      const opacity = await p
        .locator("#AX4-02 .chapter-copy")
        .evaluate((e) => Number(getComputedStyle(e).opacity));
      assert(opacity > 0 && opacity < 1);
      await p.locator("#menu-toggle").click();
      assert.equal(await p.locator("#menu").isVisible(), true);
      await p.keyboard.press("Escape");
    },
  );
  await test(
    "Pillar order, wraparound, keyboard and swipe equivalents",
    ["T04", "T05"],
    async () => {
      await chapter(p, 3);
      assert.deepEqual((await state(p)).ringOrder, [
        "hope",
        "tempus",
        "vitae",
        "mana",
        "arcnet",
      ]);
      for (const name of ["tempus", "vitae", "mana", "arcnet", "hope"]) {
        await p.locator("#next").click();
        assert.equal((await state(p)).selected, name);
      }
      await p.locator("#previous").click();
      assert.equal((await state(p)).selected, "arcnet");
      await p.locator("#card-arcnet").focus();
      await p.keyboard.press("ArrowRight");
      assert.equal((await state(p)).selected, "hope");
      await p
        .locator("#orbit")
        .dispatchEvent("pointerdown", {
          pointerId: 1,
          clientX: 260,
          clientY: 400,
        });
      await p
        .locator("#orbit")
        .dispatchEvent("pointerup", {
          pointerId: 1,
          clientX: 100,
          clientY: 405,
        });
      assert.equal((await state(p)).selected, "tempus");
      assert.equal(await p.locator("[role=tablist]").count(), 0);
      await p.waitForTimeout(120);
    },
  );
  await test(
    "In-place pillar panel, internal scroll, exact close and focus",
    ["T06", "T07", "T08"],
    async () => {
      await p.locator("#previous").click();
      await p.waitForTimeout(450);
      const before = await state(p);
      await p.locator("#card-hope").click();
      assert.equal((await state(p)).panel, "hope");
      assert(p.url().includes("AX4-03?panel=hope"));
      await p.locator("#sample-reply").click();
      assert.equal(await p.locator("#reply").isVisible(), true);
      await p
        .locator("#panel-scroll")
        .evaluate((e) => (e.scrollTop = e.scrollHeight));
      assert(await p.locator("#panel-scroll").evaluate((e) => e.scrollTop > 0));
      for (let i = 0; i < 12; i++) {
        await p.keyboard.press("Tab");
        assert(
          await p.evaluate(() =>
            document.querySelector("#panel").contains(document.activeElement),
          ),
        );
      }
      await close(p);
      assert.equal((await state(p)).scrollY, before.scrollY);
      assert.equal((await state(p)).selected, before.selected);
      assert.equal(
        await p.evaluate(() => document.activeElement.id),
        "card-hope",
      );
      await p.locator("#card-hope").click();
      await close(p, "escape");
      assert.equal(
        await p.evaluate(() => document.activeElement.id),
        "card-hope",
      );
      await p.locator("#card-hope").click();
      await close(p, "back");
      assert.equal((await state(p)).scrollY, before.scrollY);
      await p.goForward();
      await p.waitForFunction(() => document.querySelector("#panel").open);
      await close(p);
      return "Close, Escape, browser Back/Forward; focus trap and origin restored.";
    },
  );
  await test(
    "Principles sources, dated journal and real updates destination",
    ["T11", "T12", "T13"],
    async () => {
      await chapter(p, 4);
      await p.locator("#open-scene").click();
      assert(
        await p
          .locator('.source-links a[href*="/blob/395d8f"]')
          .count()
          .then((n) => n > 0),
      );
      assert.equal(await p.locator(".source-links .primary").count(), 0);
      await close(p);
      await chapter(p, 5);
      await p.locator("#open-scene").click();
      assert.equal(await p.locator('time[datetime="2026-10-09"]').count(), 2);
      assert(
        await p
          .locator("#panel-body")
          .innerText()
          .then((s) => s.includes("not a release receipt")),
      );
      assert.equal(
        await p
          .locator('.source-links a[href="https://updates.the-arcanum.net/"]')
          .count(),
        1,
      );
      await close(p);
    },
  );
  await test(
    "Illustrative journey and honest dedicated download boundary",
    ["T14", "T15", "T16", "T17"],
    async () => {
      await chapter(p, 6);
      await p.locator("#open-scene").click();
      assert(
        await p
          .locator("#panel-body")
          .innerText()
          .then((s) => s.includes("do not show your location")),
      );
      assert.equal(
        await p.locator(".source-links a").first().getAttribute("href"),
        "https://journeys.the-arcanum.net/",
      );
      await close(p);
      await chapter(p, 7);
      await p.locator("#open-scene").click();
      assert.equal(
        await p.locator(".source-links a").first().getAttribute("href"),
        "https://the-arcanum.net/download",
      );
      assert.equal(await p.locator('a[download],a[href$=".apk"]').count(), 0);
      assert(
        await p
          .locator("#panel-body")
          .innerText()
          .then((s) => s.includes("does not install anything")),
      );
      await close(p);
    },
  );
  await test(
    "Reduced-motion stages remain complete and actionable",
    ["T20"],
    async () => {
      const q = await browser.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
      });
      await q.goto(url);
      await q.waitForTimeout(100);
      assert.equal(
        await q.locator("#motion").getAttribute("aria-pressed"),
        "false",
      );
      for (let n = 1; n <= 7; n++) {
        await chapter(q, n);
        if (n >= 4) {
          await q.locator("#open-scene").click();
          assert.equal(await q.locator("#panel").isVisible(), true);
          await close(q);
        }
      }
      await q.locator("#motion").click();
      assert.equal(
        await q.locator("#motion").getAttribute("aria-pressed"),
        "false",
      );
      await q.close();
    },
  );
  await test(
    "Fresh silence, opt-in playback and cancellation",
    ["T21"],
    async () => {
      assert.equal(
        await p.locator("#sound").getAttribute("aria-pressed"),
        "false",
      );
      await p.locator("#sound").click();
      await p.waitForFunction(
        () => document.querySelector("#sound").dataset.state === "playing",
      );
      assert.equal(
        await p.locator("#sound").getAttribute("aria-pressed"),
        "true",
      );
      await p.locator("#sound").click();
      assert.equal(
        await p.locator("#sound").getAttribute("aria-pressed"),
        "false",
      );
      return "Web Audio running state verified, not physical speaker output.";
    },
  );
  await test("Blocked playback never appears on", ["T21"], async () => {
    const q = await browser.newPage();
    await q.addInitScript(() => {
      window.AudioContext = class {
        constructor() {
          this.state = "suspended";
        }
        resume() {
          return Promise.reject(Error("blocked"));
        }
        suspend() {
          return Promise.resolve();
        }
      };
    });
    await q.goto(url);
    await q.locator("#sound").click();
    await q.waitForFunction(
      () => document.querySelector("#sound").dataset.state === "blocked",
    );
    assert.equal(
      await q.locator("#sound").getAttribute("aria-pressed"),
      "false",
    );
    await q.close();
  });
  await test(
    "Pending playback can be cancelled without later activation",
    ["T21"],
    async () => {
      const q = await browser.newPage();
      await q.addInitScript(() => {
        window.AudioContext = class {
          constructor() {
            this.state = "suspended";
          }
          resume() {
            return new Promise(() => {});
          }
          suspend() {
            return Promise.resolve();
          }
        };
      });
      await q.goto(url);
      await q.locator("#sound").click();
      assert.equal(
        await q.locator("#sound").getAttribute("aria-pressed"),
        "false",
      );
      await q.locator("#sound").click();
      await q.waitForTimeout(2400);
      assert.equal(
        await q.locator("#sound").getAttribute("aria-pressed"),
        "false",
      );
      assert.equal(await q.locator("#sound").getAttribute("data-state"), "off");
      await q.close();
    },
  );
  await test(
    "Landscape and enlarged text keep all menu choices reachable",
    ["T22"],
    async () => {
      for (const v of [
        { width: 844, height: 390 },
        { width: 320, height: 568 },
      ]) {
        await p.setViewportSize(v);
        await p.addStyleTag({
          content: "body{font-size:200%} #menu a{font-size:1em}",
        });
        await p.locator("#menu-toggle").click();
        const nav = p.locator("#nav-download");
        await nav.scrollIntoViewIfNeeded();
        assert.equal(await nav.isVisible(), true);
        assert.equal(await nav.getAttribute("href"), "#AX4-07");
        await p.keyboard.press("Escape");
      }
      await p.setViewportSize({ width: 390, height: 844 });
    },
  );
  await test(
    "Old local deep links intentionally migrate, direct-entry close stays local",
    ["T23"],
    async () => {
      for (const [hash, scene, panel] of [
        ["/explore?selected=hope", "AX4-03", "hope"],
        ["/hope", "AX4-03", "hope"],
        ["/explore/mana", "AX4-03", "mana"],
        ["/principles", "AX4-04", null],
        ["/updates", "AX4-05", null],
        ["/journeys", "AX4-06", null],
        ["/download", "AX4-07", null],
      ]) {
        const q = await browser.newPage();
        await q.goto(url + "#" + hash);
        await q.waitForTimeout(100);
        assert.equal((await state(q)).currentScene, scene);
        assert.equal((await state(q)).panel, panel);
        if (panel) {
          await close(q);
          assert.equal((await state(q)).currentScene, scene);
        }
        await q.close();
      }
    },
  );
  await test(
    "Fast scroll and deep return preserve exact context",
    ["T24", "T25"],
    async () => {
      await chapter(p, 1);
      await p.evaluate(() =>
        scrollTo(0, document.querySelector("#AX4-06").offsetTop + 140),
      );
      await p.waitForTimeout(120);
      assert.equal((await state(p)).currentScene, "AX4-06");
      const before = await state(p);
      await p.locator("#open-scene").click();
      await p
        .locator("#panel-scroll")
        .evaluate((e) => (e.scrollTop = e.scrollHeight));
      await close(p);
      assert.equal((await state(p)).scrollY, before.scrollY);
      assert.equal(
        await p.evaluate(() => document.activeElement.id),
        "open-scene",
      );
    },
  );
  await test(
    "No remote requests, private inputs or persistent storage",
    ["T26", "T14"],
    async () => {
      assert.deepEqual(requests, []);
      assert.equal(await p.locator("input,textarea,iframe").count(), 0);
      assert.equal((await state(p)).hasPersistentStorage, false);
      assert.equal(await p.evaluate(() => localStorage.length), 0);
      assert.deepEqual(errors, []);
      return "Only same-origin asset requests while traversing the experience. Outward links are deliberate navigation.";
    },
  );
  await test(
    "Five menu destinations, logo eighth position and quiet footer",
    ["V07-01"],
    async () => {
      assert.deepEqual(await p.locator("#menu a").allTextContents(), [
        "Discover",
        "Principles",
        "Follow the Work",
        "Journeys",
        "Get the Arcanum",
      ]);
      await p.locator("#menu-toggle").click();
      assert.equal(
        await p.evaluate(() => document.activeElement.id),
        "nav-pillars",
      );
      await p.locator("#nav-pillars").click();
      assert.equal((await state(p)).currentScene, "AX4-03");
      for (const [id, n, panel] of [
        ["principles", 4, "principles"],
        ["updates", 5, "journal"],
        ["journeys", 6, "journeys"],
        ["download", 7, "download"],
      ]) {
        await p.locator("#menu-toggle").click();
        await p.locator("#nav-" + id).click();
        assert.equal((await state(p)).currentScene, "AX4-0" + n);
        assert.equal((await state(p)).panel, null);
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "title-AX4-0" + n,
        );
        const before = await state(p);
        await p.locator("#open-scene").click();
        assert.equal((await state(p)).panel, panel);
        await close(p, "escape");
        assert.equal((await state(p)).scrollY, before.scrollY);
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "open-scene",
        );
      }
      await chapter(p, 7);
      await p.locator(".brand").click();
      assert.equal((await state(p)).scrollY, 0);
      assert.equal(await p.locator(".chapter").count(), 7);
      assert.deepEqual(await p.locator("footer nav a").allTextContents(), [
        "Principles & Reading Library ↗",
        "Source on GitHub ↗",
        "Development Updates ↗",
        "The Great Journey ↗",
      ]);
      assert.equal(
        await p
          .locator('footer a[href*="download"],footer a[href*="explore/"]')
          .count(),
        0,
      );
    },
  );
  await test(
    "Geometry-free skip target and pillar focus return",
    ["V07-02"],
    async () => {
      await p.locator(".skip").focus();
      await p.keyboard.press("Enter");
      await p.locator("#plain-vitae").click();
      await close(p);
      assert.equal(
        await p.evaluate(() => document.activeElement.id),
        "plain-vitae",
      );
      await p.locator(".brand").click();
    },
  );
  await test(
    "No-JavaScript pillar access outside reference footer",
    ["V07-03"],
    async () => {
      const q = await browser.newPage({
        javaScriptEnabled: false,
        viewport: { width: 320, height: 568 },
      });
      await q.goto(url);
      assert.equal(await q.locator("#full-map nav a").count(), 6);
      assert.equal(await q.locator("footer nav a").count(), 4);
      assert.equal(await q.locator("#full-map").isVisible(), true);
      await q.close();
    },
  );
  await test(
    "Desktop/mobile reference layout and library return",
    ["V07-04"],
    async () => {
      await p.evaluate(() =>
        document.querySelectorAll("style").forEach((s) => {
          if (s.textContent === "body{font-size:200%} #menu a{font-size:1em}")
            s.remove();
        }),
      );
      for (const width of [320, 390, 1440]) {
        await p.setViewportSize({ width, height: 900 });
        await p.locator("footer").scrollIntoViewIfNeeded();
        assert.equal(
          await p.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await p.waitForTimeout(500);
        assert.equal(
          await p
            .locator(".chapter-copy")
            .evaluateAll(
              (es) =>
                es.filter((e) => Number(getComputedStyle(e).opacity) > 0.1)
                  .length,
            ),
          0,
        );
        await p.screenshot({
          path: path.join(R, "evidence/footer-" + width + ".png"),
        });
      }
      await p.setViewportSize({ width: 390, height: 844 });
      await p.locator(".brand").click();
      await p.locator("#menu-toggle").click();
      await p.screenshot({ path: path.join(R, "evidence/menu-mobile.png") });
      await p.keyboard.press("Escape");
      for (let i = 0; i < 4; i++) {
        await p.locator("#reference-" + i).click();
        assert.equal(
          (await state(p)).panel,
          ["principles", "journal", "journal", "journeys"][i],
        );
        if (i === 0)
          assert.equal(
            await p.locator(".source-links a").first().getAttribute("href"),
            "https://the-arcanum.net/principles",
          );
        await close(p);
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "reference-" + i,
        );
      }
      for (const width of [390, 1440]) {
        await p.setViewportSize({ width, height: 900 });
        for (const n of [1, 3, 5, 7]) {
          await chapter(p, n);
          await p.waitForTimeout(500);
          await p.screenshot({
            path: path.join(R, "evidence/scene-" + n + "-" + width + ".png"),
          });
        }
      }
    },
  );

  const report = {
    testedAt: new Date().toISOString(),
    browser: await browser.version(),
    mode: "Headless Chrome; mobile emulation and desktop. Not physical Android or a screen-reader audit.",
    results,
    errors,
    requests,
  };
  fs.writeFileSync(
    path.join(R, "evidence/regression-results.json"),
    JSON.stringify(report, null, 2),
  );
  await browser.close();
  console.log(
    JSON.stringify({
      passed: results.filter((x) => x.result === "PASS").length,
      failed: results.filter((x) => x.result === "FAIL").length,
    }),
  );
  process.exitCode = results.some((x) => x.result === "FAIL") ? 1 : 0;
})().catch(async (e) => {
  console.error(e);
  if (browser) await browser.close();
  process.exitCode = 1;
});
