# Pokemon Poker

A Vercel-ready static web game for a $25 guaranteed-prize Pokemon Poker concept.

## Card mapping

| Pokemon card type | Poker suit |
| --- | --- |
| Fire | Hearts |
| Water | Spades |
| Earth | Clubs |
| Neutral | Diamonds |

| Pokemon card role | Poker rank |
| --- | --- |
| Supporter | Jack |
| Female Trainer | Queen |
| Male Trainer | King |
| Energy | Ace |

## Game rules included

- Entry shown in the UI: $25.
- The player plays until 5 scored hands are complete.
- Each hand deals 5 cards to the player and 5 cards to the dealer from a fresh 52-card deck.
- Standard poker rankings are used.
- Ties push and do not count toward the 5 scored hands.
- Trivia questions unlock each hand but do not alter the card odds.
- Every player receives a guaranteed prize.

## Prize ladder

| Result | Prize | Retail value | Cost |
| --- | --- | ---: | ---: |
| 0-2 wins | 1 English Pack | $12 | $8 |
| 3 wins | 2 English Packs | $24 | $16 |
| 4 wins | English Pack 2 + 1 English Pack | $34 | $25 |
| 5 wins | English Pack 3 + 1 English Pack | $50 | $34 |

This produces about 81.5% retail RTP when resolved hands are treated as roughly 50/50.

## Run locally

Run the local static server:

```bash
npm run dev
```

Then open:

```text
http://localhost:4173
```

## Test and build

```bash
npm test
npm run build
```

The production files are copied into `dist/`.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Vercel will use `vercel.json`:
   - framework: Other
   - build command: `npm run build`
   - output directory: `dist`

You can also deploy with the Vercel CLI from this folder:

```bash
vercel
```

## Customize

Most game logic is in `src/engine.js`:

- `GAME_CONFIG.entryFee`
- `GAME_CONFIG.scoredHands`
- `GAME_CONFIG.prizeTable`
- `TYPES`
- `RANKS`
- `TRIVIA_QUESTIONS`

The interface is in:

- `index.html`
- `styles.css`
- `src/app.js`

## Asset note

This build uses original CSS card designs and does not include official Pokemon card art or official assets. Replace the text-card renderer with approved assets only if you want real card images.
