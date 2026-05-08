import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ABILITY_LIST } from "@/lib/abilities";
import { findMetaPokemon, loadMetaData, MetaData, MetaPokemonEntry, MetaUsageEntry } from "@/lib/metaData";
import { getMultiplier, Pokemon, POKEMON_TYPES, PokemonType } from "@/lib/pokemonLogic";

const STORAGE_KEY = "pokemon-battle-tool-data-v1";
const PRIORITIES = ["high", "medium", "low"] as const;

type Priority = (typeof PRIORITIES)[number];

type ScorePart = {
  label: string;
  points: number;
  detail: string;
};

type Prediction = {
  p: Pokemon;
  speedType: string;
  reason: string;
  itemCandidates: string[];
  moves: string[];
  teraCandidates: MetaUsageEntry[];
  metaItems: MetaUsageEntry[];
  metaEntry: MetaPokemonEntry | null;
  score: number;
  scoreParts: ScorePart[];
};

const priorityLabel: Record<Priority, string> = { high: "高", medium: "中", low: "低" };
const priorityScore: Record<Priority, number> = { high: 2, medium: 0, low: -1 };

const normalizePokemon = (p: Partial<Pokemon>, id = crypto.randomUUID()): Pokemon => ({
  id: p.id ?? id,
  name: p.name ?? "",
  type1: p.type1 ?? "",
  type2: p.type2 ?? "",
  ability: p.ability ?? "",
  teraType: p.teraType ?? "",
  canMega: p.canMega ?? false,
  roleMemo: p.roleMemo ?? "",
  priority: (p.priority as Priority) ?? "medium",
  memo: p.memo ?? "",
  item: p.item ?? "",
});

const newPokemon = () => normalizePokemon({});
const cleanName = (name: string) => name.trim().replace(/\s+/g, "");
const hasName = (pokemon: Pokemon) => pokemon.name.trim().length > 0;
const isPokemonType = (value: string): value is Exclude<PokemonType, ""> => POKEMON_TYPES.includes(value as Exclude<PokemonType, "">);

