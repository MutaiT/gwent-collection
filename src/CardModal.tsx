import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { FACTION_META, pictureUrl, wikiUrl } from './data';
import type { Card } from './data';
import { Emblem } from './Emblem';
import { tilt, untilt } from './tilt';

interface Props {
  card: Card;
  owned: boolean;
  onToggle: (index: number) => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function CardModal({ card, owned, onToggle, onClose, onPrev, onNext }: Props) {
  const art = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev?.();
      else if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
      previous?.focus();
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal panel ${owned ? 'owned' : 'missing'}`}
        role="dialog"
        aria-modal="true"
        aria-label={card.name}
        style={{ '--fc': FACTION_META[card.deck].color } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeBtn} className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-art" ref={art} onPointerMove={(e) => tilt(e, art.current)} onPointerLeave={() => untilt(art.current)}>
          <img src={pictureUrl(card)} alt={card.name} width={376} height={710} />
          <span className="shine" />
        </div>
        <div className="modal-body">
          <p className="modal-faction">
            <Emblem faction={card.deck} size={18} /> {card.deck} · {card.expansion}
          </p>
          <h2>{card.name}</h2>
          <dl>
            <dt>Where</dt>
            <dd>{card.territory}</dd>
            <dt>How</dt>
            <dd>{card.type}</dd>
            {card.details && (
              <>
                <dt>Details</dt>
                <dd>{card.details}</dd>
              </>
            )}
          </dl>
          <div className="row-gap">
            <button className={`btn ${owned ? '' : 'btn-gold'}`} onClick={() => onToggle(card.index)}>
              {owned ? 'Remove from collection' : 'Add to collection'}
            </button>
            <a className="btn btn-ghost" href={wikiUrl(card)} target="_blank" rel="noopener noreferrer">
              Witcher Wiki ↗
            </a>
          </div>
          <div className="modal-nav">
            <button className="link-btn" onClick={onPrev} disabled={!onPrev}>
              ← Previous
            </button>
            <button className="link-btn" onClick={onNext} disabled={!onNext}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
