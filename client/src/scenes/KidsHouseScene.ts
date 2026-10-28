import Phaser from "phaser";
import { BaseDuplaScene } from "./BaseDuplaScene";
import { quest } from "../systems/QuestSystem";
import type { QuestionDialogueLine } from "shared";

/**
 * KidsHouseScene — Ato 3: interior da casa das três crianças.
 * NÃO há combate com elas: confissão do ritual + cutscene do círculo.
 */
export class KidsHouseScene extends BaseDuplaScene {
  constructor() {
    super("KidsHouse");
  }

  protected get locationName(): string {
    return "CASA AO FIM DA TRILHA";
  }

  create(data?: { x?: number; y?: number }): void {
    const spawn = { x: data?.x ?? 480, y: data?.y ?? 460 };
    this.setupScene({ width: 960, height: 560, floorColor: 0x4a3a2e, spawn });

    const walls = this.physics.add.staticGroup();
    [[480, 20, 960, 40], [30, 280, 60, 500], [930, 280, 60, 500], [480, 60, 500, 20]].forEach(([x, y, w, h]) =>
      walls.add(this.add.rectangle(x, y, w, h, 0x2c2118).setStrokeStyle(2, 0x8d5524))
    );
    this.physics.add.collider(
      [this.players.lilly, this.players.kielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      walls
    );

    // móveis: cama de gêmeos, ração, cachorrinho fofo 🐕
    this.add.rectangle(180, 180, 110, 70, 0x7a4b2a).setStrokeStyle(2, 0xffca6b);
    this.add.text(180, 180, "cama", { fontSize: "9px", color: "#ffd75e" }).setOrigin(0.5);
    this.add.rectangle(800, 190, 70, 50, 0x6b3d1f).setStrokeStyle(2, 0xffca6b);
    this.add.text(800, 190, "ração", { fontSize: "9px", color: "#ffd75e" }).setOrigin(0.5);
    const dog = this.add.rectangle(760, 250, 28, 20, 0xb98a55).setStrokeStyle(2, 0xffffff);
    this.add.text(760, 225, "🐕", { fontSize: "14px" }).setOrigin(0.5);

    // círculo do ritual
    this.add.circle(480, 340, 70, 0x000000, 0.0).setStrokeStyle(3, 0xff4d6d);
    this.add.text(480, 340, "ritual", { fontSize: "12px", color: "#ff8fa3" }).setOrigin(0.5);
    this.addZone(480, 340, 180, 180, "círculo do ritual — [E] examinar", () => this.examineRitual());

    // porta do fundoindo até a trilha
    this.add.rectangle(480, 548, 70, 16, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(480, 525, "🚪 pátio", { fontSize: "9px", color: "#c9d1f2" }).setOrigin(0.5);
    this.addDoor(480, 540, 110, 40, "Trail", { x: 1650, y: 450 });

    // vela piscando
    const c = this.add.circle(620, 340, 5, 0xffd75e);
    this.tweens.add({ targets: c, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
  }

  private examineRitual(): void {
    if (quest.stage === 2) {
      this.dialogue.start(RITUAL_DONE_LINES);
      return;
    }
    this.dialogue.start(RITUAL_LINES, () => quest.advance()); // stage 1 → 2
  }
}

const RITUAL_LINES: QuestionDialogueLine[] = [
  { speaker: "lilly", text: "GENTEE!! Made um círculo rosa aqui no chão!" },
  { speaker: "npc", text: "(uma voz pequena) 'E-erra... não era pro ninguém ver...' " },
  { speaker: "kielop", text: "Três crianças, uma garrafa roubada — e um círculo mágico. Começo a imaginar." },
  { speaker: "npc", text: "(a voz) 'A gente só queria... reviver o cachorrinho nosso. Tinha um jeito! Era real!'" },
  { speaker: "lilly", text: "Ó DO CÉU QUE FOFO 😭..." },
  { speaker: "kielop", text: "Metamorfose, roubo de bebida e necromancia infantil. Dia produtivo." }
];

const RITUAL_DONE_LINES: QuestionDialogueLine[] = [
  { speaker: "npc", text: "O brilho tá mais forte. Alguém chegando?" },
  { speaker: "lilly", text: "Tô pronta pra bater em QUALQUER coisa que SAIR DAQUELE CÍRCULO!" }
];
