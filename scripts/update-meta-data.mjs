#!/usr/bin/env node
import { access, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_SOURCE_URLS = [
  "https://sv.pokedb.tokyo/opendata/s38_single_ranked_teams.json",
  "https://sv.pokedb.tokyo/opendata/s38_double_ranked_teams.json",
];

const OUTPUT_PATH = "artifacts/pokemon-battle-tool/public/data/meta.json";
const SOURCE_URLS = (process.env.POKEDB_PUBLIC_JSON_URLS ?? process.env.POKEDB_SOURCE_URL ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const POKEDB_SOURCE_URLS = SOURCE_URLS.length > 0 ? SOURCE_URLS : DEFAULT_SOURCE_URLS;
const MAX_LIST_ITEMS = Number(process.env.META_MAX_LIST_ITEMS ?? 5);
const MAX_TEAM_PATTERNS = Number(process.env.META_MAX_TEAM_PATTERNS ?? 300);

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function pickString(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickNumber(record, keys, fallback = 0) {
  for (const key of keys) {
    const value = record?.[key];
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) return number;
  }
  return fallback;
}

function percent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

function compactUsageList(value, total = 0) {
  return asArray(value)
    .map((entry) => {
      if (typeof entry === "string") return { name: entry, count: 0, rate: 0 };
      const name = pickString(entry, ["name", "label", "item", "teraType", "type", "terastal", "pokemon", "partner"]);
      const count = pickNumber(entry, ["count", "usageCount", "uses", "value"], 0);
      const rawRate = pickNumber(entry, ["rate", "usageRate", "percent", "percentage"], 0);
      const rate = rawRate || (total > 0 && count > 0 ? (count / total) * 100 : 0);
      return name ? { name, count, rate: percent(rate) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b.count - a.count) || (b.rate - a.rate) || a.name.localeCompare(b.name, "ja"))
    .slice(0, MAX_LIST_ITEMS);
}

function normalizePokemonEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const name = pickString(entry, ["name", "pokemon", "pokemonName", "species", "ja", "jaName", "japaneseName"]);
  if (!name) return null;
  const usageCount = pickNumber(entry, ["usageCount", "count", "uses", "usage", "teams"], 0);
  return {
    name,
    usageCount,
    items: compactUsageList(entry.items ?? entry.itemStats ?? entry.heldItems ?? entry.holdItems, usageCount),
    teraTypes: compactUsageList(entry.teraTypes ?? entry.tera_types ?? entry.terastalTypes ?? entry.tera ?? entry.terastal, usageCount),
    partners: compactUsageList(entry.partners ?? entry.partnerStats ?? entry.teammates ?? entry.with, usageCount),
  };
}

function membersFromRecord(record) {
  const rawMembers = record?.members ?? record?.team ?? record?.pokemon ?? record?.pokemons ?? record?.party;
  return asArray(rawMembers)
    .map((member) => typeof member === "string"
      ? member.trim()
      : pickString(member, ["name", "pokemon", "pokemonName", "species", "ja", "jaName", "japaneseName"]))
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeTeamPattern(record) {
  if (!record || typeof record !== "object") return null;
  const members = membersFromRecord(record);
  if (members.length < 2) return null;
  return {
    members,
    rank: pickNumber(record, ["rank", "placement", "order"], 0),
    rating: pickNumber(record, ["rating", "rating_value", "rate", "score"], 0),
  };
}

function recordRawCollectionStats(data) {
  if (Array.isArray(data)) return { topLevelType: "array", topLevelCount: data.length };
  if (!data || typeof data !== "object") return { topLevelType: typeof data, topLevelCount: 0 };

  const stats = { topLevelType: "object", topLevelCount: Object.keys(data).length };
  for (const key of ["pokemon", "pokemons", "pokemonStats", "usage", "records", "data", "teamPatterns", "teams", "rankings", "parties", "constructions"]) {
    if (data[key] !== undefined) stats[key] = asArray(data[key]).length;
  }
  return stats;
}

function logJsonStructure(data) {
  if (Array.isArray(data)) {
    console.log("Fetched array length:");
    console.log(data.length);
    return;
  }

  if (data && typeof data === "object") {
    console.log("Fetched JSON keys:");
    console.log(JSON.stringify(Object.keys(data)));
    return;
  }

  console.log(`Fetched JSON primitive type: ${typeof data}`);
}

function detectCollections(data) {
  if (!data || typeof data !== "object") return { pokemonEntries: [], teamEntries: [] };

  if (data.pokemon && !Array.isArray(data.pokemon) && typeof data.pokemon === "object") {
    return {
      pokemonEntries: Object.entries(data.pokemon).map(([name, value]) => ({ name, ...value })),
      teamEntries: asArray(data.teamPatterns ?? data.teams ?? data.rankings),
    };
  }

  const pokemonEntries = [];
  const teamEntries = [];
  const candidates = Array.isArray(data) ? data : Object.values(data);

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const row of candidate) {
        const team = normalizeTeamPattern(row);
        const pokemon = normalizePokemonEntry(row);
        if (team) teamEntries.push(row);
        if (pokemon) pokemonEntries.push(row);
      }
      continue;
    }

    if (!candidate || typeof candidate !== "object") continue;
    for (const key of ["pokemon", "pokemons", "pokemonStats", "usage", "records", "data"]) {
      if (candidate[key]) pokemonEntries.push(...asArray(candidate[key]));
    }
    for (const key of ["teamPatterns", "teams", "rankings", "parties", "constructions"]) {
      if (candidate[key]) teamEntries.push(...asArray(candidate[key]));
    }

    const directTeam = normalizeTeamPattern(candidate);
    const directPokemon = normalizePokemonEntry(candidate);
    if (directTeam) teamEntries.push(candidate);
    if (directPokemon) pokemonEntries.push(candidate);
  }

  return { pokemonEntries, teamEntries };
}

