import assert from "node:assert/strict";
import {
  buildCardByRankAndType,
  compareEvaluations,
  createDeck,
  dealHoldemRound,
  evaluateBestHand,
  evaluateHand,
  expectedPrizeStats,
  GAME_CONFIG,
  getPrizeForWins,
  scoreFiveCardRound,
  scoreHoldemRound
} from "../src/engine.js";

const deck = createDeck();
assert.equal(deck.length, 52, "deck should have 52 cards");
assert.equal(new Set(deck.map((card) => card.id)).size, 52, "cards should be unique");
assert.ok(deck.every((card) => card.imageUrl), "cards should include an image URL or override URL");

const fireAce = deck.find((card) => card.id === "fire-A");
assert.equal(fireAce.title, "Fire Energy");
assert.equal(fireAce.rank, 14);
assert.equal(fireAce.pokerSuit, "Hearts");

const waterJack = deck.find((card) => card.id === "water-J");
assert.equal(waterJack.title, "Water Supporter");
assert.equal(waterJack.rank, 11);
assert.equal(waterJack.pokerSuit, "Spades");

const deterministic = (() => {
  let value = 0.01;
  return () => {
    value = (value + 0.37) % 1;
    return value;
  };
})();
const holdemDeal = dealHoldemRound(deterministic);
assert.equal(holdemDeal.playerHole.length, 2, "player should get 2 hole cards");
assert.equal(holdemDeal.dealerHole.length, 2, "dealer should get 2 hole cards");
assert.equal(holdemDeal.community.length, 5, "Hold'em board should have 5 cards");
assert.equal(holdemDeal.burns.length, 3, "Hold'em deal should include burn cards");
assert.equal(new Set([...holdemDeal.playerHole, ...holdemDeal.dealerHole, ...holdemDeal.community, ...holdemDeal.burns].map((card) => card.id)).size, 12, "dealt Hold'em cards should be unique");

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
assert.equal(scoreFiveCardRound(straightFlush, fourKind).result, "player");

const playerHole = [buildCardByRankAndType(14, "fire"), buildCardByRankAndType(13, "fire")];
const dealerHole = [buildCardByRankAndType(9, "water"), buildCardByRankAndType(9, "earth")];
const community = [
  buildCardByRankAndType(12, "fire"),
  buildCardByRankAndType(11, "fire"),
  buildCardByRankAndType(10, "fire"),
  buildCardByRankAndType(2, "water"),
  buildCardByRankAndType(3, "neutral")
];
assert.equal(evaluateBestHand([...playerHole, ...community]).label, "Straight Flush");
assert.equal(scoreHoldemRound(playerHole, dealerHole, community).result, "player");

assert.equal(getPrizeForWins(0).prize, "1 English Pack");
assert.equal(getPrizeForWins(5).prize, "English Pack 3 + 1 English Pack");

const stats = expectedPrizeStats(GAME_CONFIG, 0.5);
assert.equal(Math.round(stats.expectedRetail * 100) / 100, 20.38);
assert.equal(Math.round(stats.retailRtp * 1000) / 1000, 0.815);

console.log("All Type Flush Hold'em engine checks passed.");
