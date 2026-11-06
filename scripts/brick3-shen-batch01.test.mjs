import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { injectBrick3PhotoEvents } from "./brick3-photo-events.mjs";

const raw = JSON.parse(readFileSync("stories/ambiguity-b/story.json", "utf8"));
const manifest = JSON.parse(readFileSync("docs/brick3-photo-events-v1.json", "utf8"));
const batch = manifest.events.filter((entry) => entry.batchId === "shen_yanzhou_batch01");
const compiled = injectBrick3PhotoEvents(structuredClone(raw), manifest);
const thread = compiled.chats.find((chat) => chat.app === "kakao" && chat.title === "沈硯舟");
const events = new Map(compiled.events.map((entry) => [entry.id, entry]));
const messages = new Map(thread?.messages.map((entry) => [entry.id, entry]) ?? []);

test("Shen Batch01 has 10 uploaded WebP images and forty distinct scripted reply branches", () => {
  assert.equal(batch.length, 10);
  assert.ok(thread);
  assert.equal(new Set(batch.map((e) => e.eventId)).size, 10);
  const allAssets = new Set();
  for (const e of batch) {
    assert.equal(e.characterId, "shen_yanzhou");
    assert.equal(e.images.length, 1);
    const photo = e.images[0];
    assert.equal(photo.fileCurrentlyInThisBranch, true, photo.filename);
    assert.equal(photo.uploadStatus, "uploaded_verified", photo.filename);
    assert.ok(!allAssets.has(photo.assetId), photo.assetId);
    allAssets.add(photo.assetId);
    assert.match(photo.path, /^public\/story-photos\/shen_yanzhou\/shen_yanzhou_[a-z0-9_]+\.webp$/);
    assert.ok(statSync(photo.path).size > 10000, photo.path);
    const bytes = readFileSync(photo.path);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    assert.equal(e.gallery?.entersPlayerAlbum, false);
    assert.equal(e.choices.length, 4);
    assert.equal(Object.keys(e.onChoiceResponses).length, 4);
    assert.equal(new Set(e.choices.map((c) => c.text)).size, 4);
    for (const c of e.choices) {
      assert.ok(e.onChoiceResponses[c.id]?.reply?.length, c.id);
    }
  }
});

test("all ten scenes reach a real KKT image and follow-up, then only four selectable branches", () => {
  assert.equal(batch.length, 10);
  for (const e of batch) {
    const prefix = "brick3-photo-" + e.eventId;
    const anchor = compiled.events.find((entry) =>
      (entry.actions ?? []).some((action) => action.type === "unlock" && action.key === e.trigger.anchorMessageId),
    );
    assert.ok(anchor, "missing real canon message anchor " + e.trigger.anchorMessageId);
    assert.ok(anchor.next?.includes(prefix + "-wait"), "anchor not connected " + e.eventId);

    const arrival = events.get(prefix + "-arrive");
    const followWait = events.get(prefix + "-followup-wait");
    const followArrival = events.get(prefix + "-followup-arrive");
    const options = events.get(prefix + "-options");
    assert.ok(arrival && followWait && followArrival && options);
    assert.ok(arrival.next?.includes(prefix + "-followup-wait"), e.eventId);
    assert.ok(followWait.next?.includes(prefix + "-followup-arrive"), e.eventId);
    assert.ok(followArrival.next?.includes(prefix + "-options"), e.eventId);
    assert.equal(options.next?.length, 4);
    const image = messages.get(prefix + "-image-1");
    assert.ok(image, e.eventId);
    assert.equal(image.kind, "image");
    assert.equal(image.media, "./" + e.images[0].path.slice("public/".length));
    assert.equal(image.meta?.photoEventId, e.eventId);
    assert.ok(arrival.actions.some((a) => a.type === "unlock" && a.key === image.id));

    const text = messages.get(prefix + "-followup-text");
    assert.ok(text, e.eventId);
    assert.equal(text.meta?.photoEventId, e.eventId);
    for (let i = 1; i <= 4; i++) {
      const nodeId = prefix + "-choice-" + i;
      assert.ok(options.next.includes(nodeId));
      const branch = events.get(nodeId);
      const reply = events.get(nodeId + "-reply-arrive");
      assert.ok(branch && reply);
      assert.ok(reply.actions.some((a) => a.type === "unlock" && a.key === nodeId + "-response"));
      assert.equal(messages.get(nodeId + "-out")?.body, e.choices[i - 1].text);
      assert.equal(messages.get(nodeId + "-response")?.body, e.onChoiceResponses[e.choices[i - 1].id].reply.join("\n"));
    }
  }
});

test("NPC photos stay private and no authored photo event assumes player attendance", () => {
  assert.equal(batch.length, 10);
  for (const scene of batch) {
    assert.equal(scene.trigger.requiresPlayerAttendance, false);
    assert.equal(scene.trigger.notTriggeredByPlayerOpeningChat, true);
    assert.equal(scene.photoLifecycle.delivery.persistWhenChatClosed, true);
    assert.equal(scene.gallery.entersPlayerAlbum, false);
  }
});
