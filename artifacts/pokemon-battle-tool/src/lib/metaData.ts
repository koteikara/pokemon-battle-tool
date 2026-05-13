export interface MetaUsageEntry {
  name: string;
  count: number;
  rate: number;
}

export interface MetaBaseStats {
  H: number;
  A: number;
  B: number;
  C: number;
  D: number;
  S: number;
}

export interface MetaPokemonEntry {
  name: string;
  types: string[];
  baseStats: MetaBaseStats;
  abilities: string[] | MetaUsageEntry[];
  moves: string[] | MetaUsageEntry[];
  roleTags: string[];
  metaHints: string[];
  sourceUrls: string[];
  usageCount?: number;
  items?: MetaUsageEntry[];
  teraTypes?: MetaUsageEntry[];
  partners?: MetaUsageEntry[];
}

export interface MetaMoveEntry {
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  priority: number;
  effect: string;
  adoptedPokemonSingle: string[];
  adoptedPokemonDouble: string[];
  sourceUrls: string[];
}

export interface MetaTeamPattern {
  members: string[];
  rank?: number;
  rating?: number;
  source?: "template" | "public-pattern";
}

export interface MetaData {
  source: string;
  game: string;
  updatedAt: string;
  pokemon: Record<string, MetaPokemonEntry>;
  moves: Record<string, MetaMoveEntry>;
  abilities: Record<string, unknown>;
  items: Record<string, unknown>;
  teamPatterns: MetaTeamPattern[];
  notes: string[];
  sourceUrl?: string;
  sourceUrls?: string[];
  error?: string;
}

const normalizeName = (name: string) => name.trim().replace(/\s+/g, "");
const CHAMPIONS_GAME = "pokemon-champions";
const ALLOWED_SOURCES = ["champions-derived", "manual-champions"];
const BLOCKED_SOURCE_WORDS = ["ranked_teams", "scarlet-violet", "scarlet_violet", "sv-ranked", "sv_ranking"];

export function isChampionsMetaSource(data: unknown): data is MetaData {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  const source = typeof record.source === "string" ? record.source : "";
  const game = typeof record.game === "string" ? record.game : "";
  const sourceLower = source.toLowerCase();
  return (
    game === CHAMPIONS_GAME &&
    ALLOWED_SOURCES.some((prefix) => sourceLower === prefix || sourceLower.startsWith(`${prefix}-`)) &&
    !BLOCKED_SOURCE_WORDS.some((word) => sourceLower.includes(word))
  );
}

export async function loadMetaData(): Promise<MetaData | null> {
  try {
    const metaUrl = `${import.meta.env.BASE_URL}data/meta.json`;
    const response = await fetch(metaUrl, { cache: "no-cache" });
    if (!response.ok) return null;
    const data = await response.json();
    if (
      !isChampionsMetaSource(data) ||
      !data.pokemon ||
      typeof data.pokemon !== "object" ||
      !data.moves ||
      typeof data.moves !== "object" ||
      !data.abilities ||
      typeof data.abilities !== "object" ||
      !data.items ||
      typeof data.items !== "object" ||
      !Array.isArray(data.teamPatterns) ||
      !Array.isArray(data.notes)
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function findMetaPokemon(
  metaData: MetaData | null,
  pokemonName: string,
): MetaPokemonEntry | null {
  if (!hasUsableMetaData(metaData)) return null;
  const exact = metaData.pokemon[pokemonName.trim()];
  if (exact) return exact;

  const wanted = normalizeName(pokemonName);
  const matchedKey = Object.keys(metaData.pokemon).find(
    (name) => normalizeName(name) === wanted,
  );
  return matchedKey ? metaData.pokemon[matchedKey] : null;
}

export function hasUsableMetaData(metaData: MetaData | null | undefined): metaData is MetaData {
  return Boolean(
    metaData &&
      isChampionsMetaSource(metaData) &&
      Object.keys(metaData.pokemon ?? {}).length > 0 &&
      Array.isArray(metaData.teamPatterns),
  );
}

export function getMetaDataOriginLabel(metaData: MetaData | null | undefined, entry?: MetaPokemonEntry | null): string {
  if (!isChampionsMetaSource(metaData)) return "役割・種族値・技傾向からの推定";
  if (entry?.sourceUrls?.length) return "チャンピオンズ実装データに基づく補助情報";
  return "公開データ上では未確認 / 役割・相性からの推定";
}
