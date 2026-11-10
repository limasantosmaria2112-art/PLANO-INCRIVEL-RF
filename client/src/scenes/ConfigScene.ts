import Phaser from "phaser";

/**
 * ConfigScene — menu de configurações (volume, fullscreen, etc.)
 */
export class ConfigScene extends Phaser.Scene {
  constructor() {
    super("Config");
  }

  create(): void {
    const { width, height } = this.scale;

    // Fundo semitransparente
    this.add.rectangle(width / 2, height / 2, width, height, 0x14162b);

    // Título
    this.add
      .text(width / 2, 100, "CONFIGURAÇÕES", {
        fontSize: "32px",
        color: "#FFD700",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    // Botão voltar ao menu
    const backBtn = this.makeButton(width / 2, 480, "VOLTAR AO MENU", 0x1a1c2c, 0xFFD700, this.goBack.bind(this), 200);

    // Volume Man
    this.add.text(width / 2, 160, "VOLUME MAN", { fontSize: "18px", color: "#C9D1F2" }).setOrigin(0.5);

    this.add
      .text(width / 2 + 150, 160, this.sys.game.globals.volumeMan.toString(), {
        fontSize: "16px",
        color: "#FFD700"
      })
      .setOrigin(0);

    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].forEach((level, index) => {
      const volBtn = this.add.rectangle(width / 2 - 220 + index * 22, 160, 20, 20, 0x2a2f4a).setStrokeStyle(2, 0xFFD700);
      volBtn.setInteractive({ useHandCursor: true })

      volBtn.on("pointerover", () => {
        volBtn.setFillStyle(0x3a4066);
        this.tweens.add({ targets: volBtn, scale: 1.1, duration: 100 });
      });

      volBtn.on("pointerout", () => {
        volBtn.setFillStyle(0x2a2f4a);
        this.tweens.add({ targets: volBtn, scale: 1, duration: 100 });
      });

      volBtn.on("pointerdown", () => {
        this.sys.game.globals.volumeMan = level;
        this.add.text(width / 2 + 150, 160, level.toString(), { fontSize: "16px", color: "#FFD700" }).setOrigin(0);
      });
    });

    // Volume BGM
    this.add.text(width / 2, 230, "VOLUME BGM", { fontSize: "18px", color: "#C9D1F2" }).setOrigin(0.5);

    this.add
      .text(width / 2 + 150, 230, this.sys.game.globals.volumeBgm.toString(), {
        fontSize: "16px",
        color: "#FFD700"
      })
      .setOrigin(0);

    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].forEach((level, index) => {
      const volBtn = this.add.rectangle(width / 2 - 220 + index * 22, 230, 20, 20, 0x2a2f4a).setStrokeStyle(2, 0xFFD700);
      volBtn.setInteractive({ useHandCursor: true })

      volBtn.on("pointerover", () => {
        volBtn.setFillStyle(0x3a4066);
        this.tweens.add({ targets: volBtn, scale: 1.1, duration: 100 });
      });

      volBtn.on("pointerout", () => {
        volBtn.setFillStyle(0x2a2f4a);
        this.tweens.add({ targets: volBtn, scale: 1, duration: 100 });
      });

      volBtn.on("pointerdown", () => {
        this.sys.game.globals.volumeBgm = level;
        this.add.text(width / 2 + 150, 230, level.toString(), { fontSize: "16px", color: "#FFD700" }).setOrigin(0);
      });
    });

    // Volume SFX
    this.add.text(width / 2, 300, "VOLUME SFX", { fontSize: "18px", color: "#C9D1F2" }).setOrigin(0.5);

    this.add
      .text(width / 2 + 150, 300, this.sys.game.globals.volumeSfx.toString(), {
        fontSize: "16px",
        color: "#FFD700"
      })
      .setOrigin(0);

    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].forEach((level, index) => {
      const volBtn = this.add.rectangle(width / 2 - 220 + index * 22, 300, 20, 20, 0x2a2f4a).setStrokeStyle(2, 0xFFD700);
      volBtn.setInteractive({ useHandCursor: true })

      volBtn.on("pointerover", () => {
        volBtn.setFillStyle(0x3a4066);
        this.tweens.add({ targets: volBtn, scale: 1.1, duration: 100 });
      });

      volBtn.on("pointerout", () => {
        volBtn.setFillStyle(0x2a2f4a);
        this.tweens.add({ targets: volBtn, scale: 1, duration: 100 });
      });

      volBtn.on("pointerdown", () => {
        this.sys.game.globals.volumeSfx = level;
        this.add.text(width / 2 + 150, 300, level.toString(), { fontSize: "16px", color: "#FFD700" }).setOrigin(0);
      });
    });

