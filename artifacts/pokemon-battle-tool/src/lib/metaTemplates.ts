import { hasUsableMetaData, MetaData, MetaPokemonEntry, MetaTeamPattern, MetaUsageEntry } from "@/lib/metaData";
import { Pokemon, PokemonType, POKEMON_TYPES } from "@/lib/pokemonLogic";

export type RoleTag = "高速アタッカー" | "物理アタッカー" | "特殊アタッカー" | "耐久" | "サポート" | "クッション" | "対面" | "サイクル" | "起点作成" | "汎用";

export type MetaPokemonTemplate = {
  kind: "pokemon" | "set";
  name: string;
  rank: number;
  usageCount: number;
  usageRate: number;
  score: number;
  items: MetaUsageEntry[];
  teraTypes: MetaUsageEntry[];
  abilities: MetaUsageEntry[];
  moves: MetaUsageEntry[];
  nature?: string;
  evs?: string;
  roleTags: RoleTag[];
  setName?: string;
  reason: string;
};

export type MetaBuildTemplate = {
  name: string;
  rank: number;
  rating?: number;
  members: MetaPokemonTemplate[];
  memberNames: string[];
  roleTags: RoleTag[];
  feature: string;
  reason: string;
};

type UnknownRecord = Record<string, unknown>;

const SUPPORT_MOVES = ["ステルスロック", "でんじは", "おにび", "トリックルーム", "ひかりのかべ", "リフレクター", "このゆびとまれ", "てだすけ", "ちょうはつ", "あくび"];
const BULKY_MOVES = ["じこさいせい", "はねやすめ", "なまける", "まもる", "どくどく", "やどりぎのタネ", "みがわり"];
const PIVOT_MOVES = ["とんぼがえり", "ボルトチェンジ", "クイックターン", "すてゼリフ"];
const PHYSICAL_ITEMS = ["こだわりハチマキ", "パンチグローブ", "いのちのたま", "かえんだま", "どくどくだま", "ピントレンズ"];
const SPECIAL_ITEMS = ["こだわりメガネ", "のどスプレー", "ブーストエナジー", "しろいハーブ"];
const FAST_ITEMS = ["こだわりスカーフ", "きあいのタスキ", "ブーストエナジー"];
const BULKY_ITEMS = ["たべのこし", "くろいヘドロ", "オボンのみ", "とつげきチョッキ", "ゴツゴツメット", "あつぞこブーツ"];
const CYCLE_ITEMS = ["あつぞこブーツ", "とつげきチョッキ", "ゴツゴツメット", "たべのこし", "オボンのみ"];
const HIGH_SPEED_NAMES = ["ミライドン", "コライドン", "パオジアン", "ハバタクカミ", "ザシアン", "バドレックス", "ドラパルト", "テツノツツミ", "マスカーニャ", "トドロクツキ"];
const BULKY_NAMES = ["ディンルー", "キョジオーン", "ヘイラッシャ", "ホウオウ", "ドヒドイデ", "ラッキー", "ハピナス", "ブラッキー", "カバルドン", "ランドロス"];
const PHYSICAL_NAMES = ["ウーラオス", "コライドン", "ザシアン", "パオジアン", "ランドロス", "カイリュー", "ゴリランダー", "ガチグマ", "ドドゲザン", "ホウオウ"];
const SPECIAL_NAMES = ["ミライドン", "バドレックス", "ハバタクカミ", "イーユイ", "テツノツツミ", "サーフゴー", "アシレーヌ", "ラウドボーン"];

const normalizeName = (name: string) => name.trim().replace(/\s+/g, "");
const asRecord = (value: unknown): UnknownRecord => (value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {});
const asUsageList = (value: unknown): MetaUsageEntry[] => Array.isArray(value)
  ? value
    .map((entry) => asRecord(entry))
    .map((entry) => ({
      name: String(entry.name ?? entry.label ?? entry.value ?? "").trim(),
      count: Number(entry.count ?? entry.usageCount ?? 0) || 0,
      rate: Number(entry.rate ?? entry.usageRate ?? entry.percent ?? 0) || 0,
    }))
    .filter((entry) => entry.name.length > 0)
  : [];

const pickUsageList = (entry: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    const list = asUsageList(entry[key]);
    if (list.length > 0) return list;
  }
  return [];
};

const toPokemonType = (value: string | undefined): PokemonType => {
  if (!value) return "";
  return POKEMON_TYPES.includes(value as Exclude<PokemonType, "">) ? value as PokemonType : "";
};

const unique = <T,>(values: T[]) => Array.from(new Set(values));

const getPokemonEntries = (meta: MetaData | null | undefined) => {
  if (!hasUsableMetaData(meta) || typeof meta.pokemon !== "object") return [] as Array<[string, MetaPokemonEntry]>;
  return Object.entries(meta.pokemon).filter(([name]) => name.trim().length > 0);
};

