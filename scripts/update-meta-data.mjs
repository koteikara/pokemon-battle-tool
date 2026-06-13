#!/usr/bin/env node
import { access, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CHAMPS_POKEDB_HOST = "champs.pokedb.tokyo";
const CHAMPS_OPEN_DATA_SOURCE = "champs-pokedb";
const CHAMPS_UNAVAILABLE_ERROR = "Champions open data source not found or unavailable";
const CHAMPS_OPEN_DATA_GUIDE_URL = `https://${CHAMPS_POKEDB_HOST}/guide/opendata`;
const DEFAULT_SOURCE_URLS = [
  "https://champs.pokedb.tokyo/opendata/s1_single_ranked_teams.json",
  "https://champs.pokedb.tokyo/opendata/s1_double_ranked_teams.json",
];

const OUTPUT_PATH = "artifacts/pokemon-battle-tool/public/data/meta.json";
const SOURCE_URLS = (process.env.POKEDB_PUBLIC_JSON_URLS ?? process.env.POKEDB_SOURCE_URL ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const MAX_LIST_ITEMS = Number(process.env.META_MAX_LIST_ITEMS ?? 5);
const MAX_TEAM_PATTERNS = Number(process.env.META_MAX_TEAM_PATTERNS ?? 300);

function unique(values) {
  return Array.from(new Set(values));
}

function decodeHtmlUrl(url) {
  return url.replace(/&amp;/g, "&");
}

async function discoverChampsOpenDataUrls() {
  console.log("Checking Champions open data guide:");
  console.log(CHAMPS_OPEN_DATA_GUIDE_URL);
  try {
    const response = await fetch(CHAMPS_OPEN_DATA_GUIDE_URL, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "pokemon-battle-tool-meta-updater/1.0 (+https://github.com/)",
      },
    });
    console.log(`Open data guide status: ${response.status} ${response.statusText}`);
    if (!response.ok) return [];

    const html = await response.text();
    const urls = unique(
      [...html.matchAll(/https:\/\/champs\.pokedb\.tokyo\/opendata\/[^"'\s<>]+?\.json/g)]
        .map((match) => decodeHtmlUrl(match[0])),
    );
    console.log(`Champions JSON links discovered: ${urls.length}`);
    for (const url of urls) console.log(`- ${url}`);
    return urls;
  } catch (error) {
    console.warn(`Failed to inspect Champions open data guide: ${error.message}`);
    return [];
  }
}

async function resolveSourceUrls() {
  if (SOURCE_URLS.length > 0) return SOURCE_URLS;
  const discoveredUrls = await discoverChampsOpenDataUrls();
  return discoveredUrls.length > 0 ? discoveredUrls : DEFAULT_SOURCE_URLS;
}

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
    const number = Number(record?.[key]);
    if (Number.isFinite(number)) return number;
  }
  return fallback;
}

function toUsageList(value) {
  return asArray(value)
    .map((entry) => {
      if (typeof entry === "string") return { name: entry.trim(), count: 0, rate: 0 };
      const name = pickString(entry, ["name", "label", "item", "teraType", "type", "pokemon", "move", "ability"]);
      const count = pickNumber(entry, ["count", "usageCount", "uses", "value"], 0);
      const rate = pickNumber(entry, ["rate", "usageRate", "percent", "percentage"], 0);
      return name ? { name, count, rate } : null;
    })
    .filter(Boolean)
    .slice(0, 20);
}

function decodeHtmlUrl(url) {
  return url.replace(/&amp;/g, "&");
}

function toChampsOpenDataUrl(candidate) {
  try {
    const url = new URL(decodeHtmlUrl(candidate), CHAMPS_OPEN_DATA_GUIDE_URL);
    if (url.hostname !== CHAMPS_POKEDB_HOST || !url.pathname.endsWith(".json")) return "";
    if (!url.pathname.startsWith("/opendata/")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function extractChampsOpenDataUrls(html) {
  const candidates = [
    ...html.matchAll(/https:\/\/champs\.pokedb\.tokyo\/opendata\/[^"'\s<>]+?\.json/g),
    ...html.matchAll(/(?<!:)\/opendata\/[^"'\s<>]+?\.json/g),
  ].map((match) => match[0]);
  return unique(candidates.map(toChampsOpenDataUrl));
}

async function discoverChampsOpenDataUrls() {
  console.log("参照URL:");
  console.log(`- ${CHAMPS_OPEN_DATA_GUIDE_URL}`);
  try {
    const response = await fetch(CHAMPS_OPEN_DATA_GUIDE_URL, {
      headers: { accept: "text/html,application/xhtml+xml", "user-agent": "pokemon-battle-tool-meta-updater/2.0" },
    });
    console.log(`取得成功/失敗: ${response.ok ? "成功" : "失敗"} (${response.status} ${response.statusText})`);
    if (!response.ok) return [];
    const urls = extractChampsOpenDataUrls(await response.text());
    console.log(`検出したPChamp DB JSON: ${urls.length}`);
    for (const url of urls) console.log(`- ${url}`);
    return urls;
  } catch (error) {
    console.warn(`取得成功/失敗: 失敗 (${error.message})`);
    return [];
  }
}

function getRawTeamEntries(data) {
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data)) return data;
  return asArray(data.teams ?? data.teamPatterns ?? data.rankings ?? data.parties ?? data.constructions);
}

function getSamplePokemonNames(data) {
  const names = [];
  for (const team of getRawTeamEntries(data)) {
    for (const name of membersFromRecord(team)) {
      if (!names.includes(name)) names.push(name);
      if (names.length >= 5) return names;
    }
  }

  const { pokemonEntries } = detectCollections(data);
  for (const entry of pokemonEntries.map(normalizePokemonEntry).filter(Boolean)) {
    if (!names.includes(entry.name)) names.push(entry.name);
    if (names.length >= 5) return names;
  }
  return names;
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

function logSourceSummary(sourceUrl, rawData, meta) {
  console.log("PokeDB source summary:");
  console.log(`sourceUrl: ${sourceUrl}`);
  console.log(`season: ${rawData?.season ?? meta?.season ?? "unknown"}`);
  console.log(`rule: ${rawData?.rule ?? meta?.rule ?? "unknown"}`);
  console.log(`updated_at: ${rawData?.updated_at ?? rawData?.updatedAt ?? meta?.updatedAt ?? "unknown"}`);
  console.log(`teams count: ${getRawTeamEntries(rawData).length || asArray(meta?.teamPatterns).length}`);
  console.log(`pokemon count: ${Object.keys(meta?.pokemon ?? {}).length}`);
  const samples = getSamplePokemonNames(rawData).slice(0, 5);
  console.log(`sample pokemon: ${samples.length > 0 ? samples.join(", ") : "none"}`);
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
  if (!parsed.pathname.endsWith(".json")) throw new Error(`not a JSON URL: ${url}`);
}

async function fetchJson(url) {
  validateSourceUrl(url);
  console.log(`参照URL: ${url}`);
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "pokemon-battle-tool-meta-updater/2.0" },
  });
  console.log(`取得成功/失敗: ${response.ok ? "成功" : "失敗"} (${response.status} ${response.statusText})`);
  if (!response.ok) throw new Error(`fetch failed: ${url} status ${response.status}`);
  return response.json();
}

function parseBaseStats(record) {
  const stats = record?.baseStats ?? record?.stats ?? record;
  return {
    H: pickNumber(stats, ["H", "h", "hp", "HP"], 0),
    A: pickNumber(stats, ["A", "a", "attack", "atk"], 0),
    B: pickNumber(stats, ["B", "b", "defense", "def"], 0),
    C: pickNumber(stats, ["C", "c", "specialAttack", "spAttack", "spa"], 0),
    D: pickNumber(stats, ["D", "d", "specialDefense", "spDefense", "spd"], 0),
    S: pickNumber(stats, ["S", "s", "speed", "spe"], 0),
  };
}

function inferRoleTags(entry) {
  const stats = parseBaseStats(entry);
  const moves = toUsageList(entry.moves ?? entry.moveCandidates).map((move) => move.name).join(" ");
  const tags = [];
  if (stats.S >= 100) tags.push("高速アタッカー");
  if (stats.A >= 100) tags.push("物理アタッカー");
  if (stats.C >= 100) tags.push("特殊アタッカー");
  if (stats.H + stats.B + stats.D >= 260) tags.push("耐久");
  if (/ステルスロック|でんじは|おにび|あくび|リフレクター|ひかりのかべ|ちょうはつ/.test(moves)) tags.push("サポート", "起点作成");
  if (tags.some((tag) => tag.includes("アタッカー"))) tags.push("対面");
  return unique(tags).slice(0, 6);
}

function normalizePokemonEntry(entry, sourceUrl) {
  if (!entry || typeof entry !== "object") return null;
  const name = pickString(entry, ["name", "pokemon", "pokemonName", "species", "ja", "jaName", "japaneseName"]);
  if (!name) return null;
  const types = unique(asArray(entry.types ?? entry.type).map(normalizeName));
  const abilities = unique(asArray(entry.abilities ?? entry.ability).map((ability) => typeof ability === "string" ? ability.trim() : pickString(ability, ["name", "ability"])));
  const moves = toUsageList(entry.moves ?? entry.moveCandidates ?? entry.learnset).map((move) => move.name);
  const roleTags = unique([...(asArray(entry.roleTags).map(normalizeName)), ...inferRoleTags(entry)]);
  const baseStats = parseBaseStats(entry);
  return {
    name,
    types,
    baseStats,
    abilities,
    moves,
    roleTags,
    metaHints: unique([
      ...asArray(entry.metaHints).map(normalizeName),
      roleTags.length ? "役割・種族値・技傾向からの推定" : "公開データ上では未確認",
    ]),
    sourceUrls: unique([...(asArray(entry.sourceUrls).map(normalizeName)), sourceUrl]),
    usageCount: pickNumber(entry, ["usageCount", "count", "uses", "usage", "teams"], 0),
    items: toUsageList(entry.items ?? entry.itemStats ?? entry.heldItems),
    teraTypes: toUsageList(entry.teraTypes ?? entry.tera_types ?? entry.terastalTypes ?? entry.tera),
    partners: toUsageList(entry.partners ?? entry.partnerStats ?? entry.teammates),
  };
}

function normalizeMeta(rawData, sourceUrl) {
  if ((rawData?.source === CHAMPS_OPEN_DATA_SOURCE || rawData?.source === "pokedb") && rawData?.pokemon && rawData?.teamPatterns) {
    return {
      updatedAt: rawData.updatedAt ?? rawData.updated_at ?? new Date().toISOString(),
      source: CHAMPS_OPEN_DATA_SOURCE,
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
    source: CHAMPS_OPEN_DATA_SOURCE,
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
    throw new Error(`not a JSON URL: ${url}. Use a Champions public JSON URL under https://${CHAMPS_POKEDB_HOST}/opendata/`);
  }

  if (parsedUrl.hostname !== CHAMPS_POKEDB_HOST) {
    throw new Error(`unsupported PokeDB host: ${parsedUrl.hostname}. Use Champions data from ${CHAMPS_POKEDB_HOST}; SV data is not accepted.`);
  }

  if (!parsedUrl.pathname.endsWith(".json")) {
    throw new Error(`not a JSON URL: ${url}`);
  }
  return { pokemonEntries, moveEntries, teamEntries, abilityEntries, itemEntries };
}

function normalizeTeamPattern(record) {
  const members = asArray(record?.members ?? record?.team ?? record?.pokemon ?? record?.pokemons ?? record?.party)
    .map((member) => typeof member === "string" ? member.trim() : pickString(member, ["name", "pokemon", "pokemonName", "species", "ja", "jaName"]))
    .filter(Boolean)
    .slice(0, 6);
  if (members.length < 2) return null;
  return { members, rank: pickNumber(record, ["rank", "placement", "order"], 0), rating: pickNumber(record, ["rating", "rate", "score"], 0), source: "public-pattern" };
}

function mergePokemon(target, entry) {
  const current = target[entry.name];
  if (!current) {
    target[entry.name] = entry;
    return;
  }
  target[entry.name] = {
    ...current,
    ...entry,
    types: unique([...current.types, ...entry.types]),
    abilities: unique([...asArray(current.abilities), ...asArray(entry.abilities)]),
    moves: unique([...asArray(current.moves), ...asArray(entry.moves)]),
    roleTags: unique([...current.roleTags, ...entry.roleTags]),
    metaHints: unique([...current.metaHints, ...entry.metaHints]),
    sourceUrls: unique([...current.sourceUrls, ...entry.sourceUrls]),
    items: entry.items?.length ? entry.items : current.items,
    teraTypes: entry.teraTypes?.length ? entry.teraTypes : current.teraTypes,
    partners: entry.partners?.length ? entry.partners : current.partners,
  };
}

function normalizeMeta(rawDataList) {
  const meta = createEmptyMeta();
  const referencedUrls = [];
  for (const { rawData, sourceUrl } of rawDataList) {
    referencedUrls.push(sourceUrl);
    const { pokemonEntries, moveEntries, teamEntries, abilityEntries, itemEntries } = detectCollections(rawData);
    for (const entry of pokemonEntries.map((entry) => normalizePokemonEntry(entry, sourceUrl)).filter(Boolean)) mergePokemon(meta.pokemon, entry);
    for (const entry of moveEntries.map((entry) => normalizeMoveEntry(entry, sourceUrl)).filter(Boolean)) meta.moves[entry.name] = entry;
    for (const pattern of teamEntries.map(normalizeTeamPattern).filter(Boolean).slice(0, MAX_TEAM_PATTERNS)) meta.teamPatterns.push(pattern);
    for (const entry of abilityEntries) {
      const name = typeof entry === "string" ? entry : pickString(entry, ["name", "ability", "ja"]);
      if (name) meta.abilities[name] = typeof entry === "object" ? entry : { name };
    }
    for (const entry of itemEntries) {
      const name = typeof entry === "string" ? entry : pickString(entry, ["name", "item", "ja"]);
      if (name) meta.items[name] = typeof entry === "object" ? entry : { name };
    }
  }
  meta.sourceUrls = unique([...referencedUrls, ...GAMEPEDIA_SOURCE_URLS]);
  if (meta.teamPatterns.length === 0) meta.notes.push("teamPatternsは、公開されていない構築データを補完しないため空です。");
  meta.notes.push("SVランクマッチ・ranked_teams・scarlet-violet由来データは利用していません。");
  return meta;
}

function createFallbackMeta(errorMessage = CHAMPS_UNAVAILABLE_ERROR) {
  return {
    source: CHAMPIONS_SOURCE,
    game: CHAMPIONS_GAME,
    updatedAt: new Date().toISOString(),
    source: CHAMPS_OPEN_DATA_SOURCE,
    pokemon: {},
    moves: {},
    abilities: {},
    items: {},
    teamPatterns: [],
    error: errorMessage || CHAMPS_UNAVAILABLE_ERROR,
  };
}

async function writeMeta(meta) {
  const outputDir = path.dirname(OUTPUT_PATH);
  console.log(`source: ${meta.source}`);
  console.log(`game: ${meta.game}`);
  console.log(`生成pokemon件数: ${Object.keys(meta.pokemon ?? {}).length}`);
  console.log(`生成moves件数: ${Object.keys(meta.moves ?? {}).length}`);
  console.log(`生成abilities件数: ${Object.keys(meta.abilities ?? {}).length}`);
  console.log(`teamPatterns件数: ${asArray(meta.teamPatterns).length}`);
  if (asArray(meta.teamPatterns).length === 0) console.log("teamPatternsが空の理由: 公開されていない構築データを存在するように補完しないため。");
  let existed = true;
  try { await access(outputDir); } catch { existed = false; }
  console.log(`Data directory existed before write: ${existed}`);
  await mkdir(outputDir, { recursive: true });
  const tempPath = `${OUTPUT_PATH}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
  await rename(tempPath, OUTPUT_PATH);
  console.log(`meta.json written: ${OUTPUT_PATH}`);
}

async function main() {
  const pokedbSourceUrls = await resolveSourceUrls();
  console.log("Using PokeDB URLs:");
  for (const sourceUrl of pokedbSourceUrls) console.log(`- ${sourceUrl}`);

  const rawDataList = [];
  let lastError;
  for (const sourceUrl of pokedbSourceUrls) {
    try {
      const rawData = await fetchJson(sourceUrl);
      logJsonStructure(rawData);
      const rawStats = recordRawCollectionStats(rawData);
      console.log("Raw data counts:");
      console.log(JSON.stringify(rawStats));

      const meta = normalizeMeta(rawData, sourceUrl);
      logSourceSummary(sourceUrl, rawData, meta);
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
      console.warn(`取得成功/失敗: 失敗 (${sourceUrl}: ${error.message})`);
    }
  }

  const fallbackDetails = lastError?.message ? ` Last error: ${lastError.message}` : "";
  console.warn(`No Champions PokeDB source could be fetched; writing unavailable meta.json.${fallbackDetails}`);
  await writeMeta(createFallbackMeta(CHAMPS_UNAVAILABLE_ERROR));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
