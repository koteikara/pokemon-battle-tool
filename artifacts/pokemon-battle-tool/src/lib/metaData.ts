export interface MetaUsageEntry {
  name: string;
  count: number;
  rate: number;
}

export interface MetaPokemonEntry {
  usageCount: number;
  items: MetaUsageEntry[];
  teraTypes: MetaUsageEntry[];
  partners: MetaUsageEntry[];
}

export interface MetaTeamPattern {
  members: string[];
  rank: number;
  rating: number;
}

export interface MetaData {
  updatedAt: string;
  source: "pokedb" | string;
  sourceUrl?: string;
  error?: string;
  pokemon: Record<string, MetaPokemonEntry>;
  teamPatterns: MetaTeamPattern[];
}

const normalizeName = (name: string) => name.trim().replace(/\s+/g, "");

export async function loadMetaData(): Promise<MetaData | null> {
  try {
    const metaUrl = `${import.meta.env.BASE_URL}data/meta.json`;
    const response = await fetch(metaUrl, { cache: "no-cache" });
    if (!response.ok) return null;
    const data = await response.json();
    if (
      !data ||
      typeof data !== "object" ||
      !data.pokemon ||
      !Array.isArray(data.teamPatterns)
    )
      return null;
    if (Object.keys(data.pokemon).length === 0) return null;
    return data as MetaData;
  } catch {
    return null;
  }
}

export function findMetaPokemon(
  metaData: MetaData | null,
  pokemonName: string,
): MetaPokemonEntry | null {
  if (!metaData) return null;
  const exact = metaData.pokemon[pokemonName.trim()];
  if (exact) return exact;

  const wanted = normalizeName(pokemonName);
  const matchedKey = Object.keys(metaData.pokemon).find(
    (name) => normalizeName(name) === wanted,
  );
  return matchedKey ? metaData.pokemon[matchedKey] : null;
}
