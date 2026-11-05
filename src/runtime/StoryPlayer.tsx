import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    // Always fetch the latest published story; an installed PWA must not
    // silently keep serving an older work.json after a deployment.
    const storyFile = new URLSearchParams(location.search).get("preview") === "test"
      ? "./test-work.json"
      : new URLSearchParams(location.search).get("template") === "blank"
        ? "./blank-work.json"
        : "./work.json";
    const storyUrl = new URL(storyFile, window.location.href);
    storyUrl.searchParams.set("revision", String(Date.now()));
    fetch(storyUrl.toString(), { signal: abort.signal, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title =
          w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);
  return (
    <main className="story-runtime">
      {work ? (
        <Phone work={work} />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
