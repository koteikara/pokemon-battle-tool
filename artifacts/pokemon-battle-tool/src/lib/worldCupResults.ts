export type WorldCupPredictionPick = "home" | "draw" | "away" | "unset";

export type WorldCupMatchStatus = "scheduled" | "in" | "final" | "postponed";

export type WorldCupMatch = {
  id: string;
  date: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: WorldCupMatchStatus;
  statusText: string;
  sourceUrl: string;
};

type EspnTeam = {
  displayName?: string;
  shortDisplayName?: string;
  name?: string;
};

type EspnCompetitor = {
  homeAway?: "home" | "away";
  score?: string;
  team?: EspnTeam;
};

type EspnStatus = {
  type?: {
    state?: string;
    completed?: boolean;
    description?: string;
    shortDetail?: string;
  };
};

type EspnCompetition = {
  competitors?: EspnCompetitor[];
  venue?: { fullName?: string };
  status?: EspnStatus;
};

type EspnEvent = {
  id?: string;
  date?: string;
  name?: string;
  shortName?: string;
  competitions?: EspnCompetition[];
};

type EspnScoreboard = {
  events?: EspnEvent[];
};

const ESPN_WORLD_CUP_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

export function getWorldCupScoreboardUrl(date: string) {
  return `${ESPN_WORLD_CUP_SCOREBOARD_URL}?dates=${date.replaceAll("-", "")}`;
}

function toScore(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function teamName(competitor: EspnCompetitor | undefined, fallback: string) {
  return (
    competitor?.team?.displayName ??
    competitor?.team?.shortDisplayName ??
    competitor?.team?.name ??
    fallback
  );
}

function statusFromEspn(status: EspnStatus | undefined): WorldCupMatchStatus {
  const type = status?.type;
  if (type?.completed) return "final";
  if (type?.state === "in") return "in";
  if (type?.state === "post") return "final";
  if (type?.state === "pre") return "scheduled";
  return "scheduled";
}

function parseEvent(event: EspnEvent): WorldCupMatch | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const competitors = competition.competitors ?? [];
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const away = competitors.find((competitor) => competitor.homeAway === "away");
  if (!home || !away) return null;

  const status = statusFromEspn(competition.status);
  return {
    id: event.id ?? `${event.date ?? "date"}-${teamName(home, "home")}-${teamName(away, "away")}`,
    date: event.date ?? "",
    venue: competition.venue?.fullName ?? "会場未定",
    homeTeam: teamName(home, "ホーム"),
    awayTeam: teamName(away, "アウェイ"),
    homeScore: toScore(home.score),
    awayScore: toScore(away.score),
    status,
    statusText:
      competition.status?.type?.description ??
      competition.status?.type?.shortDetail ??
      (status === "final" ? "試合終了" : "予定"),
    sourceUrl: "ESPN public scoreboard API",
  };
}

export async function fetchWorldCupMatches(date: string): Promise<WorldCupMatch[]> {
  const response = await fetch(getWorldCupScoreboardUrl(date));
  if (!response.ok) {
    throw new Error(`World Cup score fetch failed: ${response.status}`);
  }
  const data = (await response.json()) as EspnScoreboard;
  return (data.events ?? [])
    .map(parseEvent)
    .filter((match): match is WorldCupMatch => match !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getMatchWinner(match: WorldCupMatch): Exclude<WorldCupPredictionPick, "unset"> | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  if (match.homeScore > match.awayScore) return "home";
  if (match.homeScore < match.awayScore) return "away";
  return "draw";
}

export function getPickLabel(
  pick: WorldCupPredictionPick,
  match: Pick<WorldCupMatch, "homeTeam" | "awayTeam">,
) {
  if (pick === "home") return `${match.homeTeam} 勝ち`;
  if (pick === "away") return `${match.awayTeam} 勝ち`;
  if (pick === "draw") return "引き分け";
  return "未予想";
}
