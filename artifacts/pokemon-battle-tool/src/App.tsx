import { useState, useEffect, useRef } from "react";

type Screen = "register" | "battle";

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
}

// ── Allowed Pokémon (カタカナ) ───────────────────────────────────────────────
const ALLOWED_POKEMON: string[] = [
  "フシギバナ",
  "メガフシギバナ",
  "リザードン",
  "メガリザードンX",
  "メガリザードンY",
  "カメックス",
  "メガカメックス",
  "スピアー",
  "メガスピアー",
  "ピジョット",
  "メガピジョット",
  "ピカチュウ",
  "ライチュウ",
  "ライチュウ(アローラ)",
  "メガライチュウX",
  "メガライチュウY",
  "ピクシー",
  "メガピクシー",
  "キュウコン(アローラ)",
  "ウインディ",
  "ウインディ(ヒスイ)",
  "フーディン",
  "メガフーディン",
  "カイリキー",
  "ウツボット",
  "メガウツボット",
  "ヤドラン",
  "メガヤドラン",
  "ヤドラン(ガラル)",
  "ゲンガー",
  "メガゲンガー",
  "ガルーラ",
  "メガガルーラ",
  "スターミー",
  "メガスターミー",
  "カイロス",
  "メガカイロス",
  "ケンタロス",
  "ギャラドス",
  "メガギャラドス",
  "メタモン",
  "シャワーズ",
  "サンダース",
  "ブースター",
  "プテラ",
  "メガプテラ",
  "カビゴン",
  "カイリュー",
  "メガカイリュー",
  "メガニウム",
  "メガメガニウム",
  "バクフーン",
  "バクフーン(ヒスイ)",
  "オーダイル",
  "メガオーダイル",
  "アリアドス",
  "デンリュウ",
  "メガデンリュウ",
  "マリルリ",
  "ニョロトノ",
  "エーフィ",
  "ブラッキー",
  "ヤドキング",
  "ヤドキング(ガラル)",
  "ハガネール",
  "メガハガネール",
  "ハッサム",
  "メガハッサム",
  "ヘラクロス",
  "メガヘラクロス",
  "エアームド",
  "メガエアームド",
  "ヘルガー",
  "メガヘルガー",
  "バンギラス",
  "メガバンギラス",
  "ペリッパー",
  "サーナイト",
  "メガサーナイト",
  "ヤミラミ",
  "メガヤミラミ",
  "ボスゴドラ",
  "メガボスゴドラ",
  "ライボルト",
  "メガライボルト",
  "コータス",
  "チルタリス",
  "メガチルタリス",
  "ミロカロス",
  "ポワルン",
  "ジュペッタ",
  "メガジュペッタ",
  "アブソル",
  "メガアブソル",
  "メガアブソルZ",
  "オニゴーリ",
  "メタグロス",
  "メガメタグロス",
  "ドダイトス",
  "ゴウカザル",
  "エンペルト",
  "ミミロップ",
  "メガミミロップ",
  "ミカルゲ",
  "ガブリアス",
  "メガガブリアス",
  "メガガブリアスZ",
  "ルカリオ",
  "メガルカリオ",
  "メガルカリオZ",
  "カバルドン",
  "ユキノオー",
  "メガユキノオー",
  "マニューラ",
  "ドサイドン",
  "リーフィア",
  "グレイシア",
  "グライオン",
  "マンムー",
  "エルレイド",
  "メガエルレイド",
  "ユキメノコ",
  "メガユキメノコ",
  "ロトム",
  "ヒートロトム",
  "ウォッシュロトム",
  "フロストロトム",
  "スピンロトム",
  "カットロトム",
  "ジャローダ",
  "エンブオー",
  "メガエンブオー",
  "ダイケンキ",
  "ダイケンキ(ヒスイ)",
  "ドリュウズ",
  "メガドリュウズ",
  "タブンネ",
  "メガタブンネ",
  "ローブシン",
  "エルフーン",
  "ワルビアル",
  "ダストダス",
  "ゾロアーク",
  "ゾロアーク(ヒスイ)",
  "バイバニラ",
  "エモンガ",
  "マッギョ(ガラル)",
  "ゴルーグ",
  "メガゴルーグ",
  "サザンドラ",
  "ウルガモス",
  "ブリガロン",
  "メガブリガロン",
  "マフォクシー",
  "メガマフォクシー",
  "ゲッコウガ",
  "メガゲッコウガ",
  "ホルード",
  "ファイアロー",
  "ビビヨン",
  "フラエッテ(えいえん)",
  "メガフラエッテ",
  "トリミアン",
  "ニャオニクス♂",
  "ニャオニクス♀",
  "メガニャオニクス♂",
  "メガニャオニクス♀",
  "ギルガルド",
  "ブロスター",
  "エレザード",
  "ガチゴラス",
  "アマルルガ",
  "ニンフィア",
  "ルチャブル",
  "メガルチャブル",
  "ヌメルゴン",
  "クレッフィ",
  "オーロット",
  "パンプジン",
  "オンバーン",
  "ジュナイパー",
  "ジュナイパー(ヒスイ)",
  "ガオガエン",
  "アシレーヌ",
  "ドデカバシ",
  "ケケンカニ",
  "メガケケンカニ",
  "ルガルガン(まひる)",
  "ルガルガン(まよなか)",
  "ルガルガン(たそがれ)",
  "ドヒドイデ",
  "バンバドロ",
  "オニシズクモ",
  "エンニュート",
  "アマージョ",
  "ヤレユータン",
  "ミミッキュ",
  "ジジーロン",
  "メガジジーロン",
  "ジャラランガ",
  "アーマーガア",
  "タルップル",
  "サダイジャ",
  "ポットデス",
  "ブリムオン",
  "オーロンゲ",
  "バリコオル",
  "デスバーン",
  "マホイップ",
  "モルペコ",
  "ドラパルト",
  "バサギリ",
  "ガチグマ",
  "イダイトウ♂",
  "イダイトウ♀",
  "オオニューラ",
  "マスカーニャ",
  "ラウドボーン",
  "ウェーニバル",
  "パーモット",
  "イッカネズミ",
  "キョジオーン",
  "グレンアルマ",
  "ソウブレイズ",
  "スコヴィラン",
  "メガスコヴィラン",
  "デカヌチャン",
  "イルカマン",
  "ミミズズ",
  "キラフロル",
  "メガキラフロル",
  "ヘイラッシャ",
  "シャリタツ",
  "リキキリン",
  "ドドゲザン",
  "ヤバソチャ",
  "ブリジュラス",
  "カミツオロチ",
].filter(name => !name.startsWith("メガ"));

