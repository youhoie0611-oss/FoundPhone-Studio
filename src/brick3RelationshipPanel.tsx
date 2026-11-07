import { V8_LEADS, type V8Lead } from "./brick3Relationships";
import { CHARACTER_CANON } from "./characterCanon";
import type { Runtime } from "./schema";
import "./brick3RelationshipPanel.css";

type Props = { state: Runtime; close(): void };
const ids: Record<V8Lead, string> = {
  "沈硯舟": "shen", "裴知聿": "pei", "祁野": "qi",
  "顧時安": "gu", "陸沉川": "lu",
};
const labels = [
  { key: "affection", label: "好感度", aliases: ["attraction", "affection", "favor", "好感度"] },
  { key: "jealousy", label: "嫉妒值", aliases: ["jealousy", "jealous", "嫉妒值"] },
] as const;

function score(state: Runtime, lead: V8Lead, key: string, aliases: readonly string[]): number | null {
  const prefix = ids[lead];
  const variables = state.variables ?? {};
  const candidates = aliases.flatMap(alias => [
    `${prefix}_${alias}`, `${prefix}:${alias}`,
    `brick3:${prefix}:${alias}`, `${lead}_${alias}`,
    `${lead}:${alias}`,
  ]);
  for (const name of candidates) {
    const raw = variables[name];
    if (typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "")) {
      const value = Number(raw);
      if (Number.isFinite(value)) return Math.max(0, Math.min(100, Math.round(value)));
    }
  }
  // Initial affection is canon; other values remain unavailable until tracked.
  return key === "affection" ? CHARACTER_CANON[lead].initialAffection : null;
}

export function Brick3RelationshipPanel({ state, close }: Props) {
  return (
    <section className="brick3-contacts" aria-label="男主角關係">
      <header className="brick3-contacts-header">
        <button type="button" onClick={close} aria-label="返回桌面">‹ 返回</button>
        <strong>通訊錄</strong>
      </header>
      <div className="brick3-contacts-list">
        {V8_LEADS.map(lead => (
          <article className="brick3-contact" key={lead}>
            <div className="brick3-contact-name">
              <span className="brick3-contact-avatar" aria-hidden="true">{lead.slice(0, 1)}</span>
              <strong>{lead}</strong>
            </div>
            <div className="brick3-contact-scores">
              {labels.map(metric => {
                const value = score(state, lead, metric.key, metric.aliases);
                return (
                  <div className="brick3-contact-score" key={metric.key}>
                    <span>{metric.label}</span>
                    <strong>{value === null ? "—" : value}</strong>
                    <div className="brick3-contact-track" aria-hidden="true">
                      <span style={{ width: `${value ?? 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
