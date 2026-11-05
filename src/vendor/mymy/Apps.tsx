/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Home,
  Grid,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Share,
  User,
  Bell,
  X,
  Menu,
  Compass,
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { useSkinState } from "../../skinState";
import type { Item } from "../../schema";
import "./ui.css";
import "./adapter.css";
const characterAvatar: Record<string, string> = {
  "沈硯舟": "shen-yanzhou-avatar.png",
  "裴知聿": "pei-zhiyu-avatar.png",
  "祁野": "qi-ye-avatar.png",
};
function chatAvatar(name: string, fallback?: string) {
  const normalized = name.trim().replace(/^[\s\u3000]+|[\s\u3000]+$/g, "");
  const file = characterAvatar[normalized] ?? Object.entries(characterAvatar).find(([character]) => normalized.includes(character))?.[1];
  return file ? `${import.meta.env.BASE_URL}characters/${file}` : fallback;
}
/** Sort by actual displayed timestamp, not by string prefix (HH:mm vs YYYY-MM-DD HH:mm). */
function messageClock(item: Item): number {
  const match = item.time.match(/(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const clock = match ? Number(match[1]) * 60 + Number(match[2]) : -1;
  const date = item.time.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!date) return clock;
  return Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3])) / 60000 + clock;
}
function grouped(items: Item[]) {
  const groups = [...new Set(items.map((i) => i.title))].map((title) => ({
    title,
    items: items.filter((i) => i.title === title)
      .map((item, index) => ({ item, index }))
      .sort((a, b) => messageClock(a.item) - messageClock(b.item) || a.index - b.index)
      .map(({ item }) => item),
  }));
  // The chat list is ordered by the time shown on screen, newest first.
  // Legacy scripted records can carry dates from a different story day;
  // comparing those dates against live HH:mm replies misorders the inbox.
  const visibleMinute = (item: Item) => {
    const match = item.time.match(/(\\d{1,2}):(\\d{2})(?::\\d{2})?$/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : -1;
  };
  return groups.sort((a, b) =>
    visibleMinute(b.items.at(-1)!) - visibleMinute(a.items.at(-1)!));
}
export function messageRun(items: Item[], index: number) {
  const m = items[index],
    previous = items[index - 1],
    next = items[index + 1];
  return {
    first:
      !previous ||
      previous.outgoing !== m.outgoing ||
      previous.sender !== m.sender,
    last: !next || next.outgoing !== m.outgoing || next.sender !== m.sender,
  };
}
const read = (p: SkinProps, i: Item) =>
  p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
function Blank() {
  return <p className="mymy-empty">暂无内容</p>;
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="返回" onClick={onClick}>
      <ArrowLeft size={22} />
    </button>
  );
}
export function MymyKakao(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "聊天"),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  const list = grouped(p.items),
    messages = grouped(p.items).find((g) => g.title === p.thread)?.items ?? [],
    scroll = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  // A thread is read when opened; never mark other conversations or outgoing messages.
  const acknowledged = useRef(new Set<string>());
  useEffect(() => {
    if (!p.thread || p.creator) return;
    const unread = messages.filter((m) =>
      !m.outgoing && !m.read && !p.readIds?.includes(m.id) && !acknowledged.current.has(m.id)
    );
    for (const item of unread) {
      acknowledged.current.add(item.id);
      p.onRead(item.id);
    }
  }, [p.thread, p.creator, p.items, p.readIds, p.onRead]);

  const lastMessage = messages[messages.length - 1];
  // Photo events use actual engine choices, not ad-hoc text replies.
  const activePhotoEvent = !p.creator && !lastMessage?.outgoing ? lastMessage?.meta?.photoEventId : "";
  const photoChoices = activePhotoEvent
    ? (p.choices ?? []).filter((option) => option.target.startsWith(`brick3-photo-${activePhotoEvent}-option-`))
    : [];
  const lastLines = lastMessage && !lastMessage.media && !lastMessage.outgoing
    ? lastMessage.body.split("\n").filter(Boolean) : [];
  const lastKey = lastMessage ? p.thread + ":" + lastMessage.id : "";
  const shownLines = revealed[lastKey] ?? 1;
  const isTyping = !p.creator && lastLines.length > shownLines;
  useEffect(() => {
    if (!p.thread || !lastKey || !isTyping) return;
    const delay = p.thread === "祁野" ? 720 : p.thread === "裴知聿" ? 1550 : 1080;
    const timer = window.setTimeout(() => {
      setRevealed((current) => ({ ...current, [lastKey]: (current[lastKey] ?? 1) + 1 }));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [p.thread, lastKey, shownLines, isTyping]);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.thread, messages.length]);
  const lastRead = useRef("");
  useEffect(() => {
    if (!p.thread || p.creator || isTyping) return;
    const latest = [...messages].reverse().find((m) => !m.outgoing && m.meta.local !== "true");
    if (!latest) return;
    const key = p.thread + ":" + latest.id;
    if (lastRead.current === key) return;
    lastRead.current = key;
    p.onRead(latest.id);
  }, [p.thread, p.creator, messages, p.onRead, isTyping]);
  return (
    <div className="mymy-ui mymy-kakao" data-mymy="kakao">
      {p.thread ? (
        <>
          <header className="kzth">
            <Back onClick={() => p.onThread("")} />
            <span className="kzname">{p.thread}</span>
            <span className="kzpill">
              <button aria-label="聊天菜单" onClick={() => setMenu(!menu)}>
                <Menu size={21} />
              </button>
            </span>
          </header>
          <div className="msgs kk" ref={scroll}>
            {messages.map((m, i) => {
              const run = messageRun(messages, i);
              return (
                <div
                  key={m.id}
                  className={
                    "kzm " +
                    (m.outgoing ? "kzmy" : "kzot") +
                    (run.first ? " first" : "")
                  }
                >
                  {!m.outgoing && run.first && (
                    <>
                      <div className="kzmav">
                        <Avatar name={m.sender} src={chatAvatar(m.sender, m.avatar)} />
                      </div>
                      <div className="kzmn">{m.sender}</div>
                    </>
                  )}
                  {m.outgoing && run.last && (
                    <span className="kzt">
                      {m.read ? "已讀" : ""}
                      <br />
                      {m.time.slice(-5)}
                    </span>
                  )}
                  <div className="kkt-bubble-stack">
                    {(m.media ? [m.body] : m.body.split("\n").filter(Boolean).slice(0, m.id === lastMessage?.id && !m.outgoing ? shownLines : undefined)).map((line, index) => (
                      <button
                        key={index}
                        className={"kzbub" + (m.media ? " kzimg" : "")}
                        onClick={() => m.meta.local !== "true" && read(p, m)}
                      >
                        {m.media ? <Media item={m} /> : line}
                      </button>
                    ))}
                  </div>
                  {!m.outgoing && run.last && (
                    <span className="kzt">{m.time.slice(-5)}</span>
                  )}
                </div>
              );
            })}
            {isTyping && <div className="kkt-typing" role="status" aria-live="polite">{p.thread} 正在輸入…</div>}
            {!messages.length && <Blank />}
          </div>
          {!p.creator && !isTyping && !lastMessage?.outgoing && (
            <div className="kkt-reply-tray" aria-label="四個不同的回覆選項">
              {(() => {
                const photoEvent = lastMessage?.meta?.photoEventId ?? "";
                const photoOptions = photoEvent ? (p.choices ?? []).filter((choice) =>
                  choice.target.startsWith("brick3-photo-" + photoEvent + "-choice-")
                ) : [];
                if (photoOptions.length === 4) return photoOptions.map((choice) => (
                  <button type="button" key={choice.target} className="kkt-reply-choice" onClick={() => p.onChoose?.(choice.target)}>{choice.label}</button>
                ));
                const latest = lastMessage?.body ?? "";
                // Match the complete delivered turn, not only a generic keyword.
                // Earlier lines in the same message contain the actual question and context.
                const options = p.thread === "顧時安" && /提案被退|失落|心情其實不太好/.test(latest)
                  ? ["想聊聊發生什麼事嗎？", "你接下來打算怎麼做？", "先休息吧，不用急著說。", "我現在也有點累，改天再聊。"]
                  : p.thread === "顧時安" && /建築展|一起逛|城市散步/.test(latest)
                    ? ["時間地點是什麼？", "我這次不方便去。", "你為什麼對這個展有興趣？", "我先看看工作安排。"]
                    : p.thread === "顧時安" && /城市展覽|建築設計|這類活動/.test(latest)
                  ? ["聽起來有趣，是什麼展覽？", "你怎麼會有我的聯絡方式？", "謝謝邀請，但我對這類活動沒興趣。", "我現在工作有點忙，改天再聊。"]
                  : p.thread === "沈硯舟" && /介意我傳|傳給妳看看|入鏡/.test(latest)
                  ? ["可以啊，傳給我看看。", "我不太想讓照片被傳來傳去。", "你拍到的是哪一張？", "你怎麼知道那個人是我？"]
                  : p.thread === "沈硯舟" && /上次活動|那位|是妳|是你/.test(latest)
                    ? ["對，是我。你還記得我？", "你是不是認錯人了？", "你怎麼認出我的？", "我們好像還不太熟，先說說你是誰吧。"]
                    : p.thread === "裴知聿" && /分手|以前的照片|很久沒聯絡/.test(latest)
                      ? ["你突然聯絡我，是想說什麼？", "我們不是說好先不要聯絡嗎？", "我最近還好，你呢？", "我現在不想聊以前的事。"]
                      : p.thread === "祁野" && /停車場|擋路|生氣/.test(latest)
                        ? ["對，是我。你那天真的擋到路了。", "你怎麼知道是我？", "我沒有生氣，但你應該先道歉。", "這件事就算了，別再提了。"]
                        : /下班了沒|下班了|今天下班/.test(latest)
                          ? ["剛下班，今天真的有點累。", "還沒，手邊的工作還沒做完。", "你今天怎麼忙成這樣？", "我晚點再跟你聊。"]
                          : /週五|活動|現場/.test(latest)
                            ? ["你說的是哪個活動？", "那天我可能沒空。", "活動是幾點開始？", "你怎麼突然提起這件事？"]
                            : /照片|相機|拍/.test(latest)
                              ? ["可以傳給我看看嗎？", "先不用傳，謝謝。", "那張照片在哪裡拍的？", "你怎麼突然提起照片？"]
                              : /分手|聯絡|以前/.test(latest)
                                ? ["你找我到底有什麼事？", "我不想再談以前的事。", "你現在是怎麼想的？", "我們先保持距離吧。"]
                                : /停車場|擋路|車/.test(latest)
                                  ? ["你那天有看到我嗎？", "你先把那件事解釋清楚。", "算了，我不想再追究。", "你平常都這樣跟人搭話？"]
                                  : /吃飯|聚餐|週末|約/.test(latest)
                                    ? ["好啊，時間地點呢？", "我可能要加班，先別算我。", "還有誰會去？", "這次我先不去了。"]
                                    : ["你想說什麼？", "有事就直接說吧。", "我現在有點忙，晚點聊。", "你最近過得怎麼樣？"];
                if (photoChoices.length === 4) return photoChoices.map((option) => (
                  <button type="button" key={option.target} className="kkt-reply-choice" onClick={() => p.onChoose?.(option.target)}>
                    {option.label}
                  </button>
                ));
                return options.map((reply, index) => (
                  <button type="button" key={index} className="kkt-reply-choice" onClick={() => p.onCustomMessage?.(p.thread, reply)}>
                    {reply}
                  </button>
                ));
              })()}
            </div>
          )}
          {menu && (
            <div className="mymy-local-menu">
              <strong>{p.thread}</strong>
              <p>
                群成员：{[...new Set(messages.map((m) => m.sender))].join("、")}
              </p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </>
      ) : (
        <div className="kzkk">
          <div className="kzhd">
            <header className="kzkh">
              <b className="kzti">
                {tab === "好友" ? p.owner || "好友" : "聊天"}
              </b>
              <span className="kzic">
                <button
                  aria-label="搜索聊天"
                  onClick={() => setQuery(query ? "" : " ")}
                >
                  <Search size={21} />
                </button>
                {p.creator && (
                  <button aria-label="新增内容" onClick={p.onAdd}>
                    <Plus />
                  </button>
                )}
                <button aria-label="KKT设置" onClick={() => setMenu(!menu)}>
                  <Settings size={21} />
                </button>
              </span>
            </header>
            <div className="kzkc2">
              {["好友", "聊天"].map((t) => (
                <button
                  key={t}
                  className={
                    "kzkpl " +
                    (t === tab || (t === "为你推荐" && tab === "推荐")
                      ? "on"
                      : "")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {query !== "" && (
              <input
                className="mymy-search"
                aria-label="搜索KKT"
                value={query.trimStart()}
                onChange={(e) => setQuery(e.target.value || " ")}
                placeholder="搜索"
              />
            )}
          </div>
          <div className="kzkb">
            <div className="kzksec">
              {tab === "好友" ? "好友" : "全部聊天"} {list.length}
            </div>
            {list
              .filter((g) => g.title.includes(query.trim()))
              .map((g) => {
                const last = g.items.at(-1)!;
                const unread = g.items.filter((item) =>
                  !item.outgoing && !item.read && !p.readIds?.includes(item.id)
                ).length;
                return (
                  <button
                    className="kzkr kzkcr"
                    key={g.title}
                    onClick={() => p.onThread(g.title)}
                  >
                    <Avatar name={g.title} src={chatAvatar(g.title, last.avatar)} />
                    <span className="kzkn">
                      <b>{g.title}</b>
                      <small>{tab === "好友" ? last.sender : last.body}</small>
                    </span>
                    <span className="kzkmt">
                      {last.time.slice(-5)}
                      {unread > 0 && (
                        <i className="kzkbd" aria-label={`未讀 ${unread} 則訊息`}>{unread > 99 ? "99+" : unread}</i>
                      )}
                    </span>
                  </button>
                );
              })}
            {!list.length && <Blank />}
          </div>
          <nav className="kzknv">
            {[Users, MessageCircle, Compass, Grid, MoreHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  aria-label={["好友", "聊天", "发现", "更多功能", "设置"][i]}
                  className={(tab === "好友" ? 0 : 1) === i ? "on" : ""}
                  onClick={() =>
                    i < 2 ? setTab(["好友", "聊天"][i]) : setMenu(true)
                  }
                >
                  <Icon />
                </button>
              ),
            )}
          </nav>
          {menu && (
            <div className="mymy-local-menu">
              <strong>KakaoTalk</strong>
              <p>作品内聊天</p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function MymyInstagram(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "主页"),
    [liked, setLiked] = useSkinState<string[]>(p, "mymyLiked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "mymySaved", []),
    [replies, setReplies] = useSkinState<string[]>(p, "mymyReplies", []),
    [seen, setSeen] = useSkinState<string[]>(p, "mymySeen", []);
  const [profileOwner, setProfileOwner] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Item | null>(null),
    [selected, setSelected] = useState<Item | null>(null),
    [story, setStory] = useState(0),
    [draft, setDraft] = useState(""),
    [pop, setPop] = useState("");
  const posts = p.items.filter(
      (i) => i.folder !== "私信" && i.meta.story !== "true",
    ),
    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = p.items.filter((i) => i.folder === "私信"),
    active = stories[story - 1],
    displayedProfile = profileOwner ?? p.owner ?? "妳",
    profilePosts = posts.filter((item) => item.sender === displayedProfile);
  const toggle = (id: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setStory((n) => (n < stories.length ? n + 1 : 0)),
      5000,
    );
    return () => clearTimeout(t);
  }, [active, stories.length]);
  const openStory = (i: number) => {
    const m = stories[i];
    setSeen([...new Set([...seen, m.id])]);
    read(p, m);
    setStory(i + 1);
  };
  const openPost = (i: Item) => {
    if (p.creator || i.password) p.onItem(i);
    else {
      read(p, i);
      setSelected(i);
    }
  };
  const post = (i: Item) => (
    <article className="igp" key={i.id}>
      <header className="igph">
        <Avatar name={i.sender} src={chatAvatar(i.sender, i.avatar)} />
        <div className="igpn">
          <button onClick={() => { setProfileOwner(i.sender); setSelected(null); setTab("个人主页"); }}>
            <b>{i.sender}</b>
          </button>
          <small>{i.meta.location || i.time}</small>
        </div>
        <button aria-label="帖子详情" onClick={() => openPost(i)}>
          <MoreHorizontal />
        </button>
      </header>
      <div
        className="carw"
        onDoubleClick={() => {
          if (!liked.includes(i.id)) setLiked([...liked, i.id]);
          setPop(i.id);
        }}
      >
        <Media item={i} />
        {pop === i.id && (
          <Heart
            className="mymy-heart-pop"
            fill="white"
            onAnimationEnd={() => setPop("")}
          />
        )}
      </div>
      <div className="iga">
        <button
          aria-label={"点赞" + i.title}
          aria-pressed={liked.includes(i.id)}
          onClick={() => toggle(i.id, liked, setLiked)}
        >
          <Heart
            fill={liked.includes(i.id) ? "#ff3040" : "none"}
            color={liked.includes(i.id) ? "#ff3040" : "currentColor"}
          />
        </button>
        <button
          aria-label={"评论" + i.title}
          onClick={() => {
            read(p, i);
            setSheet(i);
          }}
        >
          <MessageCircle />
        </button>
        <button aria-label="分享帖子" onClick={() => setTab("私信")}>
          <Send />
        </button>
        <button
          className="mymy-save"
          aria-label={"收藏" + i.title}
          aria-pressed={saved.includes(i.id)}
          onClick={() => toggle(i.id, saved, setSaved)}
        >
          <Bookmark fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="lk2">{i.likes + (liked.includes(i.id) ? 1 : 0)} 次赞</p>
      <button
        className="igc"
        onClick={() => {
          openPost(i);
        }}
      >
        <b>{i.sender}</b> {i.body}
      </button>
      <button className="cmall" onClick={() => setSheet(i)}>
        查看评论{" "}
        {i.comments.length +
          replies.filter((r) => r.startsWith(i.id + "\t")).length}
      </button>
      <p className="igt">{i.time}</p>
    </article>
  );
  return (
    <div className="mymy-ui mymy-instagram" data-mymy="instagram">
      <div className="ig">
        <header className="igh">
          <button
            aria-label={selected ? "返回Instagram动态" : "关闭当前App"}
            onClick={() => (selected ? setSelected(null) : tab === "个人主页" && profileOwner ? (setProfileOwner(null), setTab("主页")) : p.onBack())}
          >
            <ArrowLeft />
          </button>
          <span className="igl2">
            {selected ? "帖子" : tab === "主页" ? "Instagram" : tab}
          </span>
          <button aria-label="打开私信" onClick={() => setTab("私信")}>
            <Send />
          </button>
        </header>
        <div className="igb">
          {selected && post(selected)}
          {!selected && tab === "主页" && (
            <>
              <div className="sts">
                {stories.map((s, n) => (
                  <button
                    className="st"
                    key={s.id}
                    onClick={() => openStory(n)}
                  >
                    <span
                      className={"sr on " + (seen.includes(s.id) ? "seen" : "")}
                    >
                      <Avatar name={s.sender} src={chatAvatar(s.sender, s.avatar)} />
                    </span>
                    <small>{s.sender}</small>
                  </button>
                ))}
              </div>
              {posts.map(post)}
              {!posts.length && <Blank />}
            </>
          )}
          {!selected && tab === "个人主页" && (
            <>
              <div className="pf">
                <Avatar name={displayedProfile} src={chatAvatar(displayedProfile)} />
                <div className="ps">
                  <div>
                    <b>{profilePosts.length}</b>
                    <small>帖子</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>粉丝</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>关注</small>
                  </div>
                </div>
              </div>
              <p className="pn">{displayedProfile}</p>
              <div className="ptab">
                <div className="on">
                  <Grid />
                </div>
              </div>
              <div className="pg2">
                {profilePosts.map((i) => (
                  <button key={i.id} onClick={() => openPost(i)}>
                    <Media item={i} />
                  </button>
                ))}
              </div>
            </>
          )}
          {!selected && tab === "私信" && (
            <>
              {dms.map((i) => (
                <button className="kzkr" key={i.id} onClick={() => openPost(i)}>
                  <Avatar name={i.sender} src={chatAvatar(i.sender, i.avatar)} />
                  <span className="kzkn">
                    <b>{i.title}</b>
                    <small>{i.body}</small>
                  </span>
                </button>
              ))}
              {!dms.length && <Blank />}
            </>
          )}
          {!selected && tab === "搜索" && (
            <>
              <input
                className="mymy-search"
                aria-label="搜索Instagram"
                placeholder="搜索"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {posts
                .filter((i) => (i.title + i.body + i.sender).includes(draft))
                .map(post)}
            </>
          )}
        </div>
        <nav className="mymy-ig-nav">
          {[Home, Search, Send, User].map((Icon, n) => (
            <button
              key={n}
              aria-label={["主页", "搜索", "私信", "个人主页"][n]}
              aria-pressed={
                !selected && tab === ["主页", "搜索", "私信", "个人主页"][n]
              }
              onClick={() => {
                setSelected(null);
                if (n === 3) setProfileOwner(null);
                setTab(["主页", "搜索", "私信", "个人主页"][n]);
              }}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
      {sheet && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭评论"
            onClick={() => setSheet(null)}
          />
          <section className="kzsh" role="dialog" aria-label="Instagram评论">
            <div className="mymy-sheet-handle" />
            <header>
              <b>评论</b>
              <button aria-label="关闭评论面板" onClick={() => setSheet(null)}>
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              {[
                ...sheet.comments,
                ...replies
                  .filter((r) => r.startsWith(sheet.id + "\t"))
                  .map((r) => r.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>
                  <Avatar name={c.split(":")[0]} src={chatAvatar(c.split(":")[0])} />
                  {c}
                </p>
              ))}
            </div>
            <form
              className="cmb2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, sheet.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="添加评论"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="添加评论"
                maxLength={500}
              />
              <button>发布</button>
            </form>
          </section>
        </div>
      )}
      {active && (
        <div
          className="mymy-story"
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const next =
              e.clientX - box.left < box.width * 0.3 ? story - 1 : story + 1;
            setStory(next > stories.length ? 0 : Math.max(0, next));
          }}
        >
          <div className="mymy-story-bars">
            {stories.map((s, n) => (
              <i key={s.id} className={n < story ? "seen" : ""} />
            ))}
          </div>
          <header>
            <Avatar name={active.sender} src={chatAvatar(active.sender, active.avatar)} />
            <b>{active.sender}</b>
            <button
              aria-label="关闭快拍"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setStory(0)}
            >
              <X />
            </button>
          </header>
          <Media item={active} />
          <p>{active.body}</p>
        </div>
      )}
    </div>
  );
}
export function MymyX(p: SkinProps) {
  const [dark, setDark] = useSkinState<boolean>(p, "x-dark", true);
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "推荐"),
    [likes, setLikes] = useSkinState<string[]>(p, "mymyXLikes", []),
    [reposts, setReposts] = useSkinState<string[]>(p, "mymyXReposts", []),
    [marks, setMarks] = useSkinState<string[]>(p, "mymyXMarks", []),
    [query, setQuery] = useState("");
  const isLiked = (id: string) =>
    typeof p.ui?.["liked-" + id] === "boolean"
      ? Boolean(p.ui["liked-" + id])
      : likes.includes(id);
  const isSaved = (id: string) =>
    typeof p.ui?.["saved-" + id] === "boolean"
      ? Boolean(p.ui["saved-" + id])
      : marks.includes(id);
  const toggle = (id: string, v: string[], set: (x: string[]) => void) =>
    set(v.includes(id) ? v.filter((x) => x !== id) : [...v, id]);
  return (
    <div
      className={"mymy-ui mymy-x " + (dark ? "x-reference-dark" : "")}
      data-mymy="twitter"
    >
      <div className="kzxw">
        <header className="kzxh">
          <button aria-label="关闭当前App" onClick={p.onBack}>
            <ArrowLeft />
          </button>
          <div className="kzxlg">𝕏</div>
          <button aria-label="切换X外观" onClick={() => setDark(!dark)}>
            <User />
          </button>
        </header>
        <div className="kzxtb">
          {["为你推荐", "正在关注", "添加 +", "时间"].map((t) => (
            <button
              className={t === tab ? "on" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "搜索" && (
          <input
            className="mymy-search"
            aria-label="搜索X"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
          />
        )}
        <div className="kzxfd">
          {p.items
            .filter((i) => (i.title + i.body).includes(query))
            .map((i) => (
              <article className="kzxt" key={i.id}>
                <Avatar name={i.sender} src={chatAvatar(i.sender, i.avatar)} />
                <div className="kzxb">
                  <div className="kzxn">
                    <b>{i.sender}</b>
                    <small>
                      @{i.meta.handle || "user"} · {i.time.slice(-5)}
                    </small>
                    <em>
                      <MoreHorizontal size={18} />
                    </em>
                  </div>
                  <button
                    className="kzxx"
                    onClick={() => {
                      read(p, i);
                      p.onItem(i);
                    }}
                  >
                    {i.body}
                  </button>
                  {i.media && (
                    <button
                      className="kzxv"
                      aria-label="打开媒体"
                      onClick={() => p.onItem(i)}
                    >
                      <Media item={i} />
                    </button>
                  )}
                  <div className="kzxac">
                    <button
                      aria-label={"评论" + i.title}
                      onClick={() => p.onItem(i)}
                    >
                      <MessageCircle />
                      {i.comments.length}
                    </button>
                    <button
                      aria-label={"转发" + i.title}
                      aria-pressed={reposts.includes(i.id)}
                      onClick={() => toggle(i.id, reposts, setReposts)}
                    >
                      <Repeat2 />
                      {reposts.includes(i.id) ? 1 : 0}
                    </button>
                    <button
                      aria-label={"点赞" + i.title}
                      aria-pressed={isLiked(i.id)}
                      onClick={() => {
                        toggle(i.id, likes, setLikes);
                        p.onUi?.("liked-" + i.id, !isLiked(i.id));
                      }}
                    >
                      <Heart fill={isLiked(i.id) ? "#f91880" : "none"} />
                      {i.likes + (isLiked(i.id) ? 1 : 0)}
                    </button>
                    <span>
                      <BarChart2 />
                      {i.meta.views || "—"}
                    </span>
                    <button
                      aria-label={"收藏" + i.title}
                      aria-pressed={isSaved(i.id)}
                      onClick={() => {
                        toggle(i.id, marks, setMarks);
                        p.onUi?.("saved-" + i.id, !isSaved(i.id));
                      }}
                    >
                      <Bookmark />
                    </button>
                    <button aria-label="分享" onClick={() => p.onItem(i)}>
                      <Share />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!p.items.length && <Blank />}
        </div>
        <nav className="kzxnav">
          {[Home, Search, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={["时间线", "搜索", "通知", "私信"][n]}
              onClick={() => n < 2 && setTab(n ? "搜索" : "推荐")}
              disabled={n > 1}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