    // Fullscreen
    const fullscreen = this.add.rectangle(width / 2, 360, 200, 60, 0x2a2f4a).setStrokeStyle(2, 0xFFD700);
    const fullscreenText = this.add
      .text(width / 2, 360, this.sys.game.globals.fullscreen ? "FULLSCREEN: ON" : "FULLSCREEN: OFF", {
        fontSize: "20px",
        color: this.sys.game.globals.fullscreen ? "#FFD700" : "#AAAAAA"
      })
      .setOrigin(0.5);

    fullscreen.setInteractive({ useHandCursor: true });

    fullscreen.on("pointerover", () => {
      fullscreen.setFillStyle(0x3a4066);
      fullscreenText.setColor("#FFFFFF");
      this.tweens.add({ targets: [fullscreen, fullscreenText], scale: 1.05, duration: 100 });
    });

    fullscreen.on("pointerout", () => {
      fullscreen.setFillStyle(0x2a2f4a);
      fullscreenText.setColor(this.sys.game.globals.fullscreen ? "#FFD700" : "#AAAAAA");
      this.tweens.add({ targets: [fullscreen, fullscreenText], scale: 1, duration: 100 });
    });

    fullscreen.on("pointerdown", () => {
      this.sys.game.globals.fullscreen = !this.sys.game.globals.fullscreen;
      fullscreenText.setText(
        this.sys.game.globals.fullscreen ? "FULLSCREEN: ON" : "FULLSCREEN: OFF"
      );
      fullscreenText.setColor(this.sys.game.globals.fullscreen ? "#FFD700" : "#AAAAAA");

      if (this.sys.game.globals.fullscreen) {
        this.scale.fullscreenManager.start();
      } else {
        this.scale.fullscreenManager.stop();
      }
    });

    // Reset Padrões
    const resetBtn = this.makeButton(width / 2, 430, "RESET Padrões", 0x1a1c2c, 0xFF6B35, () => {
      this.sys.game.globals.volumeMan = 50;
      this.sys.game.globals.volumeBgm = 70;
      this.sys.game.globals.volumeSfx = 80;
      this.sys.game.globals.fullscreen = false;
      this.scene.restart();
    }, 200);
  }

  private makeButton(x: number, y: number, text: string, bg: number, color: number, action: () => void, scale: number = 226): void {
    const bgBox = this.add.rectangle(x, y, scale, 50, bg).setStrokeStyle(2, color);
    const label = this.add
      .text(x, y, text, { fontSize: "20px", color: color.toString(16).padStart(6, "0"), fontStyle: "bold" })
      .setOrigin(0.5);

    bgBox.setInteractive({ useHandCursor: true });

    bgBox.on("pointerover", () => {
      bgBox.setFillStyle(0x3a4066);
      this.tweens.add({ targets: bgBox, scale: 1.05, duration: 80 });
    });

    bgBox.on("pointerout", () => {
      bgBox.setFillStyle(bg);
      this.tweens.add({ targets: bgBox, scale: 1, duration: 80 });
    });

    bgBox.on("pointerdown", action);
  }

  private goBack(): void {
    this.scene.start("Menu");
  }
}