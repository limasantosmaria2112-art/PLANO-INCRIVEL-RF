import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { BarScene } from "../scenes/BarScene";
import { CityScene } from "../scenes/CityScene";
import { TrailScene } from "../scenes/TrailScene";
import { KidsHouseScene } from "../scenes/KidsHouseScene";

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export function createGame(parent: HTMLElement): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: "#1a1c2c",
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MenuScene, BarScene, CityScene, TrailScene, KidsHouseScene],
    physics: {
      default: "arcade",
      arcade: { debug: false }
    }
  });
  // acesso de dev/testes (console): window.__planoGame.scene.start("Trail")
  (window as unknown as { __planoGame?: Phaser.Game }).__planoGame = game;
  return game;
}
