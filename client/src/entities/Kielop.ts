import Phaser from "phaser";
import { Player } from "./Player";
import type { CharacterId } from "shared";

/**
 * Kielop — humano que copia habilidades de inimigos derrotados.
 */
export class Kielop extends Player {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 0x5bc8ff, "kielop" as CharacterId, "Kielop");
  }
}
