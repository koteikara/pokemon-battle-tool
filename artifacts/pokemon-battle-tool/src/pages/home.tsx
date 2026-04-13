import React, { useState, useMemo } from "react";
import { Plus, Trash2, Shield, Sword } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POKEMON_TYPES, PokemonType, Pokemon, getMultiplier } from "@/lib/pokemonLogic";

function TypeSelect({ value, onChange, placeholder }: { value: PokemonType; onChange: (v: PokemonType) => void; placeholder: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">なし</SelectItem>
        {POKEMON_TYPES.map((t) => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PokemonForm({ 
  pokemon, 
  onChange, 
  onRemove, 
  isOpponent = false 
}: { 
  pokemon: Pokemon; 
  onChange: (p: Pokemon) => void; 
  onRemove?: () => void;
  isOpponent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-secondary/50 rounded-xl relative border border-border/50">
      {onRemove && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          data-testid={`button-remove-${pokemon.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
      
      <div className="pt-2">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          ポケモン名 {isOpponent ? "(相手)" : ""}
        </label>
        <Input 
          className="h-11 bg-background" 
          placeholder={isOpponent ? "相手のポケモン" : "例: ピカチュウ"} 
          value={pokemon.name}
          onChange={(e) => onChange({ ...pokemon, name: e.target.value })}
          data-testid={`input-name-${pokemon.id}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">タイプ1</label>
          <TypeSelect 
            value={pokemon.type1} 
            onChange={(v) => onChange({ ...pokemon, type1: v === "none" ? "" : v })} 
            placeholder="タイプ" 
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">タイプ2</label>
          <TypeSelect 
            value={pokemon.type2} 
            onChange={(v) => onChange({ ...pokemon, type2: v === "none" ? "" : v })} 
            placeholder="タイプ" 
          />
        </div>
      </div>
    </div>
  );
}

function MultiplierBadge({ mult }: { mult: number }) {
  if (mult >= 2) return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-7">バツグン (x{mult})</Badge>;
  if (mult === 0) return <Badge variant="secondary" className="bg-gray-300 text-gray-700 font-bold h-7">こうかなし (x0)</Badge>;
  if (mult < 1) return <Badge variant="destructive" className="font-bold h-7">いまひとつ (x{mult})</Badge>;
  return <Badge variant="outline" className="font-bold h-7">ふつう (x1)</Badge>;
}

export default function Home() {
  const [userTeam, setUserTeam] = useState<Pokemon[]>([
    { id: "1", name: "", type1: "", type2: "" }
  ]);
  const [opponent, setOpponent] = useState<Pokemon>({ id: "opp", name: "", type1: "", type2: "" });

  const addPokemon = () => {
    if (userTeam.length < 6) {
      setUserTeam([...userTeam, { id: Math.random().toString(36).substr(2, 9), name: "", type1: "", type2: "" }]);
    }
  };

  const updateTeam = (id: string, updated: Pokemon) => {
    setUserTeam(userTeam.map(p => p.id === id ? updated : p));
  };

  const removePokemon = (id: string) => {
    setUserTeam(userTeam.filter(p => p.id !== id));
  };

  const hasOpponentType = opponent.type1 !== "";

  return (
    <div className="min-h-[100dvh] bg-background pb-20 w-full flex justify-center">
      <div className="w-full max-w-[480px] p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Header */}
        <header className="py-6 flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-sm border-4 border-white">
            <div className="w-4 h-4 bg-white rounded-full border-2 border-primary/20" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ポケモン対戦支援ツール</h1>
          <p className="text-sm text-muted-foreground">シンプルで素早いバトル準備</p>
        </header>

        {/* Section 1: User Team */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
            <CardTitle className="text-lg flex items-center gap-3">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">1</span>
              自分のポケモン登録
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              {userTeam.map(p => (
                <PokemonForm 
                  key={p.id} 
                  pokemon={p} 
                  onChange={(updated) => updateTeam(p.id, updated)} 
                  onRemove={userTeam.length > 1 ? () => removePokemon(p.id) : undefined}
                />
              ))}
            </div>
            
            {userTeam.length < 6 && (
              <Button 
                variant="outline" 
                className="w-full h-12 border-dashed text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                onClick={addPokemon}
                data-testid="button-add-pokemon"
              >
                <Plus className="w-4 h-4 mr-2" />
                ポケモンを追加
              </Button>
            )}
            
            <div className="text-center text-xs font-medium text-muted-foreground">
              {userTeam.length} / 6 登録済み
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Opponent */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
            <CardTitle className="text-lg flex items-center gap-3">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">2</span>
              相手を入力する
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <PokemonForm 
              pokemon={opponent} 
              onChange={setOpponent} 
              isOpponent
            />
          </CardContent>
        </Card>

        {/* Section 3: Matchups */}
        <Card className="border-border shadow-sm overflow-hidden bg-gradient-to-b from-card to-secondary/20">
          <CardHeader className="bg-primary pb-4">
            <CardTitle className="text-lg flex items-center gap-3 text-primary-foreground">
              <span className="bg-white text-primary w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-bold">3</span>
              結果を見る
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {!hasOpponentType ? (
              <div className="text-center py-10 text-muted-foreground">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                相手のタイプを入力すると<br/>相性が表示されます
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {userTeam.map((pokemon, idx) => {
                  const hasUserType = pokemon.type1 !== "";
                  
                  // Compute Attack (User -> Opponent)
                  let bestAttackMult = 1;
                  if (hasUserType && hasOpponentType) {
                    const m1 = getMultiplier(pokemon.type1 as any, opponent.type1 as any, opponent.type2);
                    bestAttackMult = m1;
                    if (pokemon.type2) {
                      const m2 = getMultiplier(pokemon.type2 as any, opponent.type1 as any, opponent.type2);
                      bestAttackMult = Math.max(m1, m2);
                    }
                  }

                  // Compute Defense (Opponent -> User)
                  let worstDefenseMult = 1;
                  if (hasUserType && hasOpponentType) {
                    const m1 = getMultiplier(opponent.type1 as any, pokemon.type1 as any, pokemon.type2);
                    worstDefenseMult = m1;
                    if (opponent.type2) {
                      const m2 = getMultiplier(opponent.type2 as any, pokemon.type1 as any, pokemon.type2);
                      worstDefenseMult = Math.max(m1, m2);
                    }
                  }

                  return (
                    <div key={pokemon.id} className="bg-card border border-border p-4 rounded-xl flex flex-col gap-3 shadow-sm">
                      <div className="font-bold border-b pb-2 flex justify-between items-center">
                        <span className="text-base truncate">{pokemon.name || `ポケモン ${idx + 1}`}</span>
                        {pokemon.type1 && (
                          <div className="flex gap-1">
                            <span className="text-xs px-2 py-0.5 bg-secondary rounded text-secondary-foreground">{pokemon.type1}</span>
                            {pokemon.type2 && <span className="text-xs px-2 py-0.5 bg-secondary rounded text-secondary-foreground">{pokemon.type2}</span>}
                          </div>
                        )}
                      </div>
                      
                      {!hasUserType ? (
                        <div className="text-sm text-muted-foreground">タイプを設定してください</div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Sword className="w-4 h-4 text-rose-500" />
                              攻撃相性
                            </div>
                            <MultiplierBadge mult={bestAttackMult} />
                          </div>
                          
                          <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Shield className="w-4 h-4 text-blue-500" />
                              防御相性 (相手の攻撃)
                            </div>
                            {/* For defense, lower is better. Let's invert the styling meaning */}
                            <Badge className={`h-7 font-bold ${
                              worstDefenseMult >= 2 ? "bg-red-500 hover:bg-red-600 text-white" : 
                              worstDefenseMult < 1 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : 
                              "bg-secondary text-secondary-foreground hover:bg-secondary"
                            }`}>
                              {worstDefenseMult >= 2 ? "弱点" : worstDefenseMult < 1 ? "半減以下" : "等倍"} (x{worstDefenseMult})
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
