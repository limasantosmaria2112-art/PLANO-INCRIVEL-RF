import Phaser from "phaser";

/**
 * Entity — classe base de tudo que existe no mundo:
 * jogadores, NPCs, inimigos e itens.
 */
export abstract class Entity extends Phaser.GameObjects.Container {
  protected sprite: Phaser.GameObjects.Rectangle;
  protected speed = 140;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    super(scene, x, y);
    this.sprite = scene.add.rectangle(0, 0, 24, 24, color);
    this.add(this.sprite);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  moveTowards(x: number, y: number, speed = this.speed): void {
    this.scene.physics.moveTo(this, x, y, speed);
  }

  stop(): void {
    this.arcadeBody.stop();
  }
}
