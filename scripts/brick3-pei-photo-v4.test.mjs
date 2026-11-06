import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { injectBrick3PeiPhotoV4 } from "./brick3-pei-photo-v4.mjs";
const manifest = JSON.parse(readFileSync(new URL("../docs/brick3-pei-zhiyu-photo-events-v4.json", import.meta.url), "utf8"));
const base = () => ({
  id: "between-the-lines-b-demo",
  events: [
    { id: "reply-pei-1", type: "action", actions: [], next: [] },
    { id: "reply-pei-2", type: "action", actions: [], next: [] },
    { id: "pei-day21-reply-1", type: "action", actions: [], next: [] },
  ],
  chats: [{ app: "kakao", title: "裴知聿", participants: ["owner", "peizhiyu"], messages: [] }],
  content: { photos: [] }, variables: { pei_attraction: 70 },
});
const build = () => injectBrick3PeiPhotoV4(base(), manifest);
test("10 uploaded photos compile to 10 daily time candidates and 40 independent replies", () => {
  const s = build();
  const times = s.events.filter(e => /^brick3-photo-pei_zhiyu_v4_\d\d-time$/.test(e.id));
  const pictures = s.chats[0].messages.filter(m => m.kind === "image");
  const outgoing = s.chats[0].messages.filter(m => m.outgoing && /^brick3-photo-pei_zhiyu_v4_\d\d-choice-\d-out$/.test(m.id));
  assert.equal(times.length, 10);
  assert.equal(pictures.length, 10);
  assert.equal(outgoing.length, 40);
  assert.equal(s.content.photos.length, 0);
  for (const e of times) {
    assert.equal(e.event, "time");
    assert.ok(e.conditions.some(c => c.key === "pei_v4_contact_active"));
    assert.ok(e.conditions.some(c => c.key === "pei_v4_stop_all_photos"));
  }
  for (const picture of pictures) {
    assert.match(picture.media, /^\.\/story-photos\/pei_zhiyu\/pei_zhiyu_[a-z0-9_]+\.webp$/);
    assert.equal(picture.hidden, true);
  }
});
test("L2 and L3 cannot arrive based on affection alone", () => {
  const s = build();
  const lookup = Object.fromEntries(s.events.map(x => [x.id, x]));
  for (const i of [6, 7, 8]) {
    const id = "brick3-photo-pei_zhiyu_v4_" + String(i).padStart(2, "0") + "-time";
    const n = lookup[id];
    assert.equal(n.conditions.find(c => c.key === "pei_v4_photo_consent_level")?.value, i === 6 ? 1 : 2);
    assert.ok(n.conditions.some(c => c.key === "pei_v4_no_suggestive"));
  }
  assert.ok(lookup["brick3-photo-pei_zhiyu_v4_consent_2-options"].next.length === 4);
  assert.ok(lookup["brick3-photo-pei_zhiyu_v4_consent_3-options"].next.length === 4);
  assert.ok(lookup["brick3-photo-pei_zhiyu_v4_consent_2-wait-before-asking"].delayMs >= 3600000);
});
test("player must actually reply before the next scene becomes ready", () => {
  const s = build();
  const node = Object.fromEntries(s.events.map(x => [x.id, x]));
  const p = "brick3-photo-pei_zhiyu_v4_01";
  assert.deepEqual(node[p + "-text-arrive"].next, [p + "-options"]);
  assert.equal(node[p + "-options"].next.length, 4);
  assert.ok(!node["reply-pei-2"].next.includes(p + "-cooldown"));
  assert.equal(node[p + "-choice-1-reply"].next[0], "brick3-photo-pei_zhiyu_v4_02-cooldown");
  assert.equal(node["brick3-photo-pei_zhiyu_v4_06-time"].conditions.find(x => x.key === "pei_v4_photo_consent_level")?.op, "gt");
});
test("reentrant compiler is idempotent and does not modify other stories", () => {
  const s = build(), len = s.events.length;
  injectBrick3PeiPhotoV4(s, manifest);
  assert.equal(s.events.length, len);
  const other = base();other.id = "not-brick3";
  injectBrick3PeiPhotoV4(other, manifest);
  assert.equal(other.events.length, 3);
});
