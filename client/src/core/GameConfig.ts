import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { WorldScene } from "../scenes/WorldScene";

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: "#1a1c2c",
    pixelArt: true,
    scene: [BootScene, MenuScene, WorldScene],
    physics: {
      default: "arcade",
      arcade: { debug: false }
    }
  });
}
