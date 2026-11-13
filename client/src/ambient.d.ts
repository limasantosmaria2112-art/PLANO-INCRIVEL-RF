/**
 * Declarações ambientes do projeto.
 * `game.globals` é criado em GameConfig.createGame() e usado pela ConfigScene.
 */
import "phaser";

declare module "phaser" {
  interface Game {
    globals: {
      volumeMan: number;
      volumeBgm: number;
      volumeSfx: number;
      fullscreen: boolean;
    };
  }
}
