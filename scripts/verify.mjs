import assert from "node:assert/strict";
import {
  buildCardByRankAndType,
  compareEvaluations,
  createDeck,
  evaluateHand,
  expectedPrizeStats,
  GAME_CONFIG,
  getPrizeForWins,
  scoreRound
} from "../src/engine.js";

const deck = createDeck();
assert.equal(deck.length, 52, "deck should have 52 cards");
assert.equal(new Set(deck.map((card) => card.id)).size, 52, "cards should be unique");

const fireAce = deck.find((card) => card.id === "fire-A");
assert.equal(fireAce.title, "Fire Energy");
assert.equal(fireAce.rank, 14);
assert.equal(fireAce.pokerSuit, "Hearts");

const waterJack = deck.find((card) => card.id === "water-J");
assert.equal(waterJack.title, "Water Supporter");
assert.equal(waterJack.rank, 11);
assert.equal(waterJack.pokerSuit, "Spades");

const straightFlush = [10, 11, 12, 13, 14].map((rank) => buildCardByRankAndType(rank, "fire"));
assert.equal(evaluateHand(straightFlush).label, "Straight Flush");

const fourKind = [
  buildCardByRankAndType(9, "fire"),
  buildCardByRankAndType(9, "water"),
  buildCardByRankAndType(9, "earth"),
  buildCardByRankAndType(9, "neutral"),
  buildCardByRankAndType(2, "fire")
];
assert.equal(evaluateHand(fourKind).label, "Four of a Kind");

const fullHouse = [
  buildCardByRankAndType(7, "fire"),
  buildCardByRankAndType(7, "water"),
  buildCardByRankAndType(7, "earth"),
  buildCardByRankAndType(4, "neutral"),
  buildCardByRankAndType(4, "fire")
];
assert.equal(evaluateHand(fullHouse).label, "Full House");

assert.equal(compareEvaluations(evaluateHand(straightFlush), evaluateHand(fourKind)), 1);
assert.equal(scoreRound(straightFlush, fourKind).result, "player");
assert.equal(getPrizeForWins(0).prize, "1 English Pack");
assert.equal(getPrizeForWins(5).prize, "English Pack 3 + 1 English Pack");

const stats = expectedPrizeStats(GAME_CONFIG, 0.5);
assert.equal(Math.round(stats.expectedRetail * 100) / 100, 20.38);
assert.equal(Math.round(stats.retailRtp * 1000) / 1000, 0.815);

console.log("All Pokemon Poker engine checks passed.");
