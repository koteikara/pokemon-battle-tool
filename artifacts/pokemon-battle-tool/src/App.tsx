import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import { MOVES } from "./lib/moves";
import {
  findMetaPokemon,
  getMetaDataOriginLabel,
  hasUsableMetaData,
  loadMetaData,
  type MetaData,
  type MetaPokemonEntry,
  type MetaUsageEntry,
} from "./lib/metaData";
import {
  createPokemonFromMetaTemplate,
  getPokemonSetTemplates,
  getPopularBuildTemplates,
  getPopularPokemonTemplates,
  type MetaBuildTemplate,
  type MetaPokemonTemplate,
} from "./lib/metaTemplates";
import { ABILITY_LIST } from "./lib/abilities";
import {
  fetchPokemonApiData,
  getCachedPokemonApiData,
  getPokemonApiName,
  type PokemonApiAbility,
  type PokemonApiData,
} from "./lib/pokeApi";
import { guessMoveType } from "./lib/moveTypeGuess";
import {
  fetchMoveApiData,
  getCachedMoveApiData,
  getMoveApiName,
  type MoveApiData,
} from "./lib/pokeApiMoves";
import {
  getTypeEffectiveness,
  isPokemonType,
  type PokemonType,
} from "./lib/typeMatchups";

type Screen = "register" | "battle";
type BottomView = "home" | "saved" | "guide";

const HEADER_STADIUM_BG_URL = `${import.meta.env.BASE_URL}header-stadium-bg.png`;
const HEADER_TITLE_URL = `${import.meta.env.BASE_URL}header-title-battle.png`;
const BATTLE_VS_BADGE_URL = `${import.meta.env.BASE_URL}battle-vs-badge.png`;

// モバイルSafari向けの通常Webサイト（PWA/ネイティブ前提ではない）

interface MyPokemon {
  id: string;
  name: string;
  evH: number;
  evA: number;
  evB: number;
  evC: number;
  evD: number;
  evS: number;
  move1: string;
  move2: string;
  move3: string;
  move4: string;
  nature: string;
  item: string;
  ability: string;
  teraType: string;
  roleTags: string[];
  pickPriority: "高" | "中" | "低" | "";
  memo: string;
}

const TERA_TYPES = [
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
] as const;

// ── Allowed Pokémon (カタカナ) ───────────────────────────────────────────────
const ALLOWED_POKEMON: string[] = [
  "ガブリアス",
  "アシレーヌ",
  "リザードン",
  "ブリジュラス",
  "アーマーガア",
  "カバルドン",
  "ゲンガー",
  "カイリュー",
  "ギルガルド",
  "ハッサム",
  "マスカーニャ",
  "イダイトウ（オス）",
  "ドドゲザン",
  "ミミッキュ",
  "ミミロップ",
  "キラフロル",
  "サザンドラ",
  "ウォッシュロトム",
  "ブラッキー",
  "ルカリオ",
  "ギャラドス",
  "マフォクシー",
  "ガルーラ",
  "メガニウム",
  "フラエッテ：永遠",
  "ゲッコウガ",
  "ウルガモス",
  "フシギバナ",
  "オオニューラ",
  "ピクシー",
  "スターミー",
  "バンギラス",
  "ヒートロトム",
  "ニンフィア",
  "ラウドボーン",
  "ドラパルト",
  "ドヒドイデ",
  "クエスパトラ",
  "ハラバリー",
  "ペリッパー",
  "マリルリ",
  "マンムー",
  "ホルード",
  "ソウブレイズ",
  "カビゴン",
  "エンペルト",
  "カメックス",
  "ドリュウズ",
  "スコヴィラン",
  "エアームド",
  "ユキメノコ",
  "ウツボット",
  "サーナイト",
  "キュウコン（アローラ）",
  "ヌメルゴン（ヒスイ）",
  "エルフーン",
  "オニシズクモ",
  "バサギリ",
  "エルレイド",
  "ゾロアーク（ヒスイ）",
  "ガオガエン",
  "ジュペッタ",
  "ブリムオン",
  "ミロカロス",
  "ヤドキング（ガラル）",
  "ジャローダ",
  "ダイケンキ（ヒスイ）",
  "ヘラクロス",
  "ローブシン",
  "デカヌチャン",
  "グレンアルマ",
  "シャンデラ",
  "ウインディ（ヒスイ）",
  "メタモン",
  "プテラ",
  "ブリガロン",
  "ウインディ",
  "ミミズズ",
  "ボスゴドラ",
  "ヤドラン",
  "ヤバソチャ",
  "イルカマン",
  "エーフィ",
  "ヤミラミ",
  "エレザード",
  "サメハダー",
  "オーダイル",
  "ウェーニバル",
  "ドデカバシ",
  "スピアー",
  "ルチャブル",
  "ポットデス",
  "ケケンカニ",
  "マニューラ",
  "シャワーズ",
  "イダイトウ（メス）",
  "イッカネズミ",
  "フーディン",
  "ゴウカザル",
  "チリーン",
  "カイロス",
  "バクフーン（ヒスイ）",
  "ファイアロー",
  "キョジオーン",
  "ビビヨン",
  "ヤドラン（ガラル）",
  "ユキノオー",
  "バンバドロ",
  "ルガルガン（たそがれ）",
  "ライボルト",
  "エンブオー",
  "チルタリス",
  "ピジョット",
  "グライオン",
  "サンダース",
  "カットロトム",
  "エンニュート",
  "ケンタロス：炎",
  "ジュナイパー（ヒスイ）",
  "カイリキー",
  "デンリュウ",
  "ドダイトス",
  "デスバーン",
  "グレイシア",
  "ジャラランガ",
  "コータス",
  "ワルビアル",
  "バイバニラ",
  "フォレトス",
  "チャーレム",
  "アマージョ",
  "ハガネール",
  "ニョロトノ",
  "デスカーン",
  "ヌメルゴン",
  "ジジーロン",
  "オンバーン",
  "ペロリーム",
  "アリアドス",
  "アブソル",
  "オニゴーリ",
  "ヤドキング",
  "リキキリン",
  "ブロスター",
  "ゾロアーク",
  "ドサイドン",
  "クレベース",
  "クレベース（ヒスイ）",
  "カミツオロチ",
  "ミカルゲ",
  "クレッフィ",
  "ピカチュウ",
  "ロズレイド",
  "モルペコ",
  "ヘルガー",
  "ゴルーグ",
  "サダイジャ",
  "マホイップ",
  "ランクルス",
  "ケンタロス：氷",
  "ニャオニクス（オス）",
  "フロストロトム",
  "キュウコン",
  "バクフーン",
  "アマルルガ",
  "ドクロッグ",
  "オーロット",
  "マッギョ",
  "ガチゴラス",
  "レントラー",
  "バクーダ",
  "ゴロンダ",
  "リーフィア",
  "トリデプス",
  "エモンガ",
  "ブースター",
  "ジュナイパー",
  "フラージェス",
  "ライチュウ",
  "ライチュウ（アローラ）",
  "ニャオニクス（メス）",
  "パンプジン（とくだい）",
  "ラムパルド",
  "アヤシシ",
  "ルガルガン（まひる）",
  "タブンネ",
  "デデンネ",
  "タルップル",
  "スピンロトム",
  "アーボック",
  "バリコオル",
  "マッギョ（ガラル）",
  "ツンベアー",
  "トリミアン",
  "レパルダス",
  "ダストダス",
  "アップリュー",
  "ルガルガン（まよなか）",
  "ダイケンキ",
  "ケンタロス",
  "ヤレユータン",
  "ヒヤッキー",
  "パンプジン（ふつう）",
  "ナゲツケサル",
  "バオッキー",
  "ミルホッグ",
  "フレフワン",
  "ヤナッキー",
  "パンプジン（ちいさい）",
  "ロトム",
  "パンプジン（おおきい）",
  "ケンタロス：格",
  "ポワルン",
];
const ROLE_TAGS = [
  "物理アタッカー",
  "特殊アタッカー",
  "耐久",
  "サポート",
  "先発向き",
  "詰め要員",
  "クッション",
];

// ひらがな → カタカナ 変換
function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60),
  );
}

// 正規化して比較（ひらがな・カタカナ両対応）
function normalize(str: string): string {
  return toKatakana(str)
    .trim()
    .toLowerCase()
    .replace(/[\s　]/g, "")
    .replace(/[（）]/g, (ch) => (ch === "（" ? "(" : ")"))
    .replace(/[：]/g, ":")
    .replace(/オス/g, "♂")
    .replace(/メス/g, "♀");
}

function getOptionSuggestions(
  input: string,
  options: readonly string[],
  emptyLimit = 20,
): string[] {
  const query = normalize(input);
  if (!query) return options.slice(0, emptyLimit);
  return options.filter((option) => normalize(option).includes(query));
}

function isAllowedMove(name: string): boolean {
  if (!name.trim()) return true;
  const n = normalize(name);
  return MOVES.some((m) => normalize(m) === n);
}

function getMoveSuggestions(input: string): string[] {
  if (!input.trim()) return [];
  return getOptionSuggestions(input, MOVES, 0);
}

interface MoveInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  testId: string;
}

