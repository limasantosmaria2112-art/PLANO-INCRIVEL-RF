import Phaser from "phaser";

/**
 * MenuScene — tela de início. Fundo estrelado, título com glow,
 * os dois personagens dando as caras e um botão de COMEÇAR de verdade.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x14162b);

    // faixa de fundo levemente deslocada (não é escuro chapado)
    this.add.rectangle(width / 2, height * 0.62, width, height * 0.4, 0x1b1d3a);

    // vinheta (bordas escurecendo)
    this.add.rectangle(width / 2, 0, width, 70, 0x0a0b14, 0.45);
    this.add.rectangle(width / 2, height, width, 70, 0x0a0b14, 0.45);
    this.add.rectangle(0, height / 2, 70, height, 0x0a0b14, 0.45);
    this.add.rectangle(width, height / 2, 70, height, 0x0a0b14, 0.45);

    // estrelinhas piscando
    for (let i = 0; i < 55; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(10, width - 10),
        Phaser.Math.Between(10, height - 10),
        Phaser.Math.FloatBetween(0.6, 1.9),
        Phaser.Utils.Array.GetRandom([0xffffff, 0xffd75e, 0x9de8ff]),
        Phaser.Math.FloatBetween(0.25, 0.9)
      );
      this.tweens.add({
        targets: s,
        alpha: 0.05,
        duration: Phaser.Math.Between(500, 1800),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 900)
      });
    }

    // título com glow pulsante
    const title = this.add
      .text(width / 2, 130, "PLANO-INCRIVEL-RF", {
        fontSize: "46px",
        color: "#ffd75e",
        fontStyle: "bold",
        stroke: "#0a0b14",
        strokeThickness: 6,
        align: "center"
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, "#ffd75e", 26, true, true);
    this.tweens.add({ targets: title, y: "+=4", duration: 1400, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    // subtítulo
    this.add
      .text(width / 2, 185, "Lilly & Kielop — prólogo: a Bebida", { fontSize: "16px", color: "#c9d1f2" })
      .setOrigin(0.5);

    // a dupla dando as caras (quadros animados)
    this.makePortrait(260, 320, 0xff77a9, "L", "Lilly", 0);
    this.makePortrait(340, 360, 0x5bc8ff, "K", "Kielop", 240);

    // botão de COMEÇAR real (hover + clique ou ENTER/ESPAÇO)
    const btn = this.add.rectangle(width / 2, 400, 260, 58, 0x2a2f4a).setStrokeStyle(3, 0x8d5524);
    const btnText = this.add
      .text(width / 2, 400, "COMEÇAR", { fontSize: "24px", color: "#ffd75e", fontStyle: "bold" })
      .setOrigin(0.5);
    const btnGlow = this.add.rectangle(width / 2, 400, 260, 58, 0xffd75e, 0).setStrokeStyle(3, 0xffd75e);

    const go = () => this.scene.start("Bar");

    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerover", () => {
      btnGlow.setAlpha(0.16);
      btn.setFillStyle(0x3a4066);
      btnText.setColor("#ffffff");
      this.tweens.add({ targets: [btn, btnText], scale: 1.05, duration: 90 });
    });
    btn.on("pointerout", () => {
      btnGlow.setAlpha(0);
      btn.setFillStyle(0x2a2f4a);
      btnText.setColor("#ffd75e");
      this.tweens.add({ targets: [btn, btnText], scale: 1, duration: 90 });
    });
    btn.on("pointerdown", go);

    // pisca suave pra chamar atenção
    this.tweens.add({ targets: btnGlow, alpha: { from: 0, to: 0.1 }, duration: 900, yoyo: true, repeat: -1 });

    this.add
      .text(width / 2, 470, "clique no botão ou pressione ENTER", { fontSize: "12px", color: "#9aa4c0" })
      .setOrigin(0.5);
    this.add.text(
      12,
      height - 26,
      "WASD/setas: mover   ·   E: falar/interagir   ·   luta: [A]taca [B]especial [G]cura [F]foge",
      { fontSize: "11px", color: "#9aa4c0" }
    );

    this.input.keyboard!.once("keydown-ENTER", go);
    this.input.keyboard!.once("keydown-SPACE", go);
  }

  /** quadro animado de personagem (placeholder até termos sprites) */
  private makePortrait(x: number, y: number, color: number, letter: string, label: string, delay: number): void {
    const frame = this.add.rectangle(x, y, 64, 84, 0x0f1120).setStrokeStyle(3, color);
    this.add.rectangle(x, y, 40, 54, color).setStrokeStyle(2, 0xffffff);
    this.add
      .text(x, y, letter, { fontSize: "20px", color: "#0f1120", fontStyle: "bold" })
      .setOrigin(0.5);
    this.add.text(x, y + 56, label, { fontSize: "13px", color: "#c9d1f2" }).setOrigin(0.5);

    // "respirar" dos dois, dessincronizados
    this.tweens.add({
      targets: frame,
      y: "-=5",
      scaleX: 1.03,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      delay,
      ease: "Sine.inOut"
    });
  }
}
