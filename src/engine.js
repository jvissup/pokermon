import { CARD_IMAGE_OVERRIDES, getDefaultCardImageUrl } from "./cardImages.js";

export const GAME_CONFIG = {
  entryFee: 25,
  scoredHands: 5,
  tiesPush: true,
  prizeTable: [
    { label: "0-2 wins", minWins: 0, maxWins: 2, prize: "1 English Pack", retailValue: 12, cost: 8 },
    { label: "3 wins", minWins: 3, maxWins: 3, prize: "2 English Packs", retailValue: 24, cost: 16 },
    { label: "4 wins", minWins: 4, maxWins: 4, prize: "English Pack 2 + 1 English Pack", retailValue: 34, cost: 25 },
    { label: "5 wins", minWins: 5, maxWins: 5, prize: "English Pack 3 + 1 English Pack", retailValue: 50, cost: 34 }
  ]
};

export const TYPES = [
  { key: "fire", name: "Fire", pokerSuit: "Hearts", symbol: "\u2665", cssClass: "type-fire" },
  { key: "water", name: "Water", pokerSuit: "Spades", symbol: "\u2660", cssClass: "type-water" },
  { key: "earth", name: "Earth", pokerSuit: "Clubs", symbol: "\u2663", cssClass: "type-earth" },
  { key: "neutral", name: "Neutral", pokerSuit: "Diamonds", symbol: "\u2666", cssClass: "type-neutral" }
];

export const RANKS = [
  { value: 2, short: "2", role: "Pokemon" },
  { value: 3, short: "3", role: "Pokemon" },
  { value: 4, short: "4", role: "Pokemon" },
  { value: 5, short: "5", role: "Pokemon" },
  { value: 6, short: "6", role: "Pokemon" },
  { value: 7, short: "7", role: "Pokemon" },
  { value: 8, short: "8", role: "Pokemon" },
  { value: 9, short: "9", role: "Pokemon" },
  { value: 10, short: "10", role: "Pokemon" },
  { value: 11, short: "J", role: "Supporter" },
  { value: 12, short: "Q", role: "Female Trainer" },
  { value: 13, short: "K", role: "Male Trainer" },
  { value: 14, short: "A", role: "Energy" }
];

export const HAND_LABELS = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush"
];

export const TRIVIA_QUESTIONS = [
  { question: "In this game, Fire cards are treated as which poker suit?", choices: ["Hearts", "Spades", "Clubs", "Diamonds"], answer: "Hearts" },
  { question: "In this game, Water cards are treated as which poker suit?", choices: ["Hearts", "Spades", "Clubs", "Diamonds"], answer: "Spades" },
  { question: "In this game, Earth cards are treated as which poker suit?", choices: ["Hearts", "Spades", "Clubs", "Diamonds"], answer: "Clubs" },
  { question: "In this game, Neutral cards are treated as which poker suit?", choices: ["Hearts", "Spades", "Clubs", "Diamonds"], answer: "Diamonds" },
  { question: "Which Pokemon-card role acts as the Ace?", choices: ["Energy", "Supporter", "Male Trainer", "Female Trainer"], answer: "Energy" },
  { question: "Which Pokemon-card role acts as the Jack?", choices: ["Energy", "Supporter", "Male Trainer", "Female Trainer"], answer: "Supporter" },
  { question: "Which Pokemon-card role acts as the Queen?", choices: ["Energy", "Supporter", "Male Trainer", "Female Trainer"], answer: "Female Trainer" },
  { question: "Which Pokemon-card role acts as the King?", choices: ["Energy", "Supporter", "Male Trainer", "Female Trainer"], answer: "Male Trainer" },
  { question: "In Hold'em, how many private hole cards does each side get?", choices: ["2", "3", "4", "5"], answer: "2" },
  { question: "In Hold'em, how many community cards are shared by both sides?", choices: ["3", "4", "5", "7"], answer: "5" },
  { question: "Which hand is stronger?", choices: ["Straight", "Flush", "One Pair", "High Card"], answer: "Flush" },
  { question: "Which hand beats a Full House?", choices: ["Flush", "Straight", "Four of a Kind", "Two Pair"], answer: "Four of a Kind" }
];

function cardTitle(type, rank) {
  if (rank.role === "Pokemon") return `${type.name} Pokemon Lv. ${rank.short}`;
  if (rank.role === "Energy") return `${type.name} Energy`;
  return `${type.name} ${rank.role}`;
}

