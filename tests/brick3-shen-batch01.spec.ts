import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const built = JSON.parse(readFileSync("public/work.json", "utf8"));
const manifest = JSON.parse(readFileSync("docs/brick3-photo-events-v1.json", "utf8"));
const batch = manifest.events.filter((entry: { batchId?: string }) =>
  entry.batchId === "shen_yanzhou_batch01"
);

test.use({ viewport: { width: 393, height: 852 }, hasTouch: true, channel: "chromium" });

function preview(mode: "all" | "choices") {
  const work = structuredClone(built);
  const ids = new Set<string>();
  const target = mode === "choices" ? batch.slice(0, 1) : batch;
  for (const event of target) {
    const prefix = "brick3-photo-" + event.eventId;
    ids.add(prefix + "-caption");
    ids.add(prefix + "-image-1");
    ids.add(prefix + "-followup-text");
  }
  work.data.kakao = work.data.kakao.filter((item: { title: string }) =>
    item.title !== "沈硯舟" || ids.has(item.id)
  ).map((item: { title: string; hidden: boolean }) =>
    item.title === "沈硯舟" ? { ...item, hidden: false } : item
  );
  if (mode === "choices") {
    const id = "brick3-photo-" + batch[0].eventId;
    const original = built.nodes.filter((node: { id: string }) => node.id.startsWith(id + "-"));
    const options = original.find((node: { id: string }) => node.id === id + "-options");
    if (!options) throw Error("Compiled scene options missing");
    const start = { ...original[0], id: "shen-batch01-test-start", type: "start", event: "",
      target: "", conditions: [], actions: [], next: [options.id], once: true };
    work.nodes = [...original, start];
    work.mode = "mixed";
    // Keep player and NPC reply records so the real choose() flow can unlock them.
    const originalSceneItems = built.data.kakao.filter((item: { id: string }) =>
      item.id.startsWith(id + "-choice-")
    );
    work.data.kakao.push(...originalSceneItems);
  } else {
    work.nodes = [];
    work.mode = "explore";
  }
  return work;
}

async function openShenChat(page: Page, work: unknown) {
  await page.route("**/work.json", (route) => route.fulfill({ json: work }));
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await page.getByRole("button", { name: "打开App Store", exact: true }).click();
  await page.getByPlaceholder("搜索全部App").fill("KakaoTalk");
  await page.locator(".runtime-library-row")
    .getByRole("button", { name: "打开", exact: true }).click();
  await expect(page.locator("[data-mymy=kakao]")).toBeVisible();
  await page.locator(".kzkcr").filter({ hasText: "沈硯舟" }).first().click();
  await expect(page.locator(".kzname")).toContainText("沈硯舟");
}

test("Shen Batch01: all ten real WebP images load in mobile KKT chat", async ({ page }) => {
  expect(batch).toHaveLength(10);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openShenChat(page, preview("all"));
  const photos = page.locator(".mymy-kakao .kzimg img");
  await expect(photos).toHaveCount(10);
  for (let i = 0; i < 10; i++) {
    const img = photos.nth(i);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await photos.nth(9).scrollIntoViewIfNeeded();
  await page.locator(".phone-screen").screenshot({ path: "outputs/brick3-shen-batch01/chat-ten-photos-mobile.png" });
  expect(errors).toEqual([]);
});

test("Shen Batch01: four actual scripted KKT replies are selectable and only chosen response arrives", async ({ page }) => {
  await openShenChat(page, preview("choices"));
  const tray = page.locator(".kkt-reply-tray");
  await expect(tray.locator(".kkt-reply-choice")).toHaveCount(4);
  await page.locator(".phone-screen").screenshot({ path: "outputs/brick3-shen-batch01/chat-four-choices-mobile.png" });
  await tray.locator(".kkt-reply-choice").nth(0).click();
  await expect(page.getByText(batch[0].choices[0].text, { exact: true })).toBeVisible();
  await expect(page.getByText(batch[0].onChoiceResponses[batch[0].choices[0].id].reply[0], { exact: true }))
    .toBeVisible({ timeout: 10000 });
  await expect(page.getByText(batch[0].onChoiceResponses[batch[0].choices[1].id].reply[0], { exact: true }))
    .toHaveCount(0);
  // A finished photo scene should not fall back to unrelated generic prompts.
  await expect(page.locator(".kkt-reply-tray")).toHaveCount(0);
  await page.locator(".phone-screen").screenshot({ path: "outputs/brick3-shen-batch01/chat-selected-reply-mobile.png" });
});
