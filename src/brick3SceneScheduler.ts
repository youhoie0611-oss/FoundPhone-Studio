import { makeItem, type Runtime, type Work } from "./schema";

const lines: Record<string, Record<string, string[]>> = {
  "沈硯舟": {
    recognized: ["昨天提到活動的事。", "妳那天是不是忙到很晚才走？"],
    conversation_redirected: ["昨天聊到活動結束後的事。", "我後來找回落在現場的相機背帶了。", "妳那天有順利回家嗎？"],
    details_requested: ["昨天妳問的是活動現場的照片。", "我先不傳，等妳確定願意看再說。"],
    view_agreed: ["照片我還在整理。", "我會先徵求妳同意，不會擅自公開。"],
  },
  "裴知聿": {
    intent_revealed: ["昨天我說想重新開始。", "我知道那不是一句話就能解決的事。", "妳如果願意，我想先聽妳怎麼看當初的問題。"],
    conversation_open: ["昨天妳願意聽我說，我很感謝。", "但我不會把那當成妳願意復合。", "妳想繼續談的時候再告訴我。"],
  },
  "祁野": {
    apology_owed: ["昨天的事我想過了。", "道歉不是要妳馬上原諒。"],
  },
  "陸沉川": {
    work_explained: ["昨天說到工作的事。", "我今天才有空整理思緒。", "妳如果還想知道，我可以慢慢說。"],
  },
};

export function tickBrick3SceneEvents(work: Work, state: Runtime): Runtime {
  if (work.id !== "between-the-lines-b-demo") return state;
  const now = state.elapsedMs ?? 0;
  for (const event of state.brick3SceneEvents ?? []) {
    if (event.sent || now < event.due) continue;
    event.sent = true;
    if (state.variables[`brick3:scene:${event.thread}`] !== event.outcome) continue;
    if (state.variables[`brick3:relationship:${event.thread}:conflict`] === "boundary") continue;
    const messages = lines[event.thread]?.[event.outcome];
    if (!messages) continue;
    state.messages.kakao ??= [];
    messages.forEach((body, index) => {
      const id = `brick3-crossday-${event.thread}-${event.due}-${index}`;
      if (state.messages.kakao.some(item => item.id === id)) return;
      state.messages.kakao.push(makeItem({ id, title: event.thread, sender: event.thread, body, time: `${state.date ?? work.phone.date} ${state.time}` }));
      state.notifications.push(`${event.thread}：${body}`);
    });
  }
  return state;
}