function MoveInput({ value, onChange, placeholder, testId }: MoveInputProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestions = getMoveSuggestions(value).slice(0, 50);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => setActiveIndex(0), [value]);

  function pick(move: string) {
    onChange(move);
    setOpen(false);
  }

  const showError = value.trim() !== "" && !isAllowedMove(value);

  return (
    <div className="pokemon-input-wrap" ref={wrapRef}>
      <input
        className={`field-input${showError ? " field-input-error" : ""}`}
        placeholder={placeholder}
        value={value}
        data-testid={testId}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            pick(suggestions[activeIndex]);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && suggestions.length > 0 && (
        <div className="suggestions-list" role="listbox">
          {suggestions.map((m, idx) => (
            <div
              key={m}
              className={`suggestion-item${idx === activeIndex ? " suggestion-item--active" : ""}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={() => pick(m)}
            >
              {m}
            </div>
          ))}
        </div>
      )}
      {showError && (
        <div className="field-error-msg">
          この技は使用可能技リストにありません
        </div>
      )}
    </div>
  );
}

function getAbilitySuggestions(input: string): string[] {
  return getOptionSuggestions(input, ABILITY_LIST, 20).slice(0, 50);
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  placeholder?: string;
  testId?: string;
  emptyLimit?: number;
  children?: React.ReactNode;
}

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "未設定",
  testId,
  emptyLimit = 20,
  children,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestions = getOptionSuggestions(value, options, emptyLimit).slice(
    0,
    50,
  );
  const listId = `${testId ?? label}-suggestions`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => setActiveIndex(0), [value, options]);

  function pick(option: string) {
    onChange(option);
    setOpen(false);
  }

  return (
    <div className="field searchable-select-field">
      <label className="field-label">{label}</label>
      <div className="searchable-select-wrap" ref={wrapRef}>
        <input
          className="field-input searchable-select-input"
          placeholder={placeholder}
          value={value}
          data-testid={testId}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              pick(suggestions[activeIndex]);
            }
            if (e.key === "Escape") setOpen(false);
          }}
        />
        {open && (
          <div
            className="suggestions-list searchable-select-list"
            id={listId}
            role="listbox"
          >
            {suggestions.length > 0 ? (
              suggestions.map((option, idx) => (
                <button
                  key={option}
                  type="button"
                  className={`suggestion-item searchable-select-option${idx === activeIndex ? " suggestion-item--active" : ""}`}
                  role="option"
                  aria-selected={option === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(option);
                  }}
                  onClick={() => pick(option)}
                  data-testid={`suggestion-${testId ?? label}-${option}`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="suggestion-item searchable-select-empty">
                候補がありません
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

interface AbilityInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  testId?: string;
}

function AbilityInput({
  value,
  onChange,
  placeholder = "例: さめはだ",
  testId,
}: AbilityInputProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestions = getAbilitySuggestions(value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => setActiveIndex(0), [value]);

  function pick(ability: string) {
    onChange(ability);
    setOpen(false);
  }

  return (
    <div className="pokemon-input-wrap" ref={wrapRef}>
      <input
        className="field-input"
        placeholder={placeholder}
        value={value}
        data-testid={testId}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            pick(suggestions[activeIndex]);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && suggestions.length > 0 && (
        <div className="suggestions-list" role="listbox">
          {suggestions.map((ability, idx) => (
            <div
              key={ability}
              className={`suggestion-item${idx === activeIndex ? " suggestion-item--active" : ""}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={() => pick(ability)}
              data-testid={`suggestion-ability-${ability}`}
            >
              {ability}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function isAllowed(name: string): boolean {
  if (!name.trim()) return false;
  const n = normalize(name);
  return ALLOWED_POKEMON.some((p) => normalize(p) === n);
}

function getSuggestions(input: string): string[] {
  if (!input.trim()) return [];
  const n = normalize(input);
  return ALLOWED_POKEMON.filter((p) => normalize(p).includes(n));
}

// ── PokemonInput ─────────────────────────────────────────────────────────────
interface PokemonInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  testId?: string;
  style?: React.CSSProperties;
}

function PokemonInput({
  value,
  onChange,
  placeholder = "例: ガブリアス",
  testId,
  style,
}: PokemonInputProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestions = getSuggestions(value);
  const isEmpty = !value.trim();
  const valid = isAllowed(value);
  const showError = !isEmpty && !valid;
  const showOk = !isEmpty && valid;

  function pick(name: string) {
    onChange(name);
    setOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Highlight matching part of suggestion
  function highlight(name: string) {
    const n = normalize(name);
    const q = normalize(value);
    const idx = n.indexOf(q);
    if (idx === -1 || !q) return <span>{name}</span>;
    return (
      <span>
        {name.slice(0, idx)}
        <span className="suggestion-highlight">
          {name.slice(idx, idx + q.length)}
        </span>
        {name.slice(idx + q.length)}
      </span>
    );
  }

  return (
    <div className="pokemon-input-wrap" ref={wrapRef}>
      <input
        className={`field-input${showError ? " field-input-error" : ""}`}
        style={{ marginBottom: 0, ...style }}
        placeholder={placeholder}
        value={value}
        data-testid={testId}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (value.trim()) setOpen(true);
        }}
      />
      {open && suggestions.length > 0 && (
        <div className="suggestions-list" role="listbox">
          {suggestions.map((s) => (
            <div
              key={s}
              className="suggestion-item"
              role="option"
              onMouseDown={() => pick(s)}
              data-testid={`suggestion-${s}`}
            >
              {highlight(s)}
            </div>
          ))}
        </div>
      )}
      {showError && (
        <div className="field-error-msg" data-testid="error-invalid-pokemon">
          このポケモンは使えません
        </div>
      )}
      {showOk && (
        <div className="field-ok-msg" data-testid="msg-valid-pokemon">
          使えます
        </div>
      )}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
// ── Item List ──────────────────────────────────────────────────────────
const ITEMS: string[] = [
  // ── 道具 ──────────────────────────────────────────────────────────────────
  "おうじゃのしるし",
  "かいがらのすず",
  "かたいいし",
  "きあいのタスキ",
  "きあいのハチマキ",
  "きせきのタネ",
  "ぎんのこな",
  "くろいメガネ",
  "くろおび",
  "こだわりスカーフ",
  "じしゃく",
  "シルクのスカーフ",
  "しろいハーブ",
  "しんぴのしずく",
  "せんせいのツメ",
  "するどいくちばし",
  "たべのこし",
  "でんきだま",
  "どくバリ",
  "とけないこおり",
  "のろいのおふだ",
  "ひかりのこな",
  "ピントレンズ",
  "まがったスプーン",
  "メタルコート",
  "メンタルハーブ",
  "もくたん",
  "やわらかいすな",
  "ようせいのハネ",
  "りゅうのキバ",
  // ── きのみ ────────────────────────────────────────────────────────────────
  "イトケのみ",
  "ウタンのみ",
  "オッカのみ",
  "オレンのみ",
  "オボンのみ",
  "カゴのみ",
  "カシブのみ",
  "キーのみ",
  "クラボのみ",
  "シュカのみ",
  "ソクノのみ",
  "タンガのみ",
  "チーゴのみ",
  "ナナシのみ",
  "ナモのみ",
  "ハバンのみ",
  "バコウのみ",
  "ビアーのみ",
  "ヒメリのみ",
  "ホズのみ",
  "モモンのみ",
  "ヤチェのみ",
  "ヨプのみ",
  "ヨロギのみ",
  "ラムのみ",
  "リリバのみ",
  "リンドのみ",
  "ロゼルのみ",
  // ── メガストーン ──────────────────────────────────────────────────────────
  "アブソルナイト",
  "ウツボットナイト",
  "エアームドナイト",
  "エルレイドナイト",
  "エンブオナイト",
  "オーダイルナイト",
  "オニゴーリナイト",
  "カイリュナイト",
  "カイロスナイト",
  "カエンジシナイト",
  "ガブリアスナイト",
  "カメックスナイト",
  "ガメノデスナイト",
  "カラマネナイト",
  "ガルーラナイト",
  "ギャラドスナイト",
  "クチートナイト",
  "ゲッコウガナイト",
  "ゲンガナイト",
  "サーナイトナイト",
  "サメハダナイト",
  "ジガルデナイト",
  "ジジーロナイト",
  "シビルドナイト",
  "シャンデラナイト",
  "ジュペッタナイト",
  "スターミナイト",
  "スピアナイト",
  "ズルズキナイト",
  "タイレーツナイト",
  "タブンネナイト",
  "チャーレムナイト",
  "チルタリスナイト",
  "ディアンシナイト",
  "デンリュウナイト",
  "ドラミドナイト",
  "ドリュウズナイト",
  "ハガネールナイト",
  "バクーダナイト",
  "ハッサムナイト",
  "バンギラスナイト",
  "ピクシナイト",
  "ピジョットナイト",
  "フーディナイト",
  "フシギバナイト",
  "プテラナイト",
  "ブリガロナイト",
  "ヘラクロスナイト",
  "ヘルガナイト",
  "ペンドラナイト",
  "ボーマンダナイト",
  "ボスゴドラナイト",
  "マフォクシナイト",
  "ミミロップナイト",
  "メガニウムナイト",
  "メタグロスナイト",
  "ヤドランナイト",
  "ヤミラミナイト",
  "ユキノオナイト",
  "ユキメノコナイト",
  "ライボルトナイト",
  "リザードナイトX",
  "リザードナイトY",
  "ルカリオナイト",
  "ルチャブルナイト",
];

// ── ItemPicker ────────────────────────────────────────────────────────────────
interface ItemPickerProps {
  value: string;
  onChange: (val: string) => void;
}

function ItemPicker({ value, onChange }: ItemPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? ITEMS.filter((it) => toKatakana(it).includes(toKatakana(query.trim())))
    : ITEMS;

  function select(item: string) {
    onChange(item);
    setOpen(false);
    setQuery("");
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  function closeModal() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`item-picker-trigger${!value ? " item-picker-trigger--empty" : ""}`}
        onClick={() => setOpen(true)}
        data-testid="item-picker-trigger"
      >
        <span className="item-picker-value">
          {value || "持ち物を選択（タップして選ぶ）"}
        </span>
        {value ? (
          <span
            className="item-picker-clear-btn"
            onClick={clearValue}
            role="button"
            aria-label="クリア"
          >
            ✕
          </span>
        ) : (
          <span className="item-picker-arrow">›</span>
        )}
      </button>

      {open && (
        <div className="item-picker-backdrop" onClick={closeModal}>
          <div
            className="item-picker-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="item-picker-handle" />
            <div className="item-picker-header">
              <span className="item-picker-title">持ち物を選ぶ</span>
              <button
                className="item-picker-close"
                onClick={closeModal}
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>
            <div className="item-picker-search-wrap">
              <span className="item-picker-search-icon">🔍</span>
              <input
                ref={searchRef}
                className="item-picker-search"
                placeholder="検索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button
                  className="item-picker-search-clear"
                  onClick={() => setQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="item-picker-list" role="listbox">
              {filtered.length === 0 ? (
                <div className="item-picker-empty">
                  「{query}」は見つかりません
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item}
                    className={`item-picker-option${item === value ? " item-picker-option--selected" : ""}`}
                    role="option"
                    aria-selected={item === value}
                    onClick={() => select(item)}
                    data-testid={`item-option-${item}`}
                  >
                    <span>{item}</span>
                    {item === value && (
                      <span className="item-picker-check">✓</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const NATURES = [
  "がんばりや",
  "さみしがり",
  "ゆうかん",
  "いじっぱり",
  "やんちゃ",
  "ずぶとい",
  "てれや",
  "のんき",
  "わんぱく",
  "のうてんき",
  "おくびょう",
  "せっかち",
  "まじめ",
  "ようき",
  "むじゃき",
  "ひかえめ",
  "おっとり",
  "れいせい",
  "おだやか",
  "うっかりや",
  "おとなしい",
  "なまいき",
  "しんちょう",
  "きまぐれ",
  "なんでもすき",
];

// ── Scoring System ────────────────────────────────────────────────────────────
interface PokemonTags {
  fast?: boolean; // 素早さが高い → +2
  attacker?: boolean; // 攻撃力が高い → +2
  lead?: boolean; // 先発向き     → +3
  defensive?: boolean; // 受け性能が高い → +1
  meta?: boolean; // メタ上位・伝説 → +3
}

const POKEMON_SCORE_TABLE: Record<string, PokemonTags> = {
  // ─── 最強メタ ─────────────────────────────────────────────────────────────
  ガブリアス: { fast: true, attacker: true, lead: true, meta: true },
  メガガブリアス: { fast: true, attacker: true, meta: true },
  カイリュー: { attacker: true, meta: true },
  メガカイリュー: { attacker: true, meta: true },
  ミミッキュ: { lead: true, meta: true },
  ドラパルト: { fast: true, attacker: true, lead: true, meta: true },
  ガオガエン: { attacker: true, lead: true, meta: true },
  ウルガモス: { fast: true, attacker: true, meta: true },
  バンギラス: { attacker: true, defensive: true, meta: true },
  メガバンギラス: { attacker: true, defensive: true, meta: true },
  ゲッコウガ: { fast: true, attacker: true, meta: true },
  メガゲッコウガ: { fast: true, attacker: true, meta: true },
  サザンドラ: { fast: true, attacker: true, meta: true },
  メタグロス: { attacker: true, meta: true },
  メガメタグロス: { attacker: true, lead: true, meta: true },
  ギルガルド: { defensive: true, meta: true },
  ジャラランガ: { fast: true, attacker: true, meta: true },
  ドリュウズ: { fast: true, attacker: true, meta: true },
  メガドリュウズ: { fast: true, attacker: true, meta: true },
  マニューラ: { fast: true, attacker: true, meta: true },
  ガチグマ: { attacker: true, meta: true },
  ブリジュラス: { attacker: true, defensive: true, meta: true },
  カミツオロチ: { defensive: true, meta: true },
  マスカーニャ: { fast: true, attacker: true, meta: true },
  ウェーニバル: { attacker: true, meta: true },
  グレンアルマ: { fast: true, attacker: true, meta: true },
  メガゲンガー: { fast: true, attacker: true, meta: true },
  メガルカリオ: { fast: true, attacker: true, meta: true },
  メガルカリオZ: { fast: true, attacker: true, meta: true },
  メガヘラクロス: { attacker: true, meta: true },
  ドドゲザン: { attacker: true, meta: true },
  オオニューラ: { fast: true, attacker: true, meta: true },
  "イダイトウ♂": { attacker: true, meta: true },
  "イダイトウ♀": { fast: true, attacker: true, meta: true },
  ジュナイパー: { fast: true, attacker: true, meta: true },
  "ジュナイパー(ヒスイ)": { attacker: true, meta: true },
  ルカリオ: { fast: true, attacker: true },
  ゲンガー: { fast: true, attacker: true },
  ヘラクロス: { attacker: true },
  バサギリ: { fast: true, attacker: true },
  ゾロアーク: { fast: true, attacker: true },
  "ゾロアーク(ヒスイ)": { fast: true, attacker: true },
  // ─── 先発向き ──────────────────────────────────────────────────────────────
  カバルドン: { lead: true, defensive: true },
  エルフーン: { lead: true, fast: true },
  コータス: { lead: true, defensive: true },
  アーマーガア: { lead: true, defensive: true },
  ミカルゲ: { lead: true },
  クレッフィ: { lead: true },
  ペリッパー: { lead: true },
  ユキノオー: { lead: true },
  メガユキノオー: { lead: true, attacker: true },
  // ─── 受け・耐久 ────────────────────────────────────────────────────────────
  ドヒドイデ: { defensive: true },
  エアームド: { defensive: true },
  メガエアームド: { defensive: true },
  ヤドラン: { defensive: true },
  メガヤドラン: { defensive: true },
  "ヤドラン(ガラル)": { defensive: true },
  ブリムオン: { defensive: true },
  キョジオーン: { defensive: true },
  ヘイラッシャ: { defensive: true },
  バンバドロ: { defensive: true },
  ヌメルゴン: { defensive: true },
  ハガネール: { defensive: true },
  メガハガネール: { defensive: true },
  グライオン: { fast: true, defensive: true },
  カイロス: { defensive: true },
  マリルリ: { defensive: true },
  ニョロトノ: { defensive: true },
  ブラッキー: { defensive: true },
  エーフィ: { fast: true },
  ポットデス: { defensive: true },
  オーロット: { defensive: true },
  リキキリン: { defensive: true },
  ヤドキング: { defensive: true },
  // ─── 高速アタッカー ───────────────────────────────────────────────────────
  ファイアロー: { fast: true, attacker: true },
  ウインディ: { fast: true, attacker: true },
  "ウインディ(ヒスイ)": { fast: true, attacker: true },
  サンダース: { fast: true },
  リーフィア: { fast: true },
  スターミー: { fast: true },
  メガスターミー: { fast: true, attacker: true },
  カットロトム: { fast: true, attacker: true },
  スピンロトム: { fast: true, attacker: true },
  // ─── 物理アタッカー ───────────────────────────────────────────────────────
  カイリキー: { attacker: true },
  ローブシン: { attacker: true },
  ドサイドン: { attacker: true },
  マンムー: { attacker: true, fast: true },
  ガブリアスZ: { attacker: true, fast: true, meta: true },
  カビゴン: { attacker: true, defensive: true },
  ケンタロス: { attacker: true, fast: true },
  ギャラドス: { attacker: true },
  メガギャラドス: { attacker: true, meta: true },
  ヘルガー: { fast: true, attacker: true },
  メガヘルガー: { fast: true, attacker: true },
};

function scorePokemon(name: string): { score: number; tags: PokemonTags } {
  const norm = normalize(name);
  const key = Object.keys(POKEMON_SCORE_TABLE).find(
    (k) => normalize(k) === norm,
  );
  const tags: PokemonTags = key ? POKEMON_SCORE_TABLE[key] : {};
  let score = 1;
  if (tags.meta) score += 3;
  if (tags.lead) score += 3;
  if (tags.fast) score += 2;
  if (tags.attacker) score += 2;
  if (tags.defensive) score += 1;
  return { score, tags };
}

function buildReason(tags: PokemonTags): string {
  const parts: string[] = [];
  if (tags.meta) parts.push("メタ上位ポケモン");
  if (tags.lead) parts.push("先発で使われやすい");
  if (tags.fast && tags.attacker) parts.push("高速アタッカー");
  else if (tags.fast) parts.push("素早さが高い");
  else if (tags.attacker) parts.push("火力が高い");
  if (tags.defensive) parts.push("耐久性能が高い");
  return parts.length > 0 ? parts.join("・") : "汎用性が高い";
}

type OppPrediction = {
  name: string;
  score: number;
  reason: string;
  role: string;
  caution: string;
  predictedBuildType: string;
  itemCandidates: MetaUsageEntry[];
  teraCandidates: MetaUsageEntry[];
  metaEntry: MetaPokemonEntry | null;
  scoreBreakdown: ScoreBreakdown[];
  dataOriginLabel: string;
};

type PokemonMeta = { roles: string[]; note: string; caution: string };

const DEFAULT_POKEMON_META: PokemonMeta = {
  roles: ["汎用"],
  note: "相手パーティの一員として選出される可能性があります",
  caution: "型が読みにくいため、技範囲に注意",
};

const HIGH_PICK_PRESSURE_POKEMON = new Set(
  [
    "ガブリアス",
    "アシレーヌ",
    "リザードン",
    "ブリジュラス",
    "アーマーガア",
    "カバルドン",
    "ゲンガー",
    "カイリュー",
    "ギルガルド",
    "ハッサム",
    "マスカーニャ",
    "ドドゲザン",
    "ミミッキュ",
    "サザンドラ",
    "ウォッシュロトム",
    "ブラッキー",
    "ルカリオ",
    "ギャラドス",
    "ゲッコウガ",
    "ウルガモス",
    "バンギラス",
    "ドラパルト",
    "ドヒドイデ",
    "ペリッパー",
    "マリルリ",
    "カビゴン",
    "サーナイト",
    "ガオガエン",
    "ミロカロス",
    "ジャローダ",
    "シャンデラ",
    "メタモン",
    "イルカマン",
    "フーディン",
    "ゴウカザル",
    "ファイアロー",
    "キョジオーン",
    "グライオン",
    "ジュナイパー（ヒスイ）",
    "ジャラランガ",
    "コータス",
    "ワルビアル",
    "ニョロトノ",
    "ゾロアーク",
    "ミカルゲ",
    "クレッフィ",
    "ピカチュウ",
    "ロトム",
  ].map(normalize),
);

const POKEMON_META: Record<string, PokemonMeta> = {
  ガブリアス: {
    roles: ["物理アタッカー", "高速アタッカー", "対面性能"],
    note: "高速物理アタッカーとして選出されやすく、広い相手に対応しやすい",
    caution: "じめん・ドラゴン打点に注意",
  },
  アーマーガア: {
    roles: ["受け", "物理受け", "サイクル"],
    note: "物理方面の受け役として選出されやすい",
    caution: "長期戦や詰ませ性能に注意",
  },
  ゲンガー: {
    roles: ["特殊アタッカー", "高速アタッカー", "対面性能"],
    note: "高速特殊アタッカーとして崩し性能が高い",
    caution: "状態異常や高火力特殊技に注意",
  },
  カバルドン: {
    roles: ["受け", "起点作成", "天候要員"],
    note: "起点作成と天候展開で試合を作りやすい",
    caution: "ステルスロック展開に注意",
  },
  ペリッパー: {
    roles: ["起点作成", "天候要員", "サイクル"],
    note: "雨展開の始動役として選出されやすい",
    caution: "天候エースの同時選出に注意",
  },
  ニョロトノ: {
    roles: ["天候要員", "サイクル"],
    note: "雨展開の軸として選出されやすい",
    caution: "雨下での高火力技に注意",
  },
  ドラパルト: {
    roles: ["高速アタッカー", "物理アタッカー", "特殊アタッカー", "対面性能"],
    note: "高速高火力で初手から終盤まで通しやすい",
    caution: "型の判別が難しいため技範囲に注意",
  },
  ウルガモス: {
    roles: ["特殊アタッカー", "詰め性能", "積みアタッカー"],
    note: "積みからの全抜き性能が高く選出されやすい",
    caution: "ちょうのまい展開と終盤の全抜きに注意",
  },
  ギャラドス: {
    roles: ["物理アタッカー", "積みアタッカー", "対面性能"],
    note: "積み展開から詰めに移行しやすい",
    caution: "りゅうのまい後の制圧力に注意",
  },
};

function getPokemonMeta(name: string): PokemonMeta {
  const norm = normalize(name);
  const key = Object.keys(POKEMON_META).find((k) => normalize(k) === norm);
  return key ? POKEMON_META[key] : DEFAULT_POKEMON_META;
}

function clampMetaScore(value: number) {
  return Math.max(1, Math.min(5, value));
}

function formatMetaUsage(entry: MetaUsageEntry) {
  if (typeof entry.rate === "number" && Number.isFinite(entry.rate)) {
    return `${entry.name} ${Math.round(entry.rate)}%`;
  }
  if (typeof entry.count === "number" && Number.isFinite(entry.count)) {
    return `${entry.name} ${entry.count}件`;
  }
  return entry.name;
}

function formatMetaUsageList(entries: MetaUsageEntry[], emptyLabel: string) {
  const labels = entries.slice(0, 3).map(formatMetaUsage);
  return labels.length > 0 ? labels.join("、") : emptyLabel;
}

function inferOpponentBuildType(items: MetaUsageEntry[], role: string) {
  const topItem = items[0]?.name?.trim();
  if (!topItem) return "型候補なし";

  const itemBuildNames: Record<string, string> = {
    きあいのタスキ: "きあいのタスキ型",
    こだわりスカーフ: "こだわりスカーフ型",
    こだわりハチマキ: "こだわりハチマキ型",
    こだわりメガネ: "こだわりメガネ型",
    いのちのたま: "いのちのたま型",
    とつげきチョッキ: "とつげきチョッキ型",
    たべのこし: "たべのこし耐久型",
    ゴツゴツメット: "ゴツゴツメット耐久型",
    オボンのみ: "オボンのみ型",
    じゃくてんほけん: "じゃくてんほけん型",
  };

  if (itemBuildNames[topItem]) return itemBuildNames[topItem];
  if (topItem.endsWith("ナイト")) return "メガストーン型";
  if (topItem.endsWith("Z") || topItem.endsWith("Ｚ")) return "Zワザ型";
  if (hasAnyText(role, ["受け", "耐久"])) return "耐久型";
  if (hasAnyText(role, ["起点作成", "サポート"])) return "サポート型";
  return "アタッカー型";
}

function buildMetaReason(
  parts: ScoreBreakdown[],
  partnerMatches: MetaUsageEntry[],
  hasMatchingPattern: boolean,
) {
  const reasons: string[] = [];
  if (parts.some((part) => part.label === "採用傾向")) {
    reasons.push("補助データ上で採用傾向があります");
  }
  if (partnerMatches.length > 0) {
    reasons.push(
      `${partnerMatches
        .slice(0, 2)
        .map((partner) => partner.name)
        .join("・")}と同時採用されやすいです`,
    );
  }
  if (hasMatchingPattern) reasons.push("公開パターンに近い並びがあります");
  return reasons.length > 0
    ? `${reasons.join("。")}。`
    : "公開データ上では未確認です。役割・種族値・技傾向から推定します。";
}

function buildMetaScoreParts(
  name: string,
  slots: string[],
  metaData: MetaData | null,
): {
  metaEntry: MetaPokemonEntry | null;
  scoreParts: ScoreBreakdown[];
  itemCandidates: MetaUsageEntry[];
  teraCandidates: MetaUsageEntry[];
  reason: string;
} {
  const metaEntry = findMetaPokemon(metaData, name);
  const opponentNames = slots
    .map((slot) => normalize(slot.trim()))
    .filter(Boolean);
  const targetName = normalize(name);
  const maxUsage = Math.max(
    1,
    ...slots.map((slot) => findMetaPokemon(metaData, slot)?.usageCount ?? 0),
  );
  const scoreParts: ScoreBreakdown[] = [];

  if (metaEntry?.usageCount) {
    scoreParts.push({
      label: "採用傾向",
      points: clampMetaScore(Math.ceil((metaEntry.usageCount / maxUsage) * 5)),
    });
  }

  const partnerMatches =
    metaEntry?.partners?.filter((partner) => {
      const partnerName = normalize(partner.name);
      return partnerName !== targetName && opponentNames.includes(partnerName);
    }) ?? [];
  if (partnerMatches.length > 0) {
    const partnerRate = partnerMatches.reduce(
      (sum, partner) => sum + (partner.rate || 0),
      0,
    );
    scoreParts.push({
      label: "同時採用",
      points: clampMetaScore(
        Math.ceil(partnerRate / 20) + Math.min(2, partnerMatches.length - 1),
      ),
    });
  }

  const matchingPattern = (metaData?.teamPatterns ?? [])
    .map((pattern) => ({
      pattern,
      overlap: pattern.members.filter((member) =>
        opponentNames.includes(normalize(member)),
      ).length,
      includesTarget: pattern.members.some(
        (member) => normalize(member) === targetName,
      ),
    }))
    .filter((entry) => entry.includesTarget && entry.overlap >= 3)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        (a.pattern.rank || 999999) - (b.pattern.rank || 999999),
    )[0];
  if (matchingPattern) {
    const rankBonus =
      matchingPattern.pattern.rank > 0 && matchingPattern.pattern.rank <= 200
        ? 1
        : 0;
    scoreParts.push({
      label: "並び傾向",
      points: clampMetaScore(matchingPattern.overlap - 1 + rankBonus),
    });
  }

  const itemCandidates = metaEntry?.items?.slice(0, 3) ?? [];
  const teraCandidates = metaEntry?.teraTypes?.slice(0, 3) ?? [];
  if (itemCandidates.length > 0) {
    scoreParts.push({ label: "持ち物傾向", points: 1 });
  }
  if (teraCandidates.length > 0) {
    scoreParts.push({ label: "テラ傾向", points: 1 });
  }

  return {
    metaEntry,
    scoreParts,
    itemCandidates,
    teraCandidates,
    reason: buildMetaReason(
      scoreParts,
      partnerMatches,
      Boolean(matchingPattern),
    ),
  };
}

function predictOpponent(
  slots: string[],
  metaData: MetaData | null,
): OppPrediction[] {
  const uniqueValid = slots
    .map((s) => s.trim())
    .filter((s) => s && isAllowed(s))
    .reduce<string[]>((acc, name) => {
      if (!acc.some((existing) => normalize(existing) === normalize(name)))
        acc.push(name);
      return acc;
    }, []);
  if (uniqueValid.length === 0) return [];

  const metas = uniqueValid.map((name) => ({
    name,
    meta: getPokemonMeta(name),
  }));
  const hasPhysical = metas.some((p) =>
    p.meta.roles.includes("物理アタッカー"),
  );
  const hasSpecial = metas.some((p) => p.meta.roles.includes("特殊アタッカー"));
  const hasDefensive = metas.some((p) => p.meta.roles.includes("受け"));
  const hasSetter = metas.some((p) => p.meta.roles.includes("起点作成"));
  const hasWeather = metas.some((p) => p.meta.roles.includes("天候要員"));
  const hasWeatherAbuser = metas.some((p) =>
    p.meta.roles.some((r) =>
      ["高速アタッカー", "特殊アタッカー", "物理アタッカー"].includes(r),
    ),
  );

  const scored = metas.map(({ name, meta }) => {
    let score = 50;
    const scoreBreakdown: ScoreBreakdown[] = [];
    const addScore = (label: string, points: number) => {
      score += points;
      scoreBreakdown.push({ label, points });
    };

    if (meta.roles.includes("高速アタッカー")) addScore("高速", 20);
    if (meta.roles.includes("物理アタッカー")) addScore("物理火力", 15);
    if (meta.roles.includes("特殊アタッカー")) addScore("特殊火力", 15);
    if (meta.roles.includes("受け")) addScore("耐久", 15);
    if (meta.roles.includes("起点作成")) addScore("先発補助", 10);
    if (meta.roles.includes("詰め性能")) addScore("詰め", 15);
    if (meta.roles.includes("対面性能")) addScore("対面", 15);
    if (HIGH_PICK_PRESSURE_POKEMON.has(normalize(name)))
      addScore("基本傾向", 15);

    if (
      hasPhysical &&
      hasSpecial &&
      (meta.roles.includes("物理アタッカー") ||
        meta.roles.includes("特殊アタッカー"))
    )
      addScore("攻撃バランス", 5);
    if (
      hasDefensive &&
      (meta.roles.includes("物理アタッカー") ||
        meta.roles.includes("特殊アタッカー") ||
        meta.roles.includes("高速アタッカー"))
    )
      addScore("サイクル補完", 5);
    if (hasSetter && meta.roles.includes("積みアタッカー"))
      addScore("展開相性", 10);
    if (
      hasWeather &&
      hasWeatherAbuser &&
      (meta.roles.includes("天候要員") ||
        meta.roles.includes("高速アタッカー") ||
        meta.roles.includes("特殊アタッカー") ||
        meta.roles.includes("物理アタッカー"))
    )
      addScore("天候相性", 10);

    const metaScore = buildMetaScoreParts(name, uniqueValid, metaData);
    score += metaScore.scoreParts.reduce((sum, part) => sum + part.points, 0);
    scoreBreakdown.push(...metaScore.scoreParts);
    const role = meta.roles.join(" / ");

    return {
      name,
      score,
      reason: metaScore.metaEntry ? metaScore.reason : meta.note,
      role,
      caution: meta.caution,
      predictedBuildType: inferOpponentBuildType(
        metaScore.itemCandidates,
        role,
      ),
      itemCandidates: metaScore.itemCandidates,
      teraCandidates: metaScore.teraCandidates,
      metaEntry: metaScore.metaEntry,
      scoreBreakdown,
      dataOriginLabel: getMetaDataOriginLabel(metaData, metaScore.metaEntry),
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(3, scored.length));
}

// ── My Team Recommendation ────────────────────────────────────────────────────
type ScoreBreakdown = { label: string; points: number };
type MyRecommendation = {
  pokemon: MyPokemon;
  score: number;
  reason: string;
  advantagedOpponents: string[];
  strengths: string[];
  caution: string;
  breakdown: ScoreBreakdown[];
  dataOriginLabel: string;
};

function hasAnyText(source: string, patterns: string[]): boolean {
  const text = source.toLowerCase();
  return patterns.some((pattern) => text.includes(pattern));
}

function hasPositiveBreakdown(
  breakdown: ScoreBreakdown[],
  patterns: string[],
): boolean {
  return breakdown.some(
    (part) =>
      part.points > 0 &&
      patterns.some((pattern) => part.label.includes(pattern)),
  );
}

function uniqueLimited(values: string[], limit: number): string[] {
  return Array.from(new Set(values.filter(Boolean))).slice(0, limit);
}

function findAdvantagedOpponents(
  player: MyPokemon,
  predictedOpponents: OppPrediction[],
  breakdown: ScoreBreakdown[],
  moveDetails = getPlayerMoveDetails(player),
): string[] {
  const advantaged = new Set<string>();

  predictedOpponents.slice(0, 3).forEach((opp, index) => {
    const hasDirectScore = breakdown.some(
      (part) => part.points > 0 && part.label.includes(opp.name),
    );
    const hasRoleScore = breakdown.some(
      (part) =>
        part.points > 0 &&
        part.label.includes(`予測${index + 1}位`) &&
        (part.label.includes("対応") || part.label.includes("受けやすい")),
    );
    if (hasDirectScore || hasRoleScore) advantaged.add(opp.name);
  });

  const typedOpponents = predictedOpponents
    .slice(0, 3)
    .map((opp) => ({ ...opp, types: getKnownPokemonTypes(opp.name) }))
    .filter((opp) => opp.types.length > 0);
  const typedMoves = moveDetails.filter(
    (
      move,
    ): move is {
      name: string;
      apiData: MoveApiData | null;
      type: PokemonType;
    } => move.type !== null,
  );

  typedOpponents.forEach((opp) => {
    const hasGoodHit = typedMoves.some(
      (move) => getTypeEffectiveness(move.type, opp.types) >= 2,
    );
    if (hasGoodHit) advantaged.add(opp.name);
  });

  return Array.from(advantaged).slice(0, 3);
}

function buildRecommendationStrengths(
  player: MyPokemon,
  breakdown: ScoreBreakdown[],
): string[] {
  const roleText = `${player.roleTags.join(" ")} ${player.memo}`;
  const strengths: string[] = [];

  if (hasPositiveBreakdown(breakdown, ["高速", "先制技"]) || player.evS >= 24)
    strengths.push("高速アタッカー");
  if (
    hasPositiveBreakdown(breakdown, ["物理火力", "物理役"]) ||
    player.evA >= 24
  )
    strengths.push("物理火力");
  if (
    hasPositiveBreakdown(breakdown, ["特殊火力", "特殊役"]) ||
    player.evC >= 24
  )
    strengths.push("特殊火力");
  if (
    hasPositiveBreakdown(breakdown, ["耐久", "受け"]) ||
    player.evH >= 24 ||
    player.evB >= 24 ||
    player.evD >= 24
  )
    strengths.push("物理耐久");
  if (
    hasPositiveBreakdown(breakdown, ["先発", "行動保証"]) ||
    hasAnyText(roleText, ["先発"])
  )
    strengths.push("先発向き");
  if (hasPositiveBreakdown(breakdown, ["対策", "対応", "相手予測1位"]))
    strengths.push("対面性能");
  if (
    hasPositiveBreakdown(breakdown, ["補助", "サポート"]) ||
    hasAnyText(roleText, ["サポート"])
  )
    strengths.push("サポート");
  if (
    hasPositiveBreakdown(breakdown, ["詰め"]) ||
    hasAnyText(roleText, ["詰め"])
  )
    strengths.push("詰め要員");
  if (hasPositiveBreakdown(breakdown, ["耐久", "継戦能力", "受けやすい"]))
    strengths.push("クッション");
  if (hasPositiveBreakdown(breakdown, ["抜群", "等倍以上", "打点"]))
    strengths.push("タイプ有利");
  if (player.pickPriority === "高") strengths.push("補助データあり");
  player.roleTags.forEach((tag) => strengths.push(tag));

  return uniqueLimited(strengths, 6);
}

function buildRecommendationReason(
  breakdown: ScoreBreakdown[],
  advantagedOpponents: string[],
): string {
  const reasons: string[] = [];

  if (hasPositiveBreakdown(breakdown, ["抜群", "等倍以上", "打点"]))
    reasons.push(
      "相手の予測上位に対してタイプ相性が良く、攻撃を通しやすいです。",
    );
  if (hasPositiveBreakdown(breakdown, ["高速", "先制技"]))
    reasons.push(
      "素早さや先制技で、相手より先に動きやすい点が評価されています。",
    );
  if (hasPositiveBreakdown(breakdown, ["火力", "攻撃役", "威力"]))
    reasons.push("攻撃性能が高く、相手に圧力をかけやすいです。");
  if (hasPositiveBreakdown(breakdown, ["耐久", "受けやすい", "継戦能力"]))
    reasons.push("耐久面が安定しており、相手の攻撃を受けやすいです。");
  if (hasPositiveBreakdown(breakdown, ["役", "適性", "補助", "詰め"]))
    reasons.push(
      "登録された役割タグから、この対戦で使いやすい型と判断されています。",
    );
  if (hasPositiveBreakdown(breakdown, ["補助データあり"]))
    reasons.push(
      "チャンピオンズ実装データに基づく補助情報と役割から評価しています。",
    );
  if (hasPositiveBreakdown(breakdown, ["優先度 高"]))
    reasons.push("登録情報で優先度が高く、選出候補として評価されています。");

  if (reasons.length === 0 && advantagedOpponents.length > 0)
    reasons.push(
      "相手の予測上位3匹に対して通りが良く、安定して戦いやすいです。",
    );
  if (reasons.length === 0)
    reasons.push("登録情報と相手予測をもとにおすすめしています。");

  return reasons.slice(0, 2).join("");
}

function buildRecommendationCaution(breakdown: ScoreBreakdown[]): string {
  const negative = breakdown
    .filter((part) => part.points < 0)
    .sort((a, b) => a.points - b.points)[0];

  if (
    negative?.label.includes("有効打不足") ||
    negative?.label.includes("タイプ有効打不足")
  )
    return "相手への有効打が少ない可能性があります。技の通りを確認してください。";
  if (negative?.label.includes("攻撃技がありません"))
    return "攻撃技が少ないため、相手を倒し切る手段に注意してください。";
  if (negative?.label.includes("物理攻撃技が少ない"))
    return "物理火力を伸ばしていますが、物理技が少ない点に注意してください。";
  if (negative?.label.includes("特殊攻撃技が少ない"))
    return "特殊火力を伸ばしていますが、特殊技が少ない点に注意してください。";
  if (negative?.label.includes("優先度 低"))
    return "登録上の選出優先度は低めです。ほかの候補との相性も見てください。";

  return "大きな注意点は少なめです。相手の先制技やスカーフ持ちには注意してください。";
}

function getAbilityDetailsForDisplay(
  data: PokemonApiData,
): PokemonApiAbility[] {
  if (data.abilityDetails?.length) return data.abilityDetails;
  return data.abilities.map((name) => ({
    name,
    apiName: name,
    isHidden: false,
  }));
}

function getKnownPokemonTypes(name: string): PokemonType[] {
  const data = getCachedPokemonApiData(name);
  return data?.types.filter(isPokemonType) ?? [];
}

function getPlayerMoveDetails(player: MyPokemon): Array<{
  name: string;
  apiData: MoveApiData | null;
  type: PokemonType | null;
}> {
  return [player.move1, player.move2, player.move3, player.move4]
    .map((move) => move.trim())
    .filter(Boolean)
    .map((name) => {
      const apiData = getCachedMoveApiData(name);
      return {
        name,
        apiData,
        type: apiData?.type ?? guessMoveType(name),
      };
    });
}

function isAttackingMove(apiData: MoveApiData): boolean {
  return apiData.damageClass !== "変化" && apiData.power !== null;
}

function formatMovePower(power: number | null): string {
  return power === null ? "威力なし" : `威力${power}`;
}

function scoreMoveDataBonuses(
  player: MyPokemon,
  predictedOpponents: OppPrediction[],
  moves: ReturnType<typeof getPlayerMoveDetails>,
): ScoreBreakdown[] {
  const breakdown: ScoreBreakdown[] = [];
  const apiMoves = moves.filter(
    (
      move,
    ): move is {
      name: string;
      apiData: MoveApiData;
      type: PokemonType | null;
    } => move.apiData !== null,
  );
  if (apiMoves.length === 0) return breakdown;

  apiMoves.forEach((move) => {
    const typeLabel = move.apiData.type ?? "タイプ不明";
    breakdown.push({
      label: `${move.name}：${typeLabel}${move.apiData.damageClass} ${formatMovePower(move.apiData.power)}`,
      points: 0,
    });
  });

  const physicalAttackCount = apiMoves.filter(
    (move) =>
      move.apiData.damageClass === "物理" && isAttackingMove(move.apiData),
  ).length;
  const specialAttackCount = apiMoves.filter(
    (move) =>
      move.apiData.damageClass === "特殊" && isAttackingMove(move.apiData),
  ).length;
  const attackingMoveCount = apiMoves.filter((move) =>
    isAttackingMove(move.apiData),
  ).length;

  const hasPriorityMove = apiMoves.some((move) => move.apiData.priority >= 1);
  if (hasPriorityMove) breakdown.push({ label: "先制技あり", points: 5 });

  if (player.evA >= 24 && physicalAttackCount > 0)
    breakdown.push({ label: "物理努力値と物理技が一致", points: 4 });
  if (player.evC >= 24 && specialAttackCount > 0)
    breakdown.push({ label: "特殊努力値と特殊技が一致", points: 4 });

  if (player.evA >= 24 && physicalAttackCount === 0)
    breakdown.push({ label: "物理攻撃技が少ない", points: -6 });
  if (player.evC >= 24 && specialAttackCount === 0)
    breakdown.push({ label: "特殊攻撃技が少ない", points: -6 });
  if (attackingMoveCount === 0)
    breakdown.push({ label: "攻撃技がありません", points: -8 });

  const typedOpponents = predictedOpponents
    .slice(0, 3)
    .map((opp, index) => ({
      ...opp,
      index,
      types: getKnownPokemonTypes(opp.name),
    }))
    .filter((opp) => opp.types.length > 0);

  let hasPower100SuperEffective = false;
  let hasPower120SuperEffective = false;
  let hasPriorityTopSuperEffective = false;

  typedOpponents.forEach((opp) => {
    apiMoves.forEach((move) => {
      const type = move.apiData.type;
      const power = move.apiData.power;
      if (!type || power === null || !isAttackingMove(move.apiData)) return;
      const effectiveness = getTypeEffectiveness(type, opp.types);
      if (effectiveness < 2) return;

      if (power >= 120) hasPower120SuperEffective = true;
      if (power >= 100) hasPower100SuperEffective = true;
      if (opp.index === 0 && move.apiData.priority >= 1)
        hasPriorityTopSuperEffective = true;

      breakdown.push({
        label: `${opp.name}に${move.name}${effectiveness >= 4 ? "4倍" : "2倍"}`,
        points: 0,
      });
    });
  });

  if (hasPower120SuperEffective)
    breakdown.push({ label: "威力120以上の抜群技", points: 8 });
  else if (hasPower100SuperEffective)
    breakdown.push({ label: "威力100以上の抜群技", points: 6 });
  if (hasPriorityTopSuperEffective)
    breakdown.push({ label: "予測1位に抜群の先制技", points: 8 });

  return breakdown;
}

function scoreTypeMatchups(
  player: MyPokemon,
  predictedOpponents: OppPrediction[],
  moveDetails = getPlayerMoveDetails(player),
): ScoreBreakdown[] {
  const moves = moveDetails.filter(
    (
      move,
    ): move is {
      name: string;
      apiData: MoveApiData | null;
      type: PokemonType;
    } => move.type !== null,
  );
  if (moves.length === 0) return [];

  const typedOpponents = predictedOpponents
    .slice(0, 3)
    .map((opp, index) => ({
      ...opp,
      index,
      types: getKnownPokemonTypes(opp.name),
    }))
    .filter((opp) => opp.types.length > 0);
  if (typedOpponents.length === 0) return [];

  const breakdown: ScoreBreakdown[] = [];
  let superEffectiveCount = 0;
  let neutralOrBetterCount = 0;
  let topOpponentBestEffectiveness: number | null = null;

  typedOpponents.forEach((opp) => {
    const best = moves.reduce<{
      name: string;
      type: PokemonType;
      effectiveness: number;
    } | null>((current, move) => {
      const effectiveness = getTypeEffectiveness(move.type, opp.types);
      if (!current || effectiveness > current.effectiveness)
        return { name: move.name, type: move.type, effectiveness };
      return current;
    }, null);

    if (!best) return;
    if (opp.index === 0) topOpponentBestEffectiveness = best.effectiveness;
    if (best.effectiveness >= 1) neutralOrBetterCount += 1;

    if (best.effectiveness >= 4) {
      superEffectiveCount += 1;
      breakdown.push({ label: `${opp.name}に${best.name}4倍`, points: 18 });
    } else if (best.effectiveness >= 2) {
      superEffectiveCount += 1;
      breakdown.push({ label: `${opp.name}に${best.name}2倍`, points: 10 });
    }
  });

  if (topOpponentBestEffectiveness !== null) {
    if (topOpponentBestEffectiveness >= 2)
      breakdown.push({ label: "相手予測1位に抜群", points: 8 });
    if (topOpponentBestEffectiveness >= 4)
      breakdown.push({ label: "相手予測1位に4倍", points: 8 });
    if (topOpponentBestEffectiveness < 1)
      breakdown.push({ label: "相手予測1位への有効打不足", points: -5 });
  }

  if (superEffectiveCount >= 2)
    breakdown.push({ label: `相手${superEffectiveCount}匹に抜群`, points: 10 });
  if (typedOpponents.length >= 3 && neutralOrBetterCount >= 3)
    breakdown.push({ label: "相手予測3匹に等倍以上", points: 5 });

  const allMovesResisted = typedOpponents.every((opp) =>
    moves.every((move) => getTypeEffectiveness(move.type, opp.types) <= 0.5),
  );
  if (allMovesResisted)
    breakdown.push({ label: "タイプ有効打不足", points: -10 });

  return breakdown;
}

function scorePlayerPokemon(
  player: MyPokemon,
  predictedOpponents: OppPrediction[],
  metaData: MetaData | null = null,
): MyRecommendation {
  const breakdown: ScoreBreakdown[] = [{ label: "基本点", points: 50 }];

  const roleText = `${player.roleTags.join(" ")} ${player.memo}`;
  const moves = [player.move1, player.move2, player.move3, player.move4].filter(
    Boolean,
  );
  const moveDetails = getPlayerMoveDetails(player);
  const moveText = moves.join(" ").toLowerCase();

  if (player.evA >= 24) breakdown.push({ label: "物理火力", points: 8 });
  if (player.evC >= 24) breakdown.push({ label: "特殊火力", points: 8 });
  if (player.evS >= 24) breakdown.push({ label: "高速", points: 8 });
  if (player.evH >= 24 || player.evB >= 24 || player.evD >= 24)
    breakdown.push({ label: "耐久", points: 6 });

  const apiData = getCachedPokemonApiData(player.name);
  if (apiData) breakdown.push(...getPokemonApiRoleBonuses(apiData));

  if (findMetaPokemon(metaData, player.name))
    breakdown.push({ label: "補助データあり", points: 3 });

  if (hasAnyText(roleText, ["アタッカー"]))
    breakdown.push({ label: "攻撃役", points: 8 });
  if (hasAnyText(roleText, ["物理"]))
    breakdown.push({ label: "物理役", points: 5 });
  if (hasAnyText(roleText, ["特殊"]))
    breakdown.push({ label: "特殊役", points: 5 });
  if (hasAnyText(roleText, ["耐久", "受け"]))
    breakdown.push({ label: "耐久役", points: 6 });
  if (hasAnyText(roleText, ["先発"]))
    breakdown.push({ label: "先発適性", points: 5 });
  if (hasAnyText(roleText, ["詰め"]))
    breakdown.push({ label: "詰め役", points: 5 });
  if (hasAnyText(roleText, ["サポート"]))
    breakdown.push({ label: "補助役", points: 4 });

  const item = player.item;
  const itemBonus: Record<string, ScoreBreakdown> = {
    きあいのタスキ: { label: "行動保証", points: 8 },
    こだわりスカーフ: { label: "高速補強", points: 8 },
    たべのこし: { label: "継戦能力", points: 6 },
    オボンのみ: { label: "耐久補助", points: 5 },
    いのちのたま: { label: "火力補強", points: 6 },
    こだわりハチマキ: { label: "物理火力", points: 7 },
    こだわりメガネ: { label: "特殊火力", points: 7 },
    とつげきチョッキ: { label: "特殊耐久", points: 6 },
    ゴツゴツメット: { label: "物理受け", points: 5 },
  };
  Object.entries(itemBonus).forEach(([key, bonus]) => {
    if (item.includes(key)) breakdown.push(bonus);
  });
  if (
    item.includes("ナイト") ||
    item.includes("リザードナイトx") ||
    item.includes("リザードナイトy") ||
    item.includes("リザードナイトX") ||
    item.includes("リザードナイトY")
  ) {
    breakdown.push({ label: "メガ適性", points: 6 });
  }

  if (player.pickPriority === "高")
    breakdown.push({ label: "優先度 高", points: 8 });
  else if (player.pickPriority === "低")
    breakdown.push({ label: "優先度 低", points: -5 });

  const selfAttacker =
    hasAnyText(roleText, ["アタッカー"]) ||
    player.evA >= 24 ||
    player.evC >= 24;
  const selfFast = hasAnyText(roleText, ["高速"]) || player.evS >= 24;
  const selfDefensive =
    hasAnyText(roleText, ["耐久", "受け"]) ||
    player.evH >= 24 ||
    player.evB >= 24 ||
    player.evD >= 24;
  const selfLead = hasAnyText(roleText, ["先発"]);
  const selfCloser = hasAnyText(roleText, ["詰め"]);
  const defensiveOppCount = predictedOpponents.filter((o) =>
    hasAnyText(o.role, ["受け", "耐久"]),
  ).length;

  predictedOpponents.slice(0, 3).forEach((opp, idx) => {
    const oppAtk = hasAnyText(opp.role, [
      "アタッカー",
      "対面性能",
      "積みアタッカー",
    ]);
    if (selfFast && selfAttacker && oppAtk)
      breakdown.push({ label: `予測${idx + 1}位に高速火力対応`, points: 8 });
    if (selfDefensive && oppAtk)
      breakdown.push({ label: `予測${idx + 1}位を受けやすい`, points: 8 });
    if (idx === 0 && selfLead)
      breakdown.push({ label: "予測1位対策", points: 6 });
  });
  if (selfCloser && defensiveOppCount <= 1 && predictedOpponents.length > 0)
    breakdown.push({ label: "詰め性能が通りやすい", points: 6 });

  const hasSashThreat = predictedOpponents.some(
    (opp) => opp.predictedBuildType === "きあいのタスキ型",
  );
  if (
    hasSashThreat &&
    hasAnyText(moveText, [
      "先制",
      "しんそく",
      "ふいうち",
      "かげうち",
      "アクアジェット",
      "つららばり",
      "タネマシンガン",
      "連続",
    ])
  ) {
    breakdown.push({ label: "タスキ型への軽い対応", points: 3 });
  }

  const hasScarfThreat = predictedOpponents.some(
    (opp) => opp.predictedBuildType === "こだわりスカーフ型",
  );
  if (hasScarfThreat && selfDefensive) {
    breakdown.push({ label: "スカーフ型への軽い対応", points: 3 });
  }

  const hasDurableThreat = predictedOpponents.some((opp) =>
    ["たべのこし耐久型", "ゴツゴツメット耐久型"].includes(
      opp.predictedBuildType,
    ),
  );
  if (
    hasDurableThreat &&
    (selfAttacker ||
      hasAnyText(moveText, [
        "つるぎのまい",
        "わるだくみ",
        "りゅうのまい",
        "めいそう",
        "ビルドアップ",
        "積み",
      ]))
  ) {
    breakdown.push({ label: "耐久型への軽い対応", points: 3 });
  }

  const movePatterns: Array<{
    patterns: string[];
    label: string;
    points: number;
  }> = [
    { patterns: ["じしん", "だいちのちから"], label: "地面打点", points: 4 },
    { patterns: ["れいとう", "こおり"], label: "氷打点", points: 4 },
    { patterns: ["ほのお", "フレア", "かえん"], label: "炎打点", points: 4 },
    { patterns: ["でんき", "10まん", "ボルト"], label: "電気打点", points: 4 },
    { patterns: ["みず", "ハイドロ", "アクア"], label: "水打点", points: 4 },
    {
      patterns: ["フェアリー", "ムーン", "じゃれつく"],
      label: "フェアリー打点",
      points: 4,
    },
    { patterns: ["ゴースト", "シャドー"], label: "ゴースト打点", points: 4 },
    {
      patterns: ["あく", "かみくだく", "ふいうち"],
      label: "悪打点",
      points: 4,
    },
    {
      patterns: ["先制", "しんそく", "ふいうち", "かげうち", "アクアジェット"],
      label: "先制技",
      points: 5,
    },
    {
      patterns: ["まもる", "みがわり", "ステルスロック", "おにび", "でんじは"],
      label: "補助技",
      points: 3,
    },
  ];
  movePatterns.forEach((entry) => {
    if (
      hasAnyText(
        moveText,
        entry.patterns.map((x) => x.toLowerCase()),
      )
    )
      breakdown.push({ label: entry.label, points: entry.points });
  });

  breakdown.push(
    ...scoreMoveDataBonuses(player, predictedOpponents, moveDetails),
  );
  breakdown.push(...scoreTypeMatchups(player, predictedOpponents, moveDetails));

  const score = breakdown.reduce((sum, b) => sum + b.points, 0);
  const advantagedOpponents = findAdvantagedOpponents(
    player,
    predictedOpponents,
    breakdown,
    moveDetails,
  );
  const reason = buildRecommendationReason(breakdown, advantagedOpponents);
  const strengths = buildRecommendationStrengths(player, breakdown);
  const caution = buildRecommendationCaution(breakdown);

  return {
    pokemon: player,
    score,
    reason,
    advantagedOpponents,
    strengths,
    caution,
    breakdown,
    dataOriginLabel: getMetaDataOriginLabel(metaData, findMetaPokemon(metaData, player.name)),
  };
}

function recommendPlayerSelection(
  myTeam: MyPokemon[],
  predictedOpponents: OppPrediction[],
  metaData: MetaData | null = null,
): MyRecommendation[] {
  if (myTeam.length === 0 || predictedOpponents.length === 0) return [];
  return myTeam
    .map((player) =>
      scorePlayerPokemon(player, predictedOpponents.slice(0, 3), metaData),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(3, myTeam.length));
}

function emptyForm(): Omit<MyPokemon, "id"> {
  return {
    name: "",
    evH: 0,
    evA: 0,
    evB: 0,
    evC: 0,
    evD: 0,
    evS: 0,
    move1: "",
    move2: "",
    move3: "",
    move4: "",
    nature: "",
    item: "",
    ability: "",
    teraType: "",
    roleTags: [],
    pickPriority: "",
    memo: "",
  };
}

function formatEVs(p: MyPokemon): string {
  const stats: [string, number][] = [
    ["H", p.evH],
    ["A", p.evA],
    ["B", p.evB],
    ["C", p.evC],
    ["D", p.evD],
    ["S", p.evS],
  ];
  const nonZero = stats.filter(([, v]) => v > 0).map(([k, v]) => `${k}${v}`);
  return nonZero.length > 0 ? nonZero.join(" ") : "努力値なし";
}

function topLabel(entries: MetaUsageEntry[], fallback: string[]) {
  const metaLabels = entries.slice(0, 2).map((entry) => `${entry.name} ${Math.round(entry.rate)}%`);
  return metaLabels.length > 0 ? metaLabels : fallback;
}

function parseTemplateEvs(evs?: string): Pick<MyPokemon, "evH" | "evA" | "evB" | "evC" | "evD" | "evS"> {
  const result = { evH: 0, evA: 0, evB: 0, evC: 0, evD: 0, evS: 0 };
  if (!evs) return result;

  const keyMap: Record<string, keyof typeof result> = {
    H: "evH",
    HP: "evH",
    A: "evA",
    B: "evB",
    C: "evC",
    D: "evD",
    S: "evS",
  };

  evs.split(/[\s,/]+/).forEach((part) => {
    const match = part.trim().match(/^(H|HP|A|B|C|D|S)(\d+)$/i);
    if (!match) return;
    const key = keyMap[match[1].toUpperCase()];
    if (!key) return;
    result[key] = Math.min(EV_MAX_SINGLE, Math.max(0, Number(match[2]) || 0));
  });

  return result;
}

function myPokemonFromMetaTemplate(template: MetaPokemonTemplate): MyPokemon {
  const pokemon = createPokemonFromMetaTemplate(template);
  const [move1 = "", move2 = "", move3 = "", move4 = ""] = pokemon.moves ?? [];
  const priorityMap: Record<NonNullable<typeof pokemon.priority>, MyPokemon["pickPriority"]> = {
    high: "高",
    medium: "中",
    low: "低",
  };

  return {
    id: pokemon.id,
    name: pokemon.name,
    ...parseTemplateEvs(pokemon.evs),
    move1,
    move2,
    move3,
    move4,
    nature: pokemon.nature ?? "",
    item: pokemon.item ?? "",
    ability: pokemon.ability ?? "",
    teraType: pokemon.teraType ?? "",
    roleTags: pokemon.roleTags ?? [],
    pickPriority: pokemon.priority ? priorityMap[pokemon.priority] : "",
    memo: `${pokemon.memo ?? "補助データから追加"}：${template.reason}`,
  };
}

function templateUsageLabels(entries: MetaUsageEntry[], empty = "データなし") {
  return entries.length > 0
    ? entries.slice(0, 3).map((entry) => `${entry.name}${entry.rate ? ` ${Math.round(entry.rate)}%` : ""}`)
    : [empty];
}

function formatTemplateUsage(template: MetaPokemonTemplate) {
  const rate = template.usageRate > 0 ? ` / ${Math.round(template.usageRate)}%相当` : "";
  return `採用数${template.usageCount}${rate}`;
}

function formatPokemonApiStats(data: PokemonApiData): string {
  const { stats } = data;
  return `H${stats.hp} A${stats.attack} B${stats.defense} C${stats.specialAttack} D${stats.specialDefense} S${stats.speed}`;
}

function getPokemonApiRoleBonuses(data: PokemonApiData): ScoreBreakdown[] {
  const bonuses: ScoreBreakdown[] = [];
  const { stats } = data;
  if (stats.speed >= 100) bonuses.push({ label: "すばやさ高め", points: 3 });
  if (stats.attack >= 120 || stats.specialAttack >= 120)
    bonuses.push({ label: "火力高め", points: 3 });
  if (stats.hp >= 100 || stats.defense >= 100 || stats.specialDefense >= 100)
    bonuses.push({ label: "耐久高め", points: 3 });
  return bonuses;
}

function PokemonApiDataSummary({ data }: { data: PokemonApiData }) {
  return (
    <div className="pokeapi-summary-lines">
      <div>
        タイプ：
        {data.types.length > 0
          ? data.types.join(" / ")
          : "まだ情報がありません"}
      </div>
      <div>種族値：{formatPokemonApiStats(data)}</div>
      <div>
        特性候補：
        {data.abilities.length > 0
          ? data.abilities.join(" / ")
          : "まだ情報がありません"}
      </div>
    </div>
  );
}

type PokemonPortraitSize = "hero" | "saved" | "result" | "slot" | "chip";

function PokemonPortrait({
  name,
  imageUrl,
  size = "result",
}: {
  name: string;
  imageUrl?: string;
  size?: PokemonPortraitSize;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const altName = name.trim() || "ポケモン";

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div
      className={`pokemon-portrait pokemon-portrait--${size}`}
      aria-label={imageUrl && !imageFailed ? undefined : `${altName}の画像なし`}
    >
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={`${altName}の画像`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="pokemon-portrait-placeholder" aria-hidden="true">
          <span>?</span>
        </div>
      )}
    </div>
  );
}

function getPokemonImageUrl(name: string): string | undefined {
  const data = getCachedPokemonApiData(name);
  return data?.imageUrl ?? data?.officialArtworkUrl;
}

interface HeaderPokemonData {
  name: string;
  imageUrl?: string;
}

function getRandomPokemonPair(): [string, string] {
  const uniquePokemon = Array.from(new Set(ALLOWED_POKEMON));
  if (uniquePokemon.length < 2) return ["ピカチュウ", "リザードン"];

  const leftIndex = Math.floor(Math.random() * uniquePokemon.length);
  let rightIndex = Math.floor(Math.random() * (uniquePokemon.length - 1));
  if (rightIndex >= leftIndex) rightIndex += 1;

  return [uniquePokemon[leftIndex], uniquePokemon[rightIndex]];
}

function getPokemonHeaderDisplayData(
  name: string,
  data?: PokemonApiData | null,
): HeaderPokemonData {
  const cachedData = data ?? getCachedPokemonApiData(name);

  return {
    name,
    imageUrl: cachedData?.imageUrl ?? cachedData?.officialArtworkUrl,
  };
}

function BattleHeaderPokemon({
  pokemon,
  side,
}: {
  pokemon: HeaderPokemonData;
  side: "left" | "right";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(pokemon.imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [pokemon.imageUrl]);

  return (
    <div className={`battle-header-pokemon battle-header-pokemon--${side}`}>
      <div className="battle-header-platform" aria-hidden="true" />
      <div className="battle-header-sprite-wrap">
        {hasImage ? (
          <img
            className="battle-header-sprite"
            src={pokemon.imageUrl}
            alt={`${pokemon.name}の画像`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="battle-header-sprite battle-header-placeholder"
            aria-label={`${pokemon.name}の画像なし`}
            role="img"
          >
            ?
          </div>
        )}
      </div>
    </div>
  );
}

function BattleHeader() {
  const [pair, setPair] = useState<[string, string]>(() =>
    getRandomPokemonPair(),
  );
  const [pokemon, setPokemon] = useState<
    [HeaderPokemonData, HeaderPokemonData]
  >(() => [
    getPokemonHeaderDisplayData(pair[0]),
    getPokemonHeaderDisplayData(pair[1]),
  ]);

  useEffect(() => {
    let active = true;
    setPokemon([
      getPokemonHeaderDisplayData(pair[0]),
      getPokemonHeaderDisplayData(pair[1]),
    ]);

    Promise.allSettled(pair.map((name) => fetchPokemonApiData(name))).then(
      (results) => {
        if (!active) return;
        setPokemon([
          getPokemonHeaderDisplayData(
            pair[0],
            results[0].status === "fulfilled" ? results[0].value : null,
          ),
          getPokemonHeaderDisplayData(
            pair[1],
            results[1].status === "fulfilled" ? results[1].value : null,
          ),
        ]);
      },
    );

    return () => {
      active = false;
    };
  }, [pair]);

  function shuffleHeaderPokemon() {
    setPair((current) => {
      let next = getRandomPokemonPair();
      if (ALLOWED_POKEMON.length > 2) {
        let guard = 0;
        while (next[0] === current[0] && next[1] === current[1] && guard < 8) {
          next = getRandomPokemonPair();
          guard += 1;
        }
      }
      return next;
    });
  }

  return (
    <div className="battle-header-section">
      <header
        className="battle-header"
        style={
          {
            "--battle-header-bg": `url("${HEADER_STADIUM_BG_URL}")`,
          } as CSSProperties
        }
      >
        <div className="battle-header-scanline" aria-hidden="true" />

        <div className="battle-header-copy">
          <img
            className="battle-header-title-image"
            src={HEADER_TITLE_URL}
            alt="ポケモンバトルツール"
            draggable={false}
          />
          <p>相手の選出を予測して、おすすめの3匹を確認できます。</p>
        </div>

        <div
          className="battle-header-arena"
          aria-label="ランダムに選ばれた2匹のポケモンの対戦表示"
        >
          <BattleHeaderPokemon pokemon={pokemon[0]} side="left" />
          <img
            className="battle-vs-badge"
            src={BATTLE_VS_BADGE_URL}
            alt="VS"
            draggable={false}
          />
          <BattleHeaderPokemon pokemon={pokemon[1]} side="right" />
        </div>
      </header>

      <div
        className="battle-header-shuffle-panel"
        aria-label="ヘッダーのポケモンを変更"
      >
        <div className="battle-header-shuffle-copy">
          <strong>ヘッダーのポケモンを変更</strong>
          <span>表示中の2匹をランダムで入れ替える</span>
        </div>
        <button
          type="button"
          className="battle-header-shuffle"
          onClick={shuffleHeaderPokemon}
          aria-label="ヘッダーに表示しているポケモンを入れ替える"
        >
          入れ替え
        </button>
      </div>
    </div>
  );
}

function CachedPokemonApiSummary({ name }: { name: string }) {
  const data = getCachedPokemonApiData(name);
  if (!data) return null;
  return (
    <div className="saved-pokeapi-summary">
      <strong>ポケモン情報</strong>
      <PokemonApiDataSummary data={data} />
    </div>
  );
}

type MoveInfoStatus = "loading" | "success" | "unsupported" | "error";
type MoveInfoState = {
  moveName: string;
  status: MoveInfoStatus;
  data: MoveApiData | null;
};

function MoveTypeChip({ type }: { type: PokemonType | null }) {
  return <span className="move-type-chip">{type ?? "タイプ不明"}</span>;
}

function MoveDamageBadge({
  damageClass,
}: {
  damageClass: MoveApiData["damageClass"];
}) {
  return (
    <span className={`move-damage-badge move-damage-badge--${damageClass}`}>
      {damageClass}
    </span>
  );
}

function MoveInfoCards({ states }: { states: MoveInfoState[] }) {
  if (states.length === 0) return null;

  return (
    <div className="move-info-panel" data-testid="move-info-panel">
      <div className="move-info-title">技情報</div>
      <div className="move-info-grid">
        {states.map((state, index) => (
          <div
            className={`move-info-card move-info-card--${state.status}`}
            key={`${state.moveName}-${index}`}
          >
            <div className="move-info-name">{state.moveName}</div>
            {state.status === "loading" && (
              <div className="move-info-message">詳しい情報を取得中...</div>
            )}
            {state.status === "unsupported" && (
              <div className="move-info-message">
                詳しい技情報はまだありません
              </div>
            )}
            {state.status === "error" && (
              <div className="move-info-message">
                技情報を表示できませんでした。入力はそのまま続けられます
              </div>
            )}
            {state.status === "success" && state.data && (
              <div className="move-info-lines">
                <div>
                  タイプ：
                  <MoveTypeChip type={state.data.type} />
                </div>
                <div>
                  分類：
                  <MoveDamageBadge damageClass={state.data.damageClass} />
                </div>
                <div>威力：{state.data.power ?? "なし"}</div>
                <div>命中：{state.data.accuracy ?? "なし"}</div>
                <div>優先度：{state.data.priority}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getMoveTeamChecks(
  form: Pick<MyPokemon, "evA" | "evC">,
  states: MoveInfoState[],
): Array<{ kind: "good" | "warn"; label: string }> {
  const knownMoves = states
    .map((state) => state.data)
    .filter((data): data is MoveApiData => data !== null);
  if (knownMoves.length === 0) return [];

  const attackingMoves = knownMoves.filter(isAttackingMove);
  const physicalCount = attackingMoves.filter(
    (move) => move.damageClass === "物理",
  ).length;
  const specialCount = attackingMoves.filter(
    (move) => move.damageClass === "特殊",
  ).length;
  const statusCount = knownMoves.filter(
    (move) => move.damageClass === "変化",
  ).length;
  const checks: Array<{ kind: "good" | "warn"; label: string }> = [];

  if (attackingMoves.length === 0)
    checks.push({ kind: "warn", label: "攻撃技がありません" });
  if (form.evA >= 24 && physicalCount === 0)
    checks.push({
      kind: "warn",
      label: "Aに多く振っていますが、物理技が少なめです",
    });
  if (form.evC >= 24 && specialCount === 0)
    checks.push({
      kind: "warn",
      label: "Cに多く振っていますが、特殊技が少なめです",
    });
  if (statusCount >= 3)
    checks.push({ kind: "warn", label: "変化技が多めです" });
  if (knownMoves.some((move) => move.priority >= 1))
    checks.push({ kind: "good", label: "先制技があります" });
  if (form.evA >= 24 && physicalCount > 0)
    checks.push({ kind: "good", label: "Aと物理技が合っています" });
  if (form.evC >= 24 && specialCount > 0)
    checks.push({ kind: "good", label: "Cと特殊技が合っています" });

  return checks;
}

function MoveTeamChecks({
  checks,
}: {
  checks: Array<{ kind: "good" | "warn"; label: string }>;
}) {
  if (checks.length === 0) return null;
  return (
    <div className="move-check-list">
      {checks.map((check) => (
        <span
          key={`${check.kind}-${check.label}`}
          className={`move-check move-check--${check.kind}`}
        >
          {check.label}
        </span>
      ))}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("register");
  const [bottomView, setBottomView] = useState<BottomView>("home");
  const [myTeam, setMyTeam] = useState<MyPokemon[]>(() => {
    try {
      const saved = localStorage.getItem("myTeam");
      if (!saved) return [];
      const parsed = JSON.parse(saved) as Partial<MyPokemon>[];
      // Migrate old format that used evs: string
      return parsed.map(
        (p) =>
          ({
            ...p,
            evH: p.evH ?? 0,
            evA: p.evA ?? 0,
            evB: p.evB ?? 0,
            evC: p.evC ?? 0,
            evD: p.evD ?? 0,
            evS: p.evS ?? 0,
            ability: p.ability ?? "",
            teraType: p.teraType ?? "",
            roleTags: p.roleTags ?? [],
            pickPriority: p.pickPriority ?? "",
            memo: p.memo ?? "",
          }) as MyPokemon,
      );
    } catch {
      return [];
    }
  });
  const [opponent, setOpponent] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("opponentSlots");
      return saved ? JSON.parse(saved) : ["", "", "", "", "", ""];
    } catch {
      return ["", "", "", "", "", ""];
    }
  });
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingBuildTemplate, setPendingBuildTemplate] = useState<MetaBuildTemplate | null>(null);
  const [savedCardMetaData, setSavedCardMetaData] = useState<MetaData | null>(null);

  useEffect(() => {
    let active = true;
    loadMetaData().then((data) => {
      if (active) setSavedCardMetaData(data);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("myTeam", JSON.stringify(myTeam));
  }, [myTeam]);

  useEffect(() => {
    localStorage.setItem("opponentSlots", JSON.stringify(opponent));
  }, [opponent]);

  function saveForm() {
    if (!form.name.trim() || !isAllowed(form.name)) return;
    if (editingId) {
      setMyTeam((prev) =>
        prev.map((p) => (p.id === editingId ? { ...form, id: editingId } : p)),
      );
      setEditingId(null);
    } else {
      setMyTeam((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setForm(emptyForm());
  }

  function deleteEntry(id: string) {
    if (!window.confirm("このポケモンを削除しますか？")) return;
    setMyTeam((prev) => prev.filter((p) => p.id !== id));
  }

  function duplicateEntry(p: MyPokemon) {
    setMyTeam((prev) => [...prev, { ...p, id: `${Date.now()}-${crypto.randomUUID()}` }]);
  }

  function moveEntry(id: string, direction: -1 | 1) {
    setMyTeam((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function editEntry(p: MyPokemon) {
    setBottomView("home");
    setScreen("register");
    setEditingId(p.id);
    setForm({
      name: p.name,
      evH: p.evH,
      evA: p.evA,
      evB: p.evB,
      evC: p.evC,
      evD: p.evD,
      evS: p.evS,
      move1: p.move1,
      move2: p.move2,
      move3: p.move3,
      move4: p.move4,
      nature: p.nature,
      item: p.item,
      ability: p.ability ?? "",
      teraType: p.teraType ?? "",
      roleTags: p.roleTags ?? [],
      pickPriority: p.pickPriority ?? "",
      memo: p.memo ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function applyMetaTemplateToForm(template: MetaPokemonTemplate) {
    const pokemon = myPokemonFromMetaTemplate(template);
    setEditingId(null);
    setForm({
      name: pokemon.name,
      evH: pokemon.evH,
      evA: pokemon.evA,
      evB: pokemon.evB,
      evC: pokemon.evC,
      evD: pokemon.evD,
      evS: pokemon.evS,
      move1: pokemon.move1,
      move2: pokemon.move2,
      move3: pokemon.move3,
      move4: pokemon.move4,
      nature: pokemon.nature,
      item: pokemon.item,
      ability: pokemon.ability,
      teraType: pokemon.teraType,
      roleTags: pokemon.roleTags,
      pickPriority: pokemon.pickPriority,
      memo: pokemon.memo,
    });
  }

  function addMetaTemplateToTeam(template: MetaPokemonTemplate) {
    setMyTeam((prev) => [...prev, myPokemonFromMetaTemplate(template)]);
  }

  function addBuildMembers(template: MetaBuildTemplate, mode: "missing" | "all") {
    setMyTeam((prev) => {
      const registeredNames = new Set(prev.map((pokemon) => normalize(pokemon.name)));
      const members = template.members
        .filter((member) => mode === "all" || !registeredNames.has(normalize(member.name)))
        .map(myPokemonFromMetaTemplate);
      return members.length > 0 ? [...prev, ...members] : prev;
    });
    setPendingBuildTemplate(null);
  }

  function requestAddBuild(template: MetaBuildTemplate) {
    const hasDuplicate = template.members.some((member) =>
      myTeam.some((pokemon) => normalize(pokemon.name) === normalize(member.name)),
    );
    if (hasDuplicate) {
      setPendingBuildTemplate(template);
      return;
    }
    addBuildMembers(template, "all");
  }

  return (
    <div id="app-root">
      <div className="app-bg-layer" aria-hidden="true" />
      <div className="pokedex-shell">
        <BattleHeader />

        <main className="pokedex-screen-panel">
          {bottomView === "home" && (
            <>
              <nav className="tab-bar" aria-label="ホームメニュー">
                <button
                  type="button"
                  className={`tab-btn${screen === "register" ? " tab-btn--active" : ""}`}
                  aria-current={screen === "register" ? "page" : undefined}
                  aria-pressed={screen === "register"}
                  onClick={() => {
                    setScreen("register");
                    cancelEdit();
                  }}
                  data-testid="tab-register"
                >
                  <span className="tab-icon">📋</span>
                  <span className="tab-label">自分のポケモン登録</span>
                </button>
                <button
                  type="button"
                  className={`tab-btn${screen === "battle" ? " tab-btn--active" : ""}`}
                  aria-current={screen === "battle" ? "page" : undefined}
                  aria-pressed={screen === "battle"}
                  onClick={() => setScreen("battle")}
                  data-testid="tab-battle"
                >
                  <span className="tab-icon">⚔️</span>
                  <span className="tab-label">相手入力・おすすめ選出</span>
                </button>
              </nav>
              {screen === "register" && (
                <RegisterScreen
                  form={form}
                  setForm={setForm}
                  myTeam={myTeam}
                  onSave={saveForm}
                  onDelete={deleteEntry}
                  onEdit={editEntry}
                  onDuplicate={duplicateEntry}
                  onMove={moveEntry}
                  onCancelEdit={cancelEdit}
                  editingId={editingId}
                  metaData={savedCardMetaData}
                  onApplyTemplate={applyMetaTemplateToForm}
                  onAddTemplate={addMetaTemplateToTeam}
                  onAddBuild={requestAddBuild}
                />
              )}
              {screen === "battle" && (
                <BattleScreen
                  opponent={opponent}
                  setOpponent={setOpponent}
                  myTeam={myTeam}
                />
              )}
            </>
          )}
          {bottomView === "saved" && (
            <SavedListScreen
              myTeam={myTeam}
              onEdit={editEntry}
              onDelete={deleteEntry}
              onDuplicate={duplicateEntry}
              onMove={moveEntry}
              metaData={savedCardMetaData}
            />
          )}
          {bottomView === "guide" && <GuideScreen />}
          {pendingBuildTemplate && (
            <div className="duplicate-dialog" role="dialog" aria-modal="true" aria-label="重複確認">
              <div className="duplicate-dialog-card">
                <h3>同じポケモンがいます</h3>
                <p>同じポケモンが既に登録されています。未登録だけ追加しますか？</p>
                <div className="template-actions">
                  <button type="button" className="btn-template-add" onClick={() => addBuildMembers(pendingBuildTemplate, "missing")}>未登録だけ追加</button>
                  <button type="button" className="btn-template-apply" onClick={() => addBuildMembers(pendingBuildTemplate, "all")}>すべて追加</button>
                  <button type="button" className="btn-secondary" onClick={() => setPendingBuildTemplate(null)}>キャンセル</button>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer className="bottom-nav" aria-label="補助ナビゲーション">
          <button
            type="button"
            className={`bottom-nav-item${bottomView === "home" ? " bottom-nav-item--active" : ""}`}
            onClick={() => setBottomView("home")}
            aria-current={bottomView === "home" ? "page" : undefined}
            aria-pressed={bottomView === "home"}
          >
            <span aria-hidden="true">⌂</span>
            <span>ホーム</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-item${bottomView === "saved" ? " bottom-nav-item--active" : ""}`}
            onClick={() => setBottomView("saved")}
            aria-current={bottomView === "saved" ? "page" : undefined}
            aria-pressed={bottomView === "saved"}
          >
            <span aria-hidden="true">▤</span>
            <span>保存リスト</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-item${bottomView === "guide" ? " bottom-nav-item--active" : ""}`}
            onClick={() => setBottomView("guide")}
            aria-current={bottomView === "guide" ? "page" : undefined}
            aria-pressed={bottomView === "guide"}
          >
            <span aria-hidden="true">?</span>
            <span>使い方</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

function SavedPokemonCard({
  pokemon,
  index,
  total,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  metaData,
}: {
  pokemon: MyPokemon;
  index: number;
  total: number;
  onEdit: (p: MyPokemon) => void;
  onDelete: (id: string) => void;
  onDuplicate: (p: MyPokemon) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  metaData: MetaData | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const moves = [pokemon.move1, pokemon.move2, pokemon.move3, pokemon.move4]
    .map((move) => move.trim())
    .filter(Boolean);
  const apiData = getCachedPokemonApiData(pokemon.name);
  const metaEntry = findMetaPokemon(metaData, pokemon.name);
  const summaryParts = [
    pokemon.nature ? `性格:${pokemon.nature}` : "性格未設定",
    pokemon.item ? `持ち物:${pokemon.item}` : "持ち物なし",
    pokemon.ability ? `特性:${pokemon.ability}` : "特性未設定",
  ];

  return (
    <article
      className={`saved-team-card${expanded ? " saved-team-card--expanded" : ""}`}
      data-testid={`card-pokemon-${pokemon.id}`}
    >
      <button
        type="button"
        className="saved-team-card-toggle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={`${pokemon.name || "未設定"}の詳細を${expanded ? "閉じる" : "開く"}`}
      >
        <PokemonPortrait
          name={pokemon.name}
          imageUrl={getPokemonImageUrl(pokemon.name)}
          size="saved"
        />
        <span className="saved-team-main">
          <span className="saved-name-row">
            <strong className="saved-name">{pokemon.name || "未設定"}</strong>
            <span className="saved-expand-hint">{expanded ? "閉じる" : "詳細"}</span>
          </span>
          <span className="saved-ev">{formatEVs(pokemon)}</span>
          <span className="saved-summary-line">{summaryParts.join(" / ")}</span>
        </span>
      </button>

      <div className="saved-chip-row saved-chip-row--compact" aria-label="基本情報">
        {pokemon.teraType && <span className="saved-chip">テラ:{pokemon.teraType}</span>}
        {pokemon.pickPriority && <span className="saved-chip">優先:{pokemon.pickPriority}</span>}
        {pokemon.roleTags.length > 0
          ? pokemon.roleTags.map((tag) => (
              <span key={`${pokemon.id}-role-${tag}`} className="saved-chip saved-chip--role">
                {tag}
              </span>
            ))
          : <span className="saved-chip">役割タグなし</span>}
      </div>

      <div className="saved-actions saved-actions--compact">
        <button type="button" className="btn-secondary saved-action-btn" onClick={() => onMove(pokemon.id, -1)} disabled={index === 0}>
          上へ
        </button>
        <button type="button" className="btn-secondary saved-action-btn" onClick={() => onMove(pokemon.id, 1)} disabled={index === total - 1}>
          下へ
        </button>
        <button type="button" className="btn-secondary saved-action-btn" onClick={() => onEdit(pokemon)} data-testid={`btn-edit-${pokemon.id}`}>
          編集
        </button>
        <button type="button" className="btn-secondary saved-action-btn" onClick={() => onDuplicate(pokemon)}>
          複製
        </button>
        <button type="button" className="btn-danger saved-action-btn" onClick={() => onDelete(pokemon.id)} data-testid={`btn-delete-${pokemon.id}`}>
          削除
        </button>
      </div>

      {expanded && (
        <div className="saved-team-detail">
          <div className="saved-detail-block">
            <strong>技</strong>
            <div className="saved-chip-row saved-chip-row--compact">
              {moves.length > 0
                ? moves.map((move) => <span key={`${pokemon.id}-move-${move}`} className="saved-chip">{move}</span>)
                : <span className="saved-chip">技未設定</span>}
            </div>
          </div>
          <div className="saved-detail-grid">
            <p><strong>テラスタイプ</strong> {pokemon.teraType || "未設定"}</p>
            <p><strong>性格</strong> {pokemon.nature || "未設定"}</p>
            <p><strong>持ち物</strong> {pokemon.item || "未設定"}</p>
            <p><strong>特性</strong> {pokemon.ability || "未設定"}</p>
          </div>
          <div className="saved-detail-block">
            <strong>役割タグ</strong>
            <div className="saved-chip-row saved-chip-row--compact">
              {pokemon.roleTags.length > 0
                ? pokemon.roleTags.map((tag) => <span key={`${pokemon.id}-detail-role-${tag}`} className="saved-chip saved-chip--role">{tag}</span>)
                : <span className="saved-chip">役割タグなし</span>}
            </div>
          </div>
          {pokemon.memo.trim() ? <p className="saved-memo"><strong>メモ</strong> {pokemon.memo}</p> : null}
          {apiData && (
            <div className="saved-detail-block saved-data-box">
              <strong>補助データ</strong>
              <PokemonApiDataSummary data={apiData} />
            </div>
          )}
          {metaEntry && (
            <div className="saved-detail-block saved-data-box">
              <strong>採用傾向</strong>
              <div className="pokeapi-summary-lines">
                <div>採用数：{metaEntry.usageCount}</div>
                <div>持ち物：{topLabel(metaEntry.items ?? [], ["データなし"]).join("、")}</div>
                <div>テラ：{topLabel(metaEntry.teraTypes ?? [], ["データなし"]).join("、")}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function SavedListScreen({
  myTeam,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  metaData,
}: {
  myTeam: MyPokemon[];
  onEdit: (p: MyPokemon) => void;
  onDelete: (id: string) => void;
  onDuplicate: (p: MyPokemon) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  metaData: MetaData | null;
}) {
  return (
    <section className="card saved-list-screen">
      <h2 className="card-title">保存リスト</h2>
      <p className="subtext">登録した自分のポケモンを確認・編集できます。</p>
      <p className="saved-count">登録済み {myTeam.length}匹</p>
      {myTeam.length === 0 ? (
        <div className="empty-notice">
          <p>まだポケモンが登録されていません</p>
          <p>ホームから自分のポケモンを登録してください</p>
        </div>
      ) : (
        <div className="saved-list-grid saved-list-grid--compact">
          {myTeam.map((p, index) => (
            <SavedPokemonCard
              key={p.id}
              pokemon={p}
              index={index}
              total={myTeam.length}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onMove={onMove}
              metaData={metaData}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GuideScreen() {
  return (
    <section className="card guide-screen">
      <h2 className="card-title">使い方</h2>
      <p className="subtext">
        このツールは、ポケモンチャンピオンズの対戦で、相手の選出予測と自分のおすすめ選出を確認するための補助ツールです。
      </p>
      <div className="guide-steps">
        {[
          {
            title: "STEP 1 自分のポケモンを登録する",
            body: "まず、ホーム画面の「自分のポケモン登録」で、自分が使うポケモンを登録します。",
            details: [
              "ポケモン名",
              "努力値",
              "技4つ",
              "性格",
              "持ち物",
              "特性",
              "テラスタイプ",
              "役割タグ",
              "選出優先度",
              "メモ",
            ],
            note: "努力値はチャンピオンズ制に合わせて、合計66、1項目最大32です。",
          },
          {
            title: "STEP 2 相手の6匹を入力する",
            body: "相手入力・おすすめ選出画面で、相手のパーティを最大6匹入力します。",
            note: "全部入力しなくても動きますが、6匹入力した方が予測しやすくなります。",
          },
          {
            title: "STEP 3 相手の選出予測を見る",
            body: "入力された相手パーティから、相手が出してきそうな上位3匹を表示します。",
            details: [
              "予測順位",
              "ポケモン名",
              "予測スコア",
              "予測理由",
              "注意点",
            ],
          },
          {
            title: "STEP 4 自分のおすすめ選出を見る",
            body: "相手の予測上位3匹に対して、自分の登録済みポケモンからおすすめ3匹を表示します。",
            details: [
              "おすすめ順位",
              "ポケモン名",
              "スコア",
              "おすすめ理由",
              "スコア内訳",
            ],
          },
          {
            title: "STEP 5 保存リストで確認する",
            body: "登録済みポケモンは、下部ナビの「保存リスト」から確認できます。編集や削除もここからできます。",
          },
        ].map((step, idx) => (
          <article key={step.title} className="guide-step-card">
            <div className="guide-step-badge">STEP {idx + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            {step.details ? (
              <ul>
                {step.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : null}
            {step.note ? <p className="subtext">{step.note}</p> : null}
          </article>
        ))}
      </div>
      <article className="guide-step-card">
        <div className="guide-step-badge">注意</div>
        <ul>
          <li>このツールの予測は絶対ではありません。</li>
          <li>
            実際の対戦では、相手の型やプレイングによって結果が変わります。
          </li>
          <li>あくまで選出を考えるための補助として使ってください。</li>
          <li>データはこのブラウザに保存されます。</li>
          <li>端末やブラウザを変えると、保存データは引き継がれません。</li>
        </ul>
      </article>
    </section>
  );
}

// ── EVSection ─────────────────────────────────────────────────────────────────
const EV_MAX_SINGLE = 32;
const EV_MAX_TOTAL = 66;
const EV_STATS: {
  key: "evH" | "evA" | "evB" | "evC" | "evD" | "evS";
  label: string;
  full: string;
}[] = [
  { key: "evH", label: "H", full: "HP" },
  { key: "evA", label: "A", full: "こうげき" },
  { key: "evB", label: "B", full: "ぼうぎょ" },
  { key: "evC", label: "C", full: "とくこう" },
  { key: "evD", label: "D", full: "とくぼう" },
  { key: "evS", label: "S", full: "すばやさ" },
];

function EVSection({
  form,
  setForm,
}: {
  form: Omit<MyPokemon, "id">;
  setForm: (f: Omit<MyPokemon, "id">) => void;
}) {
  const total = EV_STATS.reduce((sum, s) => sum + (form[s.key] as number), 0);
  const remaining = EV_MAX_TOTAL - total;
  const overTotal = total > EV_MAX_TOTAL;
  const overSingle = EV_STATS.some(
    (s) => (form[s.key] as number) > EV_MAX_SINGLE,
  );

  function getSanitizedEVValue(
    key: (typeof EV_STATS)[number]["key"],
    rawValue: number,
  ) {
    const currentValue = form[key] as number;
    const otherTotal = total - currentValue;
    const maxByTotal = Math.max(0, EV_MAX_TOTAL - otherTotal);
    const maxAllowed = Math.min(EV_MAX_SINGLE, maxByTotal);
    return Math.min(Math.max(0, Math.trunc(rawValue)), maxAllowed);
  }

  function handleChange(key: (typeof EV_STATS)[number]["key"], raw: string) {
    const parsed = raw === "" ? 0 : Number.parseInt(raw, 10);
    const nextValue = Number.isNaN(parsed) ? 0 : parsed;
    setForm({ ...form, [key]: getSanitizedEVValue(key, nextValue) });
  }

  function handleStep(key: (typeof EV_STATS)[number]["key"], amount: -1 | 1) {
    const currentValue = form[key] as number;
    setForm({
      ...form,
      [key]: getSanitizedEVValue(key, currentValue + amount),
    });
  }

  function handleReset() {
    setForm({
      ...form,
      evH: 0,
      evA: 0,
      evB: 0,
      evC: 0,
      evD: 0,
      evS: 0,
    });
  }

  return (
    <div className="field">
      <div className="ev-header-row">
        <label className="field-label" style={{ margin: 0 }}>
          努力値
        </label>
        <div
          className={`ev-total${overTotal ? " ev-total--error" : remaining === 0 ? " ev-total--done" : ""}`}
        >
          合計 <strong>{total}</strong> / {EV_MAX_TOTAL}
        </div>
        <div
          className={`ev-remaining${overTotal ? " ev-remaining--error" : ""}`}
        >
          残り {Math.max(remaining, 0)}
        </div>
        {remaining === 0 && !overTotal ? (
          <div className="ev-max-note">最大まで振っています</div>
        ) : null}
      </div>

      <div className="ev-grid">
        {EV_STATS.map(({ key, label, full }) => {
          const val = form[key] as number;
          const isOver = val > EV_MAX_SINGLE;
          const minusDisabled = val <= 0;
          const plusDisabled = val >= EV_MAX_SINGLE || remaining <= 0;
          const inputId = `ev-input-${key}`;
          return (
            <div key={key} className={`ev-cell ev-cell--${key}`}>
              <label htmlFor={inputId} className="ev-label">
                {label}
              </label>
              <div className="ev-sublabel">{full}</div>
              <div className="ev-stepper" aria-label={`${label}の努力値`}>
                <button
                  type="button"
                  className="ev-stepper-btn"
                  onClick={() => handleStep(key, -1)}
                  disabled={minusDisabled}
                  aria-label={`${label}を1減らす`}
                >
                  −
                </button>
                <input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`ev-input${isOver ? " ev-input-error" : ""}`}
                  min={0}
                  max={EV_MAX_SINGLE}
                  step={1}
                  value={val}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onBlur={(e) => handleChange(key, e.target.value)}
                  aria-describedby="ev-rule-note"
                  data-testid={`input-ev-${label.toLowerCase()}`}
                />
                <button
                  type="button"
                  className="ev-stepper-btn"
                  onClick={() => handleStep(key, 1)}
                  disabled={plusDisabled}
                  aria-label={`${label}を1増やす`}
                >
                  ＋
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ev-actions">
        <button type="button" className="ev-reset-btn" onClick={handleReset}>
          努力値をリセット
        </button>
        <span id="ev-rule-note" className="ev-rule-note">
          1つは{EV_MAX_SINGLE}まで・合計{EV_MAX_TOTAL}まで
        </span>
      </div>

      {overSingle && (
        <div
          className="field-error-msg"
          style={{ marginTop: 6 }}
          data-testid="error-ev-single"
        >
          1つの能力は{EV_MAX_SINGLE}までです
        </div>
      )}
      {overTotal && (
        <div
          className="field-error-msg"
          style={{ marginTop: 6 }}
          data-testid="error-ev-total"
        >
          努力値の合計は{EV_MAX_TOTAL}までです
        </div>
      )}
    </div>
  );
}

// ── RegisterScreen ────────────────────────────────────────────────────────────
interface RegisterProps {
  form: Omit<MyPokemon, "id">;
  setForm: (f: Omit<MyPokemon, "id">) => void;
  myTeam: MyPokemon[];
  onSave: () => void;
  onDelete: (id: string) => void;
  onEdit: (p: MyPokemon) => void;
  onDuplicate: (p: MyPokemon) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onCancelEdit: () => void;
  editingId: string | null;
  metaData: MetaData | null;
  onApplyTemplate: (template: MetaPokemonTemplate) => void;
  onAddTemplate: (template: MetaPokemonTemplate) => void;
  onAddBuild: (template: MetaBuildTemplate) => void;
}

function RegisterScreen({
  form,
  setForm,
  myTeam,
  onSave,
  onDelete,
  onEdit,
  onDuplicate,
  onMove,
  onCancelEdit,
  editingId,
  metaData,
  onApplyTemplate,
  onAddTemplate,
  onAddBuild,
}: RegisterProps) {
  const [pokeApiStatus, setPokeApiStatus] = useState<
    "idle" | "loading" | "success" | "unsupported" | "error"
  >("idle");
  const [pokeApiData, setPokeApiData] = useState<PokemonApiData | null>(null);
  const [moveInfoStates, setMoveInfoStates] = useState<MoveInfoState[]>([]);

  function f(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  useEffect(() => {
    const name = form.name.trim();
    let cancelled = false;

    if (!name) {
      setPokeApiStatus("idle");
      setPokeApiData(null);
      return;
    }

    if (!getPokemonApiName(name)) {
      setPokeApiStatus("unsupported");
      setPokeApiData(null);
      return;
    }

    const cached = getCachedPokemonApiData(name);
    if (cached) {
      setPokeApiData(cached);
      setPokeApiStatus("success");
      return;
    }

    setPokeApiStatus("loading");
    setPokeApiData(null);

    fetchPokemonApiData(name)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setPokeApiData(data);
          setPokeApiStatus("success");
        } else {
          setPokeApiData(null);
          setPokeApiStatus("unsupported");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPokeApiData(null);
        setPokeApiStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [form.name]);

  useEffect(() => {
    const selectedMoves = [form.move1, form.move2, form.move3, form.move4]
      .map((move) => move.trim())
      .filter(Boolean);
    let cancelled = false;

    if (selectedMoves.length === 0) {
      setMoveInfoStates([]);
      return;
    }

    setMoveInfoStates(
      selectedMoves.map((moveName) => {
        if (!getMoveApiName(moveName)) {
          return { moveName, status: "unsupported", data: null };
        }
        const cached = getCachedMoveApiData(moveName);
        if (cached) return { moveName, status: "success", data: cached };
        return { moveName, status: "loading", data: null };
      }),
    );

    selectedMoves.forEach((moveName) => {
      if (!getMoveApiName(moveName) || getCachedMoveApiData(moveName)) return;

      fetchMoveApiData(moveName)
        .then((data) => {
          if (cancelled) return;
          setMoveInfoStates((prev) =>
            prev.map((state) =>
              state.moveName === moveName
                ? data
                  ? { moveName, status: "success", data }
                  : { moveName, status: "error", data: null }
                : state,
            ),
          );
        })
        .catch(() => {
          if (cancelled) return;
          setMoveInfoStates((prev) =>
            prev.map((state) =>
              state.moveName === moveName
                ? { moveName, status: "error", data: null }
                : state,
            ),
          );
        });
    });

    return () => {
      cancelled = true;
    };
  }, [form.move1, form.move2, form.move3, form.move4]);

  const moveTeamChecks = getMoveTeamChecks(form, moveInfoStates);
  const [, setTemplateImageCacheVersion] = useState(0);

  const evTotal = EV_STATS.reduce((sum, s) => sum + (form[s.key] as number), 0);
  const evOk =
    evTotal <= EV_MAX_TOTAL &&
    EV_STATS.every((s) => (form[s.key] as number) <= EV_MAX_SINGLE);
  const canSave = form.name.trim() !== "" && isAllowed(form.name) && evOk;
  const popularPokemonTemplates = useMemo(() => getPopularPokemonTemplates(metaData), [metaData]);
  const popularSetTemplates = useMemo(() => getPokemonSetTemplates(metaData), [metaData]);
  const popularBuildTemplates = useMemo(() => getPopularBuildTemplates(metaData, myTeam), [metaData, myTeam]);

  useEffect(() => {
    let cancelled = false;
    const namesToFetch = Array.from(new Set([
      ...popularPokemonTemplates.slice(0, 12).map((template) => template.name),
      ...popularSetTemplates.slice(0, 12).map((template) => template.name),
      ...popularBuildTemplates.slice(0, 4).flatMap((template) => template.memberNames),
    ])).filter((name) => {
      const cached = getCachedPokemonApiData(name);
      return getPokemonApiName(name) && (!cached || (!cached.imageUrl && !cached.officialArtworkUrl));
    });

    if (namesToFetch.length === 0) return;

    Promise.allSettled(namesToFetch.map((name) => fetchPokemonApiData(name))).then(() => {
      if (!cancelled) setTemplateImageCacheVersion((version) => version + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [
    popularPokemonTemplates.map((template) => template.name).join("|"),
    popularSetTemplates.map((template) => `${template.name}:${template.setName ?? ""}`).join("|"),
    popularBuildTemplates.map((template) => template.memberNames.join("-")).join("|"),
  ]);

  return (
    <div className="screen">
      <div className="card">
        <div className="card-title">
          {editingId ? "編集中" : "新しいポケモンを追加"}
        </div>

        <div className="field">
          <label className="field-label">ポケモン名</label>
          <PokemonInput
            value={form.name}
            onChange={(val) => setForm({ ...form, name: val })}
            placeholder="例: ガブリアス"
            testId="input-pokemon-name"
          />
        </div>

        <div
          className={`pokeapi-card pokeapi-card--${pokeApiStatus}`}
          data-testid="pokeapi-helper-card"
        >
          <div className="pokeapi-card-title">ポケモン情報</div>
          <div className="pokeapi-card-note">
            この情報は参考用です。チャンピオンズの内容と違う場合があります。
          </div>
          {pokeApiStatus === "idle" && (
            <div className="pokeapi-card-message">
              ポケモンを選ぶとタイプ・種族値・特性候補を表示します
            </div>
          )}
          {pokeApiStatus === "loading" && (
            <div className="pokeapi-card-message">詳しい情報を取得中...</div>
          )}
          {pokeApiStatus === "success" && pokeApiData && (
            <div className="pokeapi-summary-with-image">
              <PokemonPortrait
                name={pokeApiData.japaneseName || form.name}
                imageUrl={
                  pokeApiData.imageUrl ?? pokeApiData.officialArtworkUrl
                }
                size="hero"
              />
              <PokemonApiDataSummary data={pokeApiData} />
            </div>
          )}
          {pokeApiStatus === "unsupported" && (
            <div className="pokeapi-card-message">
              このポケモンの詳しい情報はまだありません
            </div>
          )}
          {pokeApiStatus === "error" && (
            <div className="pokeapi-card-message">
              詳しい情報を表示できませんでした。入力はそのまま続けられます
            </div>
          )}
        </div>

        <EVSection form={form} setForm={setForm} />

        <div className="field">
          <label className="field-label">技</label>
          <div className="moves-grid">
            <MoveInput
              placeholder="技1"
              value={form.move1}
              onChange={(val) => setForm({ ...form, move1: val })}
              testId="input-move1"
            />
            <MoveInput
              placeholder="技2"
              value={form.move2}
              onChange={(val) => setForm({ ...form, move2: val })}
              testId="input-move2"
            />
            <MoveInput
              placeholder="技3"
              value={form.move3}
              onChange={(val) => setForm({ ...form, move3: val })}
              testId="input-move3"
            />
            <MoveInput
              placeholder="技4"
              value={form.move4}
              onChange={(val) => setForm({ ...form, move4: val })}
              testId="input-move4"
            />
          </div>
          {(() => {
            const moves = [form.move1, form.move2, form.move3, form.move4]
              .map((m) => m.trim())
              .filter(Boolean);
            const hasDup = new Set(moves).size !== moves.length;
            return hasDup ? (
              <div className="field-error-msg" style={{ marginTop: 6 }}>
                同じ技が重複しています
              </div>
            ) : null;
          })()}
          <MoveInfoCards states={moveInfoStates} />
          <MoveTeamChecks checks={moveTeamChecks} />
        </div>

        <SearchableSelect
          label="性格"
          value={form.nature}
          onChange={(val) => setForm({ ...form, nature: val })}
          options={NATURES}
          placeholder="未設定"
          testId="select-nature"
        />

        <SearchableSelect
          label="持ち物"
          value={form.item}
          onChange={(val) => setForm({ ...form, item: val })}
          options={ITEMS}
          placeholder="未設定"
          testId="input-item"
          emptyLimit={30}
        />

        <SearchableSelect
          label="特性"
          value={form.ability}
          onChange={(val) => setForm({ ...form, ability: val })}
          options={ABILITY_LIST}
          placeholder="未設定"
          testId="input-ability"
        >
          {pokeApiStatus === "success" &&
            pokeApiData &&
            pokeApiData.abilities.length > 0 && (
              <div className="recommended-ability-box">
                <div className="recommended-ability-label">
                  このポケモンの特性候補
                </div>
                <div className="recommended-ability-chips">
                  {getAbilityDetailsForDisplay(pokeApiData).map((ability) => (
                    <button
                      key={`${ability.apiName}-${ability.name}`}
                      type="button"
                      className="recommended-ability-chip"
                      onClick={() =>
                        setForm({ ...form, ability: ability.name })
                      }
                      data-api-name={ability.apiName}
                      title={`特性候補: ${ability.name}`}
                      data-testid={`chip-api-ability-${ability.name}`}
                    >
                      <span className="recommended-ability-name">
                        {ability.name}
                      </span>
                      {ability.isHidden && (
                        <span className="recommended-ability-hidden">
                          隠れ特性
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </SearchableSelect>

        <SearchableSelect
          label="テラスタイプ"
          value={form.teraType}
          onChange={(val) => setForm({ ...form, teraType: val })}
          options={TERA_TYPES}
          placeholder="未設定"
          testId="input-tera-type"
        />
        <div className="field">
          <label className="field-label">役割タグ（複数選択）</label>
          <div className="result-tags">
            {ROLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`result-tag ${form.roleTags.includes(tag) ? "role-active" : ""}`}
                onClick={() =>
                  setForm({
                    ...form,
                    roleTags: form.roleTags.includes(tag)
                      ? form.roleTags.filter((t) => t !== tag)
                      : [...form.roleTags, tag],
                  })
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label">選出優先度</label>
          <select
            className="field-select"
            value={form.pickPriority}
            onChange={f("pickPriority")}
          >
            <option value="">未設定</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">メモ</label>
          <textarea
            className="field-input"
            placeholder="例: 初手に出しやすい"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            rows={3}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button
            className="btn-primary"
            onClick={onSave}
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.4 }}
            data-testid="btn-save"
          >
            {editingId ? "更新する" : "保存する"}
          </button>
          {editingId && (
            <button
              className="btn-secondary"
              onClick={onCancelEdit}
              data-testid="btn-cancel-edit"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      <PopularDataSection
        metaData={metaData}
        popularPokemon={popularPokemonTemplates}
        setTemplates={popularSetTemplates}
        buildTemplates={popularBuildTemplates}
        onApplyTemplate={onApplyTemplate}
        onAddTemplate={onAddTemplate}
        onAddBuild={onAddBuild}
      />

      <div style={{ padding: "4px 0" }}>
        <div className="card-title" style={{ padding: "0 4px 8px" }}>
          登録済み — {myTeam.length} 匹
        </div>

        {myTeam.length === 0 ? (
          <div className="empty-state">まだポケモンが登録されていません</div>
        ) : (
          <div className="saved-list-grid saved-list-grid--compact">
            {myTeam.map((p, index) => (
              <SavedPokemonCard
                key={p.id}
                pokemon={p}
                index={index}
                total={myTeam.length}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onMove={onMove}
                metaData={metaData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

}

function PopularDataSection({
  metaData,
  popularPokemon,
  setTemplates,
  buildTemplates,
  onApplyTemplate,
  onAddTemplate,
  onAddBuild,
}: {
  metaData: MetaData | null;
  popularPokemon: MetaPokemonTemplate[];
  setTemplates: MetaPokemonTemplate[];
  buildTemplates: MetaBuildTemplate[];
  onApplyTemplate: (template: MetaPokemonTemplate) => void;
  onAddTemplate: (template: MetaPokemonTemplate) => void;
  onAddBuild: (template: MetaBuildTemplate) => void;
}) {
  const [activeTab, setActiveTab] = useState<"pokemon" | "sets" | "builds">("pokemon");
  const [showMore, setShowMore] = useState(false);
  const hasMeta = hasUsableMetaData(metaData);
  const pokemonList = (showMore ? popularPokemon.slice(0, 12) : popularPokemon.slice(0, 4));
  const setList = (showMore ? setTemplates.slice(0, 12) : setTemplates.slice(0, 4));
  const buildList = (showMore ? buildTemplates.slice(0, 8) : buildTemplates.slice(0, 3));
  const isEmpty = hasMeta && popularPokemon.length === 0 && buildTemplates.length === 0;

  return (
    <section className="popular-template-panel" aria-label="補助データから追加">
      <div className="popular-pokemon-heading-row">
        <div>
          <div className="card-title">補助データから追加</div>
          <p className="popular-pokemon-help">チャンピオンズ実装データと推定ロジックから、型テンプレを追加できます。</p>
        </div>
        <span className="popular-pokemon-source">テンプレ提案あり</span>
      </div>

      {!hasMeta && (
        <div className="popular-status">
          <div>公開構築データは使いません。</div>
          <div>役割・相性からの推定で補助します。</div>
        </div>
      )}
      {isEmpty && <div className="popular-status">表示できる補助データがありません。</div>}

      {(hasMeta || buildTemplates.length > 0) && (
        <>
          <div className="popular-tabs" role="tablist" aria-label="補助データの種類">
            <button type="button" className={activeTab === "pokemon" ? "active" : ""} onClick={() => setActiveTab("pokemon")}>人気ポケモン</button>
            <button type="button" className={activeTab === "sets" ? "active" : ""} onClick={() => setActiveTab("sets")}>型テンプレ</button>
            <button type="button" className={activeTab === "builds" ? "active" : ""} onClick={() => setActiveTab("builds")}>提案テンプレ</button>
          </div>

          <div className="popular-grid">
            {activeTab === "pokemon" && pokemonList.map((template) => (
              <TemplateCard key={`${template.kind}-${template.name}-${template.rank}`} template={template} onApply={onApplyTemplate} onAdd={onAddTemplate} />
            ))}
            {activeTab === "sets" && setList.map((template) => (
              <TemplateCard key={`${template.kind}-${template.name}-${template.rank}-${template.setName}`} template={template} onApply={onApplyTemplate} onAdd={onAddTemplate} showSet />
            ))}
            {activeTab === "builds" && buildList.map((template) => (
              <BuildTemplateCard key={`${template.rank}-${template.memberNames.join("-")}`} template={template} onAdd={onAddBuild} />
            ))}
          </div>

          <button type="button" className="popular-more popular-more-button" onClick={() => setShowMore((value) => !value)}>
            {showMore ? "少なく表示" : "もっと見る"}
          </button>
        </>
      )}
    </section>
  );
}

function TemplateCard({
  template,
  onApply,
  onAdd,
  showSet = false,
}: {
  template: MetaPokemonTemplate;
  onApply: (template: MetaPokemonTemplate) => void;
  onAdd: (template: MetaPokemonTemplate) => void;
  showSet?: boolean;
}) {
  return (
    <article className="template-card">
      <div className="template-card-head">
        <div className="template-rank">{template.rank}位</div>
        <PokemonPortrait name={template.name} imageUrl={getPokemonImageUrl(template.name)} size="saved" />
        <div>
          <h4>{template.name}</h4>
          {showSet && <div className="template-set-name">{template.setName ?? "おすすめ型"}</div>}
          <div className="template-set-name">{formatTemplateUsage(template)}</div>
        </div>
      </div>
      <div className="template-lines">
        <div><b>持ち物</b> {templateUsageLabels(template.items).join("、")}</div>
        <div><b>テラ</b> {templateUsageLabels(template.teraTypes).join("、")}</div>
        <div><b>技</b> {templateUsageLabels(template.moves).join("、")}</div>
        <div><b>役割</b> {template.roleTags.join("、") || "汎用"}</div>
      </div>
      <div className="template-actions">
        <button type="button" className="btn-template-apply" onClick={() => onApply(template)}>フォームに反映</button>
        <button type="button" className="btn-template-add" onClick={() => onAdd(template)}>保存リストに追加</button>
      </div>
    </article>
  );
}

function BuildTemplateCard({ template, onAdd }: { template: MetaBuildTemplate; onAdd: (template: MetaBuildTemplate) => void }) {
  return (
    <article className="template-card template-card-build">
      <div className="template-card-head">
        <div className="template-rank">{template.rank}位</div>
        <div className="build-sprites" aria-hidden="true">
          {template.members.map((member) => (
            <PokemonPortrait key={`${template.rank}-${member.name}`} name={member.name} imageUrl={getPokemonImageUrl(member.name)} size="chip" />
          ))}
        </div>
        <div>
          <h4>{template.name}</h4>
          <div className="template-set-name">{template.rating ? `レート${Math.round(template.rating)}` : "テンプレ提案"}</div>
        </div>
      </div>
      <div className="template-lines">
        <div><b>6匹</b> {template.memberNames.join("、")}</div>
        <div><b>特徴</b> {template.feature}</div>
        <div><b>役割</b> {template.roleTags.join("、") || "汎用"}</div>
      </div>
      <div className="template-actions">
        <button type="button" className="btn-template-add" onClick={() => onAdd(template)}>6匹を追加</button>
      </div>
    </article>
  );
}

// ── BattleScreen ──────────────────────────────────────────────────────────────
const RANK_LABELS = ["1位", "2位", "3位"];
const RANK_COLORS = ["#f5a623", "#a0a0b0", "#c07a3a"];

function CollapsibleReasonNote({
  children,
  expanded,
  onToggle,
  ariaLabel,
}: {
  children: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [canToggle, setCanToggle] = useState(false);

  useEffect(() => {
    function measure() {
      const el = contentRef.current;
      if (!el) return;
      const previousClamp = el.style.webkitLineClamp;
      const previousDisplay = el.style.display;
      const previousOrient = el.style.webkitBoxOrient;
      const previousOverflow = el.style.overflow;
      const previousMaxHeight = el.style.maxHeight;

      el.style.display = "-webkit-box";
      el.style.webkitLineClamp = "5";
      el.style.webkitBoxOrient = "vertical";
      el.style.overflow = "hidden";
      el.style.maxHeight = "calc(1.65em * 5)";

      const hasOverflow = el.scrollHeight > el.clientHeight + 1;

      el.style.webkitLineClamp = previousClamp;
      el.style.display = previousDisplay;
      el.style.webkitBoxOrient = previousOrient;
      el.style.overflow = previousOverflow;
      el.style.maxHeight = previousMaxHeight;

      setCanToggle((current) =>
        current === hasOverflow ? current : hasOverflow,
      );
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  });

  const noteStateClass = expanded
    ? "reason-note-expanded"
    : "reason-note-collapsed";

  return (
    <div
      className={`reason-note ${noteStateClass}${canToggle ? " reason-note--toggleable" : ""}`}
      aria-label={ariaLabel}
    >
      <div className="reason-note-clip">
        <div ref={contentRef} className="reason-note-content">
          {children}
        </div>
        {!expanded && canToggle && (
          <div className="reason-note-fade" aria-hidden="true" />
        )}
      </div>
      {canToggle && (
        <div className="reason-note-footer">
          <button
            type="button"
            className="reason-note-toggle"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            {expanded ? "閉じる" : "続きを読む"}
          </button>
        </div>
      )}
    </div>
  );
}


const FALLBACK_POPULAR_POKEMON = [
  "ガブリアス",
  "サーナイト",
  "ドヒドイデ",
  "カバルドン",
  "アシレーヌ",
  "ドドゲザン",
  "ミミッキュ",
  "カイリュー",
  "ゲンガー",
  "ブリジュラス",
  "アーマーガア",
  "ハッサム",
];

const FALLBACK_POPULAR_TAGS: Record<string, string> = {
  ガブリアス: "高採用",
  サーナイト: "上位常連",
  ドヒドイデ: "受け寄り",
  カバルドン: "起点作成",
  アシレーヌ: "高採用",
  ドドゲザン: "対面性能",
  ミミッキュ: "対面性能",
  カイリュー: "上位常連",
  ゲンガー: "高速",
  ブリジュラス: "高採用",
  アーマーガア: "受け寄り",
  ハッサム: "対面性能",
};

type PopularPokemonCandidate = {
  name: string;
  trend: string;
  usageCount?: number;
  fromMeta: boolean;
};

type SpeechRecognitionResultItem = {
  transcript: string;
};

type SpeechRecognitionResultListItem = {
  0: SpeechRecognitionResultItem;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultListItem>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function getCanonicalPokemonName(name: string): string {
  const normalizedName = normalize(name);
  return (
    ALLOWED_POKEMON.find((pokemon) => normalize(pokemon) === normalizedName) ??
    name.trim()
  );
}

function buildPopularPokemonCandidates(
  metaData: MetaData | null,
  expanded: boolean,
): PopularPokemonCandidate[] {
  const limit = expanded ? 18 : 12;
  const metaCandidates = hasUsableMetaData(metaData)
    ? Object.entries(metaData.pokemon)
        .filter(([name]) => isAllowed(name) && getPokemonApiName(name))
        .sort(([, a], [, b]) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
        .slice(0, limit)
        .map(([name, entry], index) => ({
          name,
          usageCount: entry.usageCount,
          trend:
            index < 4
              ? "上位常連"
              : (entry.usageCount ?? 0) >= 20
                ? "高採用"
                : (POKEMON_META[name]?.roles?.[0] ?? FALLBACK_POPULAR_TAGS[name] ?? "採用傾向"),
          fromMeta: true,
        }))
    : [];

  if (metaCandidates.length > 0) return metaCandidates;

  return FALLBACK_POPULAR_POKEMON.slice(0, limit).map((name) => ({
    name,
    trend: FALLBACK_POPULAR_TAGS[name] ?? "候補",
    fromMeta: false,
  }));
}

function getOpponentStatus(name: string): { label: string; tone: "empty" | "ok" | "warn" | "info" } {
  if (!name.trim()) return { label: "＋ 追加", tone: "empty" };
  if (isAllowed(name)) return { label: "使用可能", tone: "ok" };
  if (getPokemonApiName(name)) return { label: "データ不足", tone: "info" };
  return { label: "未対応", tone: "warn" };
}

function BattleScreen({
  opponent,
  setOpponent,
  myTeam,
}: {
  opponent: string[];
  setOpponent: (o: string[]) => void;
  myTeam: MyPokemon[];
}) {
  const [publicMetaData, setPublicMetaData] = useState<MetaData | null>(null);
  const [expandedPredictionNotes, setExpandedPredictionNotes] = useState<
    Record<string, boolean>
  >({});
  const [expandedRecommendationNotes, setExpandedRecommendationNotes] =
    useState<Record<string, boolean>>({});
  const predictions = predictOpponent(opponent, publicMetaData);
  const [, setPokeApiCacheVersion] = useState(0);
  const [opponentMessage, setOpponentMessage] = useState("");
  const [listeningSlot, setListeningSlot] = useState<number | null>(null);
  const [showMorePopular, setShowMorePopular] = useState(false);
  const validCount = opponent.filter((s) => s.trim() && isAllowed(s)).length;
  const filledCount = opponent.filter((s) => s.trim()).length;
  const popularCandidates = buildPopularPokemonCandidates(
    publicMetaData,
    showMorePopular,
  );
  const speechRecognitionSupported = Boolean(
    typeof window !== "undefined" && getSpeechRecognitionConstructor(),
  );

  useEffect(() => {
    let active = true;
    loadMetaData().then((data) => {
      if (active) setPublicMetaData(data);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const namesToFetch = Array.from(
      new Set([
        ...predictions.map((prediction) => prediction.name),
        ...myTeam.map((pokemon) => pokemon.name),
        ...opponent.filter(Boolean),
        ...popularCandidates.map((candidate) => candidate.name),
      ]),
    ).filter((name) => {
      const cached = getCachedPokemonApiData(name);
      return (
        getPokemonApiName(name) &&
        (!cached || (!cached.imageUrl && !cached.officialArtworkUrl))
      );
    });

    if (namesToFetch.length === 0) return;

    Promise.allSettled(
      namesToFetch.map((name) => fetchPokemonApiData(name)),
    ).then(() => {
      if (!cancelled) setPokeApiCacheVersion((version) => version + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [
    predictions.map((prediction) => prediction.name).join("|"),
    myTeam.map((pokemon) => pokemon.name).join("|"),
    opponent.join("|"),
    popularCandidates.map((candidate) => candidate.name).join("|"),
  ]);

  const recommendations = recommendPlayerSelection(
    myTeam,
    predictions,
    publicMetaData,
  );

  function showOpponentMessage(message: string) {
    setOpponentMessage(message);
    window.setTimeout(() => setOpponentMessage(""), 2200);
  }

  function update(i: number, val: string) {
    const next = [...opponent];
    next[i] = val;
    setOpponent(next);
  }

  function clearSlot(i: number) {
    update(i, "");
    showOpponentMessage(`${i + 1}番を消しました`);
  }

  function moveSlot(i: number, direction: -1 | 1) {
    const target = i + direction;
    if (target < 0 || target >= opponent.length) return;
    const next = [...opponent];
    [next[i], next[target]] = [next[target], next[i]];
    setOpponent(next);
  }

  function clearAllOpponents() {
    if (!opponent.some((name) => name.trim())) return;
    if (window.confirm("相手のポケモンをすべて消しますか？")) {
      setOpponent(["", "", "", "", "", ""]);
      showOpponentMessage("すべて消しました");
    }
  }

  function addPopularPokemon(name: string) {
    const canonicalName = getCanonicalPokemonName(name);
    if (opponent.some((slot) => normalize(slot) === normalize(canonicalName))) {
      showOpponentMessage("すでに登録済みです");
      return;
    }
    const emptyIndex = opponent.findIndex((slot) => !slot.trim());
    if (emptyIndex === -1) {
      showOpponentMessage("6匹まで登録済みです");
      return;
    }
    const next = [...opponent];
    next[emptyIndex] = canonicalName;
    setOpponent(next);
    showOpponentMessage(`${canonicalName}を${emptyIndex + 1}番に追加しました`);
  }

  function startSpeechInput(slotIndex: number) {
    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      const fallbackText = window.prompt(`${slotIndex + 1}番に入れるポケモン名`);
      if (!fallbackText) return;
      update(slotIndex, getCanonicalPokemonName(fallbackText));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListeningSlot(slotIndex);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (!transcript) {
        showOpponentMessage("聞き取れませんでした");
        return;
      }
      update(slotIndex, getCanonicalPokemonName(transcript));
    };
    recognition.onerror = () => {
      showOpponentMessage("音声入力が使えませんでした");
      setListeningSlot(null);
    };
    recognition.onend = () => setListeningSlot(null);
    recognition.start();
  }

  function togglePredictionNote(key: string) {
    setExpandedPredictionNotes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function toggleRecommendationNote(key: string) {
    setExpandedRecommendationNotes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div className="screen">
      {/* ── 相手のパーティ入力 ──────────────────────────────────────── */}
      <div className="card opponent-team-card">
        <div className="opponent-input-header">
          <div>
            <div className="card-title">相手のポケモン入力</div>
            <div className="opponent-save-note">入力内容は自動で保存されます</div>
          </div>
          <div className="opponent-count-badge" aria-label={`入力済み ${filledCount} / 6`}>
            {filledCount} / 6
          </div>
        </div>

        <div className="opponent-toolbar opponent-toolbar--simple">
          <button
            type="button"
            className="retro-action-button"
            onClick={clearAllOpponents}
            disabled={filledCount === 0}
          >
            すべてクリア
          </button>
        </div>

        {opponentMessage && (
          <div className="opponent-message" role="status">
            {opponentMessage}
          </div>
        )}

        <div className="opponent-slot-list">
          {opponent.map((name, i) => {
            const status = getOpponentStatus(name);
            const displayName = name.trim();
            return (
              <div
                className={`opponent-team-slot${displayName ? " opponent-team-slot--filled" : ""}`}
                key={i}
              >
                <div className="opponent-slot-number">{i + 1}</div>
                <PokemonPortrait
                  name={displayName}
                  imageUrl={getPokemonImageUrl(displayName)}
                  size="slot"
                />
                <div className="opponent-slot-main">
                  <PokemonInput
                    value={name}
                    onChange={(val) => update(i, val)}
                    placeholder="＋ ポケモンを追加"
                    testId={`input-opponent-${i + 1}`}
                  />
                  <span className={`opponent-status-badge opponent-status-badge--${status.tone}`}>
                    {status.label}
                  </span>
                </div>
                <div className="opponent-slot-actions" aria-label={`${i + 1}番の操作`}>
                  <button
                    type="button"
                    className="slot-icon-button"
                    onClick={() => startSpeechInput(i)}
                    aria-label={`${i + 1}番を音声入力`}
                  >
                    {listeningSlot === i ? "…" : "🎤"}
                  </button>
                  <button
                    type="button"
                    className="slot-icon-button"
                    onClick={() => moveSlot(i, -1)}
                    disabled={i === 0}
                    aria-label={`${i + 1}番を上へ`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="slot-icon-button"
                    onClick={() => moveSlot(i, 1)}
                    disabled={i === opponent.length - 1}
                    aria-label={`${i + 1}番を下へ`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="slot-icon-button slot-icon-button--delete"
                    onClick={() => clearSlot(i)}
                    disabled={!displayName}
                    aria-label={`${i + 1}番を削除`}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="popular-pokemon-section">
          <div className="popular-pokemon-heading-row">
            <div>
              <div className="popular-pokemon-title">参考ポケモン</div>
              <div className="popular-pokemon-help">タップすると空いている枠に追加します</div>
            </div>
            <span className="popular-pokemon-source">
              {popularCandidates[0]?.fromMeta ? "補助データ順" : "固定候補"}
            </span>
          </div>
          <div className="popular-pokemon-grid">
            {popularCandidates.map((candidate) => (
              <button
                type="button"
                className="popular-pokemon-chip"
                key={candidate.name}
                onClick={() => addPopularPokemon(candidate.name)}
              >
                <PokemonPortrait
                  name={candidate.name}
                  imageUrl={getPokemonImageUrl(candidate.name)}
                  size="chip"
                />
                <span className="popular-pokemon-chip-text">
                  <strong>{candidate.name}</strong>
                  <small>
                    {candidate.trend}
                    {candidate.usageCount ? `・${candidate.usageCount}` : ""}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="popular-more-button"
            onClick={() => setShowMorePopular((prev) => !prev)}
          >
            {showMorePopular ? "少なく見る" : "もっと見る"}
          </button>
        </div>

        <p className="speech-fallback-note">
          {speechRecognitionSupported
            ? "音声入力は日本語で話してください。"
            : "音声入力が使えない場合は、入力欄をタップしてキーボードのマイクを使ってください。"}
        </p>
      </div>

      {/* ── 相手の選出予測 ──────────────────────────────────────────── */}
      <div className="card">
        <div className="result-section-title">相手の選出予測</div>
        <div className="result-meta-note">
          {hasUsableMetaData(publicMetaData)
            ? "入力された相手パーティから、チャンピオンズ実装データに基づく補助情報と役割・相性で3匹を予測します。"
            : "公開構築データは使いません。役割・相性からの推定で補助します。"}
        </div>
        {validCount === 0 ? (
          <div className="result-empty">
            <div className="result-empty-icon">🔍</div>
            <div className="result-empty-text">
              相手のポケモンを入力すると、選出予測が表示されます
            </div>
          </div>
        ) : (
          <>
            {predictions.map((p, i) => (
              <div
                className={`result-pokemon result-pokemon--rank-${i + 1}`}
                key={p.name}
                data-testid={`result-opponent-${i + 1}`}
              >
                <div
                  className="result-rank-badge"
                  style={{ background: RANK_COLORS[i] }}
                >
                  {RANK_LABELS[i]}
                </div>
                <PokemonPortrait
                  name={p.name}
                  imageUrl={getPokemonImageUrl(p.name)}
                  size="result"
                />
                <div className="result-info">
                  <div className="result-name">{p.name}</div>
                  <CollapsibleReasonNote
                    expanded={Boolean(expandedPredictionNotes[p.name])}
                    onToggle={() => togglePredictionNote(p.name)}
                    ariaLabel={`${p.name}の選出予測メモ`}
                  >
                    <div className="reason-note-row">
                      <span className="reason-note-label">採用根拠</span>
                      <span className="reason-note-value">{p.reason}</span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">予想型</span>
                      <span className="reason-note-value">
                        {p.predictedBuildType}
                      </span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">持ち物候補</span>
                      <span className="reason-note-value">
                        {formatMetaUsageList(
                          p.itemCandidates,
                          p.metaEntry ? "公開データ上では未確認" : "公開データ上では未確認",
                        )}
                      </span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">テラ候補</span>
                      <span className="reason-note-value">
                        {formatMetaUsageList(
                          p.teraCandidates,
                          p.metaEntry ? "公開データ上では未確認" : "公開データ上では未確認",
                        )}
                      </span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">役割タグ</span>
                      <span className="reason-note-value">{p.role}</span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">スコア内訳</span>
                      <span className="reason-note-value reason-note-score">
                        {p.scoreBreakdown
                          .map((b) => `${b.label} ${b.points > 0 ? `+${b.points}` : b.points}`)
                          .join(" / ")}
                      </span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">データ由来</span>
                      <span className="reason-note-value">{p.dataOriginLabel}</span>
                    </div>
                  </CollapsibleReasonNote>
                  <div className="result-tags result-tags--score-breakdown">
                    {p.scoreBreakdown.slice(0, 5).map((part) => (
                      <span
                        className="result-tag"
                        key={`${p.name}-${part.label}`}
                      >
                        {part.label}+{part.points}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="result-score">
                  <span className="result-score-num">{p.score}</span>
                  <span className="result-score-label">点</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── 自分のおすすめ選出 ──────────────────────────────────────── */}
      <div className="card">
        <div className="result-section-title result-section-title--green">
          自分のおすすめ選出
        </div>
        {myTeam.length === 0 ? (
          <div className="result-empty">
            <div className="result-empty-icon">📋</div>
            <div className="result-empty-text">
              自分のポケモンを登録すると、おすすめ選出が表示されます
            </div>
            <div className="result-empty-sub">
              「自分のポケモン登録」タブからチームを登録してください
            </div>
          </div>
        ) : validCount === 0 ? (
          <div className="result-empty">
            <div className="result-empty-icon">⬆️</div>
            <div className="result-empty-text">
              相手のポケモンを入力すると、おすすめ選出が表示されます
            </div>
            <div className="result-empty-sub">
              入力すると最適な選出が自動で表示されます
            </div>
          </div>
        ) : (
          <>
            <div className="result-meta-note">
              相手の予測上位3匹に対して、役割・相性からの推定でおすすめを表示します。
            </div>
            {recommendations.map((r, i) => (
              <div
                className={`result-pokemon result-pokemon--rank-${i + 1}`}
                key={r.pokemon.id}
                data-testid={`result-myteam-${i + 1}`}
              >
                <div
                  className="result-rank-badge"
                  style={{ background: RANK_COLORS[i] }}
                >
                  {RANK_LABELS[i]}
                </div>
                <PokemonPortrait
                  name={r.pokemon.name}
                  imageUrl={getPokemonImageUrl(r.pokemon.name)}
                  size="result"
                />
                <div className="result-info">
                  <div className="result-name">{r.pokemon.name}</div>
                  <div className="result-reason">{r.reason}</div>
                  <CollapsibleReasonNote
                    expanded={Boolean(
                      expandedRecommendationNotes[r.pokemon.id],
                    )}
                    onToggle={() => toggleRecommendationNote(r.pokemon.id)}
                    ariaLabel={`${r.pokemon.name}のおすすめメモ`}
                  >
                    <div className="reason-note-title">おすすめメモ</div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">おすすめ根拠</span>
                      <span className="reason-note-value">{r.reason}</span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">
                        有利に見られる相手
                      </span>
                      <span className="reason-note-value">
                        {r.advantagedOpponents.length > 0
                          ? r.advantagedOpponents.join(" / ")
                          : "大きく有利な相手は未判定です"}
                      </span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">強み</span>
                      <span className="reason-note-value reason-note-tags">
                        {r.strengths.length > 0 ? (
                          r.strengths.map((tag) => (
                            <span key={tag} className="reason-note-tag">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="reason-note-tag">汎用性</span>
                        )}
                      </span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">注意点</span>
                      <span className="reason-note-value">{r.caution}</span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">スコア内訳</span>
                      <span className="reason-note-value reason-note-score">
                        {r.breakdown
                          .map(
                            (b) =>
                              `${b.label} ${b.points > 0 ? `+${b.points}` : b.points}`,
                          )
                          .join(" / ")}
                      </span>
                    </div>
                    <div className="reason-note-row">
                      <span className="reason-note-label">データ由来</span>
                      <span className="reason-note-value">{r.dataOriginLabel}</span>
                    </div>
                  </CollapsibleReasonNote>
                  <div className="result-tags recommendation-ability">
                    <span className="result-tag">
                      努力値: {formatEVs(r.pokemon)}
                    </span>
                    {r.pokemon.item && (
                      <span className="result-tag">
                        持ち物: {r.pokemon.item}
                      </span>
                    )}
                    {r.pokemon.nature && (
                      <span className="result-tag">
                        性格: {r.pokemon.nature}
                      </span>
                    )}
                    {r.pokemon.teraType && (
                      <span className="result-tag">
                        テラ: {r.pokemon.teraType}
                      </span>
                    )}
                    {r.pokemon.ability && (
                      <span className="result-tag">
                        特性: {r.pokemon.ability}
                      </span>
                    )}
                    {r.pokemon.roleTags.map((tag) => (
                      <span key={tag} className="result-tag">
                        役割: {tag}
                      </span>
                    ))}
                    {[
                      r.pokemon.move1,
                      r.pokemon.move2,
                      r.pokemon.move3,
                      r.pokemon.move4,
                    ]
                      .filter(Boolean)
                      .map((move, idx) => (
                        <span key={`${move}-${idx}`} className="result-tag">
                          技: {move}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="result-score">
                  <span className="result-score-num result-score-num--green">
                    {r.score}
                  </span>
                  <span className="result-score-label">点</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
