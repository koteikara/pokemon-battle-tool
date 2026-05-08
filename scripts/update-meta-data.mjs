#!/usr/bin/env node
import { access, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_SOURCE_URLS = [
  "https://pokedb.org/data-export/all.json",
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
      const name = pickString(entry, ["name", "label", "item", "teraType", "type", "pokemon", "partner"]);
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
    teraTypes: compactUsageList(entry.teraTypes ?? entry.tera_types ?? entry.terastalTypes ?? entry.tera, usageCount),
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
    rating: pickNumber(record, ["rating", "rate", "score"], 0),
  };
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
  const pokemon = {};
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

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "pokemon-battle-tool-meta-updater/1.0 (+https://github.com/)",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function createFallbackMeta() {
  return {
    updatedAt: new Date().toISOString(),
    source: "pokedb",
    pokemon: {},
    teamPatterns: [],
    error: "fetch failed or no source data",
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
  console.log(`Pokemon count: ${pokemonCount}`);
  console.log(`Team patterns count: ${teamPatternsCount}`);

  const tempPath = `${OUTPUT_PATH}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(meta)}\n`, "utf8");
  await rename(tempPath, OUTPUT_PATH);
  console.log(`meta.json written: ${OUTPUT_PATH}`);
}

async function main() {
  let lastError;
  for (const sourceUrl of POKEDB_SOURCE_URLS) {
    try {
      console.log(`Fetching PokeDB data: ${sourceUrl}`);
      const rawData = await fetchJson(sourceUrl);
      const meta = normalizeMeta(rawData, sourceUrl);
      const pokemonCount = Object.keys(meta.pokemon).length;
      console.log(`Extracted ${pokemonCount} pokemon rows and ${meta.teamPatterns.length} team patterns.`);
      if (pokemonCount === 0 && meta.teamPatterns.length === 0) {
        throw new Error("Fetched JSON did not contain usable usage data.");
      }

      await writeMeta(meta);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Failed to update from ${sourceUrl}: ${error.message}`);
    }
  }

  console.warn("No PokeDB source could be fetched; writing fallback meta.json.");
  await writeMeta(createFallbackMeta());
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
