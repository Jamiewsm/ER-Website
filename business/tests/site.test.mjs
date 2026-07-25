import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("static export contains the ER Business landing page and production metadata", async () => {
  const html = await readFile(
    new URL("dist/client/index.html", projectRoot),
    "utf8",
  );

  assert.match(
    html,
    /<title>ER Business \| 사람을 이해하면, 팀의 성과가 달라집니다<\/title>/,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/business\.er-coaching\.com\/"/,
  );
  assert.match(
    html,
    /<meta property="og:url" content="https:\/\/business\.er-coaching\.com\/"/,
  );
  assert.match(html, /src="\/hero-team-ai\.jpg"/);
  assert.match(html, /src="\/hero-team-real\.jpg"/);
  assert.match(html, /사람을 읽으면,/);
  assert.match(html, /강점을 맞추면,/);
  assert.match(html, /hello@er-coaching\.com/);
  assert.doesNotMatch(html, /campus-12000\.chatgpt\.site/);
});

test("Cloudflare build targets an isolated Worker and custom domain", async () => {
  const config = JSON.parse(
    await readFile(
      new URL("dist/server/wrangler.json", projectRoot),
      "utf8",
    ),
  );

  assert.equal(config.name, "er-business-site");
  assert.equal(config.assets.binding, "ASSETS");
  assert.equal(config.assets.directory, "../client");
  assert.deepEqual(config.routes, [
    {
      pattern: "business.er-coaching.com",
      custom_domain: true,
    },
  ]);
});

test("both approved hero photographs are shipped at useful resolution", async () => {
  const [aiPhoto, realPhoto] = await Promise.all([
    stat(new URL("dist/client/hero-team-ai.jpg", projectRoot)),
    stat(new URL("dist/client/hero-team-real.jpg", projectRoot)),
  ]);

  assert.ok(aiPhoto.size > 900_000);
  assert.ok(realPhoto.size > 1_500_000);
});

test("search crawlers receive production robots and sitemap files", async () => {
  const [robots, sitemap] = await Promise.all([
    readFile(new URL("dist/client/robots.txt", projectRoot), "utf8"),
    readFile(new URL("dist/client/sitemap.xml", projectRoot), "utf8"),
  ]);

  assert.match(
    robots,
    /Sitemap: https:\/\/business\.er-coaching\.com\/sitemap\.xml/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/business\.er-coaching\.com\/<\/loc>/,
  );
});
