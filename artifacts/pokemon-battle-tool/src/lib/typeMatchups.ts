export type PokemonType =
  | "ノーマル"
  | "ほのお"
  | "みず"
  | "でんき"
  | "くさ"
  | "こおり"
  | "かくとう"
  | "どく"
  | "じめん"
  | "ひこう"
  | "エスパー"
  | "むし"
  | "いわ"
  | "ゴースト"
  | "ドラゴン"
  | "あく"
  | "はがね"
  | "フェアリー";

export const POKEMON_TYPES: PokemonType[] = [
  "ノーマル",
  "ほのお",
  "みず",
  "でんき",
  "くさ",
  "こおり",
  "かくとう",
  "どく",
  "じめん",
  "ひこう",
  "エスパー",
  "むし",
  "いわ",
  "ゴースト",
  "ドラゴン",
  "あく",
  "はがね",
  "フェアリー",
];

const TYPE_SET = new Set<string>(POKEMON_TYPES);

export function isPokemonType(type: string): type is PokemonType {
  return TYPE_SET.has(type);
}

const SUPER_EFFECTIVE: Record<PokemonType, PokemonType[]> = {
  ノーマル: [],
  ほのお: ["くさ", "こおり", "むし", "はがね"],
  みず: ["ほのお", "じめん", "いわ"],
  でんき: ["みず", "ひこう"],
  くさ: ["みず", "じめん", "いわ"],
  こおり: ["くさ", "じめん", "ひこう", "ドラゴン"],
  かくとう: ["ノーマル", "こおり", "いわ", "あく", "はがね"],
  どく: ["くさ", "フェアリー"],
  じめん: ["ほのお", "でんき", "どく", "いわ", "はがね"],
  ひこう: ["くさ", "かくとう", "むし"],
  エスパー: ["かくとう", "どく"],
  むし: ["くさ", "エスパー", "あく"],
  いわ: ["ほのお", "こおり", "ひこう", "むし"],
  ゴースト: ["エスパー", "ゴースト"],
  ドラゴン: ["ドラゴン"],
  あく: ["エスパー", "ゴースト"],
  はがね: ["こおり", "いわ", "フェアリー"],
  フェアリー: ["かくとう", "ドラゴン", "あく"],
};

const NOT_VERY_EFFECTIVE: Record<PokemonType, PokemonType[]> = {
  ノーマル: ["いわ", "はがね"],
  ほのお: ["ほのお", "みず", "いわ", "ドラゴン"],
  みず: ["みず", "くさ", "ドラゴン"],
  でんき: ["でんき", "くさ", "ドラゴン"],
  くさ: ["ほのお", "くさ", "どく", "ひこう", "むし", "ドラゴン", "はがね"],
  こおり: ["ほのお", "みず", "こおり", "はがね"],
  かくとう: ["どく", "ひこう", "エスパー", "むし", "フェアリー"],
  どく: ["どく", "じめん", "いわ", "ゴースト"],
  じめん: ["くさ", "むし"],
  ひこう: ["でんき", "いわ", "はがね"],
  エスパー: ["エスパー", "はがね"],
  むし: [
    "ほのお",
    "かくとう",
    "どく",
    "ひこう",
    "ゴースト",
    "はがね",
    "フェアリー",
  ],
  いわ: ["かくとう", "じめん", "はがね"],
  ゴースト: ["あく"],
  ドラゴン: ["はがね"],
  あく: ["かくとう", "あく", "フェアリー"],
  はがね: ["ほのお", "みず", "でんき", "はがね"],
  フェアリー: ["ほのお", "どく", "はがね"],
};

const NO_EFFECT: Record<PokemonType, PokemonType[]> = {
  ノーマル: ["ゴースト"],
  ほのお: [],
  みず: [],
  でんき: ["じめん"],
  くさ: [],
  こおり: [],
  かくとう: ["ゴースト"],
  どく: ["はがね"],
  じめん: ["ひこう"],
  ひこう: [],
  エスパー: ["あく"],
  むし: [],
  いわ: [],
  ゴースト: ["ノーマル"],
  ドラゴン: ["フェアリー"],
  あく: [],
  はがね: [],
  フェアリー: [],
};

function getSingleTypeEffectiveness(
  attackType: PokemonType,
  defenderType: PokemonType,
): 0 | 0.5 | 1 | 2 {
  if (NO_EFFECT[attackType].includes(defenderType)) return 0;
  if (SUPER_EFFECTIVE[attackType].includes(defenderType)) return 2;
  if (NOT_VERY_EFFECTIVE[attackType].includes(defenderType)) return 0.5;
  return 1;
}

export function getTypeEffectiveness(
  attackType: PokemonType,
  defenderTypes: PokemonType[],
): 0 | 0.25 | 0.5 | 1 | 2 | 4 {
  const multiplier = defenderTypes.reduce<number>(
    (total, defenderType) =>
      total * getSingleTypeEffectiveness(attackType, defenderType),
    1,
  );
  if (multiplier === 0) return 0;
  if (multiplier <= 0.25) return 0.25;
  if (multiplier <= 0.5) return 0.5;
  if (multiplier >= 4) return 4;
  if (multiplier >= 2) return 2;
  return 1;
}
