import { useEffect, useRef, useState } from 'react';
import { CARDS } from './data';
import { count, decode, emptyCollection, encode } from './storage';
import type { Collection } from './storage';

interface Props {
  collection: Collection;
  saveOk: boolean;
  onReplace: (next: Collection, title: string) => void;
  onClose: () => void;
}

export function SavePanel({ collection, saveOk, onReplace, onClose }: Props) {
  const code = encode(collection);
  const [copied, setCopied] = useState('');
  const [input, setInput] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const parsed = input ? decode(input) : null;

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
    } catch {
      setCopied('failed');
    }
    window.setTimeout(() => setCopied(''), 1800);
  };

  const download = () => {
    const blob = new Blob([`${code}\n`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gwent-collection-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const readFile = async (file: File) => setInput((await file.text()).trim());

  const shareLink = `${window.location.origin}/#${code}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal save-panel panel" role="dialog" aria-modal="true" aria-label="Save and backup" onClick={(e) => e.stopPropagation()}>
        <button ref={closeBtn} className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Save &amp; backup</h2>

        <p className={`save-line ${saveOk ? '' : 'warn'}`}>
          <span className="dot" />
          {saveOk
            ? `Saved automatically on this device: ${count(collection)} of ${CARDS.length} cards. Reloading or closing the app keeps it.`
            : "This browser is blocking storage (private window?). Changes won't survive closing it, so copy your code below."}
        </p>

        <section>
          <h3>Your save code</h3>
          <p className="hint">Works here and on gwentcards.github.io. Paste it on another device to carry your collection over.</p>
          <textarea readOnly value={code} rows={3} onFocus={(e) => e.target.select()} aria-label="Save code" />
          <div className="row-gap">
            <button className="btn" onClick={() => copy(code, 'code')}>
              {copied === 'code' ? 'Copied ✓' : 'Copy code'}
            </button>
            <button className="btn" onClick={() => copy(shareLink, 'link')}>
              {copied === 'link' ? 'Copied ✓' : 'Copy link'}
            </button>
            <button className="btn btn-ghost" onClick={download}>
              Download backup
            </button>
            {copied === 'failed' && <span className="hint warn">Copy failed; select the text instead.</span>}
          </div>
        </section>

        <section>
          <h3>Load a collection</h3>
          <p className="hint">Paste a save code or an old gwentcards.github.io link, or open a backup file.</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} placeholder="1000111011111…  or  https://gwentcards.github.io/#1000111…" aria-label="Code to load" />
          {input && !parsed && <p className="hint warn">That doesn't look like a save code (it should be only 0s and 1s).</p>}
          <div className="row-gap">
            <button
              className="btn btn-gold"
              disabled={!parsed}
              onClick={() => {
                onReplace(collection.map((v, i) => v || parsed![i]), 'Collections merged');
                setInput('');
              }}
            >
              Merge{parsed ? ` (${count(collection.map((v, i) => v || parsed[i]))})` : ''}
            </button>
            <button
              className="btn"
              disabled={!parsed}
              onClick={() => {
                onReplace(parsed!, 'Collection replaced');
                setInput('');
              }}
            >
              Replace{parsed ? ` (${count(parsed)})` : ''}
            </button>
            <button className="btn btn-ghost" onClick={() => fileInput.current?.click()}>
              Open file…
            </button>
            <input ref={fileInput} type="file" accept=".txt,text/plain" hidden onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
          </div>
        </section>

        <section className="danger">
          {confirmReset ? (
            <div className="row-gap">
              <span>Remove all {count(collection)} cards?</span>
              <button
                className="btn btn-danger"
                onClick={() => {
                  onReplace(emptyCollection(), 'Collection cleared');
                  setConfirmReset(false);
                }}
              >
                Yes, clear
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="link-btn" onClick={() => setConfirmReset(true)}>
              Start over…
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
