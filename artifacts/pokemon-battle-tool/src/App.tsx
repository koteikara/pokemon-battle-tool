import { useState, useEffect, useRef } from "react";

type Screen = "home" | "register" | "opponent" | "result";

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
];

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
const NATURES = [
  "がんばりや", "さみしがり", "ゆうかん", "いじっぱり", "やんちゃ",
  "ずぶとい", "てれや", "のんき", "わんぱく", "のうてんき",
  "おくびょう", "せっかち", "まじめ", "ようき", "むじゃき",
  "ひかえめ", "おっとり", "れいせい", "おだやか", "うっかりや",
  "おとなしい", "なまいき", "しんちょう", "きまぐれ", "なんでもすき",
];

const DUMMY_OPPONENT = [
  { name: "カイリュー", reason: "はがねがないため選出されやすい", badge: "danger" },
  { name: "ガブリアス", reason: "構成的にじめんが厄介", badge: "danger" },
  { name: "サーフゴー", reason: "受け出しに来る可能性が高い", badge: "danger" },
];

const DUMMY_MYTEAM = [
  { name: "テツノカイナ", reason: "カイリューへの最高のカウンター", badge: "blue" },
  { name: "ランドロス", reason: "ガブリアスとの同速勝負を制す", badge: "blue" },
  { name: "ウーラオス", reason: "サーフゴーに打点を持てる", badge: "blue" },
];

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
  const [screen, setScreen] = useState<Screen>("home");
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

  const screenTitles: Record<Screen, string> = {
    home: "",
    register: "自分のポケモン登録",
    opponent: "相手を入力する",
    result: "結果を見る",
  };

  return (
    <div id="app-root">
      {screen !== "home" && (
        <header className="header">
          <button className="header-back" onClick={() => { setScreen("home"); setEditingId(null); setForm(emptyForm()); }} data-testid="btn-back">
            ←
          </button>
          <span className="header-title">{screenTitles[screen]}</span>
        </header>
      )}

      {screen === "home" && <HomeScreen onNavigate={setScreen} />}
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
      {screen === "opponent" && (
        <OpponentScreen opponent={opponent} setOpponent={setOpponent} />
      )}
      {screen === "result" && <ResultScreen />}
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div>
      <div className="home-hero">
        <div className="home-logo">
          <div className="home-logo-inner" />
        </div>
        <div className="home-title">ポケモン対戦支援ツール</div>
        <div className="home-sub">チーム管理・相手読み・選出サポート</div>
      </div>

      <div className="home-buttons">
        <button className="home-btn" onClick={() => onNavigate("register")} data-testid="btn-register">
          <div className="home-btn-icon" style={{ background: "#fff0f1" }}>
            <span style={{ fontSize: 22 }}>🗂</span>
          </div>
          <div className="home-btn-text">
            <div className="home-btn-label">自分のポケモン登録</div>
            <div className="home-btn-desc">技・努力値・性格を登録する</div>
          </div>
          <span className="home-btn-arrow">›</span>
        </button>

        <button className="home-btn" onClick={() => onNavigate("opponent")} data-testid="btn-opponent">
          <div className="home-btn-icon" style={{ background: "#f0f4ff" }}>
            <span style={{ fontSize: 22 }}>🔍</span>
          </div>
          <div className="home-btn-text">
            <div className="home-btn-label">相手を入力する</div>
            <div className="home-btn-desc">相手のポケモン6匹を入力</div>
          </div>
          <span className="home-btn-arrow">›</span>
        </button>

        <button className="home-btn" onClick={() => onNavigate("result")} data-testid="btn-result">
          <div className="home-btn-icon" style={{ background: "#f0fff4" }}>
            <span style={{ fontSize: 22 }}>⚔️</span>
          </div>
          <div className="home-btn-text">
            <div className="home-btn-label">結果を見る</div>
            <div className="home-btn-desc">相手選出予測・おすすめ選出を表示</div>
          </div>
          <span className="home-btn-arrow">›</span>
        </button>
      </div>

      {/* Allowed Pokémon info */}
      <div style={{ padding: "0 16px 32px" }}>
        <div className="card">
          <div className="card-title">使用可能なポケモン</div>
          <div style={{ fontSize: 15, color: "#444", lineHeight: 1.6 }}>
            ポケモンチャンピオンズの公式リストより
            <span style={{ fontWeight: 700, color: "#cc2233" }}> {ALLOWED_POKEMON.length}匹 </span>
            が登録されています。
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: "#999" }}>
            ポケモン名を入力すると候補が表示されます。ひらがなでも入力できます。
          </div>
        </div>
      </div>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label className="field-label" style={{ margin: 0 }}>努力値</label>
        <div style={{ fontSize: 13, color: overTotal ? "#cc2233" : remaining === 0 ? "#19a355" : "#888" }}>
          合計 <strong>{total}</strong> / {EV_MAX_TOTAL}
          {remaining > 0 && !overTotal && <span style={{ marginLeft: 6, color: "#aaa" }}>（残り{remaining}）</span>}
        </div>
      </div>

      <div className="ev-grid">
        {EV_STATS.map(({ key, label, full }) => {
          const val = form[key] as number;
          const isOver = val > EV_MAX_SINGLE;
          return (
            <div key={key} className="ev-cell">
              <div className="ev-label" title={full}>{label}</div>
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
          <input
            className="field-input"
            placeholder="例: こだわりスカーフ"
            value={form.item}
            onChange={f("item")}
            data-testid="input-item"
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

// ── OpponentScreen ────────────────────────────────────────────────────────────
function OpponentScreen({ opponent, setOpponent }: { opponent: string[]; setOpponent: (o: string[]) => void }) {
  function update(i: number, val: string) {
    const next = [...opponent];
    next[i] = val;
    setOpponent(next);
  }

  return (
    <div className="screen">
      <div className="card">
        <div className="card-title">相手のパーティ（最大6匹）</div>
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
      </div>
      <p style={{ fontSize: 12, color: "#aaa", textAlign: "center" }}>入力内容は自動で保存されます</p>
    </div>
  );
}

// ── ResultScreen ──────────────────────────────────────────────────────────────
function ResultScreen() {
  return (
    <div className="screen">
      <div className="dummy-notice">
        この画面は現在ダミー表示です。今後、実際の相手パーティと自分のチームをもとに計算予定です。
      </div>

      <div className="card">
        <div className="result-section-title">相手が選びそうな3匹</div>
        {DUMMY_OPPONENT.map((p, i) => (
          <div className="result-pokemon" key={p.name} data-testid={`result-opponent-${i + 1}`}>
            <div className={`result-rank rank-${i + 1}`}>{i + 1}</div>
            <div className="result-info">
              <div className="result-name">{p.name}</div>
              <div className="result-reason">{p.reason}</div>
            </div>
            <div className={`result-badge badge-${p.badge}`}>脅威</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="result-section-title">自分のおすすめ3匹</div>
        {DUMMY_MYTEAM.map((p, i) => (
          <div className="result-pokemon" key={p.name} data-testid={`result-myteam-${i + 1}`}>
            <div className={`result-rank rank-${i + 1}`}>{i + 1}</div>
            <div className="result-info">
              <div className="result-name">{p.name}</div>
              <div className="result-reason">{p.reason}</div>
            </div>
            <div className={`result-badge badge-${p.badge}`}>おすすめ</div>
          </div>
        ))}
      </div>
    </div>
  );
}
