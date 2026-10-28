import Phaser from "phaser";
import { Entity } from "./Entity";
import type { CharacterId } from "shared";

/**
 * Player — abstrata. Lilly e Kielop herdam daqui.
 * Um dos dois está sempre "no controle"; o outro segue atrás.
 */
export abstract class Player extends Entity {
  readonly id: CharacterId;
  readonly label: string;

  /** vida atual — usada pelo BattleSystem */
  hp: number;
  maxHp = 40;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, id: CharacterId, label: string) {
    super(scene, x, y, color);
    this.id = id;
    this.label = label;
    this.hp = this.maxHp;
    // caixinha com a inicial pra identificar visualmente
    const tag = scene.add.text(this.sprite.x, this.sprite.y - 22, label[0], {
      fontSize: "10px",
      color: "#fff"
    }).setOrigin(0.5);
    this.add(tag);
  }

  /** Movimento direto por teclado (somente do personagem no controle) */
  handleInput(cursors: Phaser.Types.Input.Keyboard.CursorKeys, keys: WASDKeys): void {
    const body = this.arcadeBody;
    body.setVelocity(0);

    if (cursors.left.isDown || keys.A.isDown) body.setVelocityX(-this.speed);
    else if (cursors.right.isDown || keys.D.isDown) body.setVelocityX(this.speed);

    if (cursors.up.isDown || keys.W.isDown) body.setVelocityY(-this.speed);
    else if (cursors.down.isDown || keys.S.isDown) body.setVelocityY(this.speed);
  }
}

export interface WASDKeys {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}
