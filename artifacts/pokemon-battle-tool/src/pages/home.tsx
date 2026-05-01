import React, { useEffect, useMemo, useState } from "react";
import { Plus, Shield, Sword } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { POKEMON_TYPES, Pokemon, PokemonType, getMultiplier } from "@/lib/pokemonLogic";

const STORAGE_KEY = "pokemon-battle-tool-data-v1";
const PRIORITIES = ["high", "medium", "low"] as const;
const ABILITY_LIST = [
  "アイスボディ","あくしゅう","あついしぼう","あとだし","アナライズ","あまのじゃく","あめうけざら","あめふらし","アロマベール","いかく","いしあたま","いたずらごころ","いやしのこころ","イリュージョン","うるおいボディ","おみとおし","おやこあい","かいりきバサミ","かげふみ","かそく","かたいツメ","かたやぶり","かちき","かるわざ","かわりもの","がんじょう","がんじょうあご","かんそうはだ","きけんよち","きもったま","きょううん","きょうせい","きんちょうかん","くいしんぼう","くだけるよろい","クリアボディ","げきりゅう","こんじょう","さいせいりょく","サンパワー","シェルアーマー","じしんかじょう","しぜんかいふく","しめりけ","しゅうかく","じゅうなん","しろいけむり","シンクロ","しんりょく","スイートベール","すいすい","スカイスキン","スキルリンク","すてみ","スナイパー","すなおこし","すなかき","すながくれ","すなのちから","すりぬけ","するどいめ","せいぎのこころ","せいしんりょく","せいでんき","そうしょく","たいねつ","だっぴ","ちからずく","ちからもち","ちくでん","ちどりあし","ちょすい","てきおうりょく","テクニシャン","てつのこぶし","テレパシー","てんきや","てんねん","とうそうしん","どくしゅ","どくのトゲ","トレース","どんかん","ぬめぬめ","ねんちゃく","ノーガード","ノーてんき","のろわれボディ","ハードロック","はっこう","はとむね","バトルスイッチ","はやあし","はやおき","はりきり","ひでり","ひらいしん","ファーコート","フィルター","フェアリーオーラ","フェアリースキン","ぶきよう","ふくがん","ふくつのこころ","ふしぎなうろこ","ふみん","ふゆう","プラス","フラワーベール","フリーズスキン","プレッシャー","フレンドガード","ヘヴィメタル","へんげんじざい","ポイズンヒール","ぼうおん","ぼうじん","ぼうだん","ほおぶくろ","ほのおのからだ","マイナス","マイペース","マグマのよろい","まけんき","マジックガード","マジックミラー","ミイラ","むしのしらせ","ムラっけ","メガランチャー","メロメロボディ","めんえき","もうか","ものひろい","もらいび","やるき","ゆうばく","ゆきがくれ","ゆきふらし","ようりょくそ","ヨガパワー","ライトメタル","リーフガード","りんぷん","わるいてぐせ","ぎゃくじょう","ふしょく","ばけのかわ","じきゅうりょく","とびだすなかみ","サーフテール","レシーバー","じょおうのいげん","ゆきかき","えんかく","うるおいボイス","ひとでなし","すいほう","ミラーアーマー","すなはき","ぎたい","じゅくせい","さまようたましい","バリアフリー","はらぺこスイッチ","すじがねいり","ふかしのこぶし","クイックドロウ","さめはだ","でんきエンジン","いかりのつぼ","マルチスケイル","はやてのつばさ","マジシャン","きみょうなくすり","テイルアーマー","でんきにかえる","はんすう","どしょく","びんじょう","マイティチェンジ","どくげしょう","そうだいしょう","きれあじ","きよめのしお","かんろなミツ","おもてなし","メガソーラー","ドラゴンスキン","かんつうドリル","とびだすハバネロ"
] as const;

type Priority = (typeof PRIORITIES)[number];

const priorityLabel: Record<Priority, string> = { high: "高", medium: "中", low: "低" };
const priorityScore: Record<Priority, number> = { high: 2, medium: 0, low: -1 };

const normalizePokemon = (p: Partial<Pokemon>, id = crypto.randomUUID()): Pokemon => ({
  id: p.id ?? id,
  name: p.name ?? "",
  type1: p.type1 ?? "",
  type2: p.type2 ?? "",
  ability: p.ability ?? "",
  teraType: p.teraType ?? "",
  canMega: p.canMega ?? false,
  roleMemo: p.roleMemo ?? "",
  priority: (p.priority as Priority) ?? "medium",
  memo: p.memo ?? "",
  item: p.item ?? "",
});

const newPokemon = () => normalizePokemon({});

