const banned = ["hate","violence","terror","porn","drugs"];
export type ModerationResult = { ok:boolean; reasons:string[] };
export function aiModerate(text:string): ModerationResult {
  const t=(text||"").toLowerCase();
  const reasons=banned.filter(w=>t.includes(w));
  return { ok: reasons.length===0, reasons };
}
