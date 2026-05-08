import { isPokemonType, type PokemonType } from "./typeMatchups";

export type MoveDamageClass = "物理" | "特殊" | "変化" | "不明";

export type MoveApiData = {
  japaneseName: string;
  apiName: string;
  type: PokemonType | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  damageClass: MoveDamageClass;
};

export const MOVE_API_NAME_MAP: Record<string, string> = {
  じしん: "earthquake",
  だいちのちから: "earth-power",
  "10まんばりき": "high-horsepower",
  じならし: "bulldoze",

  れいとうビーム: "ice-beam",
  れいとうパンチ: "ice-punch",
  こおりのつぶて: "ice-shard",
  こおりのキバ: "ice-fang",
  ふぶき: "blizzard",
  フリーズドライ: "freeze-dry",
  つららおとし: "icicle-crash",
  つららばり: "icicle-spear",

  かえんほうしゃ: "flamethrower",
  だいもんじ: "fire-blast",
  オーバーヒート: "overheat",
  フレアドライブ: "flare-blitz",
  ほのおのパンチ: "fire-punch",
  ほのおのキバ: "fire-fang",
  ねっぷう: "heat-wave",
  ブラストバーン: "blast-burn",
  ニトロチャージ: "flame-charge",
  フレアソング: "torch-song",

  "10まんボルト": "thunderbolt",
  かみなり: "thunder",
  ボルトチェンジ: "volt-switch",
  ワイルドボルト: "wild-charge",
  ほうでん: "discharge",
  でんこうせっか: "quick-attack",
  エレキネット: "electroweb",
  パラボラチャージ: "parabolic-charge",

  ハイドロポンプ: "hydro-pump",
  ハイドロカノン: "hydro-cannon",
  なみのり: "surf",
  たきのぼり: "waterfall",
  アクアジェット: "aqua-jet",
  アクアブレイク: "liquidation",
  アクアテール: "aqua-tail",
  ねっとう: "scald",
  ウェーブタックル: "wave-crash",
  クイックターン: "flip-turn",

  リーフストーム: "leaf-storm",
  リーフブレード: "leaf-blade",
  ギガドレイン: "giga-drain",
  エナジーボール: "energy-ball",
  ソーラービーム: "solar-beam",
  ソーラーブレード: "solar-blade",
  ウッドハンマー: "wood-hammer",
  ウッドホーン: "horn-leech",
  タネマシンガン: "bullet-seed",
  タネばくだん: "seed-bomb",
  くさむすび: "grass-knot",

  ムーンフォース: "moonblast",
  じゃれつく: "play-rough",
  マジカルシャイン: "dazzling-gleam",
  ドレインキッス: "draining-kiss",
  ミストバースト: "misty-explosion",

  りゅうせいぐん: "draco-meteor",
  りゅうのはどう: "dragon-pulse",
  りゅうのまい: "dragon-dance",
  ドラゴンクロー: "dragon-claw",
  ドラゴンアロー: "dragon-darts",
  ドラゴンダイブ: "dragon-rush",
  げきりん: "outrage",
  スケイルショット: "scale-shot",
  スケイルノイズ: "clanging-scales",

  あくのはどう: "dark-pulse",
  かみくだく: "crunch",
  ふいうち: "sucker-punch",
  つじぎり: "night-slash",
  はたきおとす: "knock-off",
  イカサマ: "foul-play",
  バークアウト: "snarl",
  DDラリアット: "darkest-lariat",
  ドゲザン: "kowtow-cleave",

  シャドーボール: "shadow-ball",
  シャドークロー: "shadow-claw",
  シャドーパンチ: "shadow-punch",
  かげうち: "shadow-sneak",
  ゴーストダイブ: "phantom-force",
  たたりめ: "hex",
  おはかまいり: "last-respects",
  ポルターガイスト: "poltergeist",

  インファイト: "close-combat",
  ドレインパンチ: "drain-punch",
  マッハパンチ: "mach-punch",
  しんくうは: "vacuum-wave",
  はどうだん: "aura-sphere",
  きあいだま: "focus-blast",
  ローキック: "low-sweep",
  かわらわり: "brick-break",
  ボディプレス: "body-press",

  どくづき: "poison-jab",
  ヘドロばくだん: "sludge-bomb",
  ヘドロウェーブ: "sludge-wave",
  ベノムショック: "venoshock",
  どくどく: "toxic",
  どくびし: "toxic-spikes",
  どくのこな: "poison-powder",

  エアスラッシュ: "air-slash",
  ぼうふう: "hurricane",
  ブレイブバード: "brave-bird",
  つばめがえし: "aerial-ace",
  そらをとぶ: "fly",
  アクロバット: "acrobatics",
  とびはねる: "bounce",
  エアカッター: "air-cutter",

  サイコキネシス: "psychic",
  サイコショック: "psyshock",
  サイコカッター: "psycho-cut",
  サイコファング: "psychic-fangs",
  しねんのずつき: "zen-headbutt",
  みらいよち: "future-sight",
  めいそう: "calm-mind",

  シザークロス: "x-scissor",
  とんぼがえり: "u-turn",
  むしのさざめき: "bug-buzz",
  ミサイルばり: "pin-missile",
  メガホーン: "megahorn",
  むしくい: "bug-bite",

  ストーンエッジ: "stone-edge",
  いわなだれ: "rock-slide",
  ロックブラスト: "rock-blast",
  がんせきふうじ: "rock-tomb",
  アクセルロック: "accelerock",
  もろはのずつき: "head-smash",
  ステルスロック: "stealth-rock",

  アイアンヘッド: "iron-head",
  アイアンテール: "iron-tail",
  ラスターカノン: "flash-cannon",
  バレットパンチ: "bullet-punch",
  スマートホーン: "smart-strike",
  ヘビーボンバー: "heavy-slam",
  てっていこうせん: "steel-beam",

  しんそく: "extreme-speed",
  のしかかり: "body-slam",
  すてみタックル: "double-edge",
  ギガインパクト: "giga-impact",
  はかいこうせん: "hyper-beam",
  からげんき: "facade",
  ハイパーボイス: "hyper-voice",
  みがわり: "substitute",
  まもる: "protect",
  ねむる: "rest",
  ねごと: "sleep-talk",
};

