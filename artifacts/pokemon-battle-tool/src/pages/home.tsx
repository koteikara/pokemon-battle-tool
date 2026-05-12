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
import { createPokemonFromMetaTemplate, getPokemonSetTemplates, getPopularBuildTemplates, getPopularPokemonTemplates, MetaBuildTemplate, MetaPokemonTemplate } from "@/lib/metaTemplates";
import { POKEMON_API_NAME_MAP } from "@/lib/pokeApi";
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
  nature: p.nature ?? "",
  evs: p.evs ?? "",
  moves: Array.isArray(p.moves) ? p.moves.slice(0, 4) : [],
  roleTags: Array.isArray(p.roleTags) ? p.roleTags : [],
});

const newPokemon = () => normalizePokemon({});
const cleanName = (name: string) => name.trim().replace(/\s+/g, "");
const hasName = (pokemon: Pokemon) => pokemon.name.trim().length > 0;
const isPokemonType = (value: string): value is Exclude<PokemonType, ""> => POKEMON_TYPES.includes(value as Exclude<PokemonType, "">);


const TEMPLATE_SPRITE_NAME_MAP: Record<string, string> = {
  バドレックス: "calyrex-shadow",
  ディンルー: "tinglu",
  パオジアン: "chienpao",
  コライドン: "koraidon",
  ウーラオス: "urshifu-rapidstrike",
  ミライドン: "miraidon",
  ランドロス: "landorus-therian",
  ザシアン: "zacian-crowned",
  ルナアーラ: "lunala",
  カイオーガ: "kyogre",
  ハバタクカミ: "fluttermane",
  テツノワダチ: "irontreads",
  ガチグマ: "ursaluna",
  ヘイラッシャ: "dondozo",
  ホウオウ: "hooh",
  オーロンゲ: "grimmsnarl",
  ムゲンダイナ: "eternatus",
  キノガッサ: "breloom",
  テラパゴス: "terapagos",
  オーガポン: "ogerpon",
  ドオー: "clodsire",
  イーユイ: "chiyu",
  オオニューラ: "sneasler",
  ベトベトン: "muk",
  ママンボウ: "alomomola",
  ルギア: "lugia",
  マタドガス: "weezing",
  レックウザ: "rayquaza",
  ヒードラン: "heatran",
  ザマゼンタ: "zamazenta-crowned",
  トドロクツキ: "roaringmoon",
  ラッキー: "chansey",
  チオンジェン: "wochien",
  ウネルミナモ: "walkingwake",
  ハピナス: "blissey",
  ゴリランダー: "rillaboom",
  イダイナキバ: "greattusk",
  サンダー: "zapdos",
  ネクロズマ: "necrozma",
  イダイトウ: "basculegion",
  バシャーモ: "blaziken",
};

const templateImageUrl = (name: string) => {
  const apiName = TEMPLATE_SPRITE_NAME_MAP[name] ?? POKEMON_API_NAME_MAP[name] ?? POKEMON_API_NAME_MAP[name.replace(/（.*?）/g, "")] ?? "pokeball";
  return `https://play.pokemonshowdown.com/sprites/ani/${apiName}.gif`;
};

const formatUsage = (template: MetaPokemonTemplate) => {
  const rate = template.usageRate > 0 ? ` / ${Math.round(template.usageRate)}%相当` : "";
  return `採用数${template.usageCount}${rate}`;
};

const entryLabels = (entries: MetaUsageEntry[], empty = "データなし") => entries.length > 0 ? entries.slice(0, 3).map((entry) => `${entry.name}${entry.rate ? ` ${Math.round(entry.rate)}%` : ""}`) : [empty];

const templateSearchText = (template: MetaPokemonTemplate) => [
  template.name,
  ...template.items.map((entry) => entry.name),
  ...template.abilities.map((entry) => entry.name),
  ...template.teraTypes.map((entry) => entry.name),
  ...template.roleTags,
].join(" ").toLowerCase();

const buildSearchText = (template: MetaBuildTemplate) => [
  template.name,
  ...template.memberNames,
  ...template.members.flatMap((member) => [member.name, ...member.items.map((entry) => entry.name), ...member.teraTypes.map((entry) => entry.name), ...member.roleTags]),
  ...template.roleTags,
].join(" ").toLowerCase();

