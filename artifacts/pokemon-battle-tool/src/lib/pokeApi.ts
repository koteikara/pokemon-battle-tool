export type PokemonApiData = {
  japaneseName: string;
  apiName: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  abilities: string[];
};

export const POKEMON_API_NAME_MAP: Record<string, string> = {
  "ガブリアス": "garchomp",
  "アシレーヌ": "primarina",
  "リザードン": "charizard",
  "ブリジュラス": "archaludon",
  "アーマーガア": "corviknight",
  "カバルドン": "hippowdon",
  "ゲンガー": "gengar",
  "カイリュー": "dragonite",
  "ギルガルド": "aegislash-shield",
  "ハッサム": "scizor",
  "マスカーニャ": "meowscarada",
  "ドドゲザン": "kingambit",
  "ミミッキュ": "mimikyu-disguised",
  "キラフロル": "glimmora",
  "サザンドラ": "hydreigon",
  "ウォッシュロトム": "rotom-wash",
  "ヒートロトム": "rotom-heat",
  "カットロトム": "rotom-mow",
  "フロストロトム": "rotom-frost",
  "スピンロトム": "rotom-fan",
  "ブラッキー": "umbreon",
  "ルカリオ": "lucario",
  "ギャラドス": "gyarados",
  "マフォクシー": "delphox",
  "ガルーラ": "kangaskhan",
  "メガニウム": "meganium",
  "ゲッコウガ": "greninja",
  "ウルガモス": "volcarona",
  "フシギバナ": "venusaur",
  "ピクシー": "clefable",
  "スターミー": "starmie",
  "バンギラス": "tyranitar",
  "ニンフィア": "sylveon",
  "ラウドボーン": "skeledirge",
  "ドラパルト": "dragapult",
  "ドヒドイデ": "toxapex",
  "ペリッパー": "pelipper",
  "マリルリ": "azumarill",
  "マンムー": "mamoswine",
  "ソウブレイズ": "ceruledge",
  "カビゴン": "snorlax",
  "エンペルト": "empoleon",
  "カメックス": "blastoise",
  "ドリュウズ": "excadrill",
  "エアームド": "skarmory",
  "ユキメノコ": "froslass",
  "ウツボット": "victreebel",
  "サーナイト": "gardevoir",
  "キュウコン（アローラ）": "ninetales-alola",
  "エルフーン": "whimsicott",
  "バサギリ": "kleavor",
  "エルレイド": "gallade",
  "ガオガエン": "incineroar",
  "ミロカロス": "milotic",
  "ジャローダ": "serperior",
  "ヘラクロス": "heracross",
  "ローブシン": "conkeldurr",
  "デカヌチャン": "tinkaton",
  "グレンアルマ": "armarouge",
  "シャンデラ": "chandelure",
  "ウインディ（ヒスイ）": "arcanine-hisui",
  "メタモン": "ditto",
  "プテラ": "aerodactyl",
  "ブリガロン": "chesnaught",
  "ウインディ": "arcanine",
  "ボスゴドラ": "aggron",
  "ヤドラン": "slowbro",
  "ヤバソチャ": "sinistcha",
  "イルカマン": "palafin-zero",
  "エーフィ": "espeon",
  "ヤミラミ": "sableye",
  "エレザード": "heliolisk",
  "サメハダー": "sharpedo",
  "オーダイル": "feraligatr",
  "ウェーニバル": "quaquaval",
  "スピアー": "beedrill",
  "ルチャブル": "hawlucha",
  "ポットデス": "polteageist",
  "マニューラ": "weavile",
  "シャワーズ": "vaporeon",
  "フーディン": "alakazam",
  "ゴウカザル": "infernape",
  "カイロス": "pinsir",
  "ファイアロー": "talonflame",
  "キョジオーン": "garganacl",
  "ユキノオー": "abomasnow",
  "ライボルト": "manectric",
  "エンブオー": "emboar",
  "チルタリス": "altaria",
  "ピジョット": "pidgeot",
  "グライオン": "gliscor",
  "サンダース": "jolteon",
  "カイリキー": "machamp",
  "デンリュウ": "ampharos",
  "ドダイトス": "torterra",
  "グレイシア": "glaceon",
  "ジャラランガ": "kommo-o",
  "コータス": "torkoal",
  "ワルビアル": "krookodile",
  "ニョロトノ": "politoed",
  "ヌメルゴン": "goodra",
  "オンバーン": "noivern",
  "アブソル": "absol",
  "オニゴーリ": "glalie",
  "ヤドキング": "slowking",
  "リキキリン": "farigiraf",
  "ゾロアーク": "zoroark",
  "ドサイドン": "rhyperior",
  "ミカルゲ": "spiritomb",
  "クレッフィ": "klefki",
  "ピカチュウ": "pikachu",
  "ロズレイド": "roserade",
  "モルペコ": "morpeko-full-belly",
  "ヘルガー": "houndoom",
  "ゴルーグ": "golurk",
  "マホイップ": "alcremie",
  "ランクルス": "reuniclus",
  "キュウコン": "ninetales",
  "バクフーン": "typhlosion",
  "アマルルガ": "aurorus",
  "ドクロッグ": "toxicroak",
  "オーロット": "trevenant",
  "マッギョ": "stunfisk",
  "ガチゴラス": "tyrantrum",
  "レントラー": "luxray",
  "バクーダ": "camerupt",
  "ゴロンダ": "pangoro",
  "リーフィア": "leafeon",
  "エモンガ": "emolga",
  "ブースター": "flareon",
  "ジュナイパー": "decidueye",
  "フラージェス": "florges",
  "ライチュウ": "raichu",
  "ライチュウ（アローラ）": "raichu-alola",
  "タブンネ": "audino",
  "デデンネ": "dedenne",
  "タルップル": "appletun",
  "アーボック": "arbok",
  "バリコオル": "mr-rime",
  "マッギョ（ガラル）": "stunfisk-galar",
  "ツンベアー": "beartic",
  "トリミアン": "furfrou",
  "レパルダス": "liepard",
  "ダストダス": "garbodor",
  "アップリュー": "flapple",
  "ダイケンキ": "samurott",
  "ケンタロス": "tauros",
  "ヤレユータン": "oranguru",
  "ナゲツケサル": "passimian",
  "ロトム": "rotom",
  "ポワルン": "castform",
};