function incrementUsage(map, name, usage) {
  if (!name) return;
  const current = map.get(name) ?? { count: 0 };
  current.count += usage;
  map.set(name, current);
}

function usageMapToList(map, total) {
  return [...map.entries()]
    .map(([name, { count }]) => ({ name, count, rate: percent(total > 0 ? (count / total) * 100 : 0) }))
    .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name, "ja"))
    .slice(0, MAX_LIST_ITEMS);
}

function addPokemonUsage(target, name, { item = "", teraType = "", partners = [] } = {}) {
  if (!name) return;
  const current = target[name] ?? {
    usageCount: 0,
    itemUsage: new Map(),
    teraUsage: new Map(),
    partnerUsage: new Map(),
  };

  current.usageCount += 1;
  incrementUsage(current.itemUsage, item, 1);
  incrementUsage(current.teraUsage, teraType, 1);
  for (const partner of partners) incrementUsage(current.partnerUsage, partner, 1);
  target[name] = current;
}

function aggregatePokemonFromTeams(teamEntries) {
  const aggregated = {};

  for (const teamEntry of teamEntries) {
    const members = asArray(teamEntry?.team ?? teamEntry?.members ?? teamEntry?.pokemon ?? teamEntry?.pokemons ?? teamEntry?.party)
      .map((member) => {
        if (typeof member === "string") return { name: member.trim(), item: "", teraType: "" };
        return {
          name: pickString(member, ["name", "pokemon", "pokemonName", "species", "ja", "jaName", "japaneseName"]),
          item: pickString(member, ["item", "heldItem", "holdItem"]),
          teraType: pickString(member, ["terastal", "teraType", "type", "tera"]),
        };
      })
      .filter((member) => member.name);

    const names = members.map((member) => member.name);
    for (const member of members) {
      addPokemonUsage(aggregated, member.name, {
        item: member.item,
        teraType: member.teraType,
        partners: names.filter((name) => name !== member.name),
      });
    }
  }

  return Object.fromEntries(Object.entries(aggregated).map(([name, entry]) => [name, {
    usageCount: entry.usageCount,
    items: usageMapToList(entry.itemUsage, entry.usageCount),
    teraTypes: usageMapToList(entry.teraUsage, entry.usageCount),
    partners: usageMapToList(entry.partnerUsage, entry.usageCount),
  }]));
}

function mergePokemon(target, entry) {
  const current = target[entry.name] ?? { usageCount: 0, items: [], teraTypes: [], partners: [] };
  target[entry.name] = {
    usageCount: Math.max(current.usageCount, entry.usageCount),
    items: entry.items.length ? entry.items : current.items,
    teraTypes: entry.teraTypes.length ? entry.teraTypes : current.teraTypes,
    partners: entry.partners.length ? entry.partners : current.partners,
  };
}

