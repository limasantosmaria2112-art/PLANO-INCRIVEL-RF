import Phaser from "phaser";

/**
 * BootScene — tela inicial de carregamento.
 * Mostra "RuPtuRa-FononiCa" enquanto carrega recursos e ajusta fontes.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  /** atlas da dupla: [parado, andar1, andar2] x [frente, tras, esquerda, direita] */
  private static readonly DIRECOES = ["frente", "tras", "esquerda", "direita"] as const;

  preload(): void {
    this.load.spritesheet("lilly", "img/sprites/lilly.png", { frameWidth: 272, frameHeight: 392 });
    this.load.spritesheet("kielop", "img/sprites/kielop.png", { frameWidth: 192, frameHeight: 264 });
    this.load.image("floorTexture", "img/floor_small.png");
    this.load.image("grassTexture", "img/grass_small.png");
  }

  create(): void {
    // animacoes idle + walk nas 4 direcoes (frame = linha*3 + coluna)
    for (const id of ["lilly", "kielop"] as const) {
      BootScene.DIRECOES.forEach((dir, linha) => {
        this.anims.create({
          key: `${id}-idle-${dir}`,
          frames: [{ key: id, frame: linha * 3 }],
          frameRate: 1,
          repeat: -1
        });
        this.anims.create({
          key: `${id}-walk-${dir}`,
          frames: [
            { key: id, frame: linha * 3 + 1 },
            { key: id, frame: linha * 3 + 2 }
          ],
          frameRate: 6,
          repeat: -1
        });
      });
    }

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