const matchesFilter = (text: string, filter: string) => {
  if (filter === "all") return true;
  const map: Record<string, string[]> = {
    attacker: ["アタッカー", "対面"],
    bulky: ["耐久", "クッション"],
    support: ["サポート", "起点作成"],
    fast: ["高速", "スカーフ", "タスキ"],
    face: ["対面", "タスキ", "ハチマキ", "メガネ"],
    cycle: ["サイクル", "クッション", "とんぼ", "ボルトチェンジ"],
  };
  return (map[filter] ?? []).some((word) => text.includes(word.toLowerCase()));
};

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


type PopularDataSectionProps = {
  metaData: MetaData | null;
  popularPokemon: MetaPokemonTemplate[];
  setTemplates: MetaPokemonTemplate[];
  buildTemplates: MetaBuildTemplate[];
  onApplyTemplate: (template: MetaPokemonTemplate) => void;
  onAddTemplate: (template: MetaPokemonTemplate) => void;
  onAddBuild: (template: MetaBuildTemplate) => void;
};

function PopularDataSection({ metaData, popularPokemon, setTemplates, buildTemplates, onApplyTemplate, onAddTemplate, onAddBuild }: PopularDataSectionProps) {
  const [tab, setTab] = useState<"pokemon" | "sets" | "builds">("pokemon");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [pokemonLimit, setPokemonLimit] = useState(12);
  const [setLimit, setSetLimit] = useState(12);
  const [buildLimit, setBuildLimit] = useState(6);

  const normalizedQuery = query.trim().toLowerCase();
  const filterPokemon = (template: MetaPokemonTemplate) => {
    const text = templateSearchText(template);
    return (!normalizedQuery || text.includes(normalizedQuery)) && matchesFilter(text, filter);
  };
  const filterBuild = (template: MetaBuildTemplate) => {
    const text = buildSearchText(template);
    return (!normalizedQuery || text.includes(normalizedQuery)) && matchesFilter(text, filter);
  };

  const visiblePokemon = popularPokemon.filter(filterPokemon).slice(0, pokemonLimit);
  const visibleSets = setTemplates.filter(filterPokemon).slice(0, setLimit);
  const visibleBuilds = buildTemplates.filter(filterBuild).slice(0, buildLimit);
  const hasMeta = Boolean(metaData);
  const isEmpty = hasMeta && popularPokemon.length === 0 && buildTemplates.length === 0;

  return <div className="popular-template-panel space-y-3">
    <div>
      <h3 className="font-bold text-lg">人気データから追加</h3>
      <p className="text-sm text-muted-foreground">公開データの採用傾向から、よく使われるポケモンや型を自分のリストに追加できます。</p>
    </div>

    {!hasMeta && <div className="popular-status">公開データを取得できませんでした。手入力の登録はそのまま使えます。</div>}
    {isEmpty && <div className="popular-status">公開データがまだありません。</div>}

    <div className="popular-tabs" role="tablist" aria-label="人気データタブ">
      <button type="button" className={tab === "pokemon" ? "active" : ""} onClick={() => setTab("pokemon")}>人気ポケモン</button>
      <button type="button" className={tab === "sets" ? "active" : ""} onClick={() => setTab("sets")}>人気型</button>
      <button type="button" className={tab === "builds" ? "active" : ""} onClick={() => setTab("builds")}>構築テンプレ</button>
    </div>

    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
      <Input value={query} placeholder="名前・持ち物・特性・テラ・役割で検索" onChange={(e) => setQuery(e.target.value)} />
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="h-11"><SelectValue placeholder="フィルタ" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="attacker">アタッカー</SelectItem>
          <SelectItem value="bulky">耐久</SelectItem>
          <SelectItem value="support">サポート</SelectItem>
          <SelectItem value="fast">高速</SelectItem>
          <SelectItem value="face">対面</SelectItem>
          <SelectItem value="cycle">サイクル</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {tab === "pokemon" && <div className="popular-grid">
      {visiblePokemon.map((template) => <TemplateCard key={template.name} template={template} onApply={onApplyTemplate} onAdd={onAddTemplate} />)}
      {popularPokemon.filter(filterPokemon).length > visiblePokemon.length && <Button type="button" variant="outline" className="popular-more" onClick={() => setPokemonLimit((value) => value + 12)}>もっと見る</Button>}
    </div>}

    {tab === "sets" && <div className="popular-grid">
      {visibleSets.map((template) => <TemplateCard key={`${template.name}-${template.setName}-${template.items[0]?.name ?? "none"}`} template={template} onApply={onApplyTemplate} onAdd={onAddTemplate} showSet />)}
      {setTemplates.filter(filterPokemon).length > visibleSets.length && <Button type="button" variant="outline" className="popular-more" onClick={() => setSetLimit((value) => value + 12)}>もっと見る</Button>}
    </div>}

    {tab === "builds" && <div className="popular-grid">
      {visibleBuilds.map((template) => <BuildTemplateCard key={`${template.rank}-${template.memberNames.join("-")}`} template={template} onAdd={onAddBuild} />)}
      {buildTemplates.filter(filterBuild).length > visibleBuilds.length && <Button type="button" variant="outline" className="popular-more" onClick={() => setBuildLimit((value) => value + 6)}>もっと見る</Button>}
    </div>}

    <p className="text-[11px] text-muted-foreground leading-relaxed">公開データをもとにした候補です。実際の型や努力値は自分の構築に合わせて調整してください。</p>
  </div>;
}