function normalizeMeta(rawData, sourceUrl) {
  if (rawData?.source === "pokedb" && rawData?.pokemon && rawData?.teamPatterns) {
    return {
      updatedAt: rawData.updatedAt ?? new Date().toISOString(),
      source: "pokedb",
      sourceUrl,
      pokemon: rawData.pokemon,
      teamPatterns: asArray(rawData.teamPatterns).slice(0, MAX_TEAM_PATTERNS),
    };
  }

  const { pokemonEntries, teamEntries } = detectCollections(rawData);
  const pokemon = aggregatePokemonFromTeams(teamEntries);
  for (const entry of pokemonEntries.map(normalizePokemonEntry).filter(Boolean)) {
    mergePokemon(pokemon, entry);
  }

  const teamPatterns = teamEntries
    .map(normalizeTeamPattern)
    .filter(Boolean)
    .sort((a, b) => (a.rank || 999999) - (b.rank || 999999) || b.rating - a.rating)
    .slice(0, MAX_TEAM_PATTERNS);

  return {
    updatedAt: new Date().toISOString(),
    source: "pokedb",
    sourceUrl,
    pokemon,
    teamPatterns,
  };
}

function validateSourceUrl(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`invalid URL: ${url}`);
  }

  if (parsedUrl.pathname.endsWith("/guide/opendata")) {
    throw new Error(`not a JSON URL: ${url}. Use a public JSON URL such as https://sv.pokedb.tokyo/opendata/s38_single_ranked_teams.json`);
  }

  if (!parsedUrl.pathname.endsWith(".json")) {
    throw new Error(`not a JSON URL: ${url}`);
  }
}

async function fetchJson(url) {
  validateSourceUrl(url);
  console.log("Fetching:");
  console.log(url);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "pokemon-battle-tool-meta-updater/1.0 (+https://github.com/)",
    },
  });

  if (!response.ok) {
    console.log("Fetch failed:");
    console.log(`${url} status: ${response.status}`);
    const error = new Error(`fetch failed: ${url} status ${response.status}`);
    error.url = url;
    throw error;
  }

  console.log("Fetch status:");
  console.log(`${response.status} ${response.statusText}`);

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !contentType.includes("json")) {
    console.warn(`Fetch warning: ${url} content-type is ${contentType}`);
  }

  return response.json();
}

function createFallbackMeta(errorMessage = "fetch failed or no source data") {
  return {
    updatedAt: new Date().toISOString(),
    source: "pokedb",
    pokemon: {},
    teamPatterns: [],
    error: errorMessage,
  };
}

async function writeMeta(meta) {
  const outputDir = path.dirname(OUTPUT_PATH);
  console.log(`Output path: ${OUTPUT_PATH}`);
  let dataDirectoryAlreadyExisted = true;
  try {
    await access(outputDir);
  } catch {
    dataDirectoryAlreadyExisted = false;
  }
  console.log(`Data directory existed before write: ${dataDirectoryAlreadyExisted}`);
  console.log(`Ensuring data directory exists: ${outputDir}`);
  await mkdir(outputDir, { recursive: true });
  console.log(`Data directory is ready: ${outputDir}`);

  const pokemonCount = Object.keys(meta.pokemon ?? {}).length;
  const teamPatternsCount = asArray(meta.teamPatterns).length;
  console.log(`pokemon count: ${pokemonCount}`);
  console.log(`teamPatterns count: ${teamPatternsCount}`);

  const tempPath = `${OUTPUT_PATH}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(meta)}\n`, "utf8");
  await rename(tempPath, OUTPUT_PATH);
  console.log(`meta.json written: ${OUTPUT_PATH}`);
}

async function main() {
  console.log("Using PokeDB URLs:");
  for (const sourceUrl of POKEDB_SOURCE_URLS) console.log(`- ${sourceUrl}`);

  let lastError;
  for (const sourceUrl of POKEDB_SOURCE_URLS) {
    try {
      const rawData = await fetchJson(sourceUrl);
      logJsonStructure(rawData);
      const rawStats = recordRawCollectionStats(rawData);
      console.log("Raw data counts:");
      console.log(JSON.stringify(rawStats));

      const meta = normalizeMeta(rawData, sourceUrl);
      const pokemonCount = Object.keys(meta.pokemon).length;
      const teamPatternsCount = meta.teamPatterns.length;
      console.log(`Generated meta pokemon count: ${pokemonCount}`);
      console.log(`Generated meta teamPatterns count: ${teamPatternsCount}`);
      if (pokemonCount === 0 && teamPatternsCount === 0) {
        throw new Error(`no usable usage data: ${sourceUrl}`);
      }

      await writeMeta(meta);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Failed to update from ${sourceUrl}: ${error.message}`);
    }
  }

  const fallbackError = lastError?.message ?? "fetch failed or no source data";
  console.warn(`No PokeDB source could be fetched; writing fallback meta.json. ${fallbackError}`);
  await writeMeta(createFallbackMeta(fallbackError));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
