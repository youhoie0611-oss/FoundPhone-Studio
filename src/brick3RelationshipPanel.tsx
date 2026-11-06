import { V8_LEADS, discloseV8Relationship, undoV8Decision, requestV8Negotiation } from "./brick3Relationships";
import type { Runtime } from "./schema";
import "./brick3RelationshipPanel.css";

const statuses: Record<string, string> = {
  single: "未確認戀愛關係", ambiguous: "曖昧中", dating: "交往中",
  secret: "秘密交往", separated: "已分開",
};
const agreements: Record<string, string> = {
  unspecified: "尚未討論排他性", exclusive: "已約定專一",
  nonexclusive: "已協商非排他", unresolved: "關係約定待釐清",
};
type Props = { state: Runtime; close(): void; onUpdate(next: Runtime): void };
export function Brick3RelationshipPanel({ state, close, onUpdate }: Props) {
  const v = state.brick3V8;
  const action = (operation: (next: Runtime) => boolean) => {
    const next = structuredClone(state);
    if (operation(next)) onUpdate(next);
  };
  const todayUndo = v?.undo && !v.undo.used && (state.elapsedMs ?? 0) - v.undo.at < 86400000;
  return (
    <section className="brick3-relation-overlay" aria-label="磚3戀愛關係">
      <header className="brick3-relation-heading">
        <strong>我的關係</strong>
        <button type="button" onClick={close} aria-label="關閉關係卡">關閉</button>
      </header>
      <p>以下只顯示妳已確認的關係及已發現的線索。人物心裡的數值與未揭露的秘密不會顯示。</p>
      {todayUndo && (
        <button type="button" className="brick3-relation-undo"
          onClick={() => action(next => undoV8Decision(next))}>
          撤銷今日尚未送達的關係決定
        </button>
      )}
      {V8_LEADS.map(lead => {
        const bond = v?.bonds[lead], c = v?.confessions[lead];
        const partners = V8_LEADS.filter(n => n !== lead &&
          ["dating", "secret"].includes(v?.bonds[n]?.status ?? ""));
        const canDisclose = !!bond && ["dating", "secret"].includes(bond.status) &&
          partners.some(n => !bond.knows[n]);
        return (
          <article className="brick3-relation-card" key={lead}>
            <strong>{lead}</strong>
            <div>{statuses[bond?.status ?? "single"]}</div>
            {bond && bond.status !== "single" && <small>{agreements[bond.exclusivity]}</small>}
            {c?.status === "pending" && <small>有一則告白待回覆（14 個遊戲日內）</small>}
            {!!bond?.discoveries.length && <small>已發現線索：{bond.discoveries.length} 則</small>}
            {bond?.psychologicalObservation && <p>{bond.psychologicalObservation}</p>}
            {bond && ["dating", "secret"].includes(bond.status) && (
              <button type="button" onClick={() => action(next => requestV8Negotiation(next, lead))}>
                討論關係界線
              </button>
            )}
            {canDisclose && (
              <button type="button" onClick={() => action(next => discloseV8Relationship(next, lead))}>
                向{lead}坦白其他戀愛關係
              </button>
            )}
          </article>
        );
      })}
    </section>
  );
}
