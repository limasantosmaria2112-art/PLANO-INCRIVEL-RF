import Phaser from "phaser";

/**
 * BootScene — tela inicial de carregamento.
 * Mostra "RuPtuRa-FononiCa" enquanto carrega recursos e ajusta fontes.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    const { width, height } = this.scale;

    // Fundo escuro simples
    this.add.rectangle(width / 2, height / 2, width, height, 0x14162b);

    // Texto carregando
    this.add
      .text(width / 2, height / 2, "Carregando RuPtuRa-FononiCa...", {
        fontSize: "24px",
        color: "#FFD700",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    // Indicador de carregamento animado
    const dashContainer = this.add.container(width / 2, height / 2 + 50);

    [0, 1, 2].forEach((i) => {
      const dot = this.add.circle(0, 0, 8, 0xFFD700);
      dot.setAlpha(0.2);
      this.tweens.add({
        targets: dot,
        alpha: 1,
        delay: i * 150,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
      dashContainer.add(dot);
    });

    // Carregamento simulado de 1 segundo e ir para Menu
    this.time.delayedCall(1000, () => {
      this.scene.start("Menu");
    });
  }
}