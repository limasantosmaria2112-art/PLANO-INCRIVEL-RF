import Phaser from "phaser";

/**
 * EndingScene — final do prólogo "A Bebida". Lançada pelo BarScene quando
 * a dupla entrega a notícia ao Evy com o kennedito já resolvido
 * (quest estágio 3). Depois: voltar ao menu ou continuar explorando.
 */
export class EndingScene extends Phaser.Scene {
  constructor() {
    super("Ending");
  }

  create(): void {
    const { width, height } = this.scale;

    // fundo do bar: vermelho profundo + âmbar embaixo
    this.add.rectangle(width / 2, height / 2, width, height, 0x8b0000);
    this.add.rectangle(width / 2, height * 0.68, width, height * 0.36, 0xffd700);

    // vinheta
    this.add.rectangle(width / 2, 0, width, 70, 0x0a0b14, 0.45);
    this.add.rectangle(width / 2, height, width, 70, 0x0a0b14, 0.45);

    // luzinhas do bar
    for (let i = 0; i < 10; i++) {
      const lamp = this.add.circle(
        Phaser.Math.Between(90, width - 90),
        Phaser.Math.Between(40, height * 0.55),
        Phaser.Math.FloatBetween(140, 260),
        Phaser.Utils.Array.GetRandom([0xffd700, 0xff6b35, 0xffffff]),
        Phaser.Math.FloatBetween(0.08, 0.16)
      );
      this.tweens.add({ targets: lamp, alpha: { from: 0.1, to: 0.2 }, duration: Phaser.Math.Between(800, 2000), yoyo: true, repeat: -1 });
    }

    const title = this.add
      .text(width / 2, 110, "FIM DO PRÓLOGO", {
        fontSize: "46px", color: "#ffd75e", fontStyle: "bold", stroke: "#1a0505", strokeThickness: 8
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, "#ffd700", 30, true, true);
    this.tweens.add({ targets: title, scale: { from: 0.97, to: 1.03 }, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    this.add
      .text(width / 2, 180, "A Bebida — conclusão do prólogo", { fontSize: "15px", color: "#ffe4b5" })
      .setOrigin(0.5);

    // cartões dos personagens (estilo MenuScene, refeito aqui como créditos)
    this.credit(240, 300, 0xff69b4, "LILLY", "a gata de nove planos", 0);
    this.credit(340, 350, 0x1e90ff, "KIEL", "o copiador oficial", 200);
    this.credit(620, 300, 0xffd75e, "EVY", "o barman raposa 🦊", 400);
    this.credit(720, 350, 0xd08b3a, "KENNEDITO", "em paz. de novo. 🐶", 600);

    this.add
      .text(width / 2, 470, "A bebida voltou ao balcão. As três crianças assinaram um termo de\nresponsabilidade necromântica. O kennedito voltou a ser só um cachorrinho fofo.", {
        fontSize: "14px", color: "#ffe4b5", align: "center", lineSpacing: 5
      })
      .setOrigin(0.5);

    this.button(width / 2, 555, "CONTINUAR EXPLORANDO", 0xffd75e, () => this.scene.start("Bar"));
    this.button(width / 2, 620, "VOLTAR AO MENU", 0x4ecdc4, () => this.scene.start("Menu"));
  }

  /** cartão de crédito flutuante (mesma linguagem visual dos retratos do Menu) */
  private credit(x: number, y: number, color: number, name: string, role: string, delay: number): void {
    const frame = this.add.rectangle(x, y, 110, 92, 0x1a0505).setStrokeStyle(3, color);
    this.add.rectangle(x, y, 66, 40, color).setStrokeStyle(2, 0xffffff);
    this.add.text(x, y, name.slice(0, 2), { fontSize: "20px", color: "#1a0505", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(x, y + 34, name, { fontSize: "13px", color: "#ffd75e", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(x, y + 62, role, { fontSize: "10px", color: "#ffe4b5" }).setOrigin(0.5);
    this.tweens.add({ targets: frame, y: "-=6", duration: 1500, yoyo: true, repeat: -1, delay, ease: "Sine.inOut" });
  }

  private button(x: number, y: number, text: string, glow: number, action: () => void): void {
    const bg = this.add.rectangle(x, y, 300, 46, 0x2a2f4a).setStrokeStyle(2, glow);
    const label = this.add
      .text(x, y, text, { fontSize: "19px", color: `#${glow.toString(16).padStart(6, "0")}`, fontStyle: "bold" })
      .setOrigin(0.5);
    const glowBox = this.add.rectangle(x, y, 300, 46, glow, 0).setStrokeStyle(2, glow);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      glowBox.setAlpha(0.2);
      bg.setFillStyle(0x3a4066);
      this.tweens.add({ targets: [bg, label], scale: 1.06, duration: 120 });
    });
    bg.on("pointerout", () => {
      glowBox.setAlpha(0);
      bg.setFillStyle(0x2a2f4a);
      this.tweens.add({ targets: [bg, label], scale: 1, duration: 120 });
    });
    bg.on("pointerdown", action);
    this.tweens.add({ targets: glowBox, alpha: { from: 0, to: 0.12 }, duration: 800, yoyo: true, repeat: -1 });
  }
}