// ひらがな → カタカナ 変換
function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

// 正規化して比較（ひらがな・カタカナ両対応）
function normalize(str: string): string {
  return toKatakana(str.trim());
}

function isAllowed(name: string): boolean {
  if (!name.trim()) return false;
  const n = normalize(name);
  return ALLOWED_POKEMON.some(p => normalize(p) === n);
}

function getSuggestions(input: string): string[] {
  if (!input.trim()) return [];
  const n = normalize(input);
  return ALLOWED_POKEMON.filter(p => normalize(p).includes(n));
}

// ── PokemonInput ─────────────────────────────────────────────────────────────
interface PokemonInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  testId?: string;
  style?: React.CSSProperties;
}

function PokemonInput({ value, onChange, placeholder = "例: ガブリアス", testId, style }: PokemonInputProps) {
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
        <span className="suggestion-highlight">{name.slice(idx, idx + q.length)}</span>
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
        onChange={e => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => { if (value.trim()) setOpen(true); }}
      />
      {open && suggestions.length > 0 && (
        <div className="suggestions-list" role="listbox">
          {suggestions.map(s => (
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
          このポケモンはポケモンチャンピオンズでは使えません
        </div>
      )}
      {showOk && (
        <div className="field-ok-msg" data-testid="msg-valid-pokemon">
          OK
        </div>
      )}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
// ── Item List ──────────────────────────────────────────────────────────
const ITEMS: string[] = [
  // ── 道具 ──────────────────────────────────────────────────────────────────
  "おうじゃのしるし", "かいがらのすず", "かたいいし", "きあいのタスキ", "きあいのハチマキ",
  "きせきのタネ", "ぎんのこな", "くろいメガネ", "くろおび", "こだわりスカーフ",
  "じしゃく", "シルクのスカーフ", "しろいハーブ", "しんぴのしずく", "せんせいのツメ",
  "するどいくちばし", "たべのこし", "でんきだま", "どくバリ", "とけないこおり",
  "のろいのおふだ", "ひかりのこな", "ピントレンズ", "まがったスプーン", "メタルコート",
  "メンタルハーブ", "もくたん", "やわらかいすな", "ようせいのハネ", "りゅうのキバ",
  // ── きのみ ────────────────────────────────────────────────────────────────
  "イトケのみ", "ウタンのみ", "オッカのみ", "オレンのみ", "オボンのみ", "カゴのみ",
  "カシブのみ", "キーのみ", "クラボのみ", "シュカのみ", "ソクノのみ", "タンガのみ",
  "チーゴのみ", "ナナシのみ", "ナモのみ", "ハバンのみ", "バコウのみ", "ビアーのみ",
  "ヒメリのみ", "ホズのみ", "モモンのみ", "ヤチェのみ", "ヨプのみ", "ヨロギのみ",
  "ラムのみ", "リリバのみ", "リンドのみ", "ロゼルのみ",
  // ── メガストーン ──────────────────────────────────────────────────────────
  "アブソルナイト", "ウツボットナイト", "エアームドナイト", "エルレイドナイト",
  "エンブオナイト", "オーダイルナイト", "オニゴーリナイト", "カイリュナイト",
  "カイロスナイト", "カエンジシナイト", "ガブリアスナイト", "カメックスナイト",
  "ガメノデスナイト", "カラマネナイト", "ガルーラナイト", "ギャラドスナイト",
  "クチートナイト", "ゲッコウガナイト", "ゲンガナイト", "サーナイトナイト",
  "サメハダナイト", "ジガルデナイト", "ジジーロナイト", "シビルドナイト",
  "シャンデラナイト", "ジュペッタナイト", "スターミナイト", "スピアナイト",
  "ズルズキナイト", "タイレーツナイト", "タブンネナイト", "チャーレムナイト",
  "チルタリスナイト", "ディアンシナイト", "デンリュウナイト", "ドラミドナイト",
  "ドリュウズナイト", "ハガネールナイト", "バクーダナイト", "ハッサムナイト",
  "バンギラスナイト", "ピクシナイト", "ピジョットナイト", "フーディナイト",
  "フシギバナイト", "プテラナイト", "ブリガロナイト", "ヘラクロスナイト",
  "ヘルガナイト", "ペンドラナイト", "ボーマンダナイト", "ボスゴドラナイト",
  "マフォクシナイト", "ミミロップナイト", "メガニウムナイト", "メタグロスナイト",
  "ヤドランナイト", "ヤミラミナイト", "ユキノオナイト", "ユキメノコナイト",
  "ライボルトナイト", "リザードナイトX", "リザードナイトY", "ルカリオナイト",
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
    ? ITEMS.filter(it => toKatakana(it).includes(toKatakana(query.trim())))
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
  }, [open]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`item-picker-trigger${!value ? " item-picker-trigger--empty" : ""}`}
        onClick={() => setOpen(true)}
        data-testid="item-picker-trigger"
      >
        <span className="item-picker-value">{value || "持ち物を選択（タップして選ぶ）"}</span>
        {value ? (
          <span className="item-picker-clear-btn" onClick={clearValue} role="button" aria-label="クリア">✕</span>
        ) : (
          <span className="item-picker-arrow">›</span>
        )}
      </button>

      {open && (
        <div className="item-picker-backdrop" onClick={closeModal}>
          <div className="item-picker-sheet" onClick={e => e.stopPropagation()}>
            <div className="item-picker-handle" />
            <div className="item-picker-header">
              <span className="item-picker-title">持ち物を選ぶ</span>
              <button className="item-picker-close" onClick={closeModal} aria-label="閉じる">✕</button>
            </div>
            <div className="item-picker-search-wrap">
              <span className="item-picker-search-icon">🔍</span>
              <input
                ref={searchRef}
                className="item-picker-search"
                placeholder="検索..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button className="item-picker-search-clear" onClick={() => setQuery("")}>✕</button>
              )}
            </div>
            <div className="item-picker-list" role="listbox">
              {filtered.length === 0 ? (
                <div className="item-picker-empty">「{query}」は見つかりません</div>
              ) : (
                filtered.map(item => (
                  <div
                    key={item}
                    className={`item-picker-option${item === value ? " item-picker-option--selected" : ""}`}
                    role="option"
                    aria-selected={item === value}
                    onClick={() => select(item)}
                    data-testid={`item-option-${item}`}
                  >
                    <span>{item}</span>
                    {item === value && <span className="item-picker-check">✓</span>}
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
  "がんばりや", "さみしがり", "ゆうかん", "いじっぱり", "やんちゃ",
  "ずぶとい", "てれや", "のんき", "わんぱく", "のうてんき",
  "おくびょう", "せっかち", "まじめ", "ようき", "むじゃき",
  "ひかえめ", "おっとり", "れいせい", "おだやか", "うっかりや",
  "おとなしい", "なまいき", "しんちょう", "きまぐれ", "なんでもすき",
];

// ── Scoring System ────────────────────────────────────────────────────────────
interface PokemonTags {
  fast?: boolean;       // 素早さが高い → +2
  attacker?: boolean;   // 攻撃力が高い → +2
  lead?: boolean;       // 先発向き     → +3
  defensive?: boolean;  // 受け性能が高い → +1
  meta?: boolean;       // メタ上位・伝説 → +3
}

const POKEMON_SCORE_TABLE: Record<string, PokemonTags> = {
  // ─── 最強メタ ─────────────────────────────────────────────────────────────
  "ガブリアス":       { fast: true, attacker: true, lead: true, meta: true },
  "メガガブリアス":   { fast: true, attacker: true, meta: true },
  "カイリュー":       { attacker: true, meta: true },
  "メガカイリュー":   { attacker: true, meta: true },
  "ミミッキュ":       { lead: true, meta: true },
  "ドラパルト":       { fast: true, attacker: true, lead: true, meta: true },
  "ガオガエン":       { attacker: true, lead: true, meta: true },
  "ウルガモス":       { fast: true, attacker: true, meta: true },
  "バンギラス":       { attacker: true, defensive: true, meta: true },
  "メガバンギラス":   { attacker: true, defensive: true, meta: true },
  "ゲッコウガ":       { fast: true, attacker: true, meta: true },
  "メガゲッコウガ":   { fast: true, attacker: true, meta: true },
  "サザンドラ":       { fast: true, attacker: true, meta: true },
  "メタグロス":       { attacker: true, meta: true },
  "メガメタグロス":   { attacker: true, lead: true, meta: true },
  "ギルガルド":       { defensive: true, meta: true },
  "ジャラランガ":     { fast: true, attacker: true, meta: true },
  "ドリュウズ":       { fast: true, attacker: true, meta: true },
  "メガドリュウズ":   { fast: true, attacker: true, meta: true },
  "マニューラ":       { fast: true, attacker: true, meta: true },
  "ガチグマ":         { attacker: true, meta: true },
  "ブリジュラス":     { attacker: true, defensive: true, meta: true },
  "カミツオロチ":     { defensive: true, meta: true },
  "マスカーニャ":     { fast: true, attacker: true, meta: true },
  "ウェーニバル":     { attacker: true, meta: true },
  "グレンアルマ":     { fast: true, attacker: true, meta: true },
  "メガゲンガー":     { fast: true, attacker: true, meta: true },
  "メガルカリオ":     { fast: true, attacker: true, meta: true },
  "メガルカリオZ":    { fast: true, attacker: true, meta: true },
  "メガヘラクロス":   { attacker: true, meta: true },
  "ドドゲザン":       { attacker: true, meta: true },
  "オオニューラ":     { fast: true, attacker: true, meta: true },
  "イダイトウ♂":     { attacker: true, meta: true },
  "イダイトウ♀":     { fast: true, attacker: true, meta: true },
  "ジュナイパー":     { fast: true, attacker: true, meta: true },
  "ジュナイパー(ヒスイ)": { attacker: true, meta: true },
  "ルカリオ":         { fast: true, attacker: true },
  "ゲンガー":         { fast: true, attacker: true },
  "ヘラクロス":       { attacker: true },
  "バサギリ":         { fast: true, attacker: true },
  "ゾロアーク":       { fast: true, attacker: true },
  "ゾロアーク(ヒスイ)": { fast: true, attacker: true },
  // ─── 先発向き ──────────────────────────────────────────────────────────────
  "カバルドン":   { lead: true, defensive: true },
  "エルフーン":   { lead: true, fast: true },
  "コータス":     { lead: true, defensive: true },
  "アーマーガア": { lead: true, defensive: true },
  "ミカルゲ":     { lead: true },
  "クレッフィ":   { lead: true },
  "ペリッパー":   { lead: true },
  "ユキノオー":   { lead: true },
  "メガユキノオー": { lead: true, attacker: true },
  // ─── 受け・耐久 ────────────────────────────────────────────────────────────
  "ドヒドイデ":   { defensive: true },
  "エアームド":   { defensive: true },
  "メガエアームド": { defensive: true },
  "ヤドラン":     { defensive: true },
  "メガヤドラン": { defensive: true },
  "ヤドラン(ガラル)": { defensive: true },
  "ブリムオン":   { defensive: true },
  "キョジオーン": { defensive: true },
  "ヘイラッシャ": { defensive: true },
  "バンバドロ":   { defensive: true },
  "ヌメルゴン":   { defensive: true },
  "ハガネール":   { defensive: true },
  "メガハガネール": { defensive: true },
  "グライオン":   { fast: true, defensive: true },
  "カイロス":     { defensive: true },
  "マリルリ":     { defensive: true },
  "ニョロトノ":   { defensive: true },
  "ブラッキー":   { defensive: true },
  "エーフィ":     { fast: true },
  "ポットデス":   { defensive: true },
  "オーロット":   { defensive: true },
  "リキキリン":   { defensive: true },
  "ヤドキング":   { defensive: true },
  // ─── 高速アタッカー ───────────────────────────────────────────────────────
  "ファイアロー": { fast: true, attacker: true },
  "ウインディ":   { fast: true, attacker: true },
  "ウインディ(ヒスイ)": { fast: true, attacker: true },
  "サンダース":   { fast: true },
  "リーフィア":   { fast: true },
  "スターミー":   { fast: true },
  "メガスターミー": { fast: true, attacker: true },
  "カットロトム": { fast: true, attacker: true },
  "スピンロトム": { fast: true, attacker: true },
  // ─── 物理アタッカー ───────────────────────────────────────────────────────
  "カイリキー":   { attacker: true },
  "ローブシン":   { attacker: true },
  "ドサイドン":   { attacker: true },
  "マンムー":     { attacker: true, fast: true },
  "ガブリアスZ":  { attacker: true, fast: true, meta: true },
  "カビゴン":     { attacker: true, defensive: true },
  "ケンタロス":   { attacker: true, fast: true },
  "ギャラドス":   { attacker: true },
  "メガギャラドス": { attacker: true, meta: true },
  "ヘルガー":     { fast: true, attacker: true },
  "メガヘルガー": { fast: true, attacker: true },
};

function scorePokemon(name: string): { score: number; tags: PokemonTags } {
  const norm = normalize(name);
  const key = Object.keys(POKEMON_SCORE_TABLE).find(k => normalize(k) === norm);
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

function predictOpponent(slots: string[]): { name: string; score: number; reason: string }[] {
  const valid = slots.filter(s => s.trim() && isAllowed(s));
  return valid
    .map(name => {
      const { score, tags } = scorePokemon(name);
      return { name, score, reason: buildReason(tags) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ── My Team Recommendation ────────────────────────────────────────────────────
function getTags(name: string): PokemonTags {
  const norm = normalize(name);
  const key = Object.keys(POKEMON_SCORE_TABLE).find(k => normalize(k) === norm);
  return key ? POKEMON_SCORE_TABLE[key] : {};
}

function recommendMyTeam(
  myTeam: MyPokemon[],
  opponentTop3: { name: string; score: number; reason: string }[]
): { pokemon: MyPokemon; score: number; reason: string }[] {
  if (myTeam.length === 0 || opponentTop3.length === 0) return [];

  return myTeam
    .map(player => {
      const pTags = getTags(player.name);
      let score = 1;
      let countersCount = 0;
      const reasons: string[] = [];

      for (const opp of opponentTop3) {
        const oTags = getTags(opp.name);

        // Good matchup: attacker vs defensive/lead opponent
        const goodMatchup =
          (pTags.attacker && (oTags.defensive || oTags.lead)) ||
          (pTags.fast && pTags.attacker && oTags.lead);

        // Resists attacks: tanky player vs offensive opponent
        const resistsAttacks = pTags.defensive && (oTags.attacker || oTags.fast);

        if (goodMatchup) {
          score += 3;
          countersCount++;
        } else if (resistsAttacks) {
          score += 2;
        }
      }

      // Bonus: good against 2+ predicted opponents
      if (countersCount >= 2) score += 3;

      // Flat role bonuses
      if (pTags.fast && pTags.attacker) score += 2;
      if (pTags.defensive) score += 1;

      // Build reason string
      if (countersCount >= 2) reasons.push("相手の上位3匹に強く、通りが良いです");
      else if (countersCount === 1) reasons.push("相手の主力に有利を取れる");
      if (pTags.fast && pTags.attacker) reasons.push("高速アタッカー");
      if (pTags.defensive) reasons.push("耐久で粘れる");
      if (reasons.length === 0) reasons.push("汎用性が高い");

      return { pokemon: player, score, reason: reasons.join("・") };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function emptyForm(): Omit<MyPokemon, "id"> {
  return { name: "", evH: 0, evA: 0, evB: 0, evC: 0, evD: 0, evS: 0, move1: "", move2: "", move3: "", move4: "", nature: "", item: "" };
}

function formatEVs(p: MyPokemon): string {
  const stats: [string, number][] = [["H", p.evH], ["A", p.evA], ["B", p.evB], ["C", p.evC], ["D", p.evD], ["S", p.evS]];
  const nonZero = stats.filter(([, v]) => v > 0).map(([k, v]) => `${k}${v}`);
  return nonZero.length > 0 ? nonZero.join(" ") : "努力値なし";
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("register");
  const [myTeam, setMyTeam] = useState<MyPokemon[]>(() => {
    try {
      const saved = localStorage.getItem("myTeam");
      if (!saved) return [];
      const parsed = JSON.parse(saved) as MyPokemon[];
      // Migrate old format that used evs: string
      return parsed.map(p => ({
        ...p,
        evH: p.evH ?? 0, evA: p.evA ?? 0, evB: p.evB ?? 0,
        evC: p.evC ?? 0, evD: p.evD ?? 0, evS: p.evS ?? 0,
      }));
    } catch { return []; }
  });
  const [opponent, setOpponent] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("opponentSlots");
      return saved ? JSON.parse(saved) : ["", "", "", "", "", ""];
    } catch { return ["", "", "", "", "", ""]; }
  });
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("myTeam", JSON.stringify(myTeam));
  }, [myTeam]);

  useEffect(() => {
    localStorage.setItem("opponentSlots", JSON.stringify(opponent));
  }, [opponent]);

  function saveForm() {
    if (!form.name.trim() || !isAllowed(form.name)) return;
    if (editingId) {
      setMyTeam(prev => prev.map(p => p.id === editingId ? { ...form, id: editingId } : p));
      setEditingId(null);
    } else {
      setMyTeam(prev => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setForm(emptyForm());
  }

  function deleteEntry(id: string) {
    setMyTeam(prev => prev.filter(p => p.id !== id));
  }

  function editEntry(p: MyPokemon) {
    setEditingId(p.id);
    setForm({ name: p.name, evH: p.evH, evA: p.evA, evB: p.evB, evC: p.evC, evD: p.evD, evS: p.evS, move1: p.move1, move2: p.move2, move3: p.move3, move4: p.move4, nature: p.nature, item: p.item });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  return (
    <div id="app-root">
      <header className="site-header">
        <div className="site-header-icon" aria-hidden="true" />
        <div className="site-header-copy">
          <h1>ポケモンバトルツール（Web版）</h1>
          <p>最適な選出で勝利をつかめ！</p>
        </div>
      </header>

      {/* ── Webページ内ナビゲーション（2画面） ─────────────────────────── */}
      <nav className="tab-bar">
        <button
          className={`tab-btn${screen === "register" ? " tab-btn--active" : ""}`}
          onClick={() => { setScreen("register"); cancelEdit(); }}
          data-testid="tab-register"
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">自分のポケモン登録</span>
        </button>
        <button
          className={`tab-btn${screen === "battle" ? " tab-btn--active" : ""}`}
          onClick={() => setScreen("battle")}
          data-testid="tab-battle"
        >
          <span className="tab-icon">⚔️</span>
          <span className="tab-label">相手入力・最適選出</span>
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
          onCancelEdit={cancelEdit}
          editingId={editingId}
        />
      )}
      {screen === "battle" && (
        <BattleScreen opponent={opponent} setOpponent={setOpponent} myTeam={myTeam} />
      )}
    </div>
  );
}

// ── EVSection ─────────────────────────────────────────────────────────────────
const EV_MAX_SINGLE = 32;
const EV_MAX_TOTAL = 66;
const EV_STATS: { key: "evH" | "evA" | "evB" | "evC" | "evD" | "evS"; label: string; full: string }[] = [
  { key: "evH", label: "H", full: "HP" },
  { key: "evA", label: "A", full: "こうげき" },
  { key: "evB", label: "B", full: "ぼうぎょ" },
  { key: "evC", label: "C", full: "とくこう" },
  { key: "evD", label: "D", full: "とくぼう" },
  { key: "evS", label: "S", full: "すばやさ" },
];

function EVSection({ form, setForm }: { form: Omit<MyPokemon, "id">; setForm: (f: Omit<MyPokemon, "id">) => void }) {
  const total = EV_STATS.reduce((sum, s) => sum + (form[s.key] as number), 0);
  const remaining = EV_MAX_TOTAL - total;
  const overTotal = total > EV_MAX_TOTAL;
  const overSingle = EV_STATS.some(s => (form[s.key] as number) > EV_MAX_SINGLE);

  function handleChange(key: keyof typeof form, raw: string) {
    const val = raw === "" ? 0 : Math.max(0, parseInt(raw, 10) || 0);
    setForm({ ...form, [key]: val });
  }

  return (
    <div className="field">
      <div className="ev-header-row">
        <label className="field-label" style={{ margin: 0 }}>努力値</label>
        <div className={`ev-total${overTotal ? " ev-total--error" : remaining === 0 ? " ev-total--done" : ""}`}>
          合計 <strong>{total}</strong> / {EV_MAX_TOTAL}
        </div>
        <div className={`ev-remaining${overTotal ? " ev-remaining--error" : ""}`}>残り {Math.max(remaining, 0)}</div>
      </div>

      <div className="ev-grid">
        {EV_STATS.map(({ key, label, full }) => {
          const val = form[key] as number;
          const isOver = val > EV_MAX_SINGLE;
          return (
            <div key={key} className={`ev-cell ev-cell--${key}`}>
              <div className="ev-label">{label}</div>
              <div className="ev-sublabel">{full}</div>
              <input
                type="number"
                inputMode="numeric"
                className={`ev-input${isOver ? " ev-input-error" : ""}`}
                min={0}
                max={EV_MAX_SINGLE}
                value={val === 0 ? "" : val}
                placeholder="0"
                onChange={e => handleChange(key, e.target.value)}
                data-testid={`input-ev-${label.toLowerCase()}`}
              />
            </div>
          );
        })}
      </div>

      {overSingle && (
        <div className="field-error-msg" style={{ marginTop: 6 }} data-testid="error-ev-single">
          1つの能力は{EV_MAX_SINGLE}までです
        </div>
      )}
      {overTotal && (
        <div className="field-error-msg" style={{ marginTop: 6 }} data-testid="error-ev-total">
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
  onCancelEdit: () => void;
  editingId: string | null;
}

function RegisterScreen({ form, setForm, myTeam, onSave, onDelete, onEdit, onCancelEdit, editingId }: RegisterProps) {
  function f(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  const evTotal = EV_STATS.reduce((sum, s) => sum + (form[s.key] as number), 0);
  const evOk = evTotal <= EV_MAX_TOTAL && EV_STATS.every(s => (form[s.key] as number) <= EV_MAX_SINGLE);
  const canSave = form.name.trim() !== "" && isAllowed(form.name) && evOk;

  return (
    <div className="screen">
      <div className="card">
        <div className="card-title">{editingId ? "編集中" : "新しいポケモンを追加"}</div>

        <div className="field">
          <label className="field-label">ポケモン名</label>
          <PokemonInput
            value={form.name}
            onChange={val => setForm({ ...form, name: val })}
            placeholder="例: ガブリアス"
            testId="input-pokemon-name"
          />
        </div>

        <EVSection form={form} setForm={setForm} />

        <div className="field">
          <label className="field-label">技</label>
          <div className="moves-grid">
            <input className="field-input" placeholder="技1" value={form.move1} onChange={f("move1")} data-testid="input-move1" />
            <input className="field-input" placeholder="技2" value={form.move2} onChange={f("move2")} data-testid="input-move2" />
            <input className="field-input" placeholder="技3" value={form.move3} onChange={f("move3")} data-testid="input-move3" />
            <input className="field-input" placeholder="技4" value={form.move4} onChange={f("move4")} data-testid="input-move4" />
          </div>
        </div>

        <div className="field">
          <label className="field-label">性格</label>
          <select className="field-select" value={form.nature} onChange={f("nature")} data-testid="select-nature">
            <option value="">性格を選択</option>
            {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="field-label">持ち物</label>
          <ItemPicker
            value={form.item}
            onChange={val => setForm({ ...form, item: val })}
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
            <button className="btn-secondary" onClick={onCancelEdit} data-testid="btn-cancel-edit">
              キャンセル
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "4px 0" }}>
        <div className="card-title" style={{ padding: "0 4px 8px" }}>
          登録済み — {myTeam.length} 匹
        </div>

        {myTeam.length === 0 ? (
          <div className="empty-state">まだポケモンが登録されていません</div>
        ) : (
          <div className="pokemon-list">
            {myTeam.map(p => (
              <div className="pokemon-card" key={p.id} data-testid={`card-pokemon-${p.id}`}>
                <div className="pokemon-card-info">
                  <div className="pokemon-card-name">{p.name}</div>
                  <div className="pokemon-card-meta">
                    {p.nature && <span className="pokemon-card-tag">{p.nature}</span>}
                    {p.item && <span className="pokemon-card-tag">{p.item}</span>}
                    <span className="pokemon-card-tag">{formatEVs(p)}</span>
                    {[p.move1, p.move2, p.move3, p.move4].filter(Boolean).map((m, i) => (
                      <span className="pokemon-card-tag" key={i}>{m}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                  <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => onEdit(p)} data-testid={`btn-edit-${p.id}`}>編集</button>
                  <button className="btn-danger" onClick={() => onDelete(p.id)} data-testid={`btn-delete-${p.id}`}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── BattleScreen ──────────────────────────────────────────────────────────────
const RANK_LABELS = ["1位", "2位", "3位"];
const RANK_COLORS = ["#f5a623", "#a0a0b0", "#c07a3a"];

function BattleScreen({
  opponent, setOpponent, myTeam,
}: {
  opponent: string[];
  setOpponent: (o: string[]) => void;
  myTeam: MyPokemon[];
}) {
  const predictions = predictOpponent(opponent);
  const validCount = opponent.filter(s => s.trim() && isAllowed(s)).length;
  const recommendations = recommendMyTeam(myTeam, predictions);

  function update(i: number, val: string) {
    const next = [...opponent];
    next[i] = val;
    setOpponent(next);
  }

  return (
    <div className="screen">

      {/* ── 相手のパーティ入力 ──────────────────────────────────────── */}
      <div className="card">
        <div className="card-title">相手のポケモン入力（最大6匹）</div>
        {opponent.map((name, i) => (
          <div className="field" key={i} style={{ marginBottom: i < 5 ? 14 : 0 }}>
            <div className="opponent-slot" style={{ alignItems: "flex-start", gap: 10 }}>
              <div className="slot-num" style={{ marginTop: 12, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <PokemonInput
                  value={name}
                  onChange={val => update(i, val)}
                  placeholder={`ポケモン ${i + 1}`}
                  testId={`input-opponent-${i + 1}`}
                />
              </div>
            </div>
          </div>
        ))}
        <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 12 }}>
          入力内容は自動で保存されます
        </p>
      </div>

      {/* ── 相手の選出予想 ──────────────────────────────────────────── */}
      <div className="card">
        <div className="result-section-title">相手の選出予想</div>
        {validCount === 0 ? (
          <div className="result-empty">
            <div className="result-empty-icon">🔍</div>
            <div className="result-empty-text">相手のポケモンを入力してください</div>
            <div className="result-empty-sub">入力するとリアルタイムで予測が表示されます</div>
          </div>
        ) : (
          <>
            <div className="result-meta-note">
              {validCount}匹のパーティから選出されやすい3匹を予測しています
            </div>
            {predictions.map((p, i) => (
              <div className="result-pokemon" key={p.name} data-testid={`result-opponent-${i + 1}`}>
                <div className="result-rank-badge" style={{ background: RANK_COLORS[i] }}>
                  {RANK_LABELS[i]}
                </div>
                <div className="result-info">
                  <div className="result-name">{p.name}</div>
                  <div className="result-reason">{p.reason}</div>
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
        <div className="result-section-title result-section-title--green">自分のおすすめ選出</div>
        {myTeam.length === 0 ? (
          <div className="result-empty">
            <div className="result-empty-icon">📋</div>
            <div className="result-empty-text">自分のポケモンが登録されていません</div>
            <div className="result-empty-sub">「自分のポケモン登録」タブからチームを登録してください</div>
          </div>
        ) : validCount === 0 ? (
          <div className="result-empty">
            <div className="result-empty-icon">⬆️</div>
            <div className="result-empty-text">相手のポケモンを入力してください</div>
            <div className="result-empty-sub">入力すると最適な選出が自動で表示されます</div>
          </div>
        ) : (
          <>
            <div className="result-meta-note">
              登録済み{myTeam.length}匹の中から最も通りが良い3匹を提案しています
            </div>
            {recommendations.map((r, i) => (
              <div className="result-pokemon" key={r.pokemon.id} data-testid={`result-myteam-${i + 1}`}>
                <div className="result-rank-badge" style={{ background: RANK_COLORS[i] }}>
                  {RANK_LABELS[i]}
                </div>
                <div className="result-info">
                  <div className="result-name">{r.pokemon.name}</div>
                  <div className="result-reason">{r.reason}</div>
                  {(r.pokemon.nature || r.pokemon.item) && (
                    <div className="result-tags">
                      {r.pokemon.nature && <span className="result-tag">{r.pokemon.nature}</span>}
                      {r.pokemon.item && <span className="result-tag">{r.pokemon.item}</span>}
                    </div>
                  )}
                </div>
                <div className="result-score">
                  <span className="result-score-num result-score-num--green">{r.score}</span>
                  <span className="result-score-label">点</span>
                </div>
              </div>
            ))}
            <div className="result-score-legend">
              <div className="legend-title">スコアの内訳</div>
              <div className="legend-grid">
                <div className="legend-item"><span className="legend-tag">有利対面</span><span className="legend-score">+3</span></div>
                <div className="legend-item"><span className="legend-tag">2匹以上に強い</span><span className="legend-score">+3</span></div>
                <div className="legend-item"><span className="legend-tag">攻撃耐性</span><span className="legend-score">+2</span></div>
                <div className="legend-item"><span className="legend-tag">高速火力</span><span className="legend-score">+2</span></div>
                <div className="legend-item"><span className="legend-tag">耐久</span><span className="legend-score">+1</span></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
