import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { ConfigScene } from "../scenes/ConfigScene";
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
    scene: [BootScene, MenuScene, ConfigScene, BarScene, CityScene, TrailScene, KidsHouseScene],
    physics: {
      default: "arcade",
      arcade: { debug: false }
    }
  });

  // Configurações globais do jogo
  game.globals = {
    volumeMan: 50,
    volumeBgm: 70,
    volumeSfx: 80,
    fullscreen: false
  };

  // acesso de dev/testes (console): window.__phononicaGame.scene.start("Trail")
  (window as unknown as { __phononicaGame?: Phaser.Game }).__phononicaGame = game;
  return game;
}
