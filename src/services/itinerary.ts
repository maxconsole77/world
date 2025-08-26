import poisByCity from "../data/pois.json";

export type Family = "Arte & Storia"|"Famiglia"|"Cibo & Mercati"|"Natura & Parchi"|"Panorami";
export type Prefs = Partial<Record<Family, number>>;
export type Item = { day:number; time:"mattina"|"pomeriggio"|"sera"; poi:any };

export function familiesForCity(city:string): Family[] {
  const list = (poisByCity as any)[city] || [];
  return Array.from(new Set(list.map((p:any)=>p.family))) as Family[];
}
export function listPOIs(city:string){ return (poisByCity as any)[city] || []; }

export function generate(city:string, days:number, prefs:Prefs, selectedIds:string[]=[]): Item[] {
  const all = listPOIs(city);
  const weight = (p:any)=>(prefs[p.family as Family] ?? 0.5) + (p.type==="food"?0.1:0);
  let ranked = [...all].sort((a,b)=>weight(b)-weight(a));
  if (selectedIds.length){ const sel=new Set(selectedIds); ranked = ranked.filter(p=>sel.has(p.id)); }
  const slots = ["mattina","pomeriggio","sera"] as const; const total = Math.min(days*slots.length, ranked.length);
  const used = new Set<string>(); const plan: Item[] = []; let i=0;
  for(let s=0;s<total;s++){
    const day=Math.floor(s/slots.length)+1; const time=slots[s%slots.length];
    let chosen = ranked[i%ranked.length]; let guard=0;
    while(chosen && used.has(chosen.id) && guard<ranked.length){ i++; chosen=ranked[i%ranked.length]; guard++; }
    if(!chosen) break; used.add(chosen.id); plan.push({day,time,poi:chosen}); i++;
  }
  return plan;
}
