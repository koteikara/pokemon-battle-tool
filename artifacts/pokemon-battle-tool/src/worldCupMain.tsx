import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";
import {
  fetchWorldCupMatches,
  getMatchWinner,
  getPickLabel,
  type WorldCupMatch,
  type WorldCupPredictionPick,
} from "./lib/worldCupResults";
import { getAllStaticWorldCupDates, getStaticWorldCupMatches } from "./lib/worldCupStaticSchedule";
import "./worldCup.css";

type Predictor = {
  id: string;
  name: string;
};

type PredictionState = Record<string, Record<string, WorldCupPredictionPick>>;

type SavedState = {
  predictors: Predictor[];
  predictions: PredictionState;
};

type PageMode = "predict" | "results";

type LoadState = "idle" | "loading" | "success" | "fallback" | "error";

const STORAGE_KEY = "world-cup-prediction-page-v2";
const MAX_PREDICTORS = 3;
const STATIC_DATES = getAllStaticWorldCupDates();

function japanDateValue(value = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function todayValue() {
  const today = japanDateValue();
  if (STATIC_DATES.includes(today)) return today;
  return STATIC_DATES[0] ?? today;
}

function makePredictor(name: string): Predictor {
  return { id: crypto.randomUUID(), name };
}

function readMode(): PageMode {
  return window.location.pathname.includes("world-cup-results") ? "results" : "predict";
}

function readSelectedDate() {
  const params = new URLSearchParams(window.location.search);
  const date = params.get("date");
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayValue();
}

function readSavedState(): SavedState {
  const fallback = { predictors: [makePredictor("予想する人1")], predictions: {} };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    const predictors = Array.isArray(parsed.predictors)
      ? parsed.predictors
          .filter((predictor): predictor is Predictor =>
            typeof predictor?.id === "string" && typeof predictor?.name === "string",
          )
          .slice(0, MAX_PREDICTORS)
      : [];

    return {
      predictors: predictors.length > 0 ? predictors : fallback.predictors,
      predictions: parsed.predictions && typeof parsed.predictions === "object" ? parsed.predictions : {},
    };
  } catch {
    return fallback;
  }
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00+09:00`));
}

function formatTimeLabel(value: string) {
  if (!value) return "時間未定";
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

function dateKey(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[\s・.]/g, "");
}

function stableMatchKey(match: Pick<WorldCupMatch, "date" | "homeTeam" | "awayTeam">) {
  return `${dateKey(match.date)}-${normalizeName(match.homeTeam)}-${normalizeName(match.awayTeam)}`;
}

const RESULT_UPDATE_DELAY_MINUTES = 135;
const RESULT_MATCH_TIME_TOLERANCE_MINUTES = 75;

function minutesBetween(a: string, b: string) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60_000;
}

function resultReadyAt(match: Pick<WorldCupMatch, "date">) {
  return new Date(new Date(match.date).getTime() + RESULT_UPDATE_DELAY_MINUTES * 60_000);
}

function isResultRefreshTime(staticMatches: WorldCupMatch[], now = new Date()) {
  return staticMatches.some((match) => resultReadyAt(match).getTime() <= now.getTime());
}

function canApplyResult(match: WorldCupMatch, now = new Date()) {
  return resultReadyAt(match).getTime() <= now.getTime();
}

function findFetchedResult(
  staticMatch: WorldCupMatch,
  fetchedMatches: WorldCupMatch[],
  usedIndexes: Set<number>,
) {
  const key = stableMatchKey(staticMatch);
  const exactIndex = fetchedMatches.findIndex(
    (match, index) => !usedIndexes.has(index) && stableMatchKey(match) === key,
  );
  if (exactIndex >= 0) return exactIndex;

  let nearestIndex = -1;
  let nearestDiff = Number.POSITIVE_INFINITY;
  fetchedMatches.forEach((match, index) => {
    if (usedIndexes.has(index)) return;
    const diff = minutesBetween(staticMatch.date, match.date);
    if (diff <= RESULT_MATCH_TIME_TOLERANCE_MINUTES && diff < nearestDiff) {
      nearestIndex = index;
      nearestDiff = diff;
    }
  });
  return nearestIndex;
}

function mergeMatches(staticMatches: WorldCupMatch[], fetchedMatches: WorldCupMatch[]) {
  if (fetchedMatches.length === 0) return staticMatches;

  const usedIndexes = new Set<number>();
  return staticMatches.map((staticMatch) => {
    if (!canApplyResult(staticMatch)) return staticMatch;

    const fetchedIndex = findFetchedResult(staticMatch, fetchedMatches, usedIndexes);
    if (fetchedIndex < 0) return staticMatch;
    usedIndexes.add(fetchedIndex);

    const fetched = fetchedMatches[fetchedIndex];
    return {
      ...staticMatch,
      homeScore: fetched.homeScore,
      awayScore: fetched.awayScore,
      status: fetched.status,
      statusText: fetched.statusText,
      sourceUrl: fetched.sourceUrl,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

function useWorldCupMatches(selectedDate: string) {
  const [matches, setMatches] = useState<WorldCupMatch[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let active = true;
    const staticMatches = getStaticWorldCupMatches(selectedDate);
    setMatches(staticMatches);
    setUpdatedAt("");

    if (!isResultRefreshTime(staticMatches)) {
      setState(staticMatches.length > 0 ? "fallback" : "error");
      setMessage(staticMatches.length > 0
        ? "日本時間の試合終了後に結果を更新します。"
        : "この日の国内向け日程データはまだありません。"
      );
      return () => {
        active = false;
      };
    }

    setState("loading");
    setMessage("");

    fetchWorldCupMatches(selectedDate)
      .then((fetchedMatches) => {
        if (!active) return;
        const merged = mergeMatches(staticMatches, fetchedMatches);
        setMatches(merged);
        const hasAppliedResult = merged.some((match) => match.homeScore !== null && match.awayScore !== null);
        setState(hasAppliedResult ? "success" : "fallback");
        setMessage(hasAppliedResult ? "終了した試合の結果を読みこみました。" : "終了した試合の結果はまだ見つかりません。");
        setUpdatedAt(new Intl.DateTimeFormat("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()));
      })
      .catch(() => {
        if (!active) return;
        setMatches(staticMatches);
        setUpdatedAt("");
        setState(staticMatches.length > 0 ? "fallback" : "error");
        setMessage(staticMatches.length > 0
          ? "結果の自動取得ができませんでした。日程データを表示しています。"
          : "試合データを取得できませんでした。"
        );
      });

    return () => {
      active = false;
    };
  }, [selectedDate, refreshNonce]);

  return { matches, state, message, updatedAt, refresh: () => setRefreshNonce((current) => current + 1) };
}

function FlagMark({ value, label }: { value?: string; label: string }) {
  if (!value) return <span className="wc-flag wc-flag--blank" aria-label={`${label}の旗`}>●</span>;
  if (value.startsWith("http")) {
    return <img className="wc-flag wc-flag--image" src={value} alt={`${label}の旗`} loading="lazy" />;
  }
  return <span className="wc-flag" aria-label={`${label}の旗`}>{value}</span>;
}

function MatchCard({
  match,
  predictors,
  predictions,
  mode,
  onPick,
}: {
  match: WorldCupMatch;
  predictors: Predictor[];
  predictions: PredictionState;
  mode: PageMode;
  onPick: (matchId: string, predictorId: string, pick: WorldCupPredictionPick) => void;
}) {
  const actualWinner = getMatchWinner(match);
  const hasResult = match.homeScore !== null && match.awayScore !== null;
  const statusClass = match.status === "final" ? "is-final" : match.status === "in" ? "is-live" : "";

  return (
    <article className="wc-match-card">
      <div className="wc-time-box">
        <span>{formatTimeLabel(match.date)}</span>
      </div>
      <div className="wc-card-body">
        <div className="wc-match-meta">
          <span className="wc-group">{match.stageName ?? match.groupName ?? "ワールドカップ"}</span>
          <span className={`wc-status ${statusClass}`}>{match.statusText}</span>
        </div>
        <div className="wc-teams">
          <div className="wc-team">
            <FlagMark value={match.homeFlag} label={match.homeTeam} />
            <strong>{match.homeTeam}</strong>
          </div>
          <div className="wc-score">
            {hasResult ? `${match.homeScore} - ${match.awayScore}` : "×"}
          </div>
          <div className="wc-team wc-team--away">
            <strong>{match.awayTeam}</strong>
            <FlagMark value={match.awayFlag} label={match.awayTeam} />
          </div>
        </div>
        <div className="wc-info-line">
          <span>{match.groupName ?? "大会"}</span>
          <span>{match.venue}</span>
          <span>{match.broadcasters?.length ? match.broadcasters.join(" / ") : "放送予定は確認中"}</span>
        </div>

        {mode === "predict" ? (
          <div className="wc-pick-list" aria-label="予想入力">
            {predictors.map((predictor) => {
              const pick = predictions[match.id]?.[predictor.id] ?? "unset";
              return (
                <label className="wc-pick-row" key={`${match.id}-${predictor.id}`}>
                  <span>{predictor.name || "なまえなし"}</span>
                  <select
                    value={pick}
                    onChange={(event) => onPick(match.id, predictor.id, event.target.value as WorldCupPredictionPick)}
                  >
                    <option value="unset">未予想</option>
                    <option value="home">{match.homeTeam} 勝ち</option>
                    <option value="draw">引き分け</option>
                    <option value="away">{match.awayTeam} 勝ち</option>
                  </select>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="wc-result-list" aria-label="結果照合">
            {predictors.map((predictor) => {
              const pick = predictions[match.id]?.[predictor.id] ?? "unset";
              const checked = actualWinner !== null && pick !== "unset";
              const hit = checked && actualWinner === pick;
              return (
                <div className="wc-result-row" key={`${match.id}-${predictor.id}`}>
                  <span>{predictor.name || "なまえなし"}</span>
                  <strong>{getPickLabel(pick, match)}</strong>
                  <em className={checked ? (hit ? "is-hit" : "is-miss") : ""}>
                    {checked ? (hit ? "的中" : "はずれ") : hasResult ? "未予想" : "試合前"}
                  </em>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

function WorldCupApp() {
  const [mode] = useState<PageMode>(readMode);
  const [selectedDate, setSelectedDate] = useState(readSelectedDate);
  const [predictors, setPredictors] = useState<Predictor[]>(() => readSavedState().predictors);
  const [predictions, setPredictions] = useState<PredictionState>(() => readSavedState().predictions);
  const { matches, state, message, updatedAt, refresh } = useWorldCupMatches(selectedDate);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ predictors, predictions }));
  }, [predictors, predictions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("date", selectedDate);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [selectedDate]);

  const scoreBoard = useMemo(() => {
    return predictors.map((predictor) => {
      const checked = matches
        .map((match) => {
          const winner = getMatchWinner(match);
          const pick = predictions[match.id]?.[predictor.id] ?? "unset";
          if (winner === null || pick === "unset") return null;
          return winner === pick;
        })
        .filter((value): value is boolean => value !== null);

      return { predictor, total: checked.length, correct: checked.filter(Boolean).length };
    });
  }, [matches, predictions, predictors]);

  function addPredictor() {
    setPredictors((current) => current.length >= MAX_PREDICTORS ? current : [...current, makePredictor(`予想する人${current.length + 1}`)]);
  }

  function updatePredictor(id: string, name: string) {
    setPredictors((current) => current.map((predictor) => predictor.id === id ? { ...predictor, name } : predictor));
  }

  function removePredictor(id: string) {
    setPredictors((current) => current.length <= 1 ? current : current.filter((predictor) => predictor.id !== id));
    setPredictions((current) => {
      const next: PredictionState = {};
      for (const [matchId, matchPredictions] of Object.entries(current)) {
        const { [id]: _removed, ...rest } = matchPredictions;
        next[matchId] = rest;
      }
      return next;
    });
  }

  function updatePick(matchId: string, predictorId: string, pick: WorldCupPredictionPick) {
    setPredictions((current) => ({
      ...current,
      [matchId]: { ...(current[matchId] ?? {}), [predictorId]: pick },
    }));
  }

  return (
    <div className="wc-page-shell">
      <header className="wc-hero">
        <div className="wc-hero-copy">
          <p className="wc-kicker">FIFA WORLD CUP 26</p>
          <h1>勝敗予想ボード</h1>
          <p>日程を見ながら予想。試合後は結果ページで的中チェック。</p>
        </div>
        <div className="wc-logo" aria-hidden="true"><span>26</span><strong>FIFA</strong></div>
      </header>

      <nav className="wc-page-tabs" aria-label="ページ切り替え">
        <a className={mode === "predict" ? "is-active" : ""} href={`./world-cup.html?date=${selectedDate}`}>予想入力ページ</a>
        <a className={mode === "results" ? "is-active" : ""} href={`./world-cup-results.html?date=${selectedDate}`}>結果ページ</a>
        <a href="./" className="wc-home-link">ポケモンツールへ</a>
      </nav>

      <section className="wc-control-panel">
        <div className="wc-date-control">
          <label htmlFor="wc-date">日にち</label>
          <input id="wc-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </div>
        <div className="wc-date-jump" aria-label="日付ショートカット">
          {STATIC_DATES.slice(0, 10).map((date) => (
            <button key={date} type="button" className={date === selectedDate ? "is-active" : ""} onClick={() => setSelectedDate(date)}>
              {formatDateLabel(date)}
            </button>
          ))}
        </div>
        <button type="button" className="wc-refresh" onClick={refresh}>結果を更新</button>
      </section>

      <div className={`wc-data-note wc-data-note--${state}`}>
        <strong>{state === "loading" ? "読みこみ中" : state === "success" ? "自動結果" : state === "fallback" ? "日程表示" : "確認が必要"}</strong>
        <span>{message || "試合データを準備しています。"}{updatedAt ? ` 最終更新 ${updatedAt}` : ""}</span>
      </div>

      {mode === "predict" ? (
        <section className="wc-predictor-panel">
          <div>
            <h2>予想する人</h2>
            <p>3人まで登録できます。名前と予想はこのブラウザに保存されます。</p>
          </div>
          <div className="wc-predictor-list">
            {predictors.map((predictor, index) => (
              <div className="wc-predictor-card" key={predictor.id}>
                <label htmlFor={`wc-predictor-${predictor.id}`}>人 {index + 1}</label>
                <input
                  id={`wc-predictor-${predictor.id}`}
                  value={predictor.name}
                  maxLength={16}
                  onChange={(event) => updatePredictor(predictor.id, event.target.value)}
                />
                {predictors.length > 1 ? <button type="button" onClick={() => removePredictor(predictor.id)}>けす</button> : null}
              </div>
            ))}
          </div>
          <button type="button" className="wc-add-person" onClick={addPredictor} disabled={predictors.length >= MAX_PREDICTORS}>人を追加</button>
        </section>
      ) : (
        <section className="wc-leader-panel">
          <h2>今日の的中数</h2>
          <div className="wc-leader-grid">
            {scoreBoard.map(({ predictor, correct, total }) => (
              <div className="wc-leader-card" key={predictor.id}>
                <span>{predictor.name || "なまえなし"}</span>
                <strong>{correct}/{total}</strong>
                <em>的中</em>
              </div>
            ))}
          </div>
        </section>
      )}

      <main className="wc-schedule" aria-label={`${formatDateLabel(selectedDate)}の試合`}>
        <div className="wc-day-label">
          <span>{formatDateLabel(selectedDate)}</span>
          <strong>{matches.length} 試合</strong>
        </div>
        {matches.length === 0 ? (
          <div className="wc-empty">この日の試合はまだ見つかりません。</div>
        ) : matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            predictors={predictors}
            predictions={predictions}
            mode={mode}
            onPick={updatePick}
          />
        ))}
      </main>
    </div>
  );
}

createRoot(document.getElementById("world-cup-root")!).render(<WorldCupApp />);
