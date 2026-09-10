import { FLEET, SIZE } from "../constants.js";
import { gamePhase } from "../controller.js";
import {
  buildQueue,
  clearBoard,
  markShips,
  updateBoard,
  updateQueue,
} from "./render.js";

export function init(controller, { playerBoard, enemyBoard }) {
  const statusEl = document.getElementById("status");
  const placementEl = document.getElementById("placement-controls");
  const queueEl = document.getElementById("ship-queue");
  const buttonRotateEl = document.getElementById("button-rotate");
  const buttonAutoEl = document.getElementById("button-auto");
  const buttonStartEl = document.getElementById("button-start");
  const gameoverEl = document.getElementById("gameover");
  const winnerEl = document.getElementById("winner");
  const buttonRestartEl = document.getElementById("button-restart");

  let direction = "horizontal";
  let busy = false;

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

    if (event.key === "Enter" || event.key === "") {
      event.preventDefault();
      // re-enable onClickPlace & onClickAttack
      activate(event);
    }
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
      gameoverEl.hidden = false;
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
      gameoverEl.hidden = false;
    }

    repaint();
  }

  function onRotate() {
    direction = direction === "horizontal" ? "vertical" : "horizontal";
  }

  function onRestart() {
    controller.resetGame();
    repaint();
    placementEl.hidden = false;
    gameoverEl.hidden = true;
    direction = "horizontal";
    busy = false;
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

    placementEl.hidden = true;
    statusEl.textContent = "Your turn";
  }

  // setup event listeners
  playerBoard.addEventListener("click", onClickPlace);
  playerBoard.addEventListener("keydown", (e) =>
    onBoardKeyDown(e, onClickPlace),
  );
  enemyBoard.addEventListener("click", onClickAttack);
  enemyBoard.addEventListener("keydown", (e) =>
    onBoardKeyDown(e, onClickAttack),
  );
  buttonRotateEl.addEventListener("click", onRotate);
  buttonAutoEl.addEventListener("click", onAuto);
  buttonStartEl.addEventListener("click", onStart);
  buttonRestartEl.addEventListener("click", onRestart);

  // one-time setup
  buildQueue(queueEl);
  repaint();
  buttonStartEl.disabled = true;
  statusEl.textContent = "Place your Carrier";
}
