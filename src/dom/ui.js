import { FLEET } from "../constants.js";
import { clearBoard, markShips, updateBoard, updateQueue } from "./render.js";

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
}