const TYPE_API_NAME_MAP: Record<string, PokemonType> = {
  normal: "ノーマル",
  fire: "ほのお",
  water: "みず",
  electric: "でんき",
  grass: "くさ",
  ice: "こおり",
  fighting: "かくとう",
  poison: "どく",
  ground: "じめん",
  flying: "ひこう",
  psychic: "エスパー",
  bug: "むし",
  rock: "いわ",
  ghost: "ゴースト",
  dragon: "ドラゴン",
  dark: "あく",
  steel: "はがね",
  fairy: "フェアリー",
};

const DAMAGE_CLASS_MAP: Record<string, MoveDamageClass> = {
  physical: "物理",
  special: "特殊",
  status: "変化",
};

function getMoveCacheKey(apiName: string): string {
  return `pokeapi:move:${apiName}`;
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function isMoveApiData(value: unknown): value is MoveApiData {
  if (!value || typeof value !== "object") return false;
  const data = value as MoveApiData;
  return (
    typeof data.japaneseName === "string" &&
    typeof data.apiName === "string" &&
    (data.type === null || (typeof data.type === "string" && isPokemonType(data.type))) &&
    isNullableNumber(data.power) &&
    isNullableNumber(data.accuracy) &&
    isNullableNumber(data.pp) &&
    typeof data.priority === "number" &&
    ["物理", "特殊", "変化", "不明"].includes(data.damageClass)
  );
}

function getCachedMoveApiDataByApiName(apiName: string): MoveApiData | null {
  try {
    const raw = localStorage.getItem(getMoveCacheKey(apiName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isMoveApiData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getMoveApiName(japaneseMoveName: string): string | null {
  return MOVE_API_NAME_MAP[japaneseMoveName.trim()] ?? null;
}

export function getCachedMoveApiData(
  japaneseMoveName: string,
): MoveApiData | null {
  const apiName = getMoveApiName(japaneseMoveName);
  if (!apiName) return null;
  return getCachedMoveApiDataByApiName(apiName);
}

function readNamedResourceName(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const resource = value as { name?: unknown };
  return typeof resource.name === "string" ? resource.name : null;
}

export function formatMoveApiData(
  japaneseMoveName: string,
  apiName: string,
  raw: unknown,
): MoveApiData {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const apiTypeName = readNamedResourceName(data.type);
  const translatedType = apiTypeName ? TYPE_API_NAME_MAP[apiTypeName] : undefined;
  const damageClassName = readNamedResourceName(data.damage_class);

  return {
    japaneseName: japaneseMoveName.trim(),
    apiName,
    type: translatedType ?? null,
    power: typeof data.power === "number" ? data.power : null,
    accuracy: typeof data.accuracy === "number" ? data.accuracy : null,
    pp: typeof data.pp === "number" ? data.pp : null,
    priority: typeof data.priority === "number" ? data.priority : 0,
    damageClass: damageClassName ? (DAMAGE_CLASS_MAP[damageClassName] ?? "不明") : "不明",
  };
}

export async function fetchMoveApiData(
  japaneseMoveName: string,
): Promise<MoveApiData | null> {
  const apiName = getMoveApiName(japaneseMoveName);
  if (!apiName) return null;

  const cached = getCachedMoveApiDataByApiName(apiName);
  if (cached) return cached;

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/move/${apiName}`);
    if (!response.ok) throw new Error(`Move request failed: ${response.status}`);
    const raw = await response.json();
    const formatted = formatMoveApiData(japaneseMoveName, apiName, raw);

    try {
      localStorage.setItem(getMoveCacheKey(apiName), JSON.stringify(formatted));
    } catch {
      // キャッシュ保存に失敗しても、取得した技情報の表示は続けます。
    }

    return formatted;
  } catch {
    return null;
  }
}