export function createDeck() {
  const deck = [];
  let imageIndex = 0;
  for (const type of TYPES) {
    for (const rank of RANKS) {
      const id = `${type.key}-${rank.short}`;
      deck.push({
        id,
        type: type.key,
        typeName: type.name,
        pokerSuit: type.pokerSuit,
        suitSymbol: type.symbol,
        cssClass: type.cssClass,
        rank: rank.value,
        rankShort: rank.short,
        role: rank.role,
        title: cardTitle(type, rank),
        imageUrl: CARD_IMAGE_OVERRIDES[id] || getDefaultCardImageUrl(imageIndex)
      });
      imageIndex += 1;
    }
  }
  return deck;
}

export function shuffleDeck(deck, random = Math.random) {
  const copy = [...deck];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function dealFiveCardHands(random = Math.random) {
  const deck = shuffleDeck(createDeck(), random);
  return { player: deck.slice(0, 5), dealer: deck.slice(5, 10), remainingDeck: deck.slice(10) };
}

export function dealHoldemRound(random = Math.random) {
  const deck = shuffleDeck(createDeck(), random);
  const playerHole = [deck[0], deck[2]];
  const dealerHole = [deck[1], deck[3]];
  const burn1 = deck[4];
  const flop = [deck[5], deck[6], deck[7]];
  const burn2 = deck[8];
  const turn = deck[9];
  const burn3 = deck[10];
  const river = deck[11];
  return {
    playerHole,
    dealerHole,
    community: [...flop, turn, river],
    burns: [burn1, burn2, burn3],
    remainingDeck: deck.slice(12)
  };
}

function countRanks(cards) {
  const counts = new Map();
  for (const card of cards) counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  return counts;
}

function getStraightHighCard(values) {
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  if (uniqueValues.length !== 5) return null;
  if (uniqueValues[0] - uniqueValues[4] === 4) return uniqueValues[0];
  const aceLowStraight = [14, 5, 4, 3, 2];
  return aceLowStraight.every((value, index) => value === uniqueValues[index]) ? 5 : null;
}

function sortGroups(counts) {
  return [...counts.entries()].sort((left, right) => {
    const [leftRank, leftCount] = left;
    const [rightRank, rightCount] = right;
    if (rightCount !== leftCount) return rightCount - leftCount;
    return rightRank - leftRank;
  });
}

export function evaluateHand(cards) {
  if (!Array.isArray(cards) || cards.length !== 5) throw new Error("evaluateHand requires exactly 5 cards.");

  const values = cards.map((card) => card.rank).sort((a, b) => b - a);
  const counts = countRanks(cards);
  const groups = sortGroups(counts);
  const isFlush = cards.every((card) => card.type === cards[0].type);
  const straightHigh = getStraightHighCard(values);
  const isStraight = straightHigh !== null;

  if (isStraight && isFlush) return { category: 8, label: HAND_LABELS[8], tiebreakers: [straightHigh], cards };
  if (groups[0][1] === 4) return { category: 7, label: HAND_LABELS[7], tiebreakers: [groups[0][0], groups[1][0]], cards };
  if (groups[0][1] === 3 && groups[1][1] === 2) return { category: 6, label: HAND_LABELS[6], tiebreakers: [groups[0][0], groups[1][0]], cards };
  if (isFlush) return { category: 5, label: HAND_LABELS[5], tiebreakers: values, cards };
  if (isStraight) return { category: 4, label: HAND_LABELS[4], tiebreakers: [straightHigh], cards };
  if (groups[0][1] === 3) {
    const kickers = groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a);
    return { category: 3, label: HAND_LABELS[3], tiebreakers: [groups[0][0], ...kickers], cards };
  }
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = [groups[0][0], groups[1][0]].sort((a, b) => b - a);
    return { category: 2, label: HAND_LABELS[2], tiebreakers: [...pairs, groups[2][0]], cards };
  }
  if (groups[0][1] === 2) {
    const kickers = groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a);
    return { category: 1, label: HAND_LABELS[1], tiebreakers: [groups[0][0], ...kickers], cards };
  }
  return { category: 0, label: HAND_LABELS[0], tiebreakers: values, cards };
}

export function compareEvaluations(playerEvaluation, dealerEvaluation) {
  if (playerEvaluation.category !== dealerEvaluation.category) {
    return playerEvaluation.category > dealerEvaluation.category ? 1 : -1;
  }
  const maxLength = Math.max(playerEvaluation.tiebreakers.length, dealerEvaluation.tiebreakers.length);
  for (let index = 0; index < maxLength; index += 1) {
    const playerValue = playerEvaluation.tiebreakers[index] || 0;
    const dealerValue = dealerEvaluation.tiebreakers[index] || 0;
    if (playerValue !== dealerValue) return playerValue > dealerValue ? 1 : -1;
  }
  return 0;
}

