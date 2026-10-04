import { pictureUrl } from './data';
import type { Card } from './data';

export interface Toast {
  id: number;
  tone: 'gain' | 'loss' | 'info' | 'gold';
  title: string;
  body: string;
  card?: Card;
  action?: { label: string; run: () => void };
}

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          {t.card && <img src={pictureUrl(t.card)} alt="" width={38} height={72} />}
          <div className="toast-text">
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
          {t.action && (
            <button
              className="btn btn-small"
              onClick={() => {
                t.action!.run();
                onDismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