function TemplateCard({ template, onApply, onAdd, showSet = false }: { template: MetaPokemonTemplate; onApply: (template: MetaPokemonTemplate) => void; onAdd: (template: MetaPokemonTemplate) => void; showSet?: boolean }) {
  return <article className="template-card">
    <div className="template-card-head">
      <div className="template-rank">#{template.rank}</div>
      <img className="template-pokemon-img" src={templateImageUrl(template.name)} alt={`${template.name}の画像`} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      <div className="min-w-0">
        <h4>{template.name}</h4>
        {showSet && <p className="template-set-name">{template.setName}</p>}
        <p className="text-xs text-muted-foreground">{formatUsage(template)}</p>
      </div>
    </div>
    <div className="template-lines">
      <p><b>持ち物:</b> {entryLabels(template.items).join("、")}</p>
      <p><b>テラ:</b> {entryLabels(template.teraTypes).join("、")}</p>
      <p><b>特性:</b> {entryLabels(template.abilities, "候補なし").join("、")}</p>
      {showSet && <p><b>技候補:</b> {entryLabels(template.moves, "技データなし").join("、")}</p>}
      <p><b>役割:</b> {template.roleTags.join("、")}</p>
      {showSet && <p className="text-muted-foreground">{template.reason}</p>}
    </div>
    <div className="template-actions">
      <Button type="button" className="btn-template-apply" onClick={() => onApply(template)}>フォームに反映</Button>
      <Button type="button" className="btn-template-add" onClick={() => onAdd(template)}>保存リストに追加</Button>
    </div>
  </article>;
}

