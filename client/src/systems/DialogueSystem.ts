import Phaser from "phaser";
import type { QuestionDialogueLine } from "shared";

const SPEAKER_COLORS: Record<string, string> = {
  lilly: "#ff77a9",
  kielop: "#5bc8ff",
  npc: "#ffd75e"
};

/**
 * DialogueSystem — caixa estilo Undertale/DeltaRune:
 * moldura dupla, cor por falante, datilografia pulável com [E]
 * e indicador "▼" piscando. Suporta callback no fim da conversa.
 */
export class DialogueSystem {
  private scene: Phaser.Scene;
  private box!: Phaser.GameObjects.Container;
  private frame!: Phaser.GameObjects.Graphics;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private arrowText!: Phaser.GameObjects.Text;
  private lines: QuestionDialogueLine[] = [];
  private index = 0;
  private onFinish?: () => void;
  private open = false;

  /** datilografia */
  private typing?: Phaser.Time.TimerEvent;
  private fullText = "";
  private shownChar = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const w = scene.scale.width - 160;

    this.frame = scene.add.graphics();
    this.nameText = scene.add.text(0, 8, "", { fontSize: "13px", color: "#ffd75e", fontStyle: "bold" }).setOrigin(0, 0);
    this.bodyText = scene.add.text(16, 34, "", {
      fontSize: "16px",
      color: "#ffffff",
      wordWrap: { width: w - 40 },
      lineSpacing: 5
    }).setOrigin(0, 0);
    this.arrowText = scene.add.text(0, 0, "▼", { fontSize: "12px", color: "#ffd75e" }).setOrigin(0.5);

    this.box = scene.add
      .container(scene.scale.width / 2, scene.scale.height - 140, [this.frame, this.nameText, this.bodyText, this.arrowText])
      .setDepth(900)
      .setScrollFactor(0)
      .setVisible(false);

    // ▼ pulsando enquanto houver próxima fala
    scene.tweens.add({ targets: this.arrowText, alpha: 0.15, duration: 420, yoyo: true, repeat: -1 });
  }

  start(lines: QuestionDialogueLine[], onFinish?: () => void): void {
    if (lines.length === 0) {
      onFinish?.();
      return;
    }
    this.lines = lines;
    this.index = 0;
    this.onFinish = onFinish;
    this.open = true;
    this.render();
    this.box.setVisible(true);
    this.box.setAlpha(0);
    this.scene.tweens.add({ targets: this.box, alpha: 1, duration: 120 });
  }

  isOpen(): boolean {
    return this.open;
  }

  /** [E]: se está digitando → termina de revelar; senão → próxima fala */
  advance(): void {
    if (!this.open) return;
    if (this.typing) {
      this.skipTyping();
      return;
    }
    this.index++;
    if (this.index >= this.lines.length) {
      this.close();
      this.onFinish?.();
      return;
    }
    this.render();
  }

  private render(): void {
    const line = this.lines[this.index];
    const name = line.speaker === "npc" ? "???" : line.speaker === "lilly" ? "Lilly" : "Kielop";
    this.nameText.setText(name).setColor(SPEAKER_COLORS[line.speaker] ?? "#ffd75e");

    // última linha? sem ▼ (a confirmação é o próprio fechamento)
    this.arrowText.setVisible(this.index < this.lines.length - 1);

    const w = this.scene.scale.width - 160;
    const left = -w / 2;
    this.nameText.setX(left + 18);
    this.bodyText.setX(left + 18);

    // digitação da fala
    this.fullText = line.text;
    this.shownChar = 0;
    // medir a altura do texto COMPLETO (a caixa não deve "crescer" durante a digitação)
    this.bodyText.setText(this.fullText);
    const textH = this.bodyText.height;
    this.bodyText.setText("");
    this.typing?.remove();
    this.typing = this.scene.time.addEvent({
      delay: 22,
      repeat: line.text.length - 1,
      callback: () => {
        this.shownChar++;
        this.bodyText.setText(this.fullText.slice(0, this.shownChar));
        if (this.shownChar >= this.fullText.length) {
          this.typing?.remove();
          this.typing = undefined;
        }
      }
    });

    // moldura redonda dupla (altura acompanha o texto medido: mínimo 110)
    const needed = Math.max(110, 34 + textH + 30);
    this.frame.clear();
    this.frame.fillStyle(0x0b0c15, 0.94);
    this.frame.fillRoundedRect(-w / 2, 0, w, needed, 10);
    this.frame.lineStyle(3, 0xffffff, 0.95);
    this.frame.strokeRoundedRect(-w / 2, 0, w, needed, 10);
    this.frame.lineStyle(1, 0x9aa4c0, 0.35);
    this.frame.strokeRoundedRect(-w / 2 + 5, 5, w - 10, needed - 10, 8);
    // aba do nome
    this.frame.fillStyle(0x1c2144, 1);
    this.frame.fillRoundedRect(left + 12, -14, this.nameText.width + 24, 26, 8);
    this.frame.lineStyle(2, 0xffffff, 0.9);
    this.frame.strokeRoundedRect(left + 12, -14, this.nameText.width + 24, 26, 8);
    this.arrowText.setPosition(w / 2 - 20, needed - 16);
  }

  private skipTyping(): void {
    this.typing?.remove();
    this.typing = undefined;
    this.bodyText.setText(this.fullText);
  }

  private close(): void {
    this.open = false;
    this.typing?.remove();
    this.typing = undefined;
    this.arrowText.setVisible(false);
    this.box.setVisible(false);
  }
}