const makeTemplate = (name: string, entry: MetaPokemonEntry, rank: number, maxUsage: number, kind: "pokemon" | "set" = "pokemon"): MetaPokemonTemplate => {
  const raw = asRecord(entry);
  const items = pickUsageList(raw, ["items", "itemCandidates", "heldItems"]);
  const teraTypes = pickUsageList(raw, ["teraTypes", "teras", "teraTypeCandidates"]);
  const abilities = pickUsageList(raw, ["abilities", "abilityCandidates"]);
  const moves = pickUsageList(raw, ["moves", "moveCandidates"]);
  const usageCount = Number(raw.usageCount ?? raw.count ?? 0) || 0;
  const usageRate = Number(raw.usageRate ?? raw.rate ?? (maxUsage > 0 ? (usageCount / maxUsage) * 100 : 0)) || 0;
  const base: MetaPokemonTemplate = {
    kind,
    name,
    rank,
    usageCount,
    usageRate,
    score: usageCount * 10 + usageRate + (items[0]?.rate ?? 0) + (teraTypes[0]?.rate ?? 0),
    items,
    teraTypes,
    abilities,
    moves,
    nature: typeof raw.nature === "string" ? raw.nature : undefined,
    evs: typeof raw.evs === "string" ? raw.evs : undefined,
    roleTags: [],
    reason: "",
  };
  base.roleTags = inferRoleTagsFromMeta(base);
  base.setName = inferSetNameFromMeta(base);
  base.reason = formatUsageReason(base);
  return base;
};

export function getPopularPokemonTemplates(meta: MetaData | null | undefined): MetaPokemonTemplate[] {
  const entries = getPokemonEntries(meta);
  const maxUsage = Math.max(1, ...entries.map(([, entry]) => Number((entry as unknown as UnknownRecord).usageCount ?? 0) || 0));
  return entries
    .map(([name, entry], index) => makeTemplate(name, entry, index + 1, maxUsage, "pokemon"))
    .sort((a, b) => b.usageCount - a.usageCount || b.usageRate - a.usageRate || b.score - a.score || a.name.localeCompare(b.name, "ja"))
    .map((template, index) => ({ ...template, rank: index + 1 }));
}

export function getPokemonSetTemplates(meta: MetaData | null | undefined, pokemonName?: string): MetaPokemonTemplate[] {
  const popular = getPopularPokemonTemplates(meta);
  const target = pokemonName ? popular.filter((template) => normalizeName(template.name) === normalizeName(pokemonName)) : popular;
  return target.flatMap((template) => {
    const topItems = template.items.length > 0 ? template.items.slice(0, 2) : [undefined];
    return topItems.map((item, itemIndex) => {
      const setTemplate: MetaPokemonTemplate = {
        ...template,
        kind: "set",
        rank: template.rank * 10 + itemIndex,
        items: item ? [item, ...template.items.filter((candidate) => candidate.name !== item.name)] : [],
        teraTypes: template.teraTypes.slice(0, 3),
        abilities: template.abilities.slice(0, 2),
        moves: template.moves.slice(0, 4),
      };
      setTemplate.roleTags = inferRoleTagsFromMeta(setTemplate);
      setTemplate.setName = inferSetNameFromMeta(setTemplate);
      setTemplate.reason = `${formatUsageReason(setTemplate)} 型は持ち物・テラタイプ・技候補から推定しています。確定情報ではありません。`;
      return setTemplate;
    });
  }).sort((a, b) => b.usageCount - a.usageCount || b.score - a.score || a.rank - b.rank);
}

export function getPopularBuildTemplates(meta: MetaData | null | undefined): MetaBuildTemplate[] {
  const patterns = hasUsableMetaData(meta) && Array.isArray(meta.teamPatterns) ? meta.teamPatterns : [];
  const popular = getPopularPokemonTemplates(meta);
  const map = new Map(popular.map((template) => [normalizeName(template.name), template]));
  return patterns.map((pattern: MetaTeamPattern, index) => {
    const members = (Array.isArray(pattern.members) ? pattern.members : [])
      .map((name) => map.get(normalizeName(name)) ?? makeTemplate(name, { usageCount: 0, items: [], teraTypes: [], partners: [] }, 9999, 1))
      .filter((template) => template.name.trim().length > 0)
      .slice(0, 6);
    const roleTags = unique(members.flatMap((member) => member.roleTags)).slice(0, 4) as RoleTag[];
    const feature = buildFeature(roleTags);
    const rank = Number(pattern.rank ?? index + 1) || index + 1;
    const rating = Number(pattern.rating ?? 0) || undefined;
    return {
      name: `${feature}構築`,
      rank,
      rating,
      members,
      memberNames: members.map((member) => member.name),
      roleTags,
      feature: `${roleTags.slice(0, 3).join("・") || "汎用"}を中心にした並びです。`,
      reason: `公開データの構築パターン${rank}位${rating ? `（レート${Math.round(rating)}）` : ""}から作成。`,
    };
  }).filter((template) => template.members.length > 0)
    .sort((a, b) => a.rank - b.rank);
}

