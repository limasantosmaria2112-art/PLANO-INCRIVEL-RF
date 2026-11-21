import Phaser from "phaser";
import { copiasKielop } from "../systems/CopySystem";
import { novaJornada } from "../systems/NovaJornada";
import { gameState } from "../core/GameConfig";

interface EpilogueLine {
  speaker: "narrador" | "lilly" | "kielop";
  text: string;
}

const SPEAKER_COLORS: Record<EpilogueLine["speaker"], string> = {
  narrador: "#ffe4b5",
  lilly: "#ff77a9",
  kielop: "#5bc8ff"
};

const EPILOGUE: EpilogueLine[] = [
  { speaker: "narrador", text: "A bebida voltou ao balcão. Dessa vez, ninguém precisou enfrentar um cachorro." },
  { speaker: "narrador", text: "As três crianças assinaram um termo de responsabilidade necromântica. O Evy guardou a caneta." },
  { speaker: "narrador", text: "O kennedito voltou a ser só um cachorrinho. A ração, finalmente, em paz." },
  { speaker: "lilly", text: "brindo ao kennedito, que nos ensinou física aplicada." },
  { speaker: "kielop", text: "e ao bar do Evy, onde o prólogo termina com bebida e burocracia." }
];

/**
 * EndingScene — epílogo cinematográfico do prólogo "A Bebida".
 * A dupla bebe no balcão enquanto as cartelas de narração passam;
 * depois vêm o título de fim, o gancho de continuação, os créditos
 * e os botões de nova jornada / menu.
 */
export class EndingScene extends Phaser.Scene {
  private caption!: Phaser.GameObjects.Text;
  private captionSpeaker!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private finalPanel!: Phaser.GameObjects.Container;

  private index = 0;
  private advancing = false;
  private finished = false;
  private captionTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("Ending");
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(900, 0, 0, 0);

    // o "CONTINUAR" do menu volta pro bar (e o Evy tem fala pós-final)
    gameState.ultimaCena = "Bar";

    this.buildBarScene(width, height);
    this.buildCaptionUI(width, height);

    this.input.keyboard!.on("keydown-E", () => this.advanceCaption());
    this.input.on("pointerdown", () => this.advanceCaption());

