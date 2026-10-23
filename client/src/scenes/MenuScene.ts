import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    this.add.text(this.scale.width / 2, 160, "PLANO-INCRIVEL-RF", {
      fontSize: "42px",
      color: "#ffd75e",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, 240, "Lilly & Kielop — prólogo: a Bebida", {
      fontSize: "16px",
      color: "#c9d1f2"
    }).setOrigin(0.5);

    const start = this.add
      .text(this.scale.width / 2, 330, "[ clique ou ENTER para começar ]", {
        fontSize: "18px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    const go = () => this.scene.start("Bar");
    this.input.once("pointerdown", go);
    this.input.keyboard!.once("keydown-ENTER", go);
  }
}