function TypeSelect({ value, onChange, placeholder }: { value: PokemonType; onChange: (v: PokemonType) => void; placeholder: string }) {
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : (v as PokemonType))}>
      <SelectTrigger className="h-11"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">なし</SelectItem>
        {POKEMON_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function AbilitySelect({ value, onChange, placeholder = "特性を選択" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => ABILITY_LIST.filter((ability) => ability.includes(value)).slice(0, 20), [value]);

  return (
    <div className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
          <button type="button" className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted" onMouseDown={(e) => e.preventDefault()} onClick={() => onChange("")}>
            未選択
          </button>
          {filtered.map((ability) => (
            <button key={ability} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-muted" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(ability); setOpen(false); }}>
              {ability}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [userTeam, setUserTeam] = useState<Pokemon[]>([newPokemon()]);
  const [opponents, setOpponents] = useState<Pokemon[]>(Array.from({ length: 6 }, () => newPokemon()));
  const [form, setForm] = useState<Pokemon>(newPokemon());
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.userTeam)) setUserTeam(data.userTeam.map((p: Partial<Pokemon>) => normalizePokemon(p)));
    if (Array.isArray(data.opponents)) {
      const next = data.opponents.map((p: Partial<Pokemon>) => normalizePokemon(p)).slice(0, 6);
      while (next.length < 6) next.push(newPokemon());
      setOpponents(next);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userTeam, opponents }));
  }, [userTeam, opponents]);

  const addOrUpdate = () => {
    if (editingId) {
      setUserTeam((prev) => prev.map((p) => (p.id === editingId ? { ...form, id: editingId } : p)));
    } else if (userTeam.length < 6) {
      setUserTeam((prev) => [...prev, normalizePokemon(form)]);
    }
    setForm(newPokemon());
    setEditingId(null);
  };

  const predictions = useMemo(() => opponents.filter((p) => p.name.trim()).map((p) => {
    const roleMemo = `${p.roleMemo} ${p.memo}`;
    const speedType = roleMemo.includes("高速") ? "高速アタッカー" : roleMemo.includes("耐久") ? "耐久型" : roleMemo.includes("物理") ? "物理アタッカー" : roleMemo.includes("特殊") ? "特殊アタッカー" : "先発向き";
    const itemCandidates = speedType.includes("高速") ? ["こだわりスカーフ", "きあいのタスキ"] : speedType.includes("耐久") ? ["たべのこし", "オボンのみ"] : speedType.includes("物理") ? ["きあいのタスキ", "こだわりスカーフ", "ピントレンズ"] : speedType.includes("特殊") ? ["こだわりスカーフ", "しろいハーブ"] : ["きあいのタスキ", "オボンのみ"];
    const moves = speedType.includes("耐久") ? ["回復技", "状態異常技", "守る系", "削り技"] : speedType.includes("特殊") ? ["高威力特殊技", "範囲技", "補助技", "サブウェポン"] : ["高威力物理技", "先制技", "積み技", "サブウェポン"];
    return { p, speedType, reason: speedType === "高速アタッカー" ? "素早さが高めの想定" : speedType === "耐久型" ? "耐久寄りの想定" : speedType === "先発向き" ? "先発で使われやすい想定" : "攻撃的な想定", itemCandidates, moves };
  }), [opponents]);

  const recommendations = useMemo(() => userTeam.map((u) => {
    let score = priorityScore[u.priority ?? "medium"];
    const breakdown: string[] = [`優先度${priorityLabel[u.priority ?? "medium"]}:${score >= 0 ? "+" : ""}${score}`];
    if ((u.roleMemo ?? "").includes("先発") && predictions.length > 0) { score += 1; breakdown.push("先発補正:+1"); }
    if ((u.roleMemo ?? "").includes("耐久")) { score += 1; breakdown.push("耐久補正:+1"); }
    if ((u.roleMemo ?? "").includes("高速") || (u.roleMemo ?? "").includes("アタッカー")) { score += 1; breakdown.push("攻撃補正:+1"); }
    if (["きあいのタスキ", "こだわりスカーフ", "たべのこし", "オボンのみ"].includes(u.item ?? "")) { score += 1; breakdown.push(`持ち物補正(${u.item}):+1`); }
    return { ...u, score, breakdown };
  }).sort((a, b) => b.score - a.score).slice(0, 3), [userTeam, predictions.length]);

  return <div className="min-h-[100dvh] bg-background pb-12 w-full flex justify-center">
    <div className="w-full max-w-[480px] px-3 py-4 flex flex-col gap-4 overflow-x-hidden">
      <Card className="overflow-hidden"><CardHeader><CardTitle>1. 自分のポケモン登録</CardTitle></CardHeader><CardContent className="space-y-3">
        {editingId && <p className="text-sm text-primary">編集中：{userTeam.find((p) => p.id === editingId)?.name || "ポケモン"}</p>}
        <Input value={form.name} placeholder="ポケモン名" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2"><TypeSelect value={form.type1} onChange={(v) => setForm({ ...form, type1: v })} placeholder="タイプ1" /><TypeSelect value={form.type2} onChange={(v) => setForm({ ...form, type2: v })} placeholder="タイプ2" /></div>
        <AbilitySelect value={form.ability ?? ""} placeholder="例：さめはだ" onChange={(ability) => setForm({ ...form, ability })} />
        <TypeSelect value={form.teraType ?? ""} onChange={(v) => setForm({ ...form, teraType: v })} placeholder="テラスタイプ" />
        <Input value={form.item ?? ""} placeholder="持ち物" onChange={(e) => setForm({ ...form, item: e.target.value })} />
        <Input value={form.roleMemo ?? ""} placeholder="役割メモ（例: 先発 / 耐久 / 高速アタッカー）" onChange={(e) => setForm({ ...form, roleMemo: e.target.value })} />
        <Select value={form.priority ?? "medium"} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}><SelectTrigger><SelectValue placeholder="優先度" /></SelectTrigger><SelectContent><SelectItem value="high">高</SelectItem><SelectItem value="medium">中</SelectItem><SelectItem value="low">低</SelectItem></SelectContent></Select>
        <div className="flex items-center gap-2"><Checkbox checked={form.canMega ?? false} onCheckedChange={(v) => setForm({ ...form, canMega: Boolean(v) })} /><span className="text-sm">メガシンカ可</span></div>
        <Textarea value={form.memo ?? ""} placeholder="メモ欄" onChange={(e) => setForm({ ...form, memo: e.target.value })} />
        <Button className="w-full h-11" onClick={addOrUpdate}>{editingId ? "更新する" : "登録する"}</Button>
        <div className="text-xs text-muted-foreground text-center">{userTeam.length}/6 登録済み</div>
        {userTeam.map((p) => <div key={p.id} className="border rounded-lg p-3 space-y-2">
          <div className="font-semibold">{p.name || "未設定"}</div>
          <div className="flex flex-wrap gap-1 text-xs">
            {[p.type1, p.type2, p.ability ? `特性:${p.ability}` : "特性未設定", p.teraType && `テラ:${p.teraType}`, p.item && `持ち物:${p.item}`, p.roleMemo && `役割:${p.roleMemo}`, `優先度:${priorityLabel[p.priority ?? "medium"]}`, p.canMega ? "メガシンカ可" : "メガシンカ不可"].filter(Boolean).map((x, i) => <Badge key={i} variant="secondary">{x}</Badge>)}
          </div>
          {p.memo && <p className="text-xs text-muted-foreground break-words">{p.memo}</p>}
          <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setEditingId(p.id); setForm(p); }}>編集</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm("このポケモンを削除しますか？")) { setUserTeam((prev) => prev.filter((x) => x.id !== p.id)); if (editingId === p.id) { setEditingId(null); setForm(newPokemon()); } } }}>削除</Button></div>
        </div>)}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>2. 相手入力・最適選出</CardTitle></CardHeader><CardContent className="space-y-3">
        {opponents.map((p, i) => <div key={p.id} className="border rounded-lg p-3 space-y-2">
          <Input value={p.name} placeholder={`相手${i + 1}`} onChange={(e) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
          <div className="grid grid-cols-2 gap-2"><TypeSelect value={p.type1} onChange={(v) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, type1: v } : x))} placeholder="タイプ1" /><TypeSelect value={p.type2} onChange={(v) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, type2: v } : x))} placeholder="タイプ2" /></div>
          <AbilitySelect value={p.ability ?? ""} placeholder="特性を選択" onChange={(ability) => setOpponents((prev) => prev.map((x, idx) => idx === i ? { ...x, ability } : x))} />
        </div>)}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>予測とおすすめ</CardTitle></CardHeader><CardContent className="space-y-3">
        <div><p className="text-sm font-semibold mb-1">相手の選出予測（上位3）</p>{predictions.slice(0, 3).map(({ p, speedType, reason, itemCandidates, moves }) => <div key={p.id} className="border rounded-lg p-3 mb-2 space-y-2"><div className="font-semibold">{p.name}</div><div className="flex flex-wrap gap-1"><Badge>{speedType}</Badge><Badge variant="secondary">{reason}</Badge></div><div className="flex flex-wrap gap-1">{itemCandidates.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div><div className="flex flex-wrap gap-1">{moves.map((m) => <Badge key={m} variant="secondary">{m}</Badge>)}</div></div>)}</div>
        <div><p className="text-sm font-semibold mb-1">自分のおすすめ選出（上位3）</p>{recommendations.map((r) => <div key={r.id} className="border rounded-lg p-3 mb-2"><div className="flex justify-between"><span className="font-semibold">{r.name}</span><span className="text-sm">{r.score}点</span></div><div className="flex flex-wrap gap-1 my-1">{[r.ability && `特性:${r.ability}`, r.teraType && `テラ:${r.teraType}`, r.item && `持ち物:${r.item}`, r.roleMemo && `役割:${r.roleMemo}`, `優先度:${priorityLabel[r.priority ?? "medium"]}`].filter(Boolean).map((x, i) => <Badge key={i} variant="secondary">{x}</Badge>)}</div>{r.memo && <p className="text-xs text-muted-foreground break-words">{r.memo}</p>}<p className="text-xs text-muted-foreground break-words">内訳: {r.breakdown.join(" / ")}</p></div>)}</div>
      </CardContent></Card>
    </div>
  </div>;
}