export function createPokemonFromMetaTemplate(template: MetaPokemonTemplate): Pokemon {
  const moves = template.moves.slice(0, 4).map((move) => move.name);
  const roleMemo = template.roleTags.join(" / ") || "汎用";
  return {
    id: crypto.randomUUID(),
    name: template.name,
    type1: "",
    type2: "",
    ability: template.abilities[0]?.name ?? "",
    teraType: toPokemonType(template.teraTypes[0]?.name),
    canMega: false,
    roleMemo,
    roleTags: template.roleTags,
    priority: template.roleTags.some((tag) => tag.includes("アタッカー") || tag === "対面") ? "high" : "medium",
    memo: "公開データから追加",
    item: template.items[0]?.name ?? "",
    nature: template.nature ?? "",
    evs: template.evs ?? "",
    moves,
  };
}

export function inferRoleTagsFromMeta(template: Pick<MetaPokemonTemplate, "name" | "items" | "moves">): RoleTag[] {
  const itemNames = template.items.map((item) => item.name);
  const moveNames = template.moves.map((move) => move.name);
  const text = [...itemNames, ...moveNames, template.name].join(" ");
  const tags: RoleTag[] = [];

  if (HIGH_SPEED_NAMES.some((name) => template.name.includes(name)) || FAST_ITEMS.some((item) => text.includes(item))) tags.push("高速アタッカー");
  if (PHYSICAL_NAMES.some((name) => template.name.includes(name)) || PHYSICAL_ITEMS.some((item) => text.includes(item))) tags.push("物理アタッカー");
  if (SPECIAL_NAMES.some((name) => template.name.includes(name)) || SPECIAL_ITEMS.some((item) => text.includes(item))) tags.push("特殊アタッカー");
  if (BULKY_NAMES.some((name) => template.name.includes(name)) || BULKY_ITEMS.some((item) => text.includes(item)) || BULKY_MOVES.some((move) => text.includes(move))) tags.push("耐久");
  if (SUPPORT_MOVES.some((move) => text.includes(move))) tags.push("サポート");
  if (PIVOT_MOVES.some((move) => text.includes(move)) || (tags.includes("耐久") && CYCLE_ITEMS.some((item) => text.includes(item)))) tags.push("クッション");
  if (tags.some((tag) => tag.includes("アタッカー")) || text.includes("きあいのタスキ")) tags.push("対面");
  if (tags.includes("クッション") || CYCLE_ITEMS.some((item) => text.includes(item))) tags.push("サイクル");
  if (SUPPORT_MOVES.some((move) => ["ステルスロック", "でんじは", "おにび", "あくび"].includes(move) && text.includes(move))) tags.push("起点作成");

  const uniqueTags = unique(tags).slice(0, 4) as RoleTag[];
  return uniqueTags.length > 0 ? uniqueTags : ["汎用"];
}

export function inferSetNameFromMeta(template: Pick<MetaPokemonTemplate, "items" | "roleTags">): string {
  const topItem = template.items[0]?.name;
  if (topItem) {
    if (topItem === "たべのこし" || topItem === "くろいヘドロ") return `${topItem}耐久型`;
    if (topItem.includes("スカーフ")) return "こだわりスカーフ型";
    if (topItem.includes("ハチマキ")) return "こだわりハチマキ型";
    if (topItem.includes("メガネ")) return "こだわりメガネ型";
    if (topItem === "きあいのタスキ") return "きあいのタスキ型";
    return `${topItem}型`;
  }
  if (template.roleTags.includes("サポート")) return "サポート型";
  if (template.roleTags.includes("クッション")) return "クッション型";
  if (template.roleTags.includes("耐久")) return "耐久型";
  if (template.roleTags.some((tag) => tag.includes("アタッカー"))) return "アタッカー型";
  return "汎用型";
}

export function formatUsageReason(template: Pick<MetaPokemonTemplate, "usageCount" | "usageRate" | "items" | "teraTypes">): string {
  const parts = [`採用数${template.usageCount}`];
  if (template.usageRate > 0) parts.push(`採用傾向${Math.round(template.usageRate)}%`);
  if (template.items[0]) parts.push(`持ち物は${template.items[0].name}が多め`);
  if (template.teraTypes[0]) parts.push(`テラは${template.teraTypes[0].name}が多め`);
  return `公開データ上で多い候補から推定。${parts.join(" / ")}。`;
}

function buildFeature(roleTags: RoleTag[]) {
  if (roleTags.includes("サイクル") || roleTags.includes("クッション")) return "サイクル寄り";
  if (roleTags.includes("耐久") && !roleTags.some((tag) => tag.includes("アタッカー"))) return "耐久寄り";
  if (roleTags.includes("高速アタッカー")) return "高速アタッカー入り";
  if (roleTags.includes("対面")) return "対面寄り";
  return "高採用バランス";
}
