import Phaser from "phaser";
import { Player } from "./Player";
import type { CharacterId } from "shared";

/**
 * Lilly — metamorfa. No mundo, assume formas animais para
 * passar por lugares estreitos (sistema completo vem depois).
 */
export class Lilly extends Player {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 0xff77a9, "lilly" as CharacterId, "Lilly");
  }
}
