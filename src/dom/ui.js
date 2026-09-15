import { DIRECTIONS, FLEET, SIZE } from "../constants.js";
import { GAMEPHASE, SHIP_STATES } from "../controller.js";
import { calcCol, calcRow, fitsBoard, spanCells } from "../grid.js";
import {
  buildQueue,
  clearBoard,
  clearPreview,
  markShips,
  renderPreview,
  updateBoard,
  updateQueue,
} from "./render.js";

const BOARD_MESSAGE = Object.freeze({
  PLAYER: "Your Fleet",
  ENEMY: "Enemy Waters",
});

const BOARDS = Object.freeze({
  PLAYER: "player",
  ENEMY: "enemy",
});
let activeBoard = BOARDS.PLAYER;

export function highlightShip(key, length, direction, gameboard) {
  if (!Number.isInteger(key)) return { cells: [], valid: false };

  const fits = fitsBoard(key, length, direction);
  const row = calcRow(key);
  const col = calcCol(key);

  const cells = spanCells(key, length, direction).filter((cell) => {
    if (cell < 0 || cell >= SIZE * SIZE) return false;
    if (direction === DIRECTIONS.H) return calcRow(cell) === row;
    if (direction === DIRECTIONS.V) return calcCol(cell) === col;
    return false;
  });

  if (!fits) return { cells, valid: false };
  const valid = cells.every((cell) => gameboard.isEmpty(cell));
  return { cells, valid };
}