function buildCombinations(cards, size) {
  const result = [];
  const working = [];
  function walk(start) {
    if (working.length === size) {
      result.push([...working]);
      return;
    }
    for (let index = start; index <= cards.length - (size - working.length); index += 1) {
      working.push(cards[index]);
      walk(index + 1);
      working.pop();
    }
  }
  walk(0);
  return result;
}

export function evaluateBestHand(cards) {
  if (!Array.isArray(cards) || cards.length < 5) throw new Error("evaluateBestHand requires at least 5 cards.");
  let best = null;
  for (const combo of buildCombinations(cards, 5)) {
    const evaluation = evaluateHand(combo);
    if (!best || compareEvaluations(evaluation, best) > 0) best = evaluation;
  }
  return best;
}

export function scoreFiveCardRound(playerCards, dealerCards) {
  const playerEvaluation = evaluateHand(playerCards);
  const dealerEvaluation = evaluateHand(dealerCards);
  const comparison = compareEvaluations(playerEvaluation, dealerEvaluation);
  return {
    playerEvaluation,
    dealerEvaluation,
    comparison,
    result: comparison > 0 ? "player" : comparison < 0 ? "dealer" : "push"
  };
}

export function scoreHoldemRound(playerHole, dealerHole, community) {
  const playerEvaluation = evaluateBestHand([...playerHole, ...community]);
  const dealerEvaluation = evaluateBestHand([...dealerHole, ...community]);
  const comparison = compareEvaluations(playerEvaluation, dealerEvaluation);
  return {
    playerEvaluation,
    dealerEvaluation,
    comparison,
    result: comparison > 0 ? "player" : comparison < 0 ? "dealer" : "push"
  };
}

export const scoreRound = scoreFiveCardRound;

export function getPrizeForWins(wins, config = GAME_CONFIG) {
  const prize = config.prizeTable.find((item) => wins >= item.minWins && wins <= item.maxWins);
  if (!prize) throw new Error(`No prize configured for ${wins} wins.`);
  return prize;
}

function combination(n, k) {
  if (k < 0 || k > n) return 0;
  let numerator = 1;
  let denominator = 1;
  for (let index = 1; index <= k; index += 1) {
    numerator *= n - (index - 1);
    denominator *= index;
  }
  return numerator / denominator;
}

export function binomialProbability(n, k, p = 0.5) {
  return combination(n, k) * p ** k * (1 - p) ** (n - k);
}

export function expectedPrizeStats(config = GAME_CONFIG, handWinProbability = 0.5) {
  let expectedRetail = 0;
  let expectedCost = 0;
  const rows = [];
  for (let wins = 0; wins <= config.scoredHands; wins += 1) {
    const probability = binomialProbability(config.scoredHands, wins, handWinProbability);
    const prize = getPrizeForWins(wins, config);
    expectedRetail += probability * prize.retailValue;
    expectedCost += probability * prize.cost;
    rows.push({ wins, probability, prize: prize.prize, retailValue: prize.retailValue, cost: prize.cost });
  }
  return { expectedRetail, expectedCost, expectedGrossMargin: config.entryFee - expectedCost, retailRtp: expectedRetail / config.entryFee, rows };
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);
}

export function formatPercent(value) {
  return new Intl.NumberFormat("en-CA", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

export function getRandomTrivia(random = Math.random) {
  const index = Math.floor(random() * TRIVIA_QUESTIONS.length);
  return TRIVIA_QUESTIONS[index];
}

export function buildCardByRankAndType(rankValue, typeKey) {
  const type = TYPES.find((item) => item.key === typeKey);
  const rank = RANKS.find((item) => item.value === rankValue);
  if (!type || !rank) throw new Error(`Unknown card: ${rankValue} ${typeKey}`);
  const id = `${type.key}-${rank.short}`;
  return {
    id,
    type: type.key,
    typeName: type.name,
    pokerSuit: type.pokerSuit,
    suitSymbol: type.symbol,
    cssClass: type.cssClass,
    rank: rank.value,
    rankShort: rank.short,
    role: rank.role,
    title: cardTitle(type, rank),
    imageUrl: CARD_IMAGE_OVERRIDES[id] || null
  };
}
