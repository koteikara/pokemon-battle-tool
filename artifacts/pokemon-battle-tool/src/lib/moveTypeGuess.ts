import type { PokemonType } from "./typeMatchups";

type MoveTypePattern = {
  type: PokemonType;
  patterns: string[];
};

const MOVE_TYPE_PATTERNS: MoveTypePattern[] = [
  {
    type: "じめん",
    patterns: ["じしん", "だいちのちから", "10まんばりき", "じならし"],
  },
  {
    type: "こおり",
    patterns: ["れいとう", "こおり", "つらら", "フリーズ", "ふぶき"],
  },
  {
    type: "ほのお",
    patterns: [
      "ほのお",
      "かえん",
      "フレア",
      "だいもんじ",
      "オーバーヒート",
      "ねっぷう",
      "ブラストバーン",
    ],
  },
  {
    type: "みず",
    patterns: [
      "みず",
      "アクア",
      "ハイドロ",
      "なみのり",
      "たきのぼり",
      "ねっとう",
    ],
  },
  {
    type: "でんき",
    patterns: [
      "でんき",
      "10まんボルト",
      "かみなり",
      "ボルト",
      "ほうでん",
      "エレキ",
    ],
  },
  {
    type: "くさ",
    patterns: [
      "くさ",
      "リーフ",
      "ソーラー",
      "エナジーボール",
      "ギガドレイン",
      "ウッド",
      "タネ",
    ],
  },
  {
    type: "フェアリー",
    patterns: [
      "フェアリー",
      "ムーンフォース",
      "じゃれつく",
      "マジカルシャイン",
    ],
  },
  { type: "ドラゴン", patterns: ["ドラゴン", "りゅう"] },
  {
    type: "あく",
    patterns: [
      "あく",
      "かみくだく",
      "ふいうち",
      "DDラリアット",
      "ドゲザン",
      "バークアウト",
    ],
  },
  {
    type: "ゴースト",
    patterns: [
      "ゴースト",
      "シャドー",
      "たたりめ",
      "おはかまいり",
      "ポルターガイスト",
    ],
  },
  {
    type: "かくとう",
    patterns: [
      "かくとう",
      "インファイト",
      "ドレインパンチ",
      "はどうだん",
      "マッハパンチ",
      "ローキック",
    ],
  },
  { type: "どく", patterns: ["どく", "ヘドロ", "ベノム", "どくづき"] },
  {
    type: "ひこう",
    patterns: [
      "ひこう",
      "エア",
      "ぼうふう",
      "ブレイブバード",
      "つばめがえし",
      "そらをとぶ",
    ],
  },
  {
    type: "エスパー",
    patterns: ["エスパー", "サイコ", "しねん", "みらいよち"],
  },
  {
    type: "むし",
    patterns: ["むし", "シザークロス", "とんぼがえり", "むしのさざめき"],
  },
  {
    type: "いわ",
    patterns: ["いわ", "ストーン", "ロック", "がんせき", "もろは"],
  },
  {
    type: "はがね",
    patterns: [
      "はがね",
      "アイアン",
      "ラスターカノン",
      "バレットパンチ",
      "ヘビーボンバー",
    ],
  },
  {
    type: "ノーマル",
    patterns: [
      "ノーマル",
      "はかいこうせん",
      "ギガインパクト",
      "でんこうせっか",
      "しんそく",
      "のしかかり",
    ],
  },
];

export function guessMoveType(moveName: string): PokemonType | null {
  const normalizedMove = moveName.trim().toLowerCase();
  if (!normalizedMove) return null;

  const match = MOVE_TYPE_PATTERNS.find(({ patterns }) =>
    patterns.some((pattern) => normalizedMove.includes(pattern.toLowerCase())),
  );

  return match?.type ?? null;
}
