import Phaser from "phaser";
import type { QuestionDialogueLine } from "shared";
import { Npc } from "../entities/Npc";
import { BaseDuplaScene } from "./BaseDuplaScene";
import { quest } from "../systems/QuestSystem";

/**
 * BarScene — Ato 1: o bar. Apresenta Evy, o barman raposa 🦊,
 * e dispara a quest "A Bebida".
 */
export class BarScene extends BaseDuplaScene {
  protected get locationName(): string {
    return "EVERY'S TIPSY — interior";
  }

  private evyChatterIndex = 0;
  private evy!: Npc;

  create(): void {
    this.setupScene({ width: 960, height: 560, floorColor: 0x3b2a22, spawn: { x: 480, y: 460 } });

    // paredes do bar
    const walls = this.physics.add.staticGroup();
    [
      [480, 20, 960, 40],
      [480, 250, 560, 24], // balcão
      [150, 300, 24, 240],
      [810, 280, 24, 170]
    ].forEach(([x, y, w, h]) => walls.add(this.add.rectangle(x, y, w, h, 0x241626).setStrokeStyle(2, 0x5b3d2e)));
    this.physics.add.collider(
      [this.players.lilly, this.players.kielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      walls
    );

    // decoração: mesinhas + luminárias
    this.add.rectangle(420, 430, 90, 50, 0x7a4b2a).setStrokeStyle(2, 0xffca6b);
    this.add.text(420, 462, "mesa tranquila", { fontSize: "9px", color: "#ffd75e" }).setOrigin(0.5);
    this.add.rectangle(300, 380, 70, 40, 0x5b3d2e).setStrokeStyle(2, 0xffca6b);
    this.add.rectangle(660, 380, 70, 40, 0x5b3d2e).setStrokeStyle(2, 0xffca6b);
    this.add.text(300, 380, "☰", { fontSize: "16px", color: "#ffd75e" }).setOrigin(0.5);
    this.add.rectangle(150, 80, 960, 8, 0xffca6b, 0.15);

    // 🦊 EVY — barman raposa com corpo de humano, amigável
    this.evy = new Npc(this, 480, 175, "Evy 🦊", 0xc46a2b);
    this.addZone(
      480,
      210,
      140,
      70,
      "Evy, o barman — [E] conversar",
      () => this.talkToEvy()
    );

    // ⭐ primeira SwapZone do jogo: a mesa tranquila do bar
    this.addSwapZone(420, 430, 150, 80);

    // porta de saída para a praça
    this.addDoor(480, 540, 120, 40, "City", { x: 120, y: 700 });
    this.add.rectangle(480, 548, 60, 16, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(480, 525, "🚪 sair", { fontSize: "9px", color: "#c9d1f2" }).setOrigin(0.5);
  }

  /** Conversas em camadas: varia conforme o estágio da quest */
  private talkToEvy(): void {
    switch (quest.stage) {
      case 0:
        this.dialogue.start(EVY_QUEST_LINES, () => quest.advance()); // missão aceita!
        break;
      case 1:
        this.dialogue.start(EVY_CHATTER[this.evyChatterIndex++ % EVY_CHATTER.length]);
        break;
      case 2:
        this.dialogue.start([
          { speaker: "npc", text: "Vocês... se aproximaram da casa? Sinto o cheiro de dente quente em vocês." },
          { speaker: "lilly", text: "FIÓ DO CERBERUS FOI MUITO BRABO COM GENTE!!" },
          { speaker: "kielop", text: "Ela quis dizer: 'poderia dar a bebida agora'." }
        ]);
        break;
    }
  }
}

/* ───── Falas do Evy ───── */

const EVY_QUEST_LINES: QuestionDialogueLine[] = [
  { speaker: "npc", text: "Ah, dupla nova! O quema-cuca de sempre pra vocês?" },
  { speaker: "lilly", text: "A BEBIDA ESPECIAL! DUAS! VAIIII!" },
  { speaker: "npc", text: "...aí vem o problema. Não tem. Três trombadinhas levaram A ÚLTIMA garrafa." },
  { speaker: "kielop", text: "Três crianças... roubando UMA garrafa de bebida rara. Faz sentido." },
  { speaker: "npc", text: "Elas foram pra casa ao fim da trilha leste. Trazem minha bebida de volta e o round seguinte é por minha conta." },
  { speaker: "lilly", text: "MISSÃO ACEITA CARAMBA!!" }
];

const EVY_CHATTER: QuestionDialogueLine[][] = [
  [
    { speaker: "npc", text: "Sabia que raposa com corpo de humano atende o dobramento de clientes? Cauda limpando mesas é economia." },
    { speaker: "lilly", text: "EU QUERO UMA CAUDA ASSIM!! KILOP DEIXA?" },
    { speaker: "kielop", text: "...tá bom, tá bom." }
  ],
  [
    { speaker: "npc", text: "O segredo da drinkaria não é o copo. É o pé. Rapoza bem equipada levanta o copo sozinha." },
    { speaker: "kielop", text: "Anotado. We'll build a drinkária em nosso apartamento." }
  ],
  [
    { speaker: "npc", text: "Cuidado na trilha, é. Os bichos de lá nunca perderam uma briga." },
    { speaker: "lilly", text: "EU TAMBÉM NUNCA PERDI! Impressionante, não?" },
    { speaker: "kielop", text: "É porque você nunca LUTOU antes." }
  ]
];
