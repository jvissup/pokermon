import {
  GAME_CONFIG,
  TYPES,
  RANKS,
  dealHoldemRound,
  expectedPrizeStats,
  formatMoney,
  formatPercent,
  getPrizeForWins,
  getRandomTrivia,
  scoreHoldemRound
} from "./engine.js";

const STAGES = {
  WAITING: "waiting",
  PREFLOP: "preflop",
  FLOP: "flop",
  TURN: "turn",
  SHOWDOWN: "showdown"
};

const state = {
  scoredHands: 0,
  wins: 0,
  dealerWins: 0,
  pushes: 0,
  currentRound: null,
  gameOver: false,
  triviaRequired: true,
  triviaUnlocked: false,
  currentTrivia: null,
  handLog: []
};

const elements = {
  actionButton: document.querySelector("#deal-button"),
  newGameButton: document.querySelector("#new-game-button"),
  triviaToggle: document.querySelector("#trivia-toggle"),
  scoredHands: document.querySelector("#scored-hands"),
  wins: document.querySelector("#wins"),
  dealerWins: document.querySelector("#dealer-wins"),
  pushes: document.querySelector("#pushes"),
  playerCards: document.querySelector("#player-cards"),
  dealerCards: document.querySelector("#dealer-cards"),
  communityCards: document.querySelector("#community-cards"),
  playerHandName: document.querySelector("#player-hand-name"),
  dealerHandName: document.querySelector("#dealer-hand-name"),
  boardStatus: document.querySelector("#board-status"),
  resultBanner: document.querySelector("#result-banner"),
  finalPrize: document.querySelector("#final-prize"),
  currentPrize: document.querySelector("#current-prize"),
  prizeTable: document.querySelector("#prize-table-body"),
  mappingTable: document.querySelector("#mapping-table-body"),
  statsPanel: document.querySelector("#stats-panel"),
  handLog: document.querySelector("#hand-log"),
  triviaQuestion: document.querySelector("#trivia-question"),
  triviaChoices: document.querySelector("#trivia-choices"),
  triviaFeedback: document.querySelector("#trivia-feedback")
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderPrizeTable() {
  elements.prizeTable.innerHTML = GAME_CONFIG.prizeTable.map((prize) => {
    return `<tr>
      <td>${prize.label}</td>
      <td>${prize.prize}</td>
      <td>${formatMoney(prize.retailValue)}</td>
      <td>${formatMoney(prize.cost)}</td>
    </tr>`;
  }).join("");
}

function renderMappingTable() {
  const typeRows = TYPES.map((type) => {
    return `<tr>
      <td><span class="suit-pill ${type.cssClass}">${type.name}</span></td>
      <td>${type.pokerSuit}</td>
      <td>${type.symbol}</td>
    </tr>`;
  }).join("");

  const rankRows = RANKS.filter((rank) => rank.value >= 11).map((rank) => {
    const pokerRank = rank.short === "A" ? "Ace" : rank.short === "K" ? "King" : rank.short === "Q" ? "Queen" : "Jack";
    return `<tr>
      <td>${rank.role}</td>
      <td>${pokerRank}</td>
      <td>${rank.short}</td>
    </tr>`;
  }).join("");

  elements.mappingTable.innerHTML = `${typeRows}${rankRows}`;
}

function renderStatsPanel() {
  const stats = expectedPrizeStats(GAME_CONFIG, 0.5);
  elements.statsPanel.innerHTML = `
    <div class="metric-card"><span class="metric-label">Entry</span><strong>${formatMoney(GAME_CONFIG.entryFee)}</strong></div>
    <div class="metric-card"><span class="metric-label">Avg retail return</span><strong>${formatMoney(stats.expectedRetail)}</strong></div>
    <div class="metric-card"><span class="metric-label">Retail RTP estimate</span><strong>${formatPercent(stats.retailRtp)}</strong></div>
    <div class="metric-card"><span class="metric-label">Avg prize cost</span><strong>${formatMoney(stats.expectedCost)}</strong></div>
    <div class="metric-card"><span class="metric-label">Avg gross margin</span><strong>${formatMoney(stats.expectedGrossMargin)}</strong></div>
  `;
}

function cardMarkup(card, extraClass = "") {
  if (!card) {
    return `<div class="card card-back ${extraClass}"><span>?</span><small>Pokemon</small></div>`;
  }

  const safeTitle = escapeHtml(card.title);
  const safeImage = card.imageUrl ? escapeHtml(card.imageUrl) : "";
  const image = safeImage
    ? `<img class="card-art" src="${safeImage}" alt="" loading="lazy" onerror="this.closest('.card').classList.add('art-failed'); this.remove();" />`
    : "";

  return `<article class="card ${card.cssClass} ${extraClass}" title="${safeTitle}">
    ${image}
    <div class="card-overlay"></div>
    <div class="card-top"><strong>${card.rankShort}</strong><span>${card.suitSymbol}</span></div>
    <div class="card-center"><span class="card-role">${card.role}</span><strong>${card.typeName}</strong></div>
    <div class="card-bottom">${card.pokerSuit}</div>
  </article>`;
}

function renderCards(container, cards, slotCount, options = {}) {
  const visibleCards = cards || [];
  const bestIds = new Set(options.bestCards?.map((card) => card.id) || []);
  const html = [];
  for (let index = 0; index < slotCount; index += 1) {
    const card = options.hidden ? null : visibleCards[index];
    const bestClass = card && bestIds.has(card.id) ? "best-card" : "";
    html.push(cardMarkup(card, bestClass));
  }
  container.innerHTML = html.join("");
}

function renderCommunityCards() {
  const round = state.currentRound;
  if (!round) {
    renderCards(elements.communityCards, [], 5);
    return;
  }
  const visible = round.community.slice(0, round.visibleCommunityCount);
  renderCards(elements.communityCards, visible, 5, { bestCards: round.bestCommunityCards || [] });
}

function showBanner(message, tone = "neutral") {
  elements.resultBanner.textContent = message;
  elements.resultBanner.className = `result-banner ${tone}`;
}

function renderTrivia() {
  if (!state.currentTrivia) state.currentTrivia = getRandomTrivia();

  elements.triviaQuestion.textContent = state.currentTrivia.question;
  elements.triviaChoices.innerHTML = state.currentTrivia.choices.map((choice) => {
    return `<button class="choice-button" type="button" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`;
  }).join("");
  elements.triviaFeedback.textContent = state.triviaRequired ? "Answer correctly to unlock the next Hold'em deal." : "Trivia is optional in this mode.";
  elements.triviaFeedback.className = "muted";
}

function resetTriviaForNextHand() {
  state.currentTrivia = getRandomTrivia();
  state.triviaUnlocked = !state.triviaRequired;
  renderTrivia();
}

function renderLog() {
  if (state.handLog.length === 0) {
    elements.handLog.innerHTML = `<li>No Hold'em showdowns yet.</li>`;
    return;
  }
  elements.handLog.innerHTML = state.handLog.map((entry) => {
    return `<li><strong>${entry.title}</strong><span>${entry.detail}</span></li>`;
  }).join("");
}

function renderScoreboard() {
  elements.scoredHands.textContent = `${state.scoredHands}/${GAME_CONFIG.scoredHands}`;
  elements.wins.textContent = state.wins;
  elements.dealerWins.textContent = state.dealerWins;
  elements.pushes.textContent = state.pushes;

  const currentPrize = getPrizeForWins(state.wins, GAME_CONFIG);
  elements.currentPrize.innerHTML = `Current prize tier: <strong>${currentPrize.prize}</strong> (${formatMoney(currentPrize.retailValue)} retail)`;

  if (state.gameOver) {
    const finalPrize = getPrizeForWins(state.wins, GAME_CONFIG);
    elements.finalPrize.innerHTML = `Final prize: <strong>${finalPrize.prize}</strong> - ${formatMoney(finalPrize.retailValue)} retail value.`;
    elements.finalPrize.hidden = false;
  } else {
    elements.finalPrize.hidden = true;
  }
}

function getActionButtonText() {
  if (state.gameOver) return "Game complete";
  if (!state.currentRound || state.currentRound.stage === STAGES.SHOWDOWN) {
    if (state.triviaRequired && !state.triviaUnlocked) return "Answer trivia first";
    return state.scoredHands === 0 && state.pushes === 0 ? "Deal hole cards" : "Deal next hand";
  }
  if (state.currentRound.stage === STAGES.PREFLOP) return "Reveal flop";
  if (state.currentRound.stage === STAGES.FLOP) return "Reveal turn";
  if (state.currentRound.stage === STAGES.TURN) return "Reveal river and showdown";
  return "Continue";
}

function renderButtons() {
  const betweenHands = !state.currentRound || state.currentRound.stage === STAGES.SHOWDOWN;
  const lockedByTrivia = betweenHands && state.triviaRequired && !state.triviaUnlocked;
  elements.actionButton.disabled = state.gameOver || lockedByTrivia;
  elements.actionButton.textContent = getActionButtonText();
}

function renderRound() {
  const round = state.currentRound;
  if (!round) {
    renderCards(elements.playerCards, [], 2);
    renderCards(elements.dealerCards, [], 2);
    renderCommunityCards();
    elements.playerHandName.textContent = "Waiting to deal";
    elements.dealerHandName.textContent = "Hidden until showdown";
    elements.boardStatus.textContent = "Answer trivia, then deal 2 private cards to each side.";
    return;
  }

  const dealerHidden = round.stage !== STAGES.SHOWDOWN;
  renderCards(elements.playerCards, round.playerHole, 2, { bestCards: round.playerEvaluation?.cards || [] });
  renderCards(elements.dealerCards, round.dealerHole, 2, { hidden: dealerHidden, bestCards: round.dealerEvaluation?.cards || [] });
  renderCommunityCards();

  elements.playerHandName.textContent = round.playerEvaluation ? round.playerEvaluation.label : "2 hole cards";
  elements.dealerHandName.textContent = round.dealerEvaluation ? round.dealerEvaluation.label : "Hidden until showdown";

  if (round.stage === STAGES.PREFLOP) elements.boardStatus.textContent = "Pre-flop: player has 2 hole cards. Dealer is hidden.";
  if (round.stage === STAGES.FLOP) elements.boardStatus.textContent = "Flop revealed: 3 community cards are shared by both sides.";
  if (round.stage === STAGES.TURN) elements.boardStatus.textContent = "Turn revealed: 4 community cards are visible. River comes next.";
  if (round.stage === STAGES.SHOWDOWN) elements.boardStatus.textContent = "Showdown: best 5-card hand from each side's 2 hole cards plus the 5-card board wins.";
}

function render() {
  renderScoreboard();
  renderRound();
  renderLog();
  renderButtons();
}

function createRoundLog(roundNumber, result, score) {
  const playerLabel = score.playerEvaluation.label;
  const dealerLabel = score.dealerEvaluation.label;
  if (result === "player") return { title: `Showdown ${roundNumber}: Player wins`, detail: `${playerLabel} beats dealer ${dealerLabel}.` };
  if (result === "dealer") return { title: `Showdown ${roundNumber}: Dealer wins`, detail: `Dealer ${dealerLabel} beats player ${playerLabel}.` };
  return { title: "Push", detail: `${playerLabel} ties ${dealerLabel}. Showdown does not count toward the 5 scored hands.` };
}

function startHoldemHand() {
  const dealt = dealHoldemRound();
  state.currentRound = {
    playerHole: dealt.playerHole,
    dealerHole: dealt.dealerHole,
    community: dealt.community,
    visibleCommunityCount: 0,
    stage: STAGES.PREFLOP,
    playerEvaluation: null,
    dealerEvaluation: null,
    result: null,
    bestCommunityCards: []
  };
  state.triviaUnlocked = !state.triviaRequired;
  showBanner("Hole cards dealt. Reveal the shared board one street at a time.", "neutral");
  render();
}

function finishShowdown() {
  const round = state.currentRound;
  const score = scoreHoldemRound(round.playerHole, round.dealerHole, round.community);
  const roundNumber = state.scoredHands + 1;

  round.playerEvaluation = score.playerEvaluation;
  round.dealerEvaluation = score.dealerEvaluation;
  round.result = score.result;
  round.stage = STAGES.SHOWDOWN;
  round.visibleCommunityCount = 5;

  const bestCommunity = new Map();
  for (const card of [...score.playerEvaluation.cards, ...score.dealerEvaluation.cards]) {
    if (round.community.some((communityCard) => communityCard.id === card.id)) bestCommunity.set(card.id, card);
  }
  round.bestCommunityCards = [...bestCommunity.values()];

  if (score.result === "player") {
    state.wins += 1;
    state.scoredHands += 1;
    showBanner("Player wins the Hold'em showdown!", "win");
  } else if (score.result === "dealer") {
    state.dealerWins += 1;
    state.scoredHands += 1;
    showBanner("Dealer wins the Hold'em showdown.", "loss");
  } else {
    state.pushes += 1;
    showBanner("Push. Same best 5-card hand, so replay without counting it.", "push");
  }

  state.handLog.unshift(createRoundLog(roundNumber, score.result, score));

  if (state.scoredHands >= GAME_CONFIG.scoredHands) {
    state.gameOver = true;
    const prize = getPrizeForWins(state.wins, GAME_CONFIG);
    showBanner(`Game complete: ${state.wins} player wins. Prize: ${prize.prize}.`, "win");
  } else {
    resetTriviaForNextHand();
  }
}

function advanceHand() {
  if (state.gameOver) return;

  if (!state.currentRound || state.currentRound.stage === STAGES.SHOWDOWN) {
    if (state.triviaRequired && !state.triviaUnlocked) return;
    startHoldemHand();
    return;
  }

  const round = state.currentRound;
  if (round.stage === STAGES.PREFLOP) {
    round.stage = STAGES.FLOP;
    round.visibleCommunityCount = 3;
    showBanner("Flop revealed: 3 shared cards are on the board.", "neutral");
  } else if (round.stage === STAGES.FLOP) {
    round.stage = STAGES.TURN;
    round.visibleCommunityCount = 4;
    showBanner("Turn revealed: one card away from showdown.", "neutral");
  } else if (round.stage === STAGES.TURN) {
    finishShowdown();
  }

  render();
}

function newGame() {
  state.scoredHands = 0;
  state.wins = 0;
  state.dealerWins = 0;
  state.pushes = 0;
  state.currentRound = null;
  state.gameOver = false;
  state.handLog = [];
  state.triviaRequired = elements.triviaToggle.checked;
  state.triviaUnlocked = !state.triviaRequired;
  state.currentTrivia = getRandomTrivia();
  showBanner("New Hold'em game ready. Win more showdowns to upgrade the guaranteed prize.", "neutral");
  renderTrivia();
  render();
}

function answerTrivia(choice) {
  if (!state.currentTrivia || !state.triviaRequired || state.gameOver) return;
  const isCorrect = choice === state.currentTrivia.answer;
  if (isCorrect) {
    state.triviaUnlocked = true;
    elements.triviaFeedback.textContent = "Correct. Deal is unlocked.";
    elements.triviaFeedback.className = "success-text";
  } else {
    elements.triviaFeedback.textContent = "Not quite. Try again.";
    elements.triviaFeedback.className = "error-text";
  }
  renderButtons();
}

function attachEvents() {
  elements.actionButton.addEventListener("click", advanceHand);
  elements.newGameButton.addEventListener("click", newGame);
  elements.triviaToggle.addEventListener("change", () => {
    state.triviaRequired = elements.triviaToggle.checked;
    const betweenHands = !state.currentRound || state.currentRound.stage === STAGES.SHOWDOWN;
    if (betweenHands) state.triviaUnlocked = !state.triviaRequired;
    renderTrivia();
    renderButtons();
  });
  elements.triviaChoices.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-choice]");
    if (!button) return;
    answerTrivia(button.dataset.choice);
  });
}

function init() {
  renderPrizeTable();
  renderMappingTable();
  renderStatsPanel();
  attachEvents();
  newGame();
}

init();
