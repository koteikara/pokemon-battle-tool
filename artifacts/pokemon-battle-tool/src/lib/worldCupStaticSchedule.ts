import type { WorldCupMatch } from "./worldCupResults";

type StaticMatchInput = {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  groupName: string;
  stageName?: string;
  venue?: string;
  broadcasters?: string[];
};

const DEFAULT_BROADCASTERS = ["DAZN", "NHK", "BSP4K"];

const STATIC_MATCHES: StaticMatchInput[] = [
  { date: "2026-06-12", time: "04:00", homeTeam: "メキシコ", awayTeam: "南アフリカ", homeFlag: "🇲🇽", awayFlag: "🇿🇦", groupName: "グループA", venue: "メキシコシティ", broadcasters: ["DAZN", "NHK", "BSP4K"] },
  { date: "2026-06-12", time: "11:00", homeTeam: "韓国", awayTeam: "チェコ", homeFlag: "🇰🇷", awayFlag: "🇨🇿", groupName: "グループA", venue: "ロサンゼルス" },
  { date: "2026-06-13", time: "04:00", homeTeam: "カナダ", awayTeam: "ボスニア・ヘルツェゴビナ", homeFlag: "🇨🇦", awayFlag: "🇧🇦", groupName: "グループB", venue: "トロント" },
  { date: "2026-06-13", time: "10:00", homeTeam: "アメリカ", awayTeam: "パラグアイ", homeFlag: "🇺🇸", awayFlag: "🇵🇾", groupName: "グループD", venue: "ロサンゼルス" },
  { date: "2026-06-14", time: "04:00", homeTeam: "カタール", awayTeam: "スイス", homeFlag: "🇶🇦", awayFlag: "🇨🇭", groupName: "グループB" },
  { date: "2026-06-14", time: "07:00", homeTeam: "ブラジル", awayTeam: "モロッコ", homeFlag: "🇧🇷", awayFlag: "🇲🇦", groupName: "グループC" },
  { date: "2026-06-14", time: "10:00", homeTeam: "ハイチ", awayTeam: "スコットランド", homeFlag: "🇭🇹", awayFlag: "🏴", groupName: "グループC" },
  { date: "2026-06-14", time: "13:00", homeTeam: "オーストラリア", awayTeam: "トルコ", homeFlag: "🇦🇺", awayFlag: "🇹🇷", groupName: "グループD" },
  { date: "2026-06-15", time: "02:00", homeTeam: "ドイツ", awayTeam: "キュラソー", homeFlag: "🇩🇪", awayFlag: "🇨🇼", groupName: "グループE" },
  { date: "2026-06-15", time: "05:00", homeTeam: "オランダ", awayTeam: "日本", homeFlag: "🇳🇱", awayFlag: "🇯🇵", groupName: "グループF", broadcasters: ["DAZN", "NHK", "BSP4K"] },
  { date: "2026-06-15", time: "08:00", homeTeam: "コートジボワール", awayTeam: "エクアドル", homeFlag: "🇨🇮", awayFlag: "🇪🇨", groupName: "グループE" },
  { date: "2026-06-15", time: "11:00", homeTeam: "スウェーデン", awayTeam: "チュニジア", homeFlag: "🇸🇪", awayFlag: "🇹🇳", groupName: "グループF" },
  { date: "2026-06-16", time: "01:00", homeTeam: "スペイン", awayTeam: "カーボベルデ", homeFlag: "🇪🇸", awayFlag: "🇨🇻", groupName: "グループH" },
  { date: "2026-06-16", time: "04:00", homeTeam: "ベルギー", awayTeam: "エジプト", homeFlag: "🇧🇪", awayFlag: "🇪🇬", groupName: "グループG" },
  { date: "2026-06-16", time: "07:00", homeTeam: "サウジアラビア", awayTeam: "ウルグアイ", homeFlag: "🇸🇦", awayFlag: "🇺🇾", groupName: "グループH" },
  { date: "2026-06-16", time: "10:00", homeTeam: "イラン", awayTeam: "ニュージーランド", homeFlag: "🇮🇷", awayFlag: "🇳🇿", groupName: "グループG" },
  { date: "2026-06-17", time: "04:00", homeTeam: "フランス", awayTeam: "セネガル", homeFlag: "🇫🇷", awayFlag: "🇸🇳", groupName: "グループI" },
  { date: "2026-06-17", time: "07:00", homeTeam: "イラク", awayTeam: "ノルウェー", homeFlag: "🇮🇶", awayFlag: "🇳🇴", groupName: "グループI" },
  { date: "2026-06-17", time: "10:00", homeTeam: "アルゼンチン", awayTeam: "アルジェリア", homeFlag: "🇦🇷", awayFlag: "🇩🇿", groupName: "グループJ" },
  { date: "2026-06-17", time: "13:00", homeTeam: "オーストリア", awayTeam: "ヨルダン", homeFlag: "🇦🇹", awayFlag: "🇯🇴", groupName: "グループJ" },
  { date: "2026-06-18", time: "02:00", homeTeam: "ポルトガル", awayTeam: "DRコンゴ", homeFlag: "🇵🇹", awayFlag: "🇨🇩", groupName: "グループK" },
  { date: "2026-06-18", time: "05:00", homeTeam: "イングランド", awayTeam: "クロアチア", homeFlag: "🏴", awayFlag: "🇭🇷", groupName: "グループL" },
  { date: "2026-06-18", time: "08:00", homeTeam: "ガーナ", awayTeam: "パナマ", homeFlag: "🇬🇭", awayFlag: "🇵🇦", groupName: "グループL" },
  { date: "2026-06-18", time: "11:00", homeTeam: "ウズベキスタン", awayTeam: "コロンビア", homeFlag: "🇺🇿", awayFlag: "🇨🇴", groupName: "グループK" },
  { date: "2026-06-19", time: "01:00", homeTeam: "チェコ", awayTeam: "南アフリカ", homeFlag: "🇨🇿", awayFlag: "🇿🇦", groupName: "グループA" },
  { date: "2026-06-19", time: "04:00", homeTeam: "スイス", awayTeam: "ボスニア・ヘルツェゴビナ", homeFlag: "🇨🇭", awayFlag: "🇧🇦", groupName: "グループB" },
  { date: "2026-06-19", time: "07:00", homeTeam: "カナダ", awayTeam: "カタール", homeFlag: "🇨🇦", awayFlag: "🇶🇦", groupName: "グループB" },
  { date: "2026-06-19", time: "10:00", homeTeam: "メキシコ", awayTeam: "韓国", homeFlag: "🇲🇽", awayFlag: "🇰🇷", groupName: "グループA", broadcasters: ["DAZN", "NHK", "BSP4K"] },
  { date: "2026-06-20", time: "04:00", homeTeam: "アメリカ", awayTeam: "オーストラリア", homeFlag: "🇺🇸", awayFlag: "🇦🇺", groupName: "グループD" },
  { date: "2026-06-20", time: "07:00", homeTeam: "スコットランド", awayTeam: "モロッコ", homeFlag: "🏴", awayFlag: "🇲🇦", groupName: "グループC" },
  { date: "2026-06-20", time: "09:30", homeTeam: "ブラジル", awayTeam: "ハイチ", homeFlag: "🇧🇷", awayFlag: "🇭🇹", groupName: "グループC" },
  { date: "2026-06-20", time: "12:00", homeTeam: "トルコ", awayTeam: "パラグアイ", homeFlag: "🇹🇷", awayFlag: "🇵🇾", groupName: "グループD" },
  { date: "2026-06-21", time: "02:00", homeTeam: "オランダ", awayTeam: "スウェーデン", homeFlag: "🇳🇱", awayFlag: "🇸🇪", groupName: "グループF" },
  { date: "2026-06-21", time: "05:00", homeTeam: "ドイツ", awayTeam: "コートジボワール", homeFlag: "🇩🇪", awayFlag: "🇨🇮", groupName: "グループE" },
  { date: "2026-06-21", time: "09:00", homeTeam: "エクアドル", awayTeam: "キュラソー", homeFlag: "🇪🇨", awayFlag: "🇨🇼", groupName: "グループE" },
  { date: "2026-06-21", time: "13:00", homeTeam: "チュニジア", awayTeam: "日本", homeFlag: "🇹🇳", awayFlag: "🇯🇵", groupName: "グループF", broadcasters: ["DAZN", "NHK BS", "BSP4K"] },
  { date: "2026-06-22", time: "01:00", homeTeam: "スペイン", awayTeam: "サウジアラビア", homeFlag: "🇪🇸", awayFlag: "🇸🇦", groupName: "グループH" },
  { date: "2026-06-22", time: "04:00", homeTeam: "ベルギー", awayTeam: "イラン", homeFlag: "🇧🇪", awayFlag: "🇮🇷", groupName: "グループG" },
  { date: "2026-06-22", time: "07:00", homeTeam: "ウルグアイ", awayTeam: "カーボベルデ", homeFlag: "🇺🇾", awayFlag: "🇨🇻", groupName: "グループH" },
  { date: "2026-06-22", time: "10:00", homeTeam: "ニュージーランド", awayTeam: "エジプト", homeFlag: "🇳🇿", awayFlag: "🇪🇬", groupName: "グループG" },
  { date: "2026-06-23", time: "02:00", homeTeam: "アルゼンチン", awayTeam: "オーストリア", homeFlag: "🇦🇷", awayFlag: "🇦🇹", groupName: "グループJ" },
  { date: "2026-06-23", time: "06:00", homeTeam: "フランス", awayTeam: "イラク", homeFlag: "🇫🇷", awayFlag: "🇮🇶", groupName: "グループI" },
  { date: "2026-06-23", time: "09:00", homeTeam: "ノルウェー", awayTeam: "セネガル", homeFlag: "🇳🇴", awayFlag: "🇸🇳", groupName: "グループI" },
  { date: "2026-06-23", time: "12:00", homeTeam: "ヨルダン", awayTeam: "アルジェリア", homeFlag: "🇯🇴", awayFlag: "🇩🇿", groupName: "グループJ" },
  { date: "2026-06-24", time: "02:00", homeTeam: "ポルトガル", awayTeam: "ウズベキスタン", homeFlag: "🇵🇹", awayFlag: "🇺🇿", groupName: "グループK" },
  { date: "2026-06-24", time: "05:00", homeTeam: "イングランド", awayTeam: "ガーナ", homeFlag: "🏴", awayFlag: "🇬🇭", groupName: "グループL" },
  { date: "2026-06-24", time: "08:00", homeTeam: "パナマ", awayTeam: "クロアチア", homeFlag: "🇵🇦", awayFlag: "🇭🇷", groupName: "グループL" },
  { date: "2026-06-24", time: "11:00", homeTeam: "コロンビア", awayTeam: "DRコンゴ", homeFlag: "🇨🇴", awayFlag: "🇨🇩", groupName: "グループK" },
  { date: "2026-06-25", time: "04:00", homeTeam: "スイス", awayTeam: "カナダ", homeFlag: "🇨🇭", awayFlag: "🇨🇦", groupName: "グループB" },
  { date: "2026-06-25", time: "04:00", homeTeam: "ボスニア・ヘルツェゴビナ", awayTeam: "カタール", homeFlag: "🇧🇦", awayFlag: "🇶🇦", groupName: "グループB" },
  { date: "2026-06-25", time: "07:00", homeTeam: "スコットランド", awayTeam: "ブラジル", homeFlag: "🏴", awayFlag: "🇧🇷", groupName: "グループC" },
  { date: "2026-06-25", time: "07:00", homeTeam: "モロッコ", awayTeam: "ハイチ", homeFlag: "🇲🇦", awayFlag: "🇭🇹", groupName: "グループC" },
  { date: "2026-06-25", time: "10:00", homeTeam: "チェコ", awayTeam: "メキシコ", homeFlag: "🇨🇿", awayFlag: "🇲🇽", groupName: "グループA" },
  { date: "2026-06-25", time: "10:00", homeTeam: "南アフリカ", awayTeam: "韓国", homeFlag: "🇿🇦", awayFlag: "🇰🇷", groupName: "グループA" },
  { date: "2026-06-26", time: "05:00", homeTeam: "キュラソー", awayTeam: "コートジボワール", homeFlag: "🇨🇼", awayFlag: "🇨🇮", groupName: "グループE" },
  { date: "2026-06-26", time: "08:00", homeTeam: "日本", awayTeam: "スウェーデン", homeFlag: "🇯🇵", awayFlag: "🇸🇪", groupName: "グループF", broadcasters: ["DAZN", "NHK", "BSP4K"] },
  { date: "2026-06-26", time: "11:00", homeTeam: "トルコ", awayTeam: "アメリカ", homeFlag: "🇹🇷", awayFlag: "🇺🇸", groupName: "グループD" },
  { date: "2026-06-26", time: "11:00", homeTeam: "パラグアイ", awayTeam: "オーストラリア", homeFlag: "🇵🇾", awayFlag: "🇦🇺", groupName: "グループD" },
  { date: "2026-06-29", time: "04:00", homeTeam: "A組2位", awayTeam: "B組2位", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "ラウンド32" },
  { date: "2026-06-30", time: "02:00", homeTeam: "C組1位", awayTeam: "F組2位", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "ラウンド32" },
  { date: "2026-06-30", time: "05:30", homeTeam: "E組1位", awayTeam: "ABCDF組3位", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "ラウンド32" },
  { date: "2026-06-30", time: "10:00", homeTeam: "F組1位", awayTeam: "C組2位", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "ラウンド32" },
  { date: "2026-07-05", time: "02:00", homeTeam: "ラウンド16", awayTeam: "カード未定", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "ラウンド16" },
  { date: "2026-07-10", time: "05:00", homeTeam: "準々決勝", awayTeam: "カード未定", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "準々決勝" },
  { date: "2026-07-15", time: "04:00", homeTeam: "準決勝", awayTeam: "カード未定", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "準決勝" },
  { date: "2026-07-19", time: "06:00", homeTeam: "3位決定戦", awayTeam: "カード未定", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "3位決定戦" },
  { date: "2026-07-20", time: "04:00", homeTeam: "決勝", awayTeam: "カード未定", homeFlag: "⚪", awayFlag: "⚪", groupName: "決勝トーナメント", stageName: "決勝" },
];

function toIsoDateTime(date: string, time: string) {
  return `${date}T${time}:00+09:00`;
}

export function getStaticWorldCupMatches(date: string): WorldCupMatch[] {
  return STATIC_MATCHES.filter((match) => match.date === date).map((match, index) => ({
    id: `static-${match.date}-${match.time}-${index}-${match.homeTeam}-${match.awayTeam}`,
    date: toIsoDateTime(match.date, match.time),
    venue: match.venue ?? "会場は公式発表を確認",
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeFlag: match.homeFlag,
    awayFlag: match.awayFlag,
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    statusText: "試合前",
    sourceUrl: "添付日程ベース",
    groupName: match.groupName,
    stageName: match.stageName ?? "グループステージ",
    broadcasters: match.broadcasters ?? DEFAULT_BROADCASTERS,
  }));
}

export function getAllStaticWorldCupDates() {
  return Array.from(new Set(STATIC_MATCHES.map((match) => match.date))).sort();
}
