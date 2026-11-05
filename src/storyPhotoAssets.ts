import { useEffect, useState } from "react";
import type { Item } from "./schema";

/** Only hand-curated game assets are permitted. No arbitrary remote image URLs. */
const PHOTO_PATH = /^\.\/story-photos\/(shen_yanzhou|pei_zhiyu|qi_ye|gu_shian|lu_chenchuan)\/([a-z0-9_]+)\.webp$/;
const availability = new Map<string, boolean>();

export function isStoryPhotoPath(value: string): boolean {
  return PHOTO_PATH.test(value);
}

export function storyPhotoUrl(value: string): string {
  if (!isStoryPhotoPath(value)) return value;
  return `${import.meta.env.BASE_URL}story-photos/${value.slice("./story-photos/".length)}`;
}

/** An uploaded WebP only becomes visible when the published build actually serves it. */
export function useStoryPhotoAvailability(items: Item[]): (item: Item) => boolean {
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const paths = [...new Set(items.map((i) => i.media).filter(isStoryPhotoPath))].sort().join("|");
  useEffect(() => {
    let active = true;
    for (const path of paths ? paths.split("|") : []) {
      if (availability.has(path)) {
        if (active) setKnown((old) => ({ ...old, [path]: availability.get(path)! }));
        continue;
      }
      void fetch(storyPhotoUrl(path), { method: "HEAD", cache: "no-store" })
        .then((response) => response.ok && /^image\/(webp|octet-stream)/i.test(response.headers.get("content-type") ?? ""))
        .catch(() => false)
        .then((exists) => {
          availability.set(path, exists);
          if (active) setKnown((old) => ({ ...old, [path]: exists }));
        });
    }
    return () => { active = false; };
  }, [paths]);
  return (item) => !isStoryPhotoPath(item.media) || known[item.media] === true;
}
