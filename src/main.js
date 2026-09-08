import { GameController } from "./controller.js";
import { createBoard } from "./dom/render.js";
import { init } from "./dom/ui.js";

const controller = new GameController();

const playerBoard = createBoard();
const enemyBoard = createBoard();

const playerBoardEl = document.getElementById("player-board");
const enemyBoardEl = document.getElementById("enemy-board");

playerBoardEl.appendChild(playerBoard);
enemyBoardEl.appendChild(enemyBoard);

init(controller, { playerBoard, enemyBoard });