function BuildTemplateCard({ template, onAdd }: { template: MetaBuildTemplate; onAdd: (template: MetaBuildTemplate) => void }) {
  return <article className="template-card template-card-build">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h4>{template.name}</h4>
        <p className="text-xs text-muted-foreground">{template.reason}</p>
      </div>
      <div className="template-rank">#{template.rank}</div>
    </div>
    <div className="build-sprites" aria-label="構築内のポケモン画像">
      {template.members.map((member) => <img key={member.name} src={templateImageUrl(member.name)} alt={`${member.name}の画像`} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />)}
    </div>
    <p className="text-sm font-semibold break-words">{template.memberNames.join(" / ")}</p>
    <p className="text-xs break-words">特徴：{template.feature}</p>
    <div className="flex flex-wrap gap-1">{template.roleTags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
    <Button type="button" className="btn-template-add w-full" onClick={() => onAdd(template)}>この構築を追加</Button>
  </article>;
}

export default function Home() {
  const [userTeam, setUserTeam] = useState<Pokemon[]>([newPokemon()]);
  const [opponents, setOpponents] = useState<Pokemon[]>(Array.from({ length: 6 }, () => newPokemon()));
  const [form, setForm] = useState<Pokemon>(newPokemon());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [pendingBuild, setPendingBuild] = useState<MetaBuildTemplate | null>(null);

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
    } else {
      setUserTeam((prev) => [...prev, normalizePokemon(form)]);
    }
    setForm(newPokemon());
    setEditingId(null);
  };

  const popularPokemonTemplates = useMemo(() => getPopularPokemonTemplates(metaData), [metaData]);
  const popularSetTemplates = useMemo(() => getPokemonSetTemplates(metaData), [metaData]);
  const popularBuildTemplates = useMemo(() => getPopularBuildTemplates(metaData), [metaData]);

  const applyMetaTemplateToForm = (template: MetaPokemonTemplate) => {
    const pokemon = createPokemonFromMetaTemplate(template);
    setEditingId(null);
    setForm(normalizePokemon({ ...pokemon, id: crypto.randomUUID(), memo: form.memo }));
  };

  const addMetaTemplateToList = (template: MetaPokemonTemplate) => {
    setUserTeam((prev) => [...prev, normalizePokemon(createPokemonFromMetaTemplate(template))]);
  };

  const addBuildMembers = (template: MetaBuildTemplate, mode: "missing" | "all") => {
    setUserTeam((prev) => {
      const currentNames = new Set(prev.map((pokemon) => cleanName(pokemon.name)));
      const additions = template.members
        .filter((member) => mode === "all" || !currentNames.has(cleanName(member.name)))
        .map((member) => normalizePokemon(createPokemonFromMetaTemplate(member)));
      return [...prev, ...additions];
    });
    setPendingBuild(null);
  };

  const requestAddBuild = (template: MetaBuildTemplate) => {
    const hasDuplicate = template.memberNames.some((name) => userTeam.some((pokemon) => cleanName(pokemon.name) === cleanName(name)));
    if (hasDuplicate) {
      setPendingBuild(template);
      return;
    }
    addBuildMembers(template, "all");
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
        <div className="text-xs text-muted-foreground text-center">{userTeam.length}匹 保存済み</div>
        <PopularDataSection metaData={metaData} popularPokemon={popularPokemonTemplates} setTemplates={popularSetTemplates} buildTemplates={popularBuildTemplates} onApplyTemplate={applyMetaTemplateToForm} onAddTemplate={addMetaTemplateToList} onAddBuild={requestAddBuild} />
        {userTeam.map((p, index) => <div key={p.id} className="border rounded-lg p-3 space-y-2">
          <div className="font-semibold">{p.name || "未設定"}</div>
          <div className="flex flex-wrap gap-1 text-xs">
            {[p.type1, p.type2, p.ability ? `特性:${p.ability}` : "特性未設定", p.teraType && `テラ:${p.teraType}`, p.item && `持ち物:${p.item}`, p.roleMemo && `役割:${p.roleMemo}`, p.nature && `性格:${p.nature}`, p.evs ? `努力値:${p.evs}` : "努力値なし", `優先度:${priorityLabel[p.priority ?? "medium"]}`, p.canMega ? "メガシンカ可" : "メガシンカ不可"].filter(Boolean).map((x, i) => <Badge key={i} variant="secondary">{x}</Badge>)}
          </div>
          {(p.moves ?? []).length > 0 && <p className="text-xs break-words">技：{(p.moves ?? []).join("、")}</p>}
          {p.memo && <p className="text-xs text-muted-foreground break-words">{p.memo}</p>}
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { setEditingId(p.id); setForm(p); }}>編集</Button><Button size="sm" variant="outline" onClick={() => setUserTeam((prev) => [...prev.slice(0, index + 1), normalizePokemon({ ...p, id: crypto.randomUUID(), name: `${p.name}（コピー）` }), ...prev.slice(index + 1)])}>複製</Button><Button size="sm" variant="outline" disabled={index === 0} onClick={() => setUserTeam((prev) => prev.map((x, idx) => idx === index - 1 ? prev[index] : idx === index ? prev[index - 1] : x))}>上へ</Button><Button size="sm" variant="outline" disabled={index === userTeam.length - 1} onClick={() => setUserTeam((prev) => prev.map((x, idx) => idx === index + 1 ? prev[index] : idx === index ? prev[index + 1] : x))}>下へ</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm("このポケモンを削除しますか？")) { setUserTeam((prev) => prev.filter((x) => x.id !== p.id)); if (editingId === p.id) { setEditingId(null); setForm(newPokemon()); } } }}>削除</Button></div>
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
      {pendingBuild && <div className="duplicate-dialog" role="dialog" aria-modal="true" aria-label="重複確認">
        <div className="duplicate-dialog-card">
          <h3>同じポケモンがいます</h3>
          <p>同じポケモンが既に登録されています。未登録のポケモンだけ追加しますか？</p>
          <div className="grid gap-2">
            <Button type="button" className="btn-template-add" onClick={() => addBuildMembers(pendingBuild, "missing")}>未登録だけ追加</Button>
            <Button type="button" className="btn-template-apply" onClick={() => addBuildMembers(pendingBuild, "all")}>すべて追加</Button>
            <Button type="button" variant="outline" onClick={() => setPendingBuild(null)}>キャンセル</Button>
          </div>
        </div>
      </div>}
    </div>
  </div>;
}