    this.showCaption();
  }

  /* ───── cenário do bar ───── */

  private buildBarScene(width: number, height: number): void {
    const world = this.add.container(0, 0).setAlpha(0);

    // parede quente do bar
    const wall = this.add.rectangle(width / 2, height * 0.34, width, height * 0.68, 0x2a1418);
    const wallGlow = this.add.rectangle(width / 2, height * 0.34, width, height * 0.68, 0x8b0000, 0.18);

    // prateleira + garrafas silhuetadas
    const shelf = this.add.rectangle(width / 2, 168, width - 160, 8, 0x0d1620).setStrokeStyle(1, 0xffca6b, 0.4);
    const bottles: Phaser.GameObjects.GameObject[] = [];
    for (let i = 0; i < 14; i++) {
      const bx = 130 + i * 52 + Phaser.Math.Between(-5, 5);
      const bh = Phaser.Math.Between(24, 40);
      bottles.push(this.add.rectangle(bx, 162 - bh / 2, 9, bh, 0x1a0f10).setStrokeStyle(1, 0xffd75e, 0.35));
      bottles.push(this.add.rectangle(bx, 162 - bh - 7, 4, 12, 0x1a0f10).setStrokeStyle(1, 0xffd75e, 0.35));
    }

    // luzinhas âmbar do bar
    const lamps: Phaser.GameObjects.GameObject[] = [];
    for (let i = 0; i < 7; i++) {
      const lamp = this.add.circle(
        Phaser.Math.Between(110, width - 110),
        Phaser.Math.Between(60, 210),
        Phaser.Math.FloatBetween(120, 220),
        Phaser.Utils.Array.GetRandom([0xffd700, 0xff6b35, 0xffe4b5]),
        Phaser.Math.FloatBetween(0.07, 0.14)
      );
      this.tweens.add({ targets: lamp, alpha: { from: 0.08, to: 0.18 }, duration: Phaser.Math.Between(900, 2100), yoyo: true, repeat: -1 });
      lamps.push(lamp);
    }

    // balcão
    const counterTop = this.add.rectangle(width / 2, 352, width, 18, 0x9a5a32).setStrokeStyle(2, 0xffca6b, 0.7);
    const counterFront = this.add.rectangle(width / 2, 400, width, 80, 0x5b2f1d);
    const floor = this.add.rectangle(width / 2, 490, width, 100, 0x2b1710);

    // Evy atrás do balcão
    const evy = this.add.container(480, 300);
    const evyFrame = this.add.rectangle(0, 0, 90, 96, 0x1a0505).setStrokeStyle(3, 0xffd75e);
    const evyFace = this.add.text(0, -8, "🦊", { fontSize: "40px" }).setOrigin(0.5);
    const evyName = this.add.text(0, 34, "EVY", { fontSize: "12px", color: "#ffd75e", fontStyle: "bold" }).setOrigin(0.5);
    evy.add([evyFrame, evyFace, evyName]);
    this.tweens.add({ targets: evyFrame, y: "-=4", duration: 1600, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    // Lilly e Kielop sentados no balcão
    const lilly = this.characterCard(300, 318, 0xff69b4, "L", "LILLY", "a gata de nove planos");
    const kielop = this.characterCard(660, 318, 0x1e90ff, "K", "KIEL", "o copiador oficial");

    // copos sobre o balcão
    const drinks = [...this.drink(300, 356, 0xff69b4), ...this.drink(660, 356, 0x5bc8ff)];

    // kennedito deitado ao lado
    const dogMat = this.add.rectangle(840, 440, 96, 30, 0x5b2f1d).setStrokeStyle(2, 0xffca6b, 0.5);
    const dog = this.add.text(840, 420, "🐶", { fontSize: "26px" }).setOrigin(0.5);
    this.tweens.add({ targets: dog, y: "-=3", duration: 1400, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    world.add([
      wall,
      wallGlow,
      shelf,
      ...bottles,
      ...lamps,
      floor,
      counterFront,
      counterTop,
      evy,
      ...lilly,
      ...kielop,
      ...drinks,
      dogMat,
      dog
    ]);

    this.tweens.add({ targets: world, alpha: 1, duration: 1200, ease: "Sine.out" });
  }

  private characterCard(x: number, y: number, color: number, initial: string, name: string, role: string): Phaser.GameObjects.GameObject[] {
    const frame = this.add.rectangle(x, y, 74, 86, 0x1a0505).setStrokeStyle(3, color);
    const portrait = this.add.rectangle(x, y - 8, 46, 44, color).setStrokeStyle(2, 0xffffff);
    const letter = this.add.text(x, y - 8, initial, { fontSize: "22px", color: "#1a0505", fontStyle: "bold" }).setOrigin(0.5);
    const nameText = this.add.text(x, y + 34, name, { fontSize: "12px", color: "#ffd75e", fontStyle: "bold" }).setOrigin(0.5);
    const roleText = this.add.text(x, y + 50, role, { fontSize: "9px", color: "#ffe4b5" }).setOrigin(0.5);
    const stool = this.add.rectangle(x, y + 70, 40, 12, 0x3a1d12).setStrokeStyle(1, 0xffca6b, 0.5);
    this.tweens.add({ targets: frame, y: "-=3", duration: 1500, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    return [stool, frame, portrait, letter, nameText, roleText];
  }

  private drink(x: number, y: number, color: number): Phaser.GameObjects.GameObject[] {
    const glass = this.add.rectangle(x, y, 16, 20, color, 0.85).setStrokeStyle(2, 0xffffff, 0.8);
    const stem = this.add.rectangle(x, y + 13, 3, 8, 0xffffff, 0.7);
    const base = this.add.rectangle(x, y + 18, 14, 3, 0xffffff, 0.7);
    this.tweens.add({ targets: glass, alpha: { from: 0.6, to: 0.95 }, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    return [stem, base, glass];
  }

  /* ───── cartelas de narração ───── */

  private buildCaptionUI(width: number, height: number): void {
    const box = this.add.rectangle(width / 2, height - 66, width - 120, 92, 0x0b0c15, 0.92).setStrokeStyle(2, 0xffca6b, 0.7);
    box.setDepth(20);
    this.captionSpeaker = this.add
      .text(width / 2, height - 100, "", { fontSize: "12px", color: "#ffd75e", fontStyle: "bold" })
      .setOrigin(0.5);
    this.caption = this.add
      .text(width / 2, height - 68, "", {
        fontSize: "18px",
        color: "#ffe4b5",
        align: "center",
        wordWrap: { width: width - 190 },
        lineSpacing: 5
      })
      .setOrigin(0.5);
    this.hint = this.add
      .text(width - 80, height - 22, "[E] continuar", { fontSize: "11px", color: "#c9a06a" })
      .setOrigin(1, 0.5);
    this.tweens.add({ targets: this.hint, alpha: { from: 0.35, to: 1 }, duration: 800, yoyo: true, repeat: -1 });
  }

  private showCaption(): void {
    if (this.finished) return;
    if (this.index >= EPILOGUE.length) {
      this.showFinalPanel();
      return;
    }

    const line = EPILOGUE[this.index];
    this.advancing = false;
    this.captionSpeaker.setText(line.speaker === "narrador" ? "narração" : line.speaker.toUpperCase());
    this.captionSpeaker.setColor(SPEAKER_COLORS[line.speaker]);
    this.caption.setText(line.text).setColor(SPEAKER_COLORS[line.speaker]).setAlpha(0);
    this.tweens.add({ targets: this.caption, alpha: 1, duration: 260 });

    this.captionTimer?.remove();
    this.captionTimer = this.time.delayedCall(4800, () => this.advanceCaption());
  }

  private advanceCaption(): void {
    if (this.finished || this.advancing) return;
    this.advancing = true;
    this.captionTimer?.remove();
    this.tweens.add({
      targets: [this.caption, this.captionSpeaker],
      alpha: 0,
      duration: 180,
      onComplete: () => {
        this.index++;
        this.showCaption();
      }
    });
  }

  /* ───── painel final ───── */

  private buildFinalPanel(width: number, height: number): void {
    this.finalPanel = this.add.container(0, 0).setAlpha(0).setVisible(false);

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x050308, 0.72);

    const title = this.add
      .text(width / 2, 92, "A BEBIDA — FIM DO PRÓLOGO", {
        fontSize: "34px",
        color: "#ffd75e",
        fontStyle: "bold",
        stroke: "#1a0505",
        strokeThickness: 7,
        align: "center"
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, "#ffd700", 24, true, true);
    this.tweens.add({ targets: title, scale: { from: 0.98, to: 1.02 }, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    const subtitle = this.add
      .text(width / 2, 148, "A história de Lilly & Kielop continua…", { fontSize: "18px", color: "#ffe4b5" })
      .setOrigin(0.5);

    const continuation = this.add
      .text(width / 2, 184, "Os próximos atos chegam em uma futura atualização. O bar fica aberto até lá.", {
        fontSize: "12px",
        color: "#c9a06a",
        align: "center"
      })
      .setOrigin(0.5);

    const copia = copiasKielop.habilidade;
    const statText = copia
      ? `Nesta jornada, Kielop copiou: ${copia.name} (de ${copia.from}).`
      : "Nesta jornada, Kielop não copiou ninguém. Fica pra próxima.";
    const stat = this.add.text(width / 2, 228, statText, { fontSize: "12px", color: "#9de8a5" }).setOrigin(0.5);

    const credits = [
      this.credit(width / 2 - 240, 330, 0xff69b4, "LILLY"),
      this.credit(width / 2 - 80, 330, 0x1e90ff, "KIEL"),
      this.credit(width / 2 + 80, 330, 0xffd75e, "EVY"),
      this.credit(width / 2 + 240, 330, 0xd08b3a, "KENNEDITO")
    ].flat();

    const thanks = this.add
      .text(width / 2, 412, "Obrigado por jogar. 💛", { fontSize: "13px", color: "#ffe4b5" })
      .setOrigin(0.5);

    const novo = this.button(width / 2, 466, "JOGAR DE NOVO", 0xffd75e, () => {
      novaJornada();
      this.go("Bar");
    });
    const menu = this.button(width / 2, 512, "VOLTAR AO MENU", 0x4ecdc4, () => this.go("Menu"));

    this.finalPanel.add([shade, title, subtitle, continuation, stat, ...credits, thanks, ...novo, ...menu]);
  }

  private credit(x: number, y: number, color: number, name: string): Phaser.GameObjects.GameObject[] {
    const frame = this.add.rectangle(x, y, 130, 82, 0x1a0505).setStrokeStyle(3, color);
    const portrait = this.add.rectangle(x, y - 6, 52, 36, color).setStrokeStyle(2, 0xffffff);
    const letter = this.add.text(x, y - 6, name.slice(0, 2), { fontSize: "16px", color: "#1a0505", fontStyle: "bold" }).setOrigin(0.5);
    const label = this.add.text(x, y + 30, name, { fontSize: "11px", color: "#ffd75e", fontStyle: "bold" }).setOrigin(0.5);
    this.tweens.add({ targets: frame, y: "-=5", duration: 1500, yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 600), ease: "Sine.inOut" });
    return [frame, portrait, letter, label];
  }

  private button(x: number, y: number, text: string, glow: number, action: () => void): Phaser.GameObjects.GameObject[] {
    const bg = this.add.rectangle(x, y, 300, 42, 0x2a2f4a).setStrokeStyle(2, glow).setInteractive({ useHandCursor: true });
    const label = this.add
      .text(x, y, text, { fontSize: "17px", color: `#${glow.toString(16).padStart(6, "0")}`, fontStyle: "bold" })
      .setOrigin(0.5);
    const glowBox = this.add.rectangle(x, y, 300, 42, glow, 0).setStrokeStyle(2, glow);

    bg.on("pointerover", () => {
      glowBox.setAlpha(0.2);
      bg.setFillStyle(0x3a4066);
      this.tweens.add({ targets: [bg, label], scale: 1.05, duration: 120 });
    });
    bg.on("pointerout", () => {
      glowBox.setAlpha(0);
      bg.setFillStyle(0x2a2f4a);
      this.tweens.add({ targets: [bg, label], scale: 1, duration: 120 });
    });
    bg.on("pointerdown", action);
    this.tweens.add({ targets: glowBox, alpha: { from: 0, to: 0.12 }, duration: 800, yoyo: true, repeat: -1 });
    return [glowBox, bg, label];
  }

  private showFinalPanel(): void {
    if (this.finished) return;
    this.finished = true;
    this.captionTimer?.remove();

    this.buildFinalPanel(this.scale.width, this.scale.height);

    this.tweens.add({
      targets: [this.caption, this.captionSpeaker, this.hint],
      alpha: 0,
      duration: 300
    });

    this.finalPanel.setVisible(true);
    this.tweens.add({ targets: this.finalPanel, alpha: 1, duration: 900, ease: "Sine.out" });
  }

  /** fade de saída antes de trocar de cena */
  private go(sceneKey: string): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(sceneKey));
  }
}
