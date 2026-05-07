export type PokemonApiAbility = {
  name: string;
  apiName: string;
  isHidden: boolean;
};

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
  abilityDetails?: PokemonApiAbility[];
};

export const POKEMON_API_NAME_MAP: Record<string, string> = {
  ガブリアス: "garchomp",
  アシレーヌ: "primarina",
  リザードン: "charizard",
  ブリジュラス: "archaludon",
  アーマーガア: "corviknight",
  カバルドン: "hippowdon",
  ゲンガー: "gengar",
  カイリュー: "dragonite",
  ギルガルド: "aegislash-shield",
  ハッサム: "scizor",
  マスカーニャ: "meowscarada",
  ドドゲザン: "kingambit",
  ミミッキュ: "mimikyu-disguised",
  キラフロル: "glimmora",
  サザンドラ: "hydreigon",
  ウォッシュロトム: "rotom-wash",
  ヒートロトム: "rotom-heat",
  カットロトム: "rotom-mow",
  フロストロトム: "rotom-frost",
  スピンロトム: "rotom-fan",
  ブラッキー: "umbreon",
  ルカリオ: "lucario",
  ギャラドス: "gyarados",
  マフォクシー: "delphox",
  ガルーラ: "kangaskhan",
  メガニウム: "meganium",
  ゲッコウガ: "greninja",
  ウルガモス: "volcarona",
  フシギバナ: "venusaur",
  ピクシー: "clefable",
  スターミー: "starmie",
  バンギラス: "tyranitar",
  ニンフィア: "sylveon",
  ラウドボーン: "skeledirge",
  ドラパルト: "dragapult",
  ドヒドイデ: "toxapex",
  ペリッパー: "pelipper",
  マリルリ: "azumarill",
  マンムー: "mamoswine",
  ソウブレイズ: "ceruledge",
  カビゴン: "snorlax",
  エンペルト: "empoleon",
  カメックス: "blastoise",
  ドリュウズ: "excadrill",
  エアームド: "skarmory",
  ユキメノコ: "froslass",
  ウツボット: "victreebel",
  サーナイト: "gardevoir",
  "キュウコン（アローラ）": "ninetales-alola",
  エルフーン: "whimsicott",
  バサギリ: "kleavor",
  エルレイド: "gallade",
  ガオガエン: "incineroar",
  ミロカロス: "milotic",
  ジャローダ: "serperior",
  ヘラクロス: "heracross",
  ローブシン: "conkeldurr",
  デカヌチャン: "tinkaton",
  グレンアルマ: "armarouge",
  シャンデラ: "chandelure",
  "ウインディ（ヒスイ）": "arcanine-hisui",
  メタモン: "ditto",
  プテラ: "aerodactyl",
  ブリガロン: "chesnaught",
  ウインディ: "arcanine",
  ボスゴドラ: "aggron",
  ヤドラン: "slowbro",
  ヤバソチャ: "sinistcha",
  イルカマン: "palafin-zero",
  エーフィ: "espeon",
  ヤミラミ: "sableye",
  エレザード: "heliolisk",
  サメハダー: "sharpedo",
  オーダイル: "feraligatr",
  ウェーニバル: "quaquaval",
  スピアー: "beedrill",
  ルチャブル: "hawlucha",
  ポットデス: "polteageist",
  マニューラ: "weavile",
  シャワーズ: "vaporeon",
  フーディン: "alakazam",
  ゴウカザル: "infernape",
  カイロス: "pinsir",
  ファイアロー: "talonflame",
  キョジオーン: "garganacl",
  ユキノオー: "abomasnow",
  ライボルト: "manectric",
  エンブオー: "emboar",
  チルタリス: "altaria",
  ピジョット: "pidgeot",
  グライオン: "gliscor",
  サンダース: "jolteon",
  カイリキー: "machamp",
  デンリュウ: "ampharos",
  ドダイトス: "torterra",
  グレイシア: "glaceon",
  ジャラランガ: "kommo-o",
  コータス: "torkoal",
  ワルビアル: "krookodile",
  ニョロトノ: "politoed",
  ヌメルゴン: "goodra",
  オンバーン: "noivern",
  アブソル: "absol",
  オニゴーリ: "glalie",
  ヤドキング: "slowking",
  リキキリン: "farigiraf",
  ゾロアーク: "zoroark",
  ドサイドン: "rhyperior",
  ミカルゲ: "spiritomb",
  クレッフィ: "klefki",
  ピカチュウ: "pikachu",
  ロズレイド: "roserade",
  モルペコ: "morpeko-full-belly",
  ヘルガー: "houndoom",
  ゴルーグ: "golurk",
  マホイップ: "alcremie",
  ランクルス: "reuniclus",
  キュウコン: "ninetales",
  バクフーン: "typhlosion",
  アマルルガ: "aurorus",
  ドクロッグ: "toxicroak",
  オーロット: "trevenant",
  マッギョ: "stunfisk",
  ガチゴラス: "tyrantrum",
  レントラー: "luxray",
  バクーダ: "camerupt",
  ゴロンダ: "pangoro",
  リーフィア: "leafeon",
  エモンガ: "emolga",
  ブースター: "flareon",
  ジュナイパー: "decidueye",
  フラージェス: "florges",
  ライチュウ: "raichu",
  "ライチュウ（アローラ）": "raichu-alola",
  タブンネ: "audino",
  デデンネ: "dedenne",
  タルップル: "appletun",
  アーボック: "arbok",
  バリコオル: "mr-rime",
  "マッギョ（ガラル）": "stunfisk-galar",
  ツンベアー: "beartic",
  トリミアン: "furfrou",
  レパルダス: "liepard",
  ダストダス: "garbodor",
  アップリュー: "flapple",
  ダイケンキ: "samurott",
  ケンタロス: "tauros",
  ヤレユータン: "oranguru",
  ナゲツケサル: "passimian",
  ロトム: "rotom",
  ポワルン: "castform",
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
  stench: "あくしゅう",
  drizzle: "あめふらし",
  "speed-boost": "かそく",
  "battle-armor": "カブトアーマー",
  sturdy: "がんじょう",
  damp: "しめりけ",
  limber: "じゅうなん",
  "sand-veil": "すながくれ",
  static: "せいでんき",
  "volt-absorb": "ちくでん",
  "water-absorb": "ちょすい",
  oblivious: "どんかん",
  "cloud-nine": "ノーてんき",
  "compound-eyes": "ふくがん",
  insomnia: "ふみん",
  "color-change": "へんしょく",
  immunity: "めんえき",
  "flash-fire": "もらいび",
  "shield-dust": "りんぷん",
  "own-tempo": "マイペース",
  "suction-cups": "きゅうばん",
  intimidate: "いかく",
  "shadow-tag": "かげふみ",
  "rough-skin": "さめはだ",
  "wonder-guard": "ふしぎなまもり",
  levitate: "ふゆう",
  "effect-spore": "ほうし",
  synchronize: "シンクロ",
  "clear-body": "クリアボディ",
  "natural-cure": "しぜんかいふく",
  "lightning-rod": "ひらいしん",
  "serene-grace": "てんのめぐみ",
  "swift-swim": "すいすい",
  chlorophyll: "ようりょくそ",
  illuminate: "はっこう",
  trace: "トレース",
  "huge-power": "ちからもち",
  "poison-point": "どくのトゲ",
  "inner-focus": "せいしんりょく",
  "magma-armor": "マグマのよろい",
  "water-veil": "みずのベール",
  "magnet-pull": "じりょく",
  soundproof: "ぼうおん",
  "rain-dish": "あめうけざら",
  "sand-stream": "すなおこし",
  pressure: "プレッシャー",
  "thick-fat": "あついしぼう",
  "early-bird": "はやおき",
  "flame-body": "ほのおのからだ",
  "run-away": "にげあし",
  "keen-eye": "するどいめ",
  "hyper-cutter": "かいりきバサミ",
  pickup: "ものひろい",
  truant: "なまけ",
  hustle: "はりきり",
  "cute-charm": "メロメロボディ",
  plus: "プラス",
  minus: "マイナス",
  forecast: "てんきや",
  "sticky-hold": "ねんちゃく",
  "shed-skin": "だっぴ",
  guts: "こんじょう",
  "marvel-scale": "ふしぎなうろこ",
  "liquid-ooze": "ヘドロえき",
  overgrow: "しんりょく",
  blaze: "もうか",
  torrent: "げきりゅう",
  swarm: "むしのしらせ",
  "rock-head": "いしあたま",
  drought: "ひでり",
  "arena-trap": "ありじごく",
  "vital-spirit": "やるき",
  "white-smoke": "しろいけむり",
  "pure-power": "ヨガパワー",
  "shell-armor": "シェルアーマー",
  "air-lock": "エアロック",
  "tangled-feet": "ちどりあし",
  "motor-drive": "でんきエンジン",
  rivalry: "とうそうしん",
  steadfast: "ふくつのこころ",
  "snow-cloak": "ゆきがくれ",
  gluttony: "くいしんぼう",
  "anger-point": "いかりのつぼ",
  unburden: "かるわざ",
  heatproof: "たいねつ",
  simple: "たんじゅん",
  "dry-skin": "かんそうはだ",
  download: "ダウンロード",
  "iron-fist": "てつのこぶし",
  "poison-heal": "ポイズンヒール",
  adaptability: "てきおうりょく",
  "skill-link": "スキルリンク",
  hydration: "うるおいボディ",
  "solar-power": "サンパワー",
  "quick-feet": "はやあし",
  normalize: "ノーマルスキン",
  sniper: "スナイパー",
  "magic-guard": "マジックガード",
  "no-guard": "ノーガード",
  stall: "あとだし",
  technician: "テクニシャン",
  "leaf-guard": "リーフガード",
  klutz: "ぶきよう",
  "mold-breaker": "かたやぶり",
  "super-luck": "きょううん",
  aftermath: "ゆうばく",
  anticipation: "きけんよち",
  forewarn: "よちむ",
  unaware: "てんねん",
  "tinted-lens": "いろめがね",
  filter: "フィルター",
  "slow-start": "スロースタート",
  scrappy: "きもったま",
  "storm-drain": "よびみず",
  "ice-body": "アイスボディ",
  "solid-rock": "ハードロック",
  "snow-warning": "ゆきふらし",
  "honey-gather": "みつあつめ",
  frisk: "おみとおし",
  reckless: "すてみ",
  multitype: "マルチタイプ",
  "flower-gift": "フラワーギフト",
  "bad-dreams": "ナイトメア",
  pickpocket: "わるいてぐせ",
  "sheer-force": "ちからずく",
  contrary: "あまのじゃく",
  unnerve: "きんちょうかん",
  defiant: "まけんき",
  defeatist: "よわき",
  "cursed-body": "のろわれボディ",
  healer: "いやしのこころ",
  "friend-guard": "フレンドガード",
  "weak-armor": "くだけるよろい",
  "heavy-metal": "ヘヴィメタル",
  "light-metal": "ライトメタル",
  multiscale: "マルチスケイル",
  "toxic-boost": "どくぼうそう",
  "flare-boost": "ねつぼうそう",
  harvest: "しゅうかく",
  telepathy: "テレパシー",
  moody: "ムラっけ",
  overcoat: "ぼうじん",
  "poison-touch": "どくしゅ",
  regenerator: "さいせいりょく",
  "big-pecks": "はとむね",
  "sand-rush": "すなかき",
  "wonder-skin": "ミラクルスキン",
  analytic: "アナライズ",
  illusion: "イリュージョン",
  imposter: "かわりもの",
  infiltrator: "すりぬけ",
  mummy: "ミイラ",
  moxie: "じしんかじょう",
  justified: "せいぎのこころ",
  rattled: "びびり",
  "magic-bounce": "マジックミラー",
  "sap-sipper": "そうしょく",
  prankster: "いたずらごころ",
  "sand-force": "すなのちから",
  "iron-barbs": "てつのトゲ",
  "zen-mode": "ダルマモード",
  "victory-star": "しょうりのほし",
  turboblaze: "ターボブレイズ",
  teravolt: "テラボルテージ",
  "aroma-veil": "アロマベール",
  "flower-veil": "フラワーベール",
  "cheek-pouch": "ほおぶくろ",
  protean: "へんげんじざい",
  "fur-coat": "ファーコート",
  magician: "マジシャン",
  bulletproof: "ぼうだん",
  competitive: "かちき",
  "strong-jaw": "がんじょうあご",
  refrigerate: "フリーズスキン",
  "sweet-veil": "スイートベール",
  "stance-change": "バトルスイッチ",
  "gale-wings": "はやてのつばさ",
  "mega-launcher": "メガランチャー",
  "grass-pelt": "くさのけがわ",
  symbiosis: "きょうせい",
  "tough-claws": "かたいツメ",
  pixilate: "フェアリースキン",
  gooey: "ぬめぬめ",
  aerilate: "スカイスキン",
  "parental-bond": "おやこあい",
  "dark-aura": "ダークオーラ",
  "fairy-aura": "フェアリーオーラ",
  "aura-break": "オーラブレイク",
  "water-bubble": "すいほう",
  steelworker: "はがねつかい",
  berserk: "ぎゃくじょう",
  "slush-rush": "ゆきかき",
  "long-reach": "えんかく",
  "liquid-voice": "うるおいボイス",
  triage: "ヒーリングシフト",
  galvanize: "エレキスキン",
  "surge-surfer": "サーフテール",
  schooling: "ぎょぐん",
  disguise: "ばけのかわ",
  "battle-bond": "きずなへんげ",
  "power-construct": "スワームチェンジ",
  corrosion: "ふしょく",
  comatose: "ぜったいねむり",
  "queenly-majesty": "じょおうのいげん",
  "innards-out": "とびだすなかみ",
  dancer: "おどりこ",
  battery: "バッテリー",
  fluffy: "もふもふ",
  dazzling: "ビビッドボディ",
  "soul-heart": "ソウルハート",
  "tangling-hair": "カーリーヘアー",
  receiver: "レシーバー",
  "mirror-armor": "ミラーアーマー",
  "gulp-missile": "うのミサイル",
  stalwart: "すじがねいり",
  "steam-engine": "じょうききかん",
  "punk-rock": "パンクロック",
  "sand-spit": "すなはき",
  "ice-scales": "こおりのりんぷん",
  ripen: "じゅくせい",
  "ice-face": "アイスフェイス",
  "power-spot": "パワースポット",
  mimicry: "ぎたい",
  "screen-cleaner": "バリアフリー",
  "steely-spirit": "はがねのせいしん",
  "perish-body": "ほろびのボディ",
  "wandering-spirit": "さまようたましい",
  "gorilla-tactics": "ごりむちゅう",
  "neutralizing-gas": "かがくへんかガス",
  "pastel-veil": "パステルベール",
  "hunger-switch": "はらぺこスイッチ",
  "quick-draw": "クイックドロウ",
  "unseen-fist": "ふかしのこぶし",
  "curious-medicine": "きみょうなくすり",
  transistor: "トランジスタ",
  "dragons-maw": "りゅうのあぎと",
  "chilling-neigh": "しろのいななき",
  "grim-neigh": "くろのいななき",
  "thermal-exchange": "ねつこうかん",
  "anger-shell": "いかりのこうら",
  "purifying-salt": "きよめのしお",
  "well-baked-body": "こんがりボディ",
  "wind-rider": "かぜのり",
  "guard-dog": "ばんけん",
  "rocky-payload": "いわはこび",
  "wind-power": "ふうりょくでんき",
  "zero-to-hero": "マイティチェンジ",
  commander: "しれいとう",
  electromorphosis: "でんきにかえる",
  protosynthesis: "こだいかっせい",
  "quark-drive": "クォークチャージ",
  "good-as-gold": "おうごんのからだ",
  "vessel-of-ruin": "わざわいのうつわ",
  "sword-of-ruin": "わざわいのつるぎ",
  "tablets-of-ruin": "わざわいのおふだ",
  "beads-of-ruin": "わざわいのたま",
  "orichalcum-pulse": "ひひいろのこどう",
  "hadron-engine": "ハドロンエンジン",
  opportunist: "びんじょう",
  "cud-chew": "はんすう",
  sharpness: "きれあじ",
  "supreme-overlord": "そうだいしょう",
  costar: "きょうえん",
  "toxic-debris": "どくげしょう",
  "armor-tail": "テイルアーマー",
  "earth-eater": "どしょく",
  "mycelium-might": "きんしのちから",
  hospitality: "おもてなし",
  "toxic-chain": "どくのくさり",
  "supersweet-syrup": "かんろなミツ",
  "tera-shift": "テラスチェンジ",
  "tera-shell": "テラスシェル",
  "teraform-zero": "ゼロフォーミング",
};