export function init(controller, { playerBoard, enemyBoard }) {
  const statusEl = document.getElementById("status");
  const gameEl = document.getElementById("game");
  const queueEl = document.getElementById("ship-queue");
  const buttonUndoEl = document.getElementById("button-undo");
  const buttonRotateEl = document.getElementById("button-rotate");
  const buttonAutoEl = document.getElementById("button-auto");
  const buttonStartEl = document.getElementById("button-start");
  const gameoverEl = document.getElementById("gameover");
  const winnerEl = document.getElementById("winner");
  const buttonRestartEl = document.getElementById("button-restart");
  const buttonAgainEl = document.getElementById("button-again");
  const buttonToggleBoardEl = document.getElementById("button-toggle-board");

  let direction = DIRECTIONS.H;
  let busy = false;
  let previewKey = null;

  function parseKey(event) {
    return Number.parseInt(event.target.dataset.key, 10);
  }

  function moveFocus(board, key, rowDelta, colDelta) {
    const row = calcRow(key) + rowDelta;
    const col = calcCol(key) + colDelta;
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return;

    const next = board.querySelector(`.cell[data-key="${row * SIZE + col}"]`);
    if (!next) return;

    // find focused, reset value, move to next, set as new focus
    board.querySelector('.cell[tabindex="0"]').setAttribute("tabindex", "-1");
    next.tabIndex = 0;
    next.focus();
  }

  function onBoardKeyDown(event, activate) {
    const key = parseKey(event);
    if (Number.isNaN(key)) return;

    const arrows = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };

    const move = arrows[event.key];
    if (move) {
      // prevent default scroll
      event.preventDefault();
      moveFocus(event.currentTarget, key, move[0], move[1]);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // re-enable onClickPlace & onClickAttack
      activate(event);
    }
  }

  function placedShipName() {
    return new Set(
      controller.getPlayer(0).gameboard.fleetShips.map((ship) => ship.name),
    );
  }

  function lastShip() {
    const placed = placedShipName();
    // name of the last ship that was placed
    return FLEET.findLast(({ name }) => placed.has(name))?.name;
  }

  function currentShip() {
    const placed = placedShipName();
    // name of first ship not yet placed
    return FLEET.find(({ name }) => !placed.has(name))?.name;
  }

  function repaint() {
    clearBoard(playerBoard);
    clearBoard(enemyBoard);
    updateBoard(playerBoard, controller.getPlayer(0).gameboard);
    // show ships for player only, keep enemy ships hidden (fog-of-war)
    markShips(playerBoard, controller.getPlayer(0).gameboard);
    updateBoard(enemyBoard, controller.getPlayer(1).gameboard);
    updateQueue(queueEl, controller.getPlayer(0).gameboard);
  }

  function onClickPlace(event) {
    const key = parseKey(event);
    const name = currentShip();

    // conditions for immediate exit
    if (controller.phase !== GAMEPHASE.PLACE) return;
    if (Number.isNaN(key)) return;
    if (!name) return;
    if (busy) return;

    try {
      controller.placeShip(0, key, name, direction);
    } catch (error) {
      statusEl.textContent = error.message;
      return;
    }

    repaint();
    buttonUndoEl.disabled = false;

    // update status for active ship
    const next = currentShip();
    if (next) {
      statusEl.textContent = `Place: ${next}`;
      return;
    }

    // no ships left, exit
    buttonStartEl.disabled = false;
    statusEl.textContent = "Fleet ready";
  }

  function onClickAttack(event) {
    const key = parseKey(event);

    // conditions for immediate exit
    if (controller.phase !== GAMEPHASE.PLAY) return;
    if (Number.isNaN(key)) return;
    if (busy) return;

    // player turn
    busy = true;
    const turn = controller.playTurn(key);
    if (turn.result === SHIP_STATES.DUPLICATE)
      statusEl.textContent = "Already attacked";
    else if (turn.result === SHIP_STATES.HIT)
      statusEl.textContent = `You hit ${turn.ship}!`;
    else statusEl.textContent = "You missed";

    // gameover check
    if (turn.gameOver) {
      winnerEl.textContent = controller.getPlayer(turn.winner).name;
      syncPhase();
    }

    // cpu, keeps turn on 'hit'
    while (controller.activePlayer === 1 && !controller.isGameOver) {
      const cpuTurn = controller.playTurn();

      // duplicate should never occur for cpu, defensive measure
      if (cpuTurn.result === SHIP_STATES.DUPLICATE) {
        statusEl.textContent = "CPU, already attacked";
        break;
      }

      if (cpuTurn.result === SHIP_STATES.HIT) {
        statusEl.textContent = `CPU hit your ${cpuTurn.ship}!`;
      } else {
        statusEl.textContent = "CPU missed";
      }

      // gameover check
      if (cpuTurn.gameOver) {
        winnerEl.textContent = controller.getPlayer(cpuTurn.winner).name;
        syncPhase();
      }
    }

    busy = false;
    repaint();
  }

  function onPlacementKeyDown(event) {
    const isRotateKey =
      event.key.toLowerCase() === "r" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey;

    if (!isRotateKey || controller.phase !== GAMEPHASE.PLACE) return;

    event.preventDefault();
    onRotate();
  }

  function onUndo() {
    const name = lastShip();

    // conditions for immediate exit
    if (controller.phase !== GAMEPHASE.PLACE) return;
    if (!name) return;

    try {
      controller.removeShip(0, name);
    } catch (error) {
      repaint();
      statusEl.textContent = error.message;
      return;
    }

    repaint();
    buttonStartEl.disabled = true;
    buttonUndoEl.disabled =
      controller.getPlayer(0).gameboard.fleetShips.length === 0;
    statusEl.textContent = `Place: ${currentShip()}`;
    refreshPreview();
  }

  function onRotate() {
    direction = direction === DIRECTIONS.H ? DIRECTIONS.V : DIRECTIONS.H;
    refreshPreview();
  }

  function onRestart() {
    controller.resetGame();
    repaint();
    syncPhase();
    activeBoard = BOARDS.PLAYER;
    syncBoard();
    clearPlayerPreview();
    direction = DIRECTIONS.H;
    busy = false;
    buttonStartEl.disabled = true;
    buttonUndoEl.disabled = true;
    statusEl.textContent = "Place your Carrier";
  }

  function onAuto() {
    try {
      controller.autoPlace(0);
    } catch (error) {
      repaint();
      statusEl.textContent = error.message;
      return;
    }

    repaint();
    buttonUndoEl.disabled = false;
    buttonStartEl.disabled = false;
    statusEl.textContent = "Fleet ready";
  }

  function onStart() {
    try {
      controller.startGame();
    } catch (error) {
      statusEl.textContent = error.message;
      return;
    }

    syncPhase();
    activeBoard = BOARDS.PLAYER;
    syncBoard();
    statusEl.textContent = "Your turn";
  }

  function refreshPreview() {
    if (previewKey === null) return;

    const name = currentShip();
    if (!name) {
      clearPlayerPreview();
      return;
    }

    const ship = FLEET.find(({ name: shipName }) => shipName === name);
    if (!ship) {
      clearPlayerPreview();
      return;
    }

    const gameboard = controller.getPlayer(0).gameboard;
    const { cells, valid } = highlightShip(
      previewKey,
      ship.length,
      direction,
      gameboard,
    );
    renderPreview(playerBoard, cells, valid);
  }

  function previewShip(event) {
    if (controller.phase !== GAMEPHASE.PLACE) {
      clearPlayerPreview();
      return;
    }

    const key = parseKey(event);
    if (Number.isNaN(key)) {
      clearPlayerPreview();
      return;
    }

    previewKey = key;
    refreshPreview();
  }

  function clearPlayerPreview() {
    previewKey = null;
    clearPreview(playerBoard);
  }

  function syncBoard() {
    gameEl.dataset.board = activeBoard;
    buttonToggleBoardEl.textContent =
      activeBoard === BOARDS.PLAYER
        ? BOARD_MESSAGE.ENEMY
        : BOARD_MESSAGE.PLAYER;
  }

  function onToggleBoard() {
    activeBoard = activeBoard === BOARDS.PLAYER ? BOARDS.ENEMY : BOARDS.PLAYER;
    syncBoard();
  }

  function syncPhase() {
    gameEl.dataset.phase = controller.phase;
    if (controller.isGameOver) gameoverEl.showModal();
    else gameoverEl.close();
  }

  // setup event listeners
  document.addEventListener("keydown", onPlacementKeyDown);
  playerBoard.addEventListener("click", onClickPlace);
  playerBoard.addEventListener("keydown", (e) =>
    onBoardKeyDown(e, onClickPlace),
  );
  playerBoard.addEventListener("pointerover", previewShip);
  playerBoard.addEventListener("focusin", previewShip);
  playerBoard.addEventListener("pointerleave", clearPlayerPreview);
  // clear preview when focus goes off board
  playerBoard.addEventListener("focusout", (e) => {
    if (playerBoard.contains(e.relatedTarget)) return;
    clearPlayerPreview();
  });
  enemyBoard.addEventListener("click", onClickAttack);
  enemyBoard.addEventListener("keydown", (e) =>
    onBoardKeyDown(e, onClickAttack),
  );
  buttonToggleBoardEl.addEventListener("click", onToggleBoard);
  buttonUndoEl.addEventListener("click", onUndo);
  buttonRotateEl.addEventListener("click", onRotate);
  buttonAutoEl.addEventListener("click", onAuto);
  buttonStartEl.addEventListener("click", onStart);
  buttonRestartEl.addEventListener("click", onRestart);
  buttonAgainEl.addEventListener("click", onRestart);

  // one-time setup
  buildQueue(queueEl);
  repaint();
  syncPhase();
  syncBoard();
  buttonStartEl.disabled = true;
  statusEl.textContent = "Place your Carrier";
}
