import raw from './data/cards.json';

export interface Card {
  /** Position in the list; also the position in the save code, so never reorder cards.json. */
  index: number;
  name: string;
  deck: Faction;
  expansion: Expansion;
  territory: string;
  type: string;
  details: string;
  picture: string;
}

export const FACTIONS = ['Northern Realms', 'Nilfgaard', "Scoia'tael", 'Monsters', 'Skellige', 'Neutral'] as const;
export type Faction = (typeof FACTIONS)[number];

export const EXPANSIONS = ['Base game', 'Hearts of Stone', 'Blood and Wine'] as const;
export type Expansion = (typeof EXPANSIONS)[number];

export const FACTION_META: Record<Faction, { color: string; short: string; motto: string }> = {
  'Northern Realms': { color: '#4f86c6', short: 'North', motto: 'Steel and siege engines' },
  Nilfgaard: { color: '#d4a93c', short: 'Nilfgaard', motto: 'The White Flame dances' },
  "Scoia'tael": { color: '#6aa84f', short: "Scoia'tael", motto: 'Squirrels of the forest' },
  Monsters: { color: '#c0392b', short: 'Monsters', motto: 'Things that go bump' },
  Skellige: { color: '#8e6bbf', short: 'Skellige', motto: 'Sons of the isles' },
  Neutral: { color: '#a9a9a0', short: 'Neutral', motto: 'Heroes and weather' },
};

export const CARDS: Card[] = (raw as { cards: Omit<Card, 'index'>[] }).cards.map((c, index) => ({ ...c, index }));

/** "Novigrad (Oxenfurt)" -> "Novigrad" */
export function region(territory: string): string {
  return territory.replace(/\s*\(.*\)$/, '');
}

export const REGIONS = [...new Set(CARDS.map((c) => region(c.territory)))].sort();

/** Source types with consistent casing, e.g. "Win From NPC" and "Win from NPC" are the same. */
export function normType(type: string): string {
  return type.replace(/Win From/i, 'Win from');
}

export const TYPES = [...new Set(CARDS.map((c) => normType(c.type)))].sort();

export function wikiUrl(card: Card): string {
  const base = card.name.replace(/\(\d of \d\)/, '').trim().replace(/ /g, '_');
  return `https://witcher.fandom.com/wiki/${encodeURIComponent(base)}_(gwent_card)`;
}

export function pictureUrl(card: Card): string {
  return `/cards/${card.picture.replace(/\.png$/, '.webp')}`;
}
