import Phaser from "phaser";

/**
 * MenuScene — tela de início. Fundo do bar em tons frios (azul-noite, petróleo, teal),
 * neon ciano, os dois personages em cartões flutuantes, e botões de COMEÇAR/CONFIGURAÇÕES.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const { width, height } = this.scale;

    // Fundo do bar frio: gradiente azul-noite -> petróleo -> teal no balcão
    this.paintBarBackground(width, height);

    // Vingeta (bordas escurecendo)
    this.add.rectangle(width / 2, 0, width, 70, 0x060a12, 0.55);
    this.add.rectangle(width / 2, height, width, 70, 0x060a12, 0.55);
    this.add.rectangle(0, height / 2, 70, height, 0x060a12, 0.55);
    this.add.rectangle(width, height / 2, 70, height, 0x060a12, 0.55);

    // Abas luminosas de neon frio (halos ciano/azul-gelo)
    for (let i = 0; i < 8; i++) {
      const lamp = this.add.circle(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(50, height * 0.6),
        Phaser.Math.FloatBetween(150, 280),
        Phaser.Utils.Array.GetRandom([0x7fd8e8, 0x4ECDC4, 0x8fa8ff]),
        Phaser.Math.FloatBetween(0.08, 0.18)
      );
      this.tweens.add({
        targets: lamp,
        alpha: { from: 0.1, to: 0.20 },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000),
        ease: "Sine.inOut"
      });
    }

    // Título neon pulsante (ciano com glow azul)
    const title = this.add
      .text(width / 2, 110, "RuPtuRa-FononiCa", {
        fontSize: "56px",
        color: "#9ff0f5",
        fontStyle: "bold",
        stroke: "#2ec7d6",
        strokeThickness: 8,
        align: "center"
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, "#3fb9d4", 32, true, true);
    // Efeito neon pulsante (rápido)
    this.tweens.add({ targets: title, alpha: { from: 0.8, to: 1 }, duration: 600, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: title, scale: { from: 0.98, to: 1.02 }, duration: 800, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    // Texto deslizando
    this.tweens.add({ targets: title, y: "+=6", duration: 1600, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    // subtítulo
    this.add
      .text(width / 2, 185, "Lilly & Kielop — prólogo: a Bebida", { fontSize: "16px", color: "#bfe8ef" })
      .setOrigin(0.5);

    // cartões flutuantes dos personagens
    this.makePortrait(200, 320, 0xFF69B4, "LILLY", "Mario", 0);
    this.makePortrait(300, 360, 0x5BC8FF, "KIEL", "Lilly", 250);

    // Botão COMEÇAR
    this.makeButton(width / 2, 460, "COMEÇAR", 0x12222e, 0x4ECDC4, this.gotoBar.bind(this));

    // Botão CONFIGURAÇÕES
    this.makeButton(width / 2, 540, "CONFIGURAÇÕES", 0x12222e, 0x7fd8e8, this.gotoConfig.bind(this));

    // Controles de teclado
    this.add
      .text(width / 2, 610, "WASD/setas: mover   ·   E: falar/interagir   ·   Luta: [A]taca [B]especial [G]cura [F]foge", { fontSize: "12px", color: "#AAAAAA" })
      .setOrigin(0.5);
    this.add
      .text(width / 2, 630, "ENTER: começa | ESC: configurações", { fontSize: "12px", color: "#AAAAAA" })
      .setOrigin(0.5);

    // Eventos de teclado
    this.input.keyboard!.once("keydown-ENTER", this.gotoBar.bind(this));
    this.input.keyboard!.once("keydown-SPACE", this.gotoBar.bind(this));
    this.input.keyboard!.once("keydown-ESCAPE", this.gotoConfig.bind(this));
  }

  /** Fundo do bar em tons frios: parede, neon, garrafas, balcão de madeira azulada */
  private paintBarBackground(width: number, height: number): void {
    const wallH = height * 0.62;

    // parede: gradiente vertical azul-noite -> petróleo
    const wall = this.add.graphics();
    wall.fillGradientStyle(0x0a0f1e, 0x0a0f1e, 0x12202e, 0x12202e, 1);
    wall.fillRect(0, 0, width, wallH);

    // painel de madeira fria (tábuas verticais) atrás do balcão
    const plank = this.add.graphics();
    for (let x = 0; x < width; x += 64) {
      plank.fillStyle(0x14202c, 1);
      plank.fillRect(x, wallH - 170, 60, 170);
      plank.fillStyle(0x0d1620, 1);
      plank.fillRect(x + 58, wallH - 170, 6, 170);
      plank.lineStyle(1, 0x3d5a6e, 0.35);
      plank.lineBetween(x + 30, wallH - 170, x + 30, wallH);
    }

    // garrafas silhuetadas na prateleira, com stroke ciano
    for (let i = 0; i < 12; i++) {
      const bx = 60 + i * 72 + Phaser.Math.Between(-6, 6);
      const bh = Phaser.Math.Between(26, 40);
      const bw = 10;
      const bottle = this.add.graphics();
      bottle.fillStyle(0x0b1420, 1);
      bottle.fillRect(bx - bw / 2, wallH - 196 - bh, bw, bh);
      bottle.fillRect(bx - 3, wallH - 206 - bh, 6, 12);
      bottle.lineStyle(1, 0x4ECDC4, 0.5);
      bottle.strokeRect(bx - bw / 2, wallH - 196 - bh, bw, bh);
    }
    // prateleira
    this.add.rectangle(width / 2, wallH - 192, width - 60, 6, 0x0d1620).setStrokeStyle(1, 0x3d5a6e, 0.6);

    // balcão (madeira azulada escura com brilho teal)
    this.add.rectangle(width / 2, wallH + 20, width, 56, 0x1b3a4a);
    this.add.rectangle(width / 2, wallH + 20, width, 6, 0x7fd8e8, 0.25);

    // piso: azul-petróleo escuro com tábuas horizontais
    const floor = this.add.graphics();
    floor.fillStyle(0x0b131e, 1);
    floor.fillRect(0, wallH + 48, width, height - wallH - 48);
    for (let y = wallH + 62; y < height; y += 34) {
      floor.lineStyle(1, 0x16242f, 0.8);
      floor.lineBetween(0, y, width, y);
    }

    // reflexo suave do neon no piso
    this.add.rectangle(width / 2, wallH + 58, width, 26, 0x4ECDC4, 0.06);

    // vinheta suave nas bordas (profundidade de bar escuro)
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x060a12, 0x060a12, 0x060a12, 0x060a12, 0.9, 0.9, 0, 0);
    vignette.fillRect(0, 0, width, height * 0.35);
    vignette.fillGradientStyle(0x060a12, 0x060a12, 0x060a12, 0x060a12, 0, 0, 0.85, 0.85);
    vignette.fillRect(0, height * 0.65, width, height * 0.35);
  }

  /** sprite/memória animada do personagem */
  private makePortrait(x: number, y: number, color: number, letter: string, label: string, delay: number): void {
    const frame = this.add.rectangle(x, y, 90, 120, 0x0a1220).setStrokeStyle(4, color);
    // Brilho no cartão
    this.add.rectangle(x, y, 84, 114, color, 0)  // Layer branco suave
      .setStrokeStyle(3, color);

    // Thumbnail do personagem (cor quadrada)
    this.add.rectangle(x, y, 50, 70, color).setStrokeStyle(2, 0xFFFFFF);

    // Letra inicial
    const letterText = this.add
      .text(x, y, letter, { fontSize: "28px", color: "#06101a", fontStyle: "bold" })
      .setOrigin(0.5);

    // Nome do personagem
    const nameLabel = this.add.text(x, y + 60, label, { fontSize: "14px", color: "#bfe8ef", fontStyle: "bold" }).setOrigin(0.5);

    // Efeito de "respirar" (pulsar suavemente)
    this.tweens.add({
      targets: [frame, letterText, nameLabel],
      y: "-=6",
      scaleX: 1.04,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      delay,
      ease: "Sine.inOut"
    });
  }

  /** botão com hover e efeito glow */
  private makeButton(x: number, y: number, text: string, bg: number, glow: number, action: () => void): void {
    const bgBox = this.add.rectangle(x, y, 260, 50, bg).setStrokeStyle(2, glow);
    const label = this.add
      .text(x, y, text, { fontSize: "22px", color: glow.toString(16).padStart(6, "0"), fontStyle: "bold" })
      .setOrigin(0.5);

    const glowBox = this.add.rectangle(x, y, 260, 50, glow, 0).setStrokeStyle(2, glow);

    bgBox.setInteractive({ useHandCursor: true });

    bgBox.on("pointerover", () => {
      glowBox.setAlpha(0.2);
      bgBox.setFillStyle(0x1b3242);
      label.setColor(glow.toString(16).padStart(6, "0"));
      this.tweens.add({ targets: [bgBox, label], scale: 1.08, duration: 120 });
    });

    bgBox.on("pointerout", () => {
      glowBox.setAlpha(0);
      bgBox.setFillStyle(bg);
      label.setColor(glow.toString(16).padStart(6, "0"));
      this.tweens.add({ targets: [bgBox, label], scale: 1, duration: 120 });
    });

    bgBox.on("pointerdown", action);

    // Pisca suave para chamar atenção
    this.tweens.add({ targets: glowBox, alpha: { from: 0, to: 0.15 }, duration: 800, yoyo: true, repeat: -1 });
  }

  private gotoBar(): void {
    this.scene.start("Bar");
  }

  private gotoConfig(): void {
    this.scene.start("Config");
  }
}
