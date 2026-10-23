import Phaser from "phaser";

/**
 * Npc — personagem não-jogável. Pode ser um NPC de destaque (ex: o barman
 * raposa Evy) com conversas em camadas definido pela cena.
 */
export class Npc extends Phaser.GameObjects.Container {
  declare name: string;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, color: number, height = 44) {
    super(scene, x, y);
    const body = scene.add.rectangle(0, 0, 26, height, color).setStrokeStyle(2, 0xffffff);
    const ears = scene.add.triangle(0, -height / 2 - 6, 0, 14, 7, 0, 14, 14, color);
    const tag = scene.add
      .text(0, -height / 2 - 22, name, { fontSize: "10px", color: "#ffd75e", backgroundColor: "#00000099" })
      .setOrigin(0.5);
    this.add([body, ears, tag]);
    scene.add.existing(this);

    // bochecho amigável
    scene.tweens.add({ targets: this, y: y - 4, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  }
}
