import Phaser from "phaser";
import type { QuestionDialogueLine } from "shared";

/**
 * DialogueSystem — caixa de diálogo simples com "Confirmar (E)".
 * Suporta lista de falas e callback no fim (ex: trocar controle).
 */
export class DialogueSystem {
  private scene: Phaser.Scene;
  private box!: Phaser.GameObjects.Container;
  private textHint!: Phaser.GameObjects.Text;
  private lines: QuestionDialogueLine[] = [];
  private index = 0;
  private onFinish?: () => void;
  private open = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const w = scene.scale.width - 160;
    const bg = scene.add.rectangle(0, 0, w, 110, 0x0b0c15, 0.92)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5, 0);
    const nameText = scene.add.text(0, 12, "", { fontSize: "12px", color: "#ffd75e" }).setOrigin(0, 0);
    const bodyText = scene.add.text(16, 34, "", { fontSize: "16px", color: "#ffffff", wordWrap: { width: w - 48 } });
    this.textHint = scene.add.text(w / 2, 96, "[E] continuar", {
      fontSize: "10px",
      color: "#9aa4c0"
    }).setOrigin(0.5);
    this.box = scene.add
      .container(scene.scale.width / 2, scene.scale.height - 130, [bg, nameText, bodyText, this.textHint])
      .setDepth(900)
      .setScrollFactor(0)
      .setVisible(false);
    this.box.setData("name", nameText).setData("body", bodyText);
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

  advance(): void {
    if (!this.open) return;
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
    (this.box.getData("name") as Phaser.GameObjects.Text).setText(
      line.speaker === "npc" ? "?" : line.speaker === "lilly" ? "Lilly" : "Kielop"
    );
    (this.box.getData("body") as Phaser.GameObjects.Text).setText(line.text);
  }

  private close(): void {
    this.open = false;
    this.box.setVisible(false);
  }
}
