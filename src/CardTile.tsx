import { memo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { tilt, untilt } from './tilt';
import { FACTION_META, pictureUrl } from './data';
import type { Card } from './data';

interface Props {
  card: Card;
  owned: boolean;
  /** Timestamp of the last collect, used to replay the burst animation. */
  burst?: number;
  onToggle: (index: number) => void;
  onOpen: (index: number) => void;
}

export const CardTile = memo(function CardTile({ card, owned, burst, onToggle, onOpen }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const where = card.territory === card.type ? card.territory : `${card.territory} · ${card.type}`;
  return (
    <div className={`tile ${owned ? 'owned' : 'missing'}`} style={{ '--fc': FACTION_META[card.deck].color } as CSSProperties}>
      <button
        ref={ref}
        className="card-face"
        aria-pressed={owned}
        aria-label={`${card.name}, ${owned ? 'collected' : 'missing'}. Toggle collected.`}
        onClick={() => onToggle(card.index)}
        onPointerMove={(e) => tilt(e, ref.current)}
        onPointerLeave={() => untilt(ref.current)}
      >
        <img src={pictureUrl(card)} alt="" loading="lazy" decoding="async" width={376} height={710} />
        <span className="shine" />
        {!owned && <span className="missing-label">Not collected</span>}
        <span className="seal" aria-hidden="true">
          ✓
        </span>
        {burst && <span key={burst} className="burst" aria-hidden="true" />}
      </button>
      <div className="tile-caption">
        <span className="tile-name" title={card.name}>
          {card.name}
        </span>
        <button className="info-btn" onClick={() => onOpen(card.index)} aria-label={`Where to find ${card.name}`} title="Where to find it">
          i
        </button>
      </div>
      <span className="tile-where" title={where}>
        {where}
      </span>
    </div>
  );
});
