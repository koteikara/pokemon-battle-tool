export const POKEMON_TYPES = [
  "ノーマル", "ほのお", "みず", "でんき", "くさ", "こおり", "かくとう", "どく",
  "じめん", "ひこう", "エスパー", "むし", "いわ", "ゴースト", "ドラゴン",
  "あく", "はがね", "フェアリー"
] as const;

export type PokemonType = typeof POKEMON_TYPES[number] | "";

export interface Pokemon {
  id: string;
  name: string;
  type1: PokemonType;
  type2: PokemonType;
}

// 0 = Normal, 1 = Fire, 2 = Water, 3 = Electric, 4 = Grass, 5 = Ice, 6 = Fighting, 7 = Poison
// 8 = Ground, 9 = Flying, 10 = Psychic, 11 = Bug, 12 = Rock, 13 = Ghost, 14 = Dragon
// 15 = Dark, 16 = Steel, 17 = Fairy
const TYPE_INDEX: Record<Exclude<PokemonType, "">, number> = {
  "ノーマル": 0, "ほのお": 1, "みず": 2, "でんき": 3, "くさ": 4, "こおり": 5, "かくとう": 6, "どく": 7,
  "じめん": 8, "ひこう": 9, "エスパー": 10, "むし": 11, "いわ": 12, "ゴースト": 13, "ドラゴン": 14,
  "あく": 15, "はがね": 16, "フェアリー": 17
};

// Rows: Attacker, Cols: Defender
const TYPE_CHART: number[][] = [
  /* Nor */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1, 1, 0.5, 1],
  /* Fir */ [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5, 1, 2, 1],
  /* Wat */ [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5, 1, 1, 1],
  /* Ele */ [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5, 1, 1, 1],
  /* Gra */ [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5, 1, 0.5, 1],
  /* Ice */ [1, 0.5, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 0.5, 1],
  /* Fig */ [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1, 2, 2, 0.5],
  /* Poi */ [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 0, 2],
  /* Gro */ [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1, 1, 2, 1],
  /* Fly */ [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 0.5, 1],
  /* Psy */ [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1, 0, 0.5, 1],
  /* Bug */ [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1, 2, 0.5, 0.5],
  /* Roc */ [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 0.5, 1],
  /* Gho */ [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 1],
  /* Dra */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0.5, 0],
  /* Dar */ [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 0.5],
  /* Ste */ [1, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0.5, 2],
  /* Fai */ [1, 0.5, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 1, 2, 2, 0.5, 1]
];

export function getMultiplier(attackType: Exclude<PokemonType, "">, defendType1: Exclude<PokemonType, "">, defendType2?: PokemonType): number {
  const atk = TYPE_INDEX[attackType];
  const def1 = TYPE_INDEX[defendType1];
  let mult = TYPE_CHART[atk][def1];

  if (defendType2 && defendType2 !== "") {
    const def2 = TYPE_INDEX[defendType2 as Exclude<PokemonType, "">];
    mult *= TYPE_CHART[atk][def2];
  }
  
  return mult;
}
