import type { Faction } from './data';

// Simple original glyphs standing in for each faction's banner.
const PATHS: Record<Faction | 'all', string> = {
  // Crown
  'Northern Realms': 'M4 17h16l1-10-5 4-4-7-4 7-5-4zM4 19h16v2H4z',
  // Sun
  Nilfgaard:
    'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v4h-2zM11 19h2v4h-2zM1 11h4v2H1zM19 11h4v2h-4zM4.2 5.6l1.4-1.4 2.8 2.8-1.4 1.4zM15.6 17l1.4-1.4 2.8 2.8-1.4 1.4zM4.2 18.4l2.8-2.8 1.4 1.4-2.8 2.8zM15.6 7l2.8-2.8 1.4 1.4-2.8 2.8z',
  // Leaf
  "Scoia'tael": 'M20 3C9 3 4 9 4 15c0 2 .6 3.6 1.4 4.8L3 22l1.4 1.4 2.4-2.4C8 21.6 9.6 22 11 22c6 0 10-6 9-19zM8 17c2-4 5-7 9-9-3 3-6 6-9 9z',
  // Claw marks
  Monsters: 'M6 2c1 6 1 12-2 20l2 .5C9 15 9 8 8 2zM12 2c1 6 1 12-2 20l2 .5C15 15 15 8 14 2zM18 2c1 6 1 12-2 20l2 .5C21 15 21 8 20 2z',
  // Anchor
  Skellige:
    'M12 2a3 3 0 0 0-1 5.8V10H7v2h4v7.9C8 19.5 5.7 17.3 5.1 14.5L7 13l-4-2v3c0 4.9 4 9 9 9s9-4.1 9-9v-3l-4 2 1.9 1.5c-.6 2.8-2.9 5-5.9 5.4V12h4v-2h-4V7.8A3 3 0 0 0 12 2zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  // Crossed swords
  Neutral: 'M3 2l8 8-1.5 1.5L2 4V2zM21 2v2l-7.5 7.5L12 10l8-8zM6 14l4 4-2 2-1-1-3 3-2-2 3-3-1-1zM18 14l2 2-1 1 3 3-2 2-3-3-1 1-2-2zM9 13l2 2 6-6-2-2z',
  // Card fan
  all: 'M8 3h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v13h9V5zM3 7l2-.5v11.8l-.3.1L3 7z',
};

export function Emblem({ faction, size = 20 }: { faction: Faction | 'all'; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d={PATHS[faction]} />
    </svg>
  );
}
