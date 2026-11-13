import Phaser from "phaser";
import { gameState } from "../core/GameConfig";

/**
 * MenuScene — tela de início. Fundo do bar (âmbar e vermelho profundo),
 * título neon, os dois personagers em cartões flutuantes, e botões de COMEÇAR/CONFIGURAÇÕES.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const { width, height } = this.scale;

    // Fundo do bar: gradiente vermelho escuro -> âmbar
    this.add.rectangle(width / 2, height / 2, width, height, 0x8B0000);
    this.add.rectangle(width / 2, height * 0.62, width, height * 0.4, 0xFFD700);

    // Vingeta (bordas escurecendo)
    this.add.rectangle(width / 2, 0, width, 70, 0x0a0b14, 0.45);
    this.add.rectangle(width / 2, height, width, 70, 0x0a0b14, 0.45);
    this.add.rectangle(0, height / 2, 70, height, 0x0a0b14, 0.45);
    this.add.rectangle(width, height / 2, 70, height, 0x0a0b14, 0.45);

    // Abas luminosas do bar (botijões e luzes)
    for (let i = 0; i < 8; i++) {
      const lamp = this.add.circle(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(50, height * 0.6),
        Phaser.Math.FloatBetween(150, 280),
        Phaser.Utils.Array.GetRandom([0xFFD700, 0xFF6B35, 0xFFFFFF]),
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

    // Título neon pulsante
    const title = this.add
      .text(width / 2, 110, "RuPtuRa-FononiCa", {
        fontSize: "56px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#FFD700",
        strokeThickness: 8,
        align: "center"
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, "#FFD700", 32, true, true);
    // Efeito neon pulsante (rápido)
    this.tweens.add({ targets: title, alpha: { from: 0.8, to: 1 }, duration: 600, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: title, scale: { from: 0.98, to: 1.02 }, duration: 800, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    // Texto deslizando
    this.tweens.add({ targets: title, y: "+=6", duration: 1600, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    // subtítulo
    this.add
      .text(width / 2, 185, "Lilly & Kielop — prólogo: a Bebida", { fontSize: "16px", color: "#FFE4B5" })
      .setOrigin(0.5);

    // cartões flutuantes dos personagens
    this.makePortrait(200, 320, 0xFF69B4, "LILLY", "Mario", 0);
    this.makePortrait(300, 360, 0x1E90FF, "KIEL", "Lilly", 250);

    // Botões (CONTINUAR só aparece se já houve mundo jogado nesta sessão)
    const continuarDisponivel = gameState.ultimaCena !== null;
    this.makeButton(width / 2, 460, "COMEÇAR", 0x2a2f4a, 0xFFD700, this.gotoBar.bind(this));
    if (continuarDisponivel) {
      this.makeButton(width / 2, 520, "CONTINUAR", 0x2a2f4a, 0x9de8a5, this.gotoContinue.bind(this));
      this.makeButton(width / 2, 580, "CONFIGURAÇÕES", 0x2a2f4a, 0x4ECDC4, this.gotoConfig.bind(this));
    } else {
      this.makeButton(width / 2, 540, "CONFIGURAÇÕES", 0x2a2f4a, 0x4ECDC4, this.gotoConfig.bind(this));
    }

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

  /** sprite/memória animada do personagem */
  private makePortrait(x: number, y: number, color: number, letter: string, label: string, delay: number): void {
    const frame = this.add.rectangle(x, y, 90, 120, 0x1a0505).setStrokeStyle(4, color);
    // Brilho no cartão
    this.add.rectangle(x, y, 84, 114, color, 0)  // Layer branco suave
      .setStrokeStyle(3, color);

    // Thumbnail do personagem (cor quadrada)
    this.add.rectangle(x, y, 50, 70, color).setStrokeStyle(2, 0xFFFFFF);

    // Letra inicial
    const letterText = this.add
      .text(x, y, letter, { fontSize: "28px", color: "#1a0505", fontStyle: "bold" })
      .setOrigin(0.5);

    // Nome do personagem
    const nameLabel = this.add.text(x, y + 60, label, { fontSize: "14px", color: "#FFE4B5", fontStyle: "bold" }).setOrigin(0.5);

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
      bgBox.setFillStyle(0x3a4066);
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

  /** CONTINUAR: reabre o último mundo jogado (sem save em banco — Fase 3) */
  private gotoContinue(): void {
    this.scene.start(gameState.ultimaCena ?? "Bar");
  }

  private gotoBar(): void {
    this.scene.start("Bar");
  }

  private gotoConfig(): void {
    this.scene.start("Config");
  }
}