const TYPE_API_NAME_MAP: Record<string, string> = {
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

export const ABILITY_API_NAME_MAP: Record<string, string> = {
  intimidate: "いかく",
  "rough-skin": "さめはだ",
  "sand-veil": "すながくれ",
  levitate: "ふゆう",
  overgrow: "しんりょく",
  blaze: "もうか",
  torrent: "げきりゅう",
  swarm: "むしのしらせ",
  pressure: "プレッシャー",
  "inner-focus": "せいしんりょく",
  multiscale: "マルチスケイル",
  "clear-body": "クリアボディ",
  technician: "テクニシャン",
  "speed-boost": "かそく",
  "magic-guard": "マジックガード",
  "magic-bounce": "マジックミラー",
  sturdy: "がんじょう",
  regenerator: "さいせいりょく",
  "natural-cure": "しぜんかいふく",
  synchronize: "シンクロ",
  guts: "こんじょう",
  moxie: "じしんかじょう",
  adaptability: "てきおうりょく",
  prankster: "いたずらごころ",
  disguise: "ばけのかわ",
  unaware: "てんねん",
  "snow-warning": "ゆきふらし",
  drought: "ひでり",
  drizzle: "あめふらし",
  "sand-stream": "すなおこし",
  "swift-swim": "すいすい",
  chlorophyll: "ようりょくそ",
  "water-absorb": "ちょすい",
  "volt-absorb": "ちくでん",
  "flash-fire": "もらいび",
  "poison-heal": "ポイズンヒール",
  defiant: "まけんき",
  competitive: "かちき",
  "sheer-force": "ちからずく",
  "huge-power": "ちからもち",
  "pure-power": "ヨガパワー",
  protean: "へんげんじざい",
  "battle-bond": "きずなへんげ",
  "good-as-gold": "おうごんのからだ",
  "supreme-overlord": "そうだいしょう",
  sharpness: "きれあじ",
  "purifying-salt": "きよめのしお",
  "toxic-debris": "どくげしょう",
  "quark-drive": "クォークチャージ",
  protosynthesis: "こだいかっせい",
  "solar-power": "サンパワー",
};

type PokeApiPokemonResponse = {
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string } }[];
};

const STAT_API_NAME_MAP: Record<string, keyof PokemonApiData["stats"]> = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "specialAttack",
  "special-defense": "specialDefense",
  speed: "speed",
};

const getCacheKey = (apiName: string) => `pokeapi:pokemon:${apiName}`;

function isPokemonApiData(value: unknown): value is PokemonApiData {
  if (!value || typeof value !== "object") return false;
  const data = value as PokemonApiData;
  return typeof data.japaneseName === "string" && typeof data.apiName === "string" && Array.isArray(data.types) && Array.isArray(data.abilities) &&
    !!data.stats && typeof data.stats.hp === "number" && typeof data.stats.attack === "number" && typeof data.stats.defense === "number" &&
    typeof data.stats.specialAttack === "number" && typeof data.stats.specialDefense === "number" && typeof data.stats.speed === "number";
}

export function getPokemonApiName(japaneseName: string): string | undefined {
  return POKEMON_API_NAME_MAP[japaneseName.trim()];
}

export function getCachedPokemonApiData(japaneseName: string): PokemonApiData | null {
  const apiName = getPokemonApiName(japaneseName);
  if (!apiName) return null;

  try {
    const raw = localStorage.getItem(getCacheKey(apiName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isPokemonApiData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatAbilityName(apiAbilityName: string): string {
  return ABILITY_API_NAME_MAP[apiAbilityName] ?? `未翻訳: ${apiAbilityName}`;
}

function formatPokemonApiData(japaneseName: string, apiName: string, data: PokeApiPokemonResponse): PokemonApiData {
  const stats: PokemonApiData["stats"] = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  data.stats.forEach((entry) => {
    const statKey = STAT_API_NAME_MAP[entry.stat.name];
    if (statKey) stats[statKey] = entry.base_stat;
  });

  return {
    japaneseName,
    apiName,
    types: data.types.map((entry) => TYPE_API_NAME_MAP[entry.type.name] ?? entry.type.name),
    stats,
    abilities: data.abilities.map((entry) => formatAbilityName(entry.ability.name)),
  };
}

export async function fetchPokemonApiData(japaneseName: string): Promise<PokemonApiData | null> {
  const apiName = getPokemonApiName(japaneseName);
  if (!apiName) return null;

  const cached = getCachedPokemonApiData(japaneseName);
  if (cached) return cached;

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
  if (!response.ok) throw new Error(`PokeAPI request failed: ${response.status}`);

  const raw = await response.json() as PokeApiPokemonResponse;
  const formatted = formatPokemonApiData(japaneseName.trim(), apiName, raw);

  try {
    localStorage.setItem(getCacheKey(apiName), JSON.stringify(formatted));
  } catch {
    // localStorage容量不足などでキャッシュできなくても、取得データの表示は継続します。
  }

  return formatted;
}
