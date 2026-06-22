import {
  GAME_CONFIG,
  TYPES,
  RANKS,
  dealHands,
  expectedPrizeStats,
  formatMoney,
  formatPercent,
  getPrizeForWins,
  getRandomTrivia,
  scoreRound
} from "./engine.js";

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
  dealButton: document.querySelector("#deal-button"),
  newGameButton: document.querySelector("#new-game-button"),
  triviaToggle: document.querySelector("#trivia-toggle"),
  scoredHands: document.querySelector("#scored-hands"),
  wins: document.querySelector("#wins"),
  dealerWins: document.querySelector("#dealer-wins"),
  pushes: document.querySelector("#pushes"),
  playerCards: document.querySelector("#player-cards"),
  dealerCards: document.querySelector("#dealer-cards"),
  playerHandName: document.querySelector("#player-hand-name"),
  dealerHandName: document.querySelector("#dealer-hand-name"),
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

function renderCards(container, cards) {
  if (!cards || cards.length === 0) {
    container.innerHTML = Array.from({ length: 5 }).map(() => {
      return `<div class="card card-back"><span>?</span><small>Pokemon</small></div>`;
    }).join("");
    return;
  }

  container.innerHTML = cards.map((card) => {
    return `<article class="card ${card.cssClass}" title="${card.title}">
      <div class="card-top"><strong>${card.rankShort}</strong><span>${card.suitSymbol}</span></div>
      <div class="card-center"><span class="card-role">${card.role}</span><strong>${card.typeName}</strong></div>
      <div class="card-bottom">${card.pokerSuit}</div>
    </article>`;
  }).join("");
}

function showBanner(message, tone = "neutral") {
  elements.resultBanner.textContent = message;
  elements.resultBanner.className = `result-banner ${tone}`;
}

function renderTrivia() {
  if (!state.currentTrivia) state.currentTrivia = getRandomTrivia();

  elements.triviaQuestion.textContent = state.currentTrivia.question;
  elements.triviaChoices.innerHTML = state.currentTrivia.choices.map((choice) => {
    return `<button class="choice-button" type="button" data-choice="${choice}">${choice}</button>`;
  }).join("");
  elements.triviaFeedback.textContent = state.triviaRequired ? "Answer correctly to unlock the next hand." : "Trivia is optional in this mode.";
  elements.triviaFeedback.className = "muted";
}

function resetTriviaForNextHand() {
  state.currentTrivia = getRandomTrivia();
  state.triviaUnlocked = !state.triviaRequired;
  renderTrivia();
}

function renderLog() {
  if (state.handLog.length === 0) {
    elements.handLog.innerHTML = `<li>No hands dealt yet.</li>`;
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

function renderButtons() {
  const canDeal = !state.gameOver && (!state.triviaRequired || state.triviaUnlocked);
  elements.dealButton.disabled = !canDeal;
  if (state.gameOver) elements.dealButton.textContent = "Game complete";
  else if (state.triviaRequired && !state.triviaUnlocked) elements.dealButton.textContent = "Answer trivia first";
  else elements.dealButton.textContent = state.scoredHands === 0 ? "Deal first hand" : "Deal next hand";
}

function renderRound() {
  const round = state.currentRound;
  renderCards(elements.playerCards, round ? round.playerCards : []);
  renderCards(elements.dealerCards, round ? round.dealerCards : []);
  elements.playerHandName.textContent = round ? round.playerEvaluation.label : "Waiting to deal";
  elements.dealerHandName.textContent = round ? round.dealerEvaluation.label : "Waiting to deal";
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
  if (result === "player") return { title: `Hand ${roundNumber}: Player wins`, detail: `${playerLabel} beats dealer ${dealerLabel}.` };
  if (result === "dealer") return { title: `Hand ${roundNumber}: Dealer wins`, detail: `Dealer ${dealerLabel} beats player ${playerLabel}.` };
  return { title: "Push", detail: `${playerLabel} ties ${dealerLabel}. Hand does not count.` };
}

function dealNextHand() {
  if (state.gameOver || (state.triviaRequired && !state.triviaUnlocked)) return;

  const dealt = dealHands();
  const score = scoreRound(dealt.player, dealt.dealer);
  const roundNumber = state.scoredHands + 1;

  state.currentRound = {
    playerCards: dealt.player,
    dealerCards: dealt.dealer,
    playerEvaluation: score.playerEvaluation,
    dealerEvaluation: score.dealerEvaluation,
    result: score.result
  };

  if (score.result === "player") {
    state.wins += 1;
    state.scoredHands += 1;
    showBanner("Player wins this hand!", "win");
  } else if (score.result === "dealer") {
    state.dealerWins += 1;
    state.scoredHands += 1;
    showBanner("Dealer wins this hand.", "loss");
  } else {
    state.pushes += 1;
    showBanner("Push. Same strength hand, so re-deal without counting it.", "push");
  }

  state.handLog.unshift(createRoundLog(roundNumber, score.result, score));

  if (state.scoredHands >= GAME_CONFIG.scoredHands) {
    state.gameOver = true;
    const prize = getPrizeForWins(state.wins, GAME_CONFIG);
    showBanner(`Game complete: ${state.wins} player wins. Prize: ${prize.prize}.`, "win");
  } else {
    resetTriviaForNextHand();
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
  showBanner("New game ready. Win more hands to upgrade the guaranteed prize.", "neutral");
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
  elements.dealButton.addEventListener("click", dealNextHand);
  elements.newGameButton.addEventListener("click", newGame);
  elements.triviaToggle.addEventListener("change", () => {
    state.triviaRequired = elements.triviaToggle.checked;
    state.triviaUnlocked = !state.triviaRequired;
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
