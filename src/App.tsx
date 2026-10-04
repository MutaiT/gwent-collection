import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { CARDS, EXPANSIONS, FACTIONS, FACTION_META, REGIONS, TYPES, normType, region } from './data';
import type { Card, Expansion, Faction } from './data';
import { clearLink, codeFromLink, count, emptyCollection, load, loadPrefs, requestPersistence, save, savePrefs } from './storage';
import type { Collection, Prefs } from './storage';
import { playCollect, playFanfare, playRemove, playTick } from './sound';
import { Emblem } from './Emblem';
import { CardTile } from './CardTile';
import { CardModal } from './CardModal';
import { Ledger } from './Ledger';
import { SavePanel } from './SavePanel';
import { Toasts } from './Toasts';
import type { Toast } from './Toasts';
import { Medallion } from './Medallion';

type Status = 'all' | 'owned' | 'missing';
type SortKey = 'faction' | 'name' | 'region' | 'owned';

interface Filters {
  faction: Faction | 'all';
  expansion: Expansion | 'all';
  region: string;
  type: string;
  status: Status;
  q: string;
}

const NO_FILTERS: Filters = { faction: 'all', expansion: 'all', region: 'all', type: 'all', status: 'all', q: '' };

/** Works out the starting collection, and whether a code in the link needs the user to decide. */
function initialState(): { collection: Collection; fromLink: Collection | null; imported: boolean } {
  const saved = load();
  const linked = codeFromLink();
  if (!linked) {
    return { collection: saved ?? emptyCollection(), fromLink: null, imported: false };
  }
  if (!saved || count(saved) === 0) {
    clearLink();
    return { collection: linked, fromLink: null, imported: true };
  }
  if (saved.every((v, i) => v === linked[i])) {
    clearLink();
    return { collection: saved, fromLink: null, imported: false };
  }
  return { collection: saved, fromLink: linked, imported: false };
}

