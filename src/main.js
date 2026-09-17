import {
  createIcons,
  icons,
} from "https://cdn.jsdelivr.net/npm/lucide@1.46.0/+esm";
import { GameController } from "./controller.js";
import { createBoard } from "./dom/render.js";
import { init } from "./dom/ui.js";

createIcons({ icons });
const menuFormEl = document.getElementById("menu-form");
const nameInputEl = document.getElementById("player-name");

function start(name) {
  const controller = new GameController(name);
  const playerBoard = createBoard();
  const enemyBoard = createBoard();

  const playerBoardEl = document.getElementById("player-board");
  const enemyBoardEl = document.getElementById("enemy-board");

  playerBoardEl.appendChild(playerBoard);
  enemyBoardEl.appendChild(enemyBoard);

  init(controller, { playerBoard, enemyBoard });
}

menuFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInputEl.value.trim() || "Player 1";
  // menu to game transition
  document.startViewTransition(() => {
    document.getElementById("menu").remove();
    start(name);
  });
});
