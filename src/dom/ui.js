import { DIRECTIONS, FLEET, SIZE } from "../constants.js";
import { gamePhase } from "../controller.js";
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

  let direction = DIRECTIONS.H;
  let busy = false;
  let previewKey = null;

  function parseKey(event) {
    return Number.parseInt(event.target.dataset.key, 10);
  }

  function moveFocus(board, key, rowDelta, colDelta) {
    const row = Math.floor(key / SIZE) + rowDelta;
    const col = (key % SIZE) + colDelta;
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

  function lastShip() {
    const placed = new Set(
      controller.getPlayer(0).gameboard.fleetShips.map((ship) => ship.name),
    );

    // name of the last ship that was placed
    return FLEET.findLast(({ name }) => placed.has(name))?.name;
  }

  function currentShip() {
    const placed = new Set(
      controller.getPlayer(0).gameboard.fleetShips.map((ship) => ship.name),
    );

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
    if (controller.phase !== gamePhase.PLACE) return;
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
    if (controller.phase !== gamePhase.PLAY) return;
    if (Number.isNaN(key)) return;
    if (busy) return;

    // player turn
    busy = true;
    const turn = controller.playTurn(key);
    if (turn.result === "duplicate") {
      statusEl.textContent = "Already attacked";
      busy = false;
      return;
    }
    if (turn.result === "hit") {
      statusEl.textContent = `You hit ${turn.ship}!`;
      busy = false;
    }
    if (turn.result === "miss") {
      statusEl.textContent = "You missed";
      busy = false;
    }

    // gameover check
    if (turn.gameOver) {
      winnerEl.textContent = controller.getPlayer(turn.winner).name;
      syncPhase();
      repaint();
      return;
    }

    // cpu turn
    busy = true;
    const cpuTurn = controller.playTurn();

    // duplicate should never occur for cpu, defensive measure
    if (cpuTurn.result === "duplicate") {
      statusEl.textContent = "CPU, already attacked";
      busy = false;
      return;
    }
    if (cpuTurn.result === "hit") {
      statusEl.textContent = `CPU hit your ${cpuTurn.ship}!`;
      busy = false;
    }
    if (cpuTurn.result === "miss") {
      statusEl.textContent = "CPU missed";
      busy = false;
    }

    // gameover check
    if (cpuTurn.gameOver) {
      winnerEl.textContent = controller.getPlayer(cpuTurn.winner).name;
      syncPhase();
    }

    repaint();
  }

  function onPlacementKeyDown(event) {
    const isRotateKey =
      event.key.toLowerCase() === "r" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey;

    if (!isRotateKey || controller.phase !== gamePhase.PLACE) return;

    event.preventDefault();
    onRotate();
  }

  function onUndo() {
    const name = lastShip();

    // conditions for immediate exit
    if (controller.phase !== gamePhase.PLACE) return;
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
    if (controller.phase !== gamePhase.PLACE) {
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

  function syncPhase() {
    gameEl.dataset.phase = controller.phase;
    gameoverEl.hidden = !controller.isGameOver;
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
  buttonUndoEl.addEventListener("click", onUndo);
  buttonRotateEl.addEventListener("click", onRotate);
  buttonAutoEl.addEventListener("click", onAuto);
  buttonStartEl.addEventListener("click", onStart);
  buttonRestartEl.addEventListener("click", onRestart);

  // one-time setup
  buildQueue(queueEl);
  repaint();
  syncPhase();
  buttonStartEl.disabled = true;
  statusEl.textContent = "Place your Carrier";
}
