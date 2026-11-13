import Phaser from "phaser";

/**
 * PauseMenuScene — overlay de pausa (ESC) lançado POR CIMA da cena de jogo.
 * A cena de baixo fica `scene.pause()`-ada: física, tweens e input congelam.
 * Botões: RETOMAR / CONFIGURAÇÕES / SAIR PARA O MENU.
 * Sem save nesta fase: sair para o menu pede confirmação (progresso da sessão é mantido
 * via gameState.ultimaCena, mas o mundo volta ao spawn da cena).
 */
export class PauseMenuScene extends Phaser.Scene {
  /** cena de jogo que abriu o pause */
  private from = "Bar";
  /** confirmação em duas etapas para sair */
  private confirming = false;

  constructor() {
    super("Pause");
  }

  create(data?: { from?: string }): void {
    this.from = data?.from ?? "Bar";
    this.confirming = false;
    const { width, height } = this.scale;

    // escurece o mundo pausado atrás do menu
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0b14, 0.72).setDepth(1000);

    // painel estilo bar (vermelho profundo + moldura âmbar)
    const panel = this.add.rectangle(width / 2, height / 2, 420, 380, 0x1a0505, 0.96).setStrokeStyle(3, 0xffd75e).setDepth(1001);
    this.add.rectangle(width / 2, height / 2, 408, 368, 0x8b0000, 0.25).setDepth(1001).setStrokeStyle(1, 0xffd75e, 0.4);

    const title = this.add
      .text(width / 2, height / 2 - 140, "PAUSA", {
        fontSize: "38px", color: "#ffd75e", fontStyle: "bold", stroke: "#1a0505", strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(1002);
    this.tweens.add({ targets: title, alpha: { from: 0.75, to: 1 }, duration: 900, yoyo: true, repeat: -1 });

    this.makeButton(width / 2, height / 2 - 55, "RETOMAR", 0xffd75e, () => this.resumeGame(), 1002);
    this.makeButton(width / 2, height / 2 + 10, "CONFIGURAÇÕES", 0x4ecdc4, () => this.gotoConfig(), 1002);

    this.menuLabel = this.makeButtonWithLabel(width / 2, height / 2 + 75, "SAIR PARA O MENU", 0xff6b35, () => this.quitToMenu(), 1002);

    this.add
      .text(width / 2, height / 2 + 150, "ESC: retoma", { fontSize: "12px", color: "#aaaaaa" })
      .setOrigin(0.5)
      .setDepth(1002);

    // retomar com ESC (uma tecla, de volta ao jogo)
    this.input.keyboard!.once("keydown-ESCAPE", () => this.resumeGame());
    void panel;
  }

  private menuLabel!: Phaser.GameObjects.Text;

  private resumeGame(): void {
    // a cena de jogo continua existindo (pausada) — só retomar
    this.scene.resume(this.from);
    this.scene.stop();
  }

  private gotoConfig(): void {
    // a cena de jogo permanece pausada; ConfigScene volta para ela (data.returnTo)
    this.scene.stop();
    this.scene.start("Config", { returnTo: this.from });
  }

  private quitToMenu(): void {
    if (!this.confirming) {
      this.confirming = true;
      this.menuLabel.setText("TEM CERTEZA? (clique de novo)");
      this.time.delayedCall(2600, () => {
        this.confirming = false;
        if (this.menuLabel.active) this.menuLabel.setText("SAIR PARA O MENU");
      });
      return;
    }
    // encerra o mundo e volta ao título (o CONTINUAR do menu reabre a última cena)
    this.scene.stop(this.from);
    this.scene.start("Menu");
  }

  /** botão no padrão do MenuScene, com depth acima do overlay */
  private makeButton(x: number, y: number, text: string, glow: number, action: () => void, depth: number): void {
    this.makeButtonWithLabel(x, y, text, glow, action, depth);
  }

  private makeButtonWithLabel(x: number, y: number, text: string, glow: number, action: () => void, depth: number): Phaser.GameObjects.Text {
    const bg = this.add.rectangle(x, y, 300, 48, 0x2a2f4a).setStrokeStyle(2, glow).setDepth(depth);
    const label = this.add
      .text(x, y, text, { fontSize: "19px", color: `#${glow.toString(16).padStart(6, "0")}`, fontStyle: "bold" })
      .setOrigin(0.5)
      .setDepth(depth);
    const glowBox = this.add.rectangle(x, y, 300, 48, glow, 0).setStrokeStyle(2, glow).setDepth(depth);

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
    return label;
  }
}