function TypeSelect({ value, onChange, placeholder }: { value: PokemonType; onChange: (v: PokemonType) => void; placeholder: string }) {
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : (v as PokemonType))}>
      <SelectTrigger className="h-11"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">なし</SelectItem>
        {POKEMON_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function AbilitySelect({ value, onChange, placeholder = "特性を選択" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => ABILITY_LIST.filter((ability) => ability.includes(value)).slice(0, 20), [value]);

  return (
    <div className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
          <button type="button" className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted" onMouseDown={(e) => e.preventDefault()} onClick={() => onChange("")}>
            未選択
          </button>
          {filtered.map((ability) => (
            <button key={ability} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-muted" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(ability); setOpen(false); }}>
              {ability}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function clampScore(value: number) {
  return Math.max(1, Math.min(5, value));
}

function topLabel(entries: MetaUsageEntry[], fallback: string[]) {
  const metaLabels = entries.slice(0, 2).map((entry) => `${entry.name} ${Math.round(entry.rate)}%`);
  return metaLabels.length > 0 ? metaLabels : fallback;
}

function createShortReason(pokemonName: string, scoreParts: ScorePart[], metaEntry: MetaPokemonEntry | null) {
  const labels = scoreParts.filter((part) => part.points > 0).map((part) => part.label);
  const partner = metaEntry?.partners?.[0]?.name;
  if (labels.includes("上位構築") && partner) return `上位構築で見かけ、${partner}と同時採用の傾向が多いです。`;
  if (labels.includes("同時採用") && partner) return `${partner}といっしょに採用される傾向が多いです。`;
  if (labels.includes("採用率")) return `${pokemonName}は公開データで採用が多い傾向です。`;
  return "入力メモから出てきそうな型を予想しています。";
}

function scoreWithMeta(pokemon: Pokemon, opponents: Pokemon[], metaData: MetaData | null, speedType: string): Pick<Prediction, "metaEntry" | "metaItems" | "teraCandidates" | "score" | "scoreParts" | "reason"> {
  const metaEntry = findMetaPokemon(metaData, pokemon.name);
  const opponentNames = opponents.filter(hasName).map((opponent) => cleanName(opponent.name));
  const maxUsage = Math.max(
    1,
    ...opponents
      .map((opponent) => findMetaPokemon(metaData, opponent.name)?.usageCount ?? 0),
  );
  const scoreParts: ScorePart[] = [{ label: "基本予想", points: 1, detail: `${speedType}として予想` }];

  if (metaEntry?.usageCount) {
    const usagePoints = clampScore(Math.ceil((metaEntry.usageCount / maxUsage) * 5));
    scoreParts.push({ label: "採用率", points: usagePoints, detail: `採用数${metaEntry.usageCount}` });
  }

  const partnerMatches = metaEntry?.partners?.filter((partner) => opponentNames.includes(cleanName(partner.name))) ?? [];
  if (partnerMatches.length > 0) {
    const partnerRate = partnerMatches.reduce((sum, partner) => sum + partner.rate, 0);
    const partnerPoints = clampScore(Math.ceil(partnerRate / 20) + Math.min(2, partnerMatches.length - 1));
    scoreParts.push({ label: "同時採用", points: partnerPoints, detail: partnerMatches.slice(0, 2).map((partner) => partner.name).join("・") });
  }

  const teamPatterns = metaData?.teamPatterns ?? [];
  const matchingPattern = teamPatterns
    .map((pattern) => ({
      pattern,
      overlap: pattern.members.filter((member) => opponentNames.includes(cleanName(member))).length,
      includesTarget: pattern.members.some((member) => cleanName(member) === cleanName(pokemon.name)),
    }))
    .filter((entry) => entry.includesTarget && entry.overlap >= 3)
    .sort((a, b) => b.overlap - a.overlap || (a.pattern.rank || 999999) - (b.pattern.rank || 999999))[0];

  if (matchingPattern) {
    const rankBonus = matchingPattern.pattern.rank > 0 && matchingPattern.pattern.rank <= 200 ? 1 : 0;
    scoreParts.push({ label: "上位構築", points: clampScore(matchingPattern.overlap - 1 + rankBonus), detail: `${matchingPattern.overlap}匹が同じ並び` });
  }

  if ((metaEntry?.items?.[0]?.rate ?? 0) >= 20) {
    scoreParts.push({ label: "持ち物傾向", points: 1, detail: `${metaEntry?.items[0].name}が多い` });
  }

  if ((metaEntry?.teraTypes?.[0]?.rate ?? 0) >= 20) {
    scoreParts.push({ label: "テラ傾向", points: 1, detail: `${metaEntry?.teraTypes[0].name}が多い` });
  }

  const score = scoreParts.reduce((sum, part) => sum + part.points, 0);
  return {
    metaEntry,
    metaItems: metaEntry?.items?.slice(0, 2) ?? [],
    teraCandidates: metaEntry?.teraTypes?.slice(0, 2) ?? [],
    score,
    scoreParts,
    reason: createShortReason(pokemon.name, scoreParts, metaEntry),
  };
}

function attackTypeAdvantage(user: Pokemon, target: Pokemon, targetTeraType?: string) {
  const attackTypes = [user.type1, user.type2].filter(isPokemonType);
  if (attackTypes.length === 0 || !isPokemonType(target.type1)) return 0;

  const defenseType1 = targetTeraType && isPokemonType(targetTeraType) ? targetTeraType : target.type1;
  const defenseType2 = targetTeraType ? "" : target.type2;
  return Math.max(...attackTypes.map((attackType) => getMultiplier(attackType, defenseType1, defenseType2)));
}

export default function Home() {
  const [userTeam, setUserTeam] = useState<Pokemon[]>([newPokemon()]);
  const [opponents, setOpponents] = useState<Pokemon[]>(Array.from({ length: 6 }, () => newPokemon()));
  const [form, setForm] = useState<Pokemon>(newPokemon());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metaData, setMetaData] = useState<MetaData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.userTeam)) setUserTeam(data.userTeam.map((p: Partial<Pokemon>) => normalizePokemon(p)));
    if (Array.isArray(data.opponents)) {
      const next = data.opponents.map((p: Partial<Pokemon>) => normalizePokemon(p)).slice(0, 6);
      while (next.length < 6) next.push(newPokemon());
      setOpponents(next);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userTeam, opponents }));
  }, [userTeam, opponents]);

  useEffect(() => {
    let active = true;
    loadMetaData().then((data) => {
      if (active) setMetaData(data);
    });
    return () => { active = false; };
  }, []);

  const addOrUpdate = () => {
    if (editingId) {
      setUserTeam((prev) => prev.map((p) => (p.id === editingId ? { ...form, id: editingId } : p)));
    } else if (userTeam.length < 6) {
      setUserTeam((prev) => [...prev, normalizePokemon(form)]);
    }
    setForm(newPokemon());
    setEditingId(null);
  };

  const predictions = useMemo(() => opponents.filter(hasName).map((p) => {
    const roleMemo = `${p.roleMemo} ${p.memo}`;
    const speedType = roleMemo.includes("高速") ? "高速アタッカー" : roleMemo.includes("耐久") ? "耐久型" : roleMemo.includes("物理") ? "物理アタッカー" : roleMemo.includes("特殊") ? "特殊アタッカー" : "先発向き";
    const itemCandidates = speedType.includes("高速") ? ["こだわりスカーフ", "きあいのタスキ"] : speedType.includes("耐久") ? ["たべのこし", "オボンのみ"] : speedType.includes("物理") ? ["きあいのタスキ", "こだわりスカーフ", "ピントレンズ"] : speedType.includes("特殊") ? ["こだわりスカーフ", "しろいハーブ"] : ["きあいのタスキ", "オボンのみ"];
    const moves = speedType.includes("耐久") ? ["回復技", "状態異常技", "守る系", "削り技"] : speedType.includes("特殊") ? ["高威力特殊技", "範囲技", "補助技", "サブウェポン"] : ["高威力物理技", "先制技", "積み技", "サブウェポン"];
    const metaScore = scoreWithMeta(p, opponents, metaData, speedType);
    return { p, speedType, itemCandidates, moves, ...metaScore };
  }).sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name, "ja")), [metaData, opponents]);

  const topPredictions = useMemo(() => predictions.slice(0, 3), [predictions]);

  const recommendations = useMemo(() => userTeam.map((u) => {
    let score = priorityScore[u.priority ?? "medium"];
    const breakdown: string[] = [`優先度${priorityLabel[u.priority ?? "medium"]}:${score >= 0 ? "+" : ""}${score}`];
    if ((u.roleMemo ?? "").includes("先発") && topPredictions.length > 0) { score += 1; breakdown.push("先発補正:+1"); }
    if ((u.roleMemo ?? "").includes("耐久")) { score += 1; breakdown.push("耐久補正:+1"); }
    if ((u.roleMemo ?? "").includes("高速") || (u.roleMemo ?? "").includes("アタッカー")) { score += 1; breakdown.push("攻撃補正:+1"); }
    if (["きあいのタスキ", "こだわりスカーフ", "たべのこし", "オボンのみ"].includes(u.item ?? "")) { score += 1; breakdown.push(`持ち物補正(${u.item}):+1`); }

    const bestTypeMatch = Math.max(0, ...topPredictions.map((prediction) => attackTypeAdvantage(u, prediction.p)));
    if (bestTypeMatch >= 2) { score += 1; breakdown.push("予想相手へのタイプ相性:+1"); }

    const bestTeraMatch = Math.max(0, ...topPredictions.flatMap((prediction) => prediction.teraCandidates.map((tera) => attackTypeAdvantage(u, prediction.p, tera.name))));
    if (bestTeraMatch >= 2) { score += 1; breakdown.push("よくあるテラへの相性:+1"); }

    const fastThreat = topPredictions.some((prediction) => prediction.metaItems.some((item) => ["こだわりスカーフ", "きあいのタスキ"].includes(item.name)));
    if (fastThreat && ((u.roleMemo ?? "").includes("先発") || (u.roleMemo ?? "").includes("高速"))) {
      score += 1;
      breakdown.push("持ち物傾向への対応:+1");
    }

    return { ...u, score, breakdown };
  }).sort((a, b) => b.score - a.score).slice(0, 3), [topPredictions, userTeam]);

  return <div className="min-h-[100dvh] bg-background pb-12 w-full flex justify-center">
    <div className="w-full max-w-[480px] px-3 py-4 flex flex-col gap-4 overflow-x-hidden">
      <Card className="overflow-hidden"><CardHeader><CardTitle>1. 自分のポケモン登録</CardTitle></CardHeader><CardContent className="space-y-3">
        {editingId && <p className="text-sm text-primary">編集中：{userTeam.find((p) => p.id === editingId)?.name || "ポケモン"}</p>}
        <Input value={form.name} placeholder="ポケモン名" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2"><TypeSelect value={form.type1} onChange={(v) => setForm({ ...form, type1: v })} placeholder="タイプ1" /><TypeSelect value={form.type2} onChange={(v) => setForm({ ...form, type2: v })} placeholder="タイプ2" /></div>
        <AbilitySelect value={form.ability ?? ""} placeholder="例：さめはだ" onChange={(ability) => setForm({ ...form, ability })} />
        <TypeSelect value={form.teraType ?? ""} onChange={(v) => setForm({ ...form, teraType: v })} placeholder="テラスタイプ" />
        <Input value={form.item ?? ""} placeholder="持ち物" onChange={(e) => setForm({ ...form, item: e.target.value })} />
        <Input value={form.roleMemo ?? ""} placeholder="役割メモ（例: 先発 / 耐久 / 高速アタッカー）" onChange={(e) => setForm({ ...form, roleMemo: e.target.value })} />
        <Select value={form.priority ?? "medium"} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}><SelectTrigger><SelectValue placeholder="優先度" /></SelectTrigger><SelectContent><SelectItem value="high">高</SelectItem><SelectItem value="medium">中</SelectItem><SelectItem value="low">低</SelectItem></SelectContent></Select>
        <div className="flex items-center gap-2"><Checkbox checked={form.canMega ?? false} onCheckedChange={(v) => setForm({ ...form, canMega: Boolean(v) })} /><span className="text-sm">メガシンカ可</span></div>
        <Textarea value={form.memo ?? ""} placeholder="メモ欄" onChange={(e) => setForm({ ...form, memo: e.target.value })} />
        <Button className="w-full h-11" onClick={addOrUpdate}>{editingId ? "更新する" : "登録する"}</Button>
        <div className="text-xs text-muted-foreground text-center">{userTeam.length}/6 登録済み</div>
        {userTeam.map((p) => <div key={p.id} className="border rounded-lg p-3 space-y-2">
          <div className="font-semibold">{p.name || "未設定"}</div>
          <div className="flex flex-wrap gap-1 text-xs">
            {[p.type1, p.type2, p.ability ? `特性:${p.ability}` : "特性未設定", p.teraType && `テラ:${p.teraType}`, p.item && `持ち物:${p.item}`, p.roleMemo && `役割:${p.roleMemo}`, `優先度:${priorityLabel[p.priority ?? "medium"]}`, p.canMega ? "メガシンカ可" : "メガシンカ不可"].filter(Boolean).map((x, i) => <Badge key={i} variant="secondary">{x}</Badge>)}
          </div>
          {p.memo && <p className="text-xs text-muted-foreground break-words">{p.memo}</p>}
          <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setEditingId(p.id); setForm(p); }}>編集</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm("このポケモンを削除しますか？")) { setUserTeam((prev) => prev.filter((x) => x.id !== p.id)); if (editingId === p.id) { setEditingId(null); setForm(newPokemon()); } } }}>削除</Button></div>
        </div>)}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>2. 相手入力・最適選出</CardTitle></CardHeader><CardContent className="space-y-3">
        {opponents.map((p, i) => <div key={p.id} className="border rounded-lg p-3 space-y-2">
          <Input value={p.name} placeholder={`相手${i + 1}`} onChange={(e) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
          <div className="grid grid-cols-2 gap-2"><TypeSelect value={p.type1} onChange={(v) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, type1: v } : x))} placeholder="タイプ1" /><TypeSelect value={p.type2} onChange={(v) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, type2: v } : x))} placeholder="タイプ2" /></div>
          <AbilitySelect value={p.ability ?? ""} placeholder="特性を選択" onChange={(ability) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, ability } : x))} />
        </div>)}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>予測とおすすめ</CardTitle></CardHeader><CardContent className="space-y-3">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">相手の選出予想（上位3）</p>
            {metaData && <Badge variant="outline" className="shrink-0 text-[11px]">採用データ反映済み</Badge>}
          </div>
          {topPredictions.map((prediction, index) => <div key={prediction.p.id} className="border rounded-lg p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between gap-2"><div className="font-semibold">{index + 1}. {prediction.p.name}</div><div className="text-sm font-semibold">{prediction.score}点</div></div>
            <p className="text-xs text-muted-foreground break-words">根拠：{prediction.reason}</p>
            <div className="flex flex-wrap gap-1">
              <Badge>{prediction.speedType}</Badge>
              {prediction.scoreParts.map((part) => <Badge key={`${part.label}-${part.detail}`} variant="secondary">{part.label}+{part.points}</Badge>)}
            </div>
            <p className="text-xs break-words">持ち物候補：{topLabel(prediction.metaItems, prediction.itemCandidates).join("、")}</p>
            <p className="text-xs break-words">テラ候補：{topLabel(prediction.teraCandidates, ["データなし"]).join("、")}</p>
            <div className="flex flex-wrap gap-1">{prediction.moves.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}</div>
          </div>)}
        </div>
        <div><p className="text-sm font-semibold mb-1">自分のおすすめ選出（上位3）</p>{recommendations.map((r) => <div key={r.id} className="border rounded-lg p-3 mb-2"><div className="flex justify-between"><span className="font-semibold">{r.name}</span><span className="text-sm">{r.score}点</span></div><div className="flex flex-wrap gap-1 my-1">{[r.ability && `特性:${r.ability}`, r.teraType && `テラ:${r.teraType}`, r.item && `持ち物:${r.item}`, r.roleMemo && `役割:${r.roleMemo}`, `優先度:${priorityLabel[r.priority ?? "medium"]}`].filter(Boolean).map((x, i) => <Badge key={i} variant="secondary">{x}</Badge>)}</div>{r.memo && <p className="text-xs text-muted-foreground break-words">{r.memo}</p>}<p className="text-xs text-muted-foreground break-words">内訳: {r.breakdown.join(" / ")}</p></div>)}</div>
      </CardContent></Card>
    </div>
  </div>;
}
