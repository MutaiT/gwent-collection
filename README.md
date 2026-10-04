# Gwent Card Collection

Live at **https://gwent-collection.vercel.app**. Pushing to `main` deploys automatically.

A checklist for every Gwent card in The Witcher 3: Wild Hunt (base game, Hearts of Stone and Blood and Wine), styled after the game's menus.

- **Saves automatically** in the browser (localStorage), so reloading, closing the tab or relaunching the installed app keeps your collection.
- **Save code**: the collection is a string of 0s and 1s, one per card. It's the same format as [gwentcards.github.io](https://gwentcards.github.io/), so old links/codes can be pasted into *Save & backup* (or opened as `https://<this site>/#<code>`), and merged with what's already saved.
- Installable as an app (PWA) and works offline once loaded.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

Card data is `src/data/cards.json`, copied from gwentcards.github.io. **Never reorder cards in it**: a card's position is its position in everyone's save code. Add new cards at the end.

Card pictures are in `public/cards/` (WebP, converted from the gwentcards.github.io PNGs).

## Deploy to Vercel

Import the repo in Vercel (framework preset: Vite, no settings needed), or run `npx vercel --prod`. `vercel.json` sets long cache headers for card pictures.

## Credits

Card pictures and data from the [Witcher Wiki](https://witcher.fandom.com/) under [CC BY-SA](https://www.fandom.com/licensing), via [gwentcards.github.io](https://github.com/gwentcards/gwentcards.github.io). Fan project, not affiliated with CD PROJEKT RED.