type PokeApiPokemonResponse = {
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
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
  return (
    typeof data.japaneseName === "string" &&
    typeof data.apiName === "string" &&
    Array.isArray(data.types) &&
    Array.isArray(data.abilities) &&
    !!data.stats &&
    typeof data.stats.hp === "number" &&
    typeof data.stats.attack === "number" &&
    typeof data.stats.defense === "number" &&
    typeof data.stats.specialAttack === "number" &&
    typeof data.stats.specialDefense === "number" &&
    typeof data.stats.speed === "number"
  );
}

export function getPokemonApiName(japaneseName: string): string | undefined {
  return POKEMON_API_NAME_MAP[japaneseName.trim()];
}

export function getCachedPokemonApiData(
  japaneseName: string,
): PokemonApiData | null {
  const apiName = getPokemonApiName(japaneseName);
  if (!apiName) return null;

  try {
    const raw = localStorage.getItem(getCacheKey(apiName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isPokemonApiData(parsed)) return null;
    if (!parsed.abilityDetails?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function formatAbilityName(apiAbilityName: string): string {
  return ABILITY_API_NAME_MAP[apiAbilityName] ?? "未対応特性";
}

function formatPokemonApiData(
  japaneseName: string,
  apiName: string,
  data: PokeApiPokemonResponse,
): PokemonApiData {
  const stats: PokemonApiData["stats"] = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
  data.stats.forEach((entry) => {
    const statKey = STAT_API_NAME_MAP[entry.stat.name];
    if (statKey) stats[statKey] = entry.base_stat;
  });

  const abilityDetails = data.abilities.map((entry) => ({
    name: formatAbilityName(entry.ability.name),
    apiName: entry.ability.name,
    isHidden: entry.is_hidden,
  }));

  return {
    japaneseName,
    apiName,
    types: data.types.map(
      (entry) => TYPE_API_NAME_MAP[entry.type.name] ?? entry.type.name,
    ),
    stats,
    abilities: abilityDetails.map((ability) => ability.name),
    abilityDetails,
  };
}

export async function fetchPokemonApiData(
  japaneseName: string,
): Promise<PokemonApiData | null> {
  const apiName = getPokemonApiName(japaneseName);
  if (!apiName) return null;

  const cached = getCachedPokemonApiData(japaneseName);
  if (cached) return cached;

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
  if (!response.ok)
    throw new Error(`PokeAPI request failed: ${response.status}`);

  const raw = (await response.json()) as PokeApiPokemonResponse;
  const formatted = formatPokemonApiData(japaneseName.trim(), apiName, raw);

  try {
    localStorage.setItem(getCacheKey(apiName), JSON.stringify(formatted));
  } catch {
    // localStorage容量不足などでキャッシュできなくても、取得データの表示は継続します。
  }

  return formatted;
}
