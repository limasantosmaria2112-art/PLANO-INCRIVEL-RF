import Phaser from "phaser";

/**
 * GameOverScene — tela de derrota. Substitui o restart instantâneo:
 * o BattleSystem chama onLose → a cena de jogo troca para esta tela,
 * e o jogador escolhe voltar ao spawn da MESMA cena (mesmo mundo) ou ao menu.
 */
export class GameOverScene extends Phaser.Scene {
  private cena!: string;
  private spawn = { x: 480, y: 460 };

  constructor() {
    super("GameOver");
  }

  create(data?: { cena?: string; spawn?: { x: number; y: number } }): void {
    this.cena = data?.cena ?? "Bar";
    this.spawn = data?.spawn ?? { x: 480, y: 460 };
    const { width, height } = this.scale;

    // fundo: vermelho profundo com véu escuro
    this.add.rectangle(width / 2, height / 2, width, height, 0x8b0000);
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0b14, 0.45);

    const title = this.add
      .text(width / 2, 130, "A DUPLA FOI DERROTADA...", {
        fontSize: "40px", color: "#ff4d6d", fontStyle: "bold", stroke: "#1a0505", strokeThickness: 8, align: "center"
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, "#ff4d6d", 26, true, true);
    this.tweens.add({ targets: title, alpha: { from: 0.65, to: 1 }, duration: 700, yoyo: true, repeat: -1 });

    this.add
      .text(width / 2, 200, "Lilly e Kielop acordam renovados no mesmo lugar.\n(HP restaurado — o mundo continua do último ponto.)", {
        fontSize: "15px", color: "#ffe4b5", align: "center", lineSpacing: 6
      })
      .setOrigin(0.5);

    this.button(width / 2, 330, "CONTINUAR DO ÚLTIMO PONTO", 0xffd75e, () => this.scene.start(this.cena, this.spawn));
    this.button(width / 2, 410, "VOLTAR AO MENU", 0x4ecdc4, () => this.scene.start("Menu"));

    this.add
      .text(width / 2, 480, "ENTER: continuar", { fontSize: "12px", color: "#aaaaaa" })
      .setOrigin(0.5);
    this.input.keyboard!.once("keydown-ENTER", () => this.scene.start(this.cena, this.spawn));
  }

  /** botão no padrão visual do projeto */
  private button(x: number, y: number, text: string, glow: number, action: () => void): void {
    const bg = this.add.rectangle(x, y, 340, 50, 0x2a2f4a).setStrokeStyle(2, glow);
    const label = this.add
      .text(x, y, text, { fontSize: "20px", color: `#${glow.toString(16).padStart(6, "0")}`, fontStyle: "bold" })
      .setOrigin(0.5);
    const glowBox = this.add.rectangle(x, y, 340, 50, glow, 0).setStrokeStyle(2, glow);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      glowBox.setAlpha(0.2);
      bg.setFillStyle(0x3a4066);
      this.tweens.add({ targets: [bg, label], scale: 1.07, duration: 120 });
    });
    bg.on("pointerout", () => {
      glowBox.setAlpha(0);
      bg.setFillStyle(0x2a2f4a);
      this.tweens.add({ targets: [bg, label], scale: 1, duration: 120 });
    });
    bg.on("pointerdown", action);
    this.tweens.add({ targets: glowBox, alpha: { from: 0, to: 0.14 }, duration: 800, yoyo: true, repeat: -1 });
  }
}
