import type { CSSProperties } from 'react';
import { FACTION_META } from './data';
import type { Card } from './data';
import type { Collection } from './storage';
import { Emblem } from './Emblem';

interface Props {
  cards: Card[];
  collection: Collection;
  onToggle: (index: number) => void;
  onOpen: (index: number) => void;
}

/** Compact list, like a quest log, for quickly ticking cards off. */
export function Ledger({ cards, collection, onToggle, onOpen }: Props) {
  return (
    <div className="ledger panel">
      <table>
        <thead>
          <tr>
            <th className="col-check">
              <span className="sr-only">Collected</span>
            </th>
            <th>Card</th>
            <th className="hide-sm">Deck</th>
            <th>Where</th>
            <th className="hide-sm">How</th>
            <th className="hide-md">Details</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => {
            const owned = collection[c.index];
            return (
              <tr key={c.index} className={owned ? 'owned' : ''} style={{ '--fc': FACTION_META[c.deck].color } as CSSProperties}>
                <td className="col-check">
                  <button className="check" aria-pressed={owned} aria-label={`${c.name} collected`} onClick={() => onToggle(c.index)}>
                    {owned ? '✓' : ''}
                  </button>
                </td>
                <td>
                  <button className="link-btn ledger-name" onClick={() => onOpen(c.index)}>
                    {c.name}
                  </button>
                  <div className="ledger-meta show-sm">
                    {c.deck} · {c.type}
                  </div>
                </td>
                <td className="hide-sm">
                  <span className="deck-chip">
                    <Emblem faction={c.deck} size={14} /> {c.deck}
                  </span>
                </td>
                <td>{c.territory}</td>
                <td className="hide-sm">{c.type}</td>
                <td className="hide-md details">{c.details}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
