# Type Flush Hold'em

A Vercel-ready static web game for a $25 guaranteed-prize Pokemon-card Hold'em concept.

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

## Hold'em game rules included

- Entry shown in the UI: $25.
- The player plays until 5 scored showdowns are complete.
- Each showdown uses a fresh 52-card Pokemon-style poker deck.
- The player gets 2 private hole cards.
- The dealer gets 2 private hole cards, hidden until showdown.
- Both sides share a 5-card community board: flop, turn, and river.
- The winner is the best 5-card poker hand from each side's 2 hole cards plus the shared 5-card board.
- Ties push and do not count toward the 5 scored showdowns.
- Trivia questions unlock each hand but do not alter the card odds.
- Every player receives a guaranteed prize.

## Prize ladder

| Result | Prize | Retail value | Cost |
| --- | --- | ---: | ---: |
| 0-2 wins | 1 English Pack | $12 | $8 |
| 3 wins | 2 English Packs | $24 | $16 |
| 4 wins | English Pack 2 + 1 English Pack | $34 | $25 |
| 5 wins | English Pack 3 + 1 English Pack | $50 | $34 |

This produces about 81.5% retail RTP when resolved showdowns are treated as roughly 50/50.

## Card images

This build uses external card-art URLs in `src/cardImages.js` plus a CSS fallback. The default URLs point to public card-image links and are not bundled into the project.

To use specific images you found through Google Images:

1. Open the source page for each image.
2. Verify the usage rights and license terms.
3. Replace or add entries in `CARD_IMAGE_OVERRIDES` in `src/cardImages.js`.

Example:

```js
export const CARD_IMAGE_OVERRIDES = {
  "fire-A": "https://your-approved-image-source.example/fire-energy.png"
};
```

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
- `dealHoldemRound`
- `scoreHoldemRound`
- `evaluateBestHand`

The interface is in:

- `index.html`
- `styles.css`
- `src/app.js`