export default function App() {
  const [init] = useState(initialState);
  const [collection, setCollection] = useState<Collection>(init.collection);
  const [linkOffer, setLinkOffer] = useState<Collection | null>(init.fromLink);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<SortKey>('faction');
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveOk, setSaveOk] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bursts, setBursts] = useState<Record<number, number>>({});
  const toastId = useRef(0);

  useEffect(() => {
    void requestPersistence();
  }, []);

  useEffect(() => {
    setSaveOk(save(collection));
  }, [collection]);

  useEffect(() => savePrefs(prefs), [prefs]);

  const sfx = useCallback((fn: () => void) => prefs.sound && fn(), [prefs.sound]);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), t.action ? 6000 : 3200);
  }, []);

  useEffect(() => {
    if (init.imported) {
      pushToast({ tone: 'info', title: 'Collection imported', body: `${count(init.collection)} cards loaded from your link and saved on this device.` });
    }
  }, [init, pushToast]);

  /** Replace the collection, offering undo since it can change many cards at once. */
  const replaceCollection = useCallback(
    (next: Collection, title: string) => {
      const previous = collection;
      setCollection(next);
      pushToast({ tone: 'info', title, body: `${count(next)} of ${CARDS.length} cards collected.`, action: { label: 'Undo', run: () => setCollection(previous) } });
    },
    [collection, pushToast],
  );

  const toggle = useCallback(
    (index: number) => {
      const card = CARDS[index];
      const owned = !collection[index];
      const next = collection.slice();
      next[index] = owned;
      setCollection(next);

      if (!owned) {
        sfx(playRemove);
        pushToast({ tone: 'loss', title: 'Card removed', body: card.name, action: { label: 'Undo', run: () => setCollection(collection) } });
        return;
      }

      setBursts((b) => ({ ...b, [index]: Date.now() }));
      const factionDone = CARDS.every((c) => c.deck !== card.deck || next[c.index]);
      if (count(next) === CARDS.length) {
        sfx(playFanfare);
        pushToast({ tone: 'gold', title: "Collect 'Em All!", body: 'Every Gwent card is yours. The Card Collector salutes you.' });
      } else if (factionDone) {
        sfx(playFanfare);
        pushToast({ tone: 'gold', title: `${card.deck} deck complete`, body: FACTION_META[card.deck].motto });
      } else {
        sfx(playCollect);
        pushToast({ tone: 'gain', title: 'New card added to collection', body: card.name, card });
      }
    },
    [collection, sfx, pushToast],
  );

  // Only re-sort/re-filter on collection changes when the result depends on it, so cards don't jump around
  const collectionDep = sort === 'owned' || filters.status !== 'all' ? collection : null;
  const filtered = useMemo(() => {
    const owned = collectionDep ?? collection;
    const q = filters.q.trim().toLowerCase();
    const list = CARDS.filter(
      (c) =>
        (filters.faction === 'all' || c.deck === filters.faction) &&
        (filters.expansion === 'all' || c.expansion === filters.expansion) &&
        (filters.region === 'all' || region(c.territory) === filters.region) &&
        (filters.type === 'all' || normType(c.type) === filters.type) &&
        (filters.status === 'all' || (filters.status === 'owned') === owned[c.index]) &&
        (!q || `${c.name} ${c.territory} ${c.details} ${c.type}`.toLowerCase().includes(q)),
    );
    const byName = (a: Card, b: Card) => a.name.localeCompare(b.name, undefined, { numeric: true });
    const cmp: Record<SortKey, (a: Card, b: Card) => number> = {
      faction: (a, b) => FACTIONS.indexOf(a.deck) - FACTIONS.indexOf(b.deck) || byName(a, b),
      name: byName,
      region: (a, b) => a.territory.localeCompare(b.territory) || byName(a, b),
      owned: (a, b) => Number(owned[a.index]) - Number(owned[b.index]) || byName(a, b),
    };
    return list.sort(cmp[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, collectionDep]);

  const stats = useMemo(() => {
    const total = count(collection);
    const faction = Object.fromEntries(
      FACTIONS.map((f) => {
        const cs = CARDS.filter((c) => c.deck === f);
        return [f, { owned: cs.filter((c) => collection[c.index]).length, total: cs.length }];
      }),
    ) as Record<Faction, { owned: number; total: number }>;
    const expansion = EXPANSIONS.map((e) => {
      const cs = CARDS.filter((c) => c.expansion === e);
      return { name: e, owned: cs.filter((c) => collection[c.index]).length, total: cs.length };
    });
    return { total, faction, expansion };
  }, [collection]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    if (key !== 'q') sfx(playTick);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const filtersActive = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  const setAllShown = (owned: boolean) => {
    const next = collection.slice();
    filtered.forEach((c) => (next[c.index] = owned));
    replaceCollection(next, owned ? `Collected ${filtered.length} shown cards` : `Removed ${filtered.length} shown cards`);
  };

  const resolveLinkOffer = (next: Collection | null, title: string) => {
    if (next) replaceCollection(next, title);
    setLinkOffer(null);
    clearLink();
  };

  const openIndex = openCard === null ? -1 : filtered.findIndex((c) => c.index === openCard);
  const merged = linkOffer && collection.map((v, i) => v || linkOffer[i]);

  return (
    <div className="app">
      <header className="hero">
        <Medallion owned={stats.total} total={CARDS.length} />
        <div className="hero-text">
          <p className="eyebrow">The Witcher 3: Wild Hunt</p>
          <h1>Gwent Card Collection</h1>
          <p className="hero-sub">
            <strong>{stats.total}</strong> of {CARDS.length} cards collected
            {stats.total === CARDS.length && <span className="badge-gold">Card Collector</span>}
          </p>
          <div className="expansions">
            {stats.expansion.map((e) => (
              <div key={e.name} className="exp-bar" title={`${e.name}: ${e.owned} / ${e.total}`}>
                <span>{e.name}</span>
                <div className="bar">
                  <div style={{ width: `${(e.owned / e.total) * 100}%` }} />
                </div>
                <span className="num">
                  {e.owned}/{e.total}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-actions">
          <button className={`btn btn-ghost save-status ${saveOk ? '' : 'warn'}`} onClick={() => setSaveOpen(true)} title="Saving, backups and importing">
            <span className="dot" />
            {saveOk ? 'Saved on this device' : 'Not saving!'}
          </button>
          <button
            className="btn btn-ghost icon-btn"
            onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
            aria-pressed={prefs.sound}
            aria-label="Sound effects"
            title={prefs.sound ? 'Mute sounds' : 'Turn sounds on'}
          >
            {prefs.sound ? '🔊' : '🔈'}
          </button>
        </div>
      </header>

      {linkOffer && merged && (
        <div className="link-offer panel" role="alertdialog" aria-label="Collection found in link">
          <div>
            <strong>This link carries a collection of {count(linkOffer)} cards.</strong> This device already has {stats.total} saved. What should happen?
          </div>
          <div className="row-gap">
            <button className="btn btn-gold" onClick={() => resolveLinkOffer(merged, 'Collections merged')}>
              Merge both ({count(merged)})
            </button>
            <button className="btn" onClick={() => resolveLinkOffer(linkOffer, 'Replaced with link')}>
              Use link ({count(linkOffer)})
            </button>
            <button className="btn btn-ghost" onClick={() => resolveLinkOffer(null, '')}>
              Keep saved ({stats.total})
            </button>
          </div>
        </div>
      )}

      <nav className="tabs" aria-label="Decks">
        <button className={`tab ${filters.faction === 'all' ? 'active' : ''}`} style={{ '--fc': '#c9a45c' } as CSSProperties} onClick={() => setFilter('faction', 'all')}>
          <Emblem faction="all" />
          <span className="tab-name">All decks</span>
          <span className="tab-count">
            {stats.total}/{CARDS.length}
          </span>
          <span className="tab-bar" style={{ width: `${(stats.total / CARDS.length) * 100}%` }} />
        </button>
        {FACTIONS.map((f) => {
          const s = stats.faction[f];
          return (
            <button
              key={f}
              className={`tab ${filters.faction === f ? 'active' : ''} ${s.owned === s.total ? 'done' : ''}`}
              style={{ '--fc': FACTION_META[f].color } as CSSProperties}
              onClick={() => setFilter('faction', f)}
              title={f}
            >
              <Emblem faction={f} />
              <span className="tab-name">{FACTION_META[f].short}</span>
              <span className="tab-count">
                {s.owned}/{s.total}
              </span>
              <span className="tab-bar" style={{ width: `${(s.owned / s.total) * 100}%` }} />
            </button>
          );
        })}
      </nav>

      <section className="toolbar panel">
        <label className="search">
          <span className="sr-only">Search</span>
          <input type="search" placeholder="Search name, place or quest…" value={filters.q} onChange={(e) => setFilter('q', e.target.value)} />
        </label>
        <div className="segmented" role="group" aria-label="Collected">
          {(['all', 'missing', 'owned'] as Status[]).map((s) => (
            <button key={s} className={filters.status === s ? 'on' : ''} aria-pressed={filters.status === s} onClick={() => setFilter('status', s)}>
              {s === 'all' ? 'All' : s === 'owned' ? 'Collected' : 'Missing'}
            </button>
          ))}
        </div>
        <select value={filters.expansion} onChange={(e) => setFilter('expansion', e.target.value as Filters['expansion'])} aria-label="Expansion">
          <option value="all">All expansions</option>
          {EXPANSIONS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <select value={filters.region} onChange={(e) => setFilter('region', e.target.value)} aria-label="Region">
          <option value="all">All regions</option>
          {REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} aria-label="How to obtain">
          <option value="all">Any source</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
          <option value="faction">Sort: deck</option>
          <option value="name">Sort: name</option>
          <option value="region">Sort: region</option>
          <option value="owned">Sort: missing first</option>
        </select>
        <div className="segmented" role="group" aria-label="View">
          <button className={prefs.view === 'grid' ? 'on' : ''} aria-pressed={prefs.view === 'grid'} onClick={() => setPrefs((p) => ({ ...p, view: 'grid' }))}>
            Cards
          </button>
          <button className={prefs.view === 'ledger' ? 'on' : ''} aria-pressed={prefs.view === 'ledger'} onClick={() => setPrefs((p) => ({ ...p, view: 'ledger' }))}>
            List
          </button>
        </div>
      </section>

      <div className="subbar">
        <span>
          Showing {filtered.length} of {CARDS.length}
          {filtersActive && (
            <button className="link-btn" onClick={() => setFilters(NO_FILTERS)}>
              Clear filters
            </button>
          )}
        </span>
        <span className="row-gap">
          <button className="link-btn" onClick={() => setAllShown(true)} disabled={!filtered.length}>
            Collect all shown
          </button>
          <button className="link-btn" onClick={() => setAllShown(false)} disabled={!filtered.length}>
            Remove all shown
          </button>
        </span>
      </div>

      <main>
        {filtered.length === 0 ? (
          <div className="empty panel">
            <p>No cards match. The board is empty, witcher.</p>
            <button className="btn" onClick={() => setFilters(NO_FILTERS)}>
              Clear filters
            </button>
          </div>
        ) : prefs.view === 'grid' ? (
          <div className="grid">
            {filtered.map((c) => (
              <CardTile key={c.index} card={c} owned={collection[c.index]} burst={bursts[c.index]} onToggle={toggle} onOpen={setOpenCard} />
            ))}
          </div>
        ) : (
          <Ledger cards={filtered} collection={collection} onToggle={toggle} onOpen={setOpenCard} />
        )}
      </main>

      <footer className="footer">
        <p>
          Your collection saves automatically in this browser. Use{' '}
          <button className="link-btn" onClick={() => setSaveOpen(true)}>
            Save &amp; backup
          </button>{' '}
          to move it to another device.
        </p>
        <p>
          Card pictures and data from the <a href="https://witcher.fandom.com/">Witcher Wiki</a> (<a href="https://www.fandom.com/licensing">CC BY-SA</a>) via{' '}
          <a href="https://github.com/gwentcards/gwentcards.github.io">gwentcards.github.io</a>. Fan project, not affiliated with CD PROJEKT RED.
        </p>
      </footer>

      {openCard !== null && (
        <CardModal
          card={CARDS[openCard]}
          owned={collection[openCard]}
          onToggle={toggle}
          onClose={() => setOpenCard(null)}
          onPrev={openIndex > 0 ? () => setOpenCard(filtered[openIndex - 1].index) : undefined}
          onNext={openIndex >= 0 && openIndex < filtered.length - 1 ? () => setOpenCard(filtered[openIndex + 1].index) : undefined}
        />
      )}

      {saveOpen && <SavePanel collection={collection} saveOk={saveOk} onReplace={replaceCollection} onClose={() => setSaveOpen(false)} />}

      <Toasts toasts={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} />
    </div>
  );
}
