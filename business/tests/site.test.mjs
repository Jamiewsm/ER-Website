import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const productionOrigin = "https://business.er-coaching.com";

const routes = [
  {
    file: "index.html",
    path: "/",
    title: "ER Business | 사람을 이해하면, 팀의 성과가 달라집니다",
    h1: "사람을 이해하면,",
  },
  {
    file: "programs.html",
    path: "/programs",
    title: "프로그램 | ER Business",
    h1: "팀의 문제에 맞는 개입을 설계합니다.",
  },
  {
    file: "about.html",
    path: "/about",
    title: "ER의 관점 | ER Business",
    h1: "사람을 유형으로 설명하는 데서 멈추지 않습니다.",
  },
  {
    file: "contact.html",
    path: "/contact",
    title: "제안 요청 | ER Business",
    h1: "우리 팀의 문제를 사람의 언어로 다시 읽어보세요.",
  },
  {
    file: "privacy.html",
    path: "/privacy",
    title: "개인정보처리방침 | ER Business",
    h1: "개인정보처리방침",
  },
  {
    file: "terms.html",
    path: "/terms",
    title: "서비스 이용 안내 | ER Business",
    h1: "서비스 이용 및 상담 안내",
  },
];

async function readExport(file) {
  return readFile(new URL(`dist/client/${file}`, projectRoot), "utf8");
}

async function readPngInfo(file) {
  const data = await readFile(new URL(`dist/client/${file}`, projectRoot));
  assert.equal(data.toString("ascii", 1, 4), "PNG");
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    colorType: data.readUInt8(25),
  };
}

test("static export contains six distinct, self-canonical ER Business pages", async () => {
  const descriptions = new Set();

  for (const route of routes) {
    const html = await readExport(route.file);
    const canonical = `${productionOrigin}${route.path}`;
    const description = html.match(
      /<meta name="description" content="([^"]+)"/,
    )?.[1];

    assert.match(html, new RegExp(`<title>${route.title}</title>`));
    assert.match(html, /<html lang="ko">/);
    assert.ok(description);
    descriptions.add(description);
    assert.match(
      html,
      new RegExp(
        `<link rel="canonical" href="${canonical.replaceAll("/", "\\/")}"`,
      ),
    );
    assert.match(
      html,
      new RegExp(
        `<meta property="og:url" content="${canonical.replaceAll("/", "\\/")}"`,
      ),
    );
    assert.match(html, new RegExp(route.h1));
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
    assert.match(html, /id="main-content"/);
    assert.doesNotMatch(html, /campus-12000\.chatgpt\.site/);
  }

  assert.equal(descriptions.size, routes.length);
});

test("Business favicon assets are transparent, correctly sized, and linked", async () => {
  assert.deepEqual(await readPngInfo("favicon.png"), {
    width: 512,
    height: 512,
    colorType: 6,
  });
  assert.deepEqual(await readPngInfo("favicon-32x32.png"), {
    width: 32,
    height: 32,
    colorType: 6,
  });

  const ico = await readFile(new URL("dist/client/favicon.ico", projectRoot));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);

  const html = await readExport("index.html");
  assert.match(html, /href="https:\/\/business\.er-coaching\.com\/favicon\.ico"/);
  assert.match(
    html,
    /href="https:\/\/business\.er-coaching\.com\/favicon-32x32\.png"/,
  );
  assert.match(html, /href="https:\/\/business\.er-coaching\.com\/favicon\.png"/);
});

test("shared navigation and legal footer connect every Business route", async () => {
  const html = await readExport("index.html");

  for (const href of [
    "/programs",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }

  assert.match(html, /© 2026 ER Business/);
  assert.match(html, /사업자등록번호[\s\S]{0,80}347-64-00804/);
  assert.doesNotMatch(html, /href="mailto:[^"]+"[^>]*>기업교육 제안 요청하기/);
});

test("every internal link resolves to an exported route or in-page target", async () => {
  const routeHtml = new Map(
    await Promise.all(
      routes.map(async (route) => [route.path, await readExport(route.file)]),
    ),
  );

  for (const [sourcePath, html] of routeHtml) {
    const internalLinks = [
      ...html.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g),
    ].map(
      (match) => match[1],
    );

    for (const href of internalLinks) {
      const [rawPath, hash] = href.split("#");
      const targetPath = rawPath || sourcePath;
      const targetHtml = routeHtml.get(targetPath);

      assert.ok(targetHtml, `${sourcePath} links to missing route ${href}`);
      if (hash) {
        assert.match(
          targetHtml,
          new RegExp(`id="${hash}"`),
          `${sourcePath} links to missing target ${href}`,
        );
      }
    }
  }
});

test("contact route collects only proposal context and clearly opens email", async () => {
  const html = await readExport("contact.html");

  for (const name of [
    "company",
    "name",
    "role",
    "email",
    "teamSize",
    "challenge",
    "outcome",
    "privacyConsent",
  ]) {
    assert.match(html, new RegExp(`name="${name}"`));
  }

  assert.match(html, /이메일 작성 화면 열기/);
  assert.match(html, /메일을 보내야/);
  assert.match(html, /클립보드에 복사/);
  assert.match(html, /hello@er-coaching\.com/);
});

test("program and policy copy preserves assessment ethics and has no placeholders", async () => {
  const files = await Promise.all(routes.map((route) => readExport(route.file)));
  const siteCopy = files.join("\n");

  assert.match(siteCopy, /채용 합격·불합격을 결정하는 성격검사가 아닙니다/);
  assert.match(siteCopy, /채용, 해고, 승진 등 인사 결정을 위한 단독 기준/);
  assert.match(siteCopy, /Cloudflare Web Analytics/);
  assert.doesNotMatch(siteCopy, /\[확인 필요|TODO|PLACEHOLDER/);
  assert.doesNotMatch(siteCopy, /교회|기독교|사역지원|목회자|선교사/);
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

test("hero and social assets are shipped without enforcing oversized files", async () => {
  const assets = await Promise.all(
    ["hero-team-ai.jpg", "hero-team-real.jpg", "og.png"].map((file) =>
      stat(new URL(`dist/client/${file}`, projectRoot)),
    ),
  );

  for (const asset of assets) {
    assert.ok(asset.size > 50_000);
  }
});

test("search crawlers receive an exact six-route production sitemap", async () => {
  const [robots, sitemap] = await Promise.all([
    readFile(new URL("dist/client/robots.txt", projectRoot), "utf8"),
    readFile(new URL("dist/client/sitemap.xml", projectRoot), "utf8"),
  ]);

  assert.match(
    robots,
    /Sitemap: https:\/\/business\.er-coaching\.com\/sitemap\.xml/,
  );

  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    sitemapLocations,
    routes.map((route) => `${productionOrigin}${route.path}`),
  );
});
