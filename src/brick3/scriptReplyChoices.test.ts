import { describe, expect, it } from "vitest";
import { authoredReplies } from "./scriptReplyChoices";

const make = (prefix: string) => ["a","b","c","d"].map((code) => ({label: code, target: prefix + code}));

describe("磚3 KKT 正式四分歧優先於制式回覆", () => {
  it("matches only the current character's latest longform turn", () => {
    const a=make("z3-long-shen-c2-choice-");
    expect(authoredReplies("沈硯舟",{id:"z3-long-shen-c2-follow",outgoing:false,meta:{}},a)).toEqual(a);
    expect(authoredReplies("祁野",{id:"z3-long-shen-c2-follow",outgoing:false,meta:{}},a)).toEqual([]);
    expect(authoredReplies("沈硯舟",{id:"z3-long-shen-c1-follow",outgoing:false,meta:{}},a)).toEqual([]);
  });
  it("does not show resolved choices after an NPC response or player answer", () => {
    const a=make("z3-long-lu-c1-choice-");
    expect(authoredReplies("陸沉川",{id:"z3-long-lu-c1-reply-ask",outgoing:false,meta:{}},a)).toEqual([]);
    expect(authoredReplies("陸沉川",{id:"z3-long-lu-c1-player-ask",outgoing:true,meta:{}},a)).toEqual([]);
  });
  it("handles initial ex and actor-specific photos without leaking across threads", () => {
    const intro=make("pei-intro-choice-");
    expect(authoredReplies("裴知聿",{id:"pei-intro-context",outgoing:false,meta:{}},intro)).toEqual(intro);
    const gu=make("gu-photo-site-choice-");
    expect(authoredReplies("顧時安",{id:"gu-photo-site-caption",outgoing:false,meta:{guScene:"gu-photo-site"}},gu)).toEqual(gu);
  });
  it("handles Lin An's invitations and Lu's private choice without auto-accepting", () => {
    const lin=make("z3-lu-invite-");
    expect(authoredReplies("林安",{id:"z3-lin-night-invite",outgoing:false,meta:{}},lin)).toEqual(lin);
    const lu=make("z3-lu-private-choice-");
    expect(authoredReplies("陸沉川",{id:"z3-lu-private-context",outgoing:false,meta:{}},lu)).toEqual(lu);
  });
  it("refuses to present unrelated or incomplete four-choice groups", () => {
    expect(authoredReplies("沈硯舟",{id:"z3-v6-shen-follow",outgoing:false,meta:{}},make("z3-v6-shen-choice-").slice(0,3))).toEqual([]);
    expect(authoredReplies("沈硯舟",undefined,make("z3-v6-shen-choice-"))).toEqual([]);
  });
});
