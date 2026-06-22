'use client';

import { useState } from 'react';

export type PlayerOption = {
  id: number;
  name: string;
};

type BetBrazilScorerFieldsProps = {
  disabled: boolean;
  matchId: number;
  players: PlayerOption[];
};

type AdminBrazilScorerFieldsProps = {
  defaultGoals: number | null;
  defaultScorerIds: number[];
  players: PlayerOption[];
};

export function BetBrazilScorerFields({ disabled, matchId, players }: BetBrazilScorerFieldsProps) {
  const [goalsValue, setGoalsValue] = useState('');
  const goals = parseGoals(goalsValue);

  return (
    <div className="score-col score-col-brazil">
      <label className="score-col-label">
        <span className="score-team">Brasil</span>
        <input
          className="score-input"
          name={`match-${matchId}-brazil`}
          type="number"
          min={0}
          max={99}
          disabled={disabled}
          placeholder="0"
          value={goalsValue}
          onChange={(event) => setGoalsValue(event.target.value)}
        />
      </label>
      <ScorerSelectList
        disabled={disabled}
        emptyMessage="Cadastre jogadores no admin para liberar os goleadores."
        nameForPosition={(position) => `match-${matchId}-scorer-${position}`}
        players={players}
        selectedPlayerIds={[]}
        total={goals}
      />
    </div>
  );
}

export function AdminBrazilScorerFields({ defaultGoals, defaultScorerIds, players }: AdminBrazilScorerFieldsProps) {
  const [goalsValue, setGoalsValue] = useState(defaultGoals === null ? '' : String(defaultGoals));
  const goals = parseGoals(goalsValue);

  return (
    <div className="admin-scorer-field">
      <label>
        Gols Brasil
        <input
          name="brazilGoals"
          type="number"
          min={0}
          max={99}
          value={goalsValue}
          onChange={(event) => setGoalsValue(event.target.value)}
        />
      </label>
      <ScorerSelectList
        disabled={false}
        emptyMessage="Cadastre jogadores ativos antes de registrar goleadores."
        nameForPosition={(position) => `match-scorer-${position}`}
        players={players}
        selectedPlayerIds={defaultScorerIds}
        total={goals}
      />
    </div>
  );
}

function ScorerSelectList({
  disabled,
  emptyMessage,
  nameForPosition,
  players,
  selectedPlayerIds,
  total,
}: {
  disabled: boolean;
  emptyMessage: string;
  nameForPosition: (position: number) => string;
  players: PlayerOption[];
  selectedPlayerIds: number[];
  total: number;
}) {
  if (total <= 0) return null;

  return (
    <div className="scorer-select-list">
      <span className="scorer-select-title">Goleadores do Brasil</span>
      {players.length === 0 ? <span className="scorer-select-empty">{emptyMessage}</span> : null}
      {Array.from({ length: total }, (_, position) => (
        <label className="scorer-select-field" key={position}>
          Gol {position + 1}
          <select
            name={nameForPosition(position)}
            defaultValue={selectedPlayerIds[position] ?? ''}
            disabled={disabled || players.length === 0}
            required
          >
            <option value="">Selecione</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function parseGoals(value: string): number {
  if (value.trim() === '') return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return Math.min(parsed, 99);
}
