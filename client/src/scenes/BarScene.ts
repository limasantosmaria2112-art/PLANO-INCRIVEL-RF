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
  constructor() {
    super("Bar");
  }

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
    ].forEach(([x, y, w, h]) => walls.add(this.add.rectangle(x, y, w, h, 0x4a1f33).setStrokeStyle(3, 0xc46a2b)));
    this.physics.add.collider(
      [this.players.lilly, this.players.kielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      walls
    );
    this.wallsGroup = walls;

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
    this.addDoor(480, 540, 120, 40, "City", { x: 120, y: 640 });
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
          { speaker: "npc", text: "vocês passaram pela casa? sinto cheiro de dente quente no ar." },
          { speaker: "lilly", text: "o kennedito deu uma aula de física aplicada. na gente." },
          { speaker: "kielop", text: "ela quis dizer: 'a bebida, evy.'" }
        ]);
        break;
    }
  }
}

/* ───── Falas do Evy ───── */

const EVY_QUEST_LINES: QuestionDialogueLine[] = [
  { speaker: "npc", text: "ah, a dupla nova. o quema-cuca de sempre pra vocês?" },
  { speaker: "lilly", text: "a bebida especial. duas. somos clientes profissionais, sim." },
  { speaker: "npc", text: "...então tem problema: acabou. três crianças levaram a última garrafa." },
  { speaker: "kielop", text: "três crianças. uma garrafa rara. zero testemunhas. admirável." },
  { speaker: "npc", text: "a casa fica no fim da trilha leste. tragam a bebida e a próxima fica por conta da casa." },
  { speaker: "lilly", text: "aceito. recompensa líquida e tudo." }
];

const EVY_CHATTER: QuestionDialogueLine[][] = [
  [
    { speaker: "npc", text: "raposa com corpo de humano atendendo o dobro de clientes. a cauda limpa as mesas por mim. economia." },
    { speaker: "lilly", text: "quero uma cauda. kielop, aprova fiscalmente?" },
    { speaker: "kielop", text: "não é minha área. mas anoto como item de interesse." }
  ],
  [
    { speaker: "npc", text: "o segredo da drinkaria não é o copo. é o pé. rapoza de postura levanta o copo sozinha." },
    { speaker: "kielop", text: "anotado. abriremos uma drinkária." },
    { speaker: "lilly", text: "com cauda. não abrimos sem cauda." }
  ],
  [
    { speaker: "npc", text: "cuidado na trilha, é. os bichos de lá nunca perderam uma briga." },
    { speaker: "lilly", text: "nós também não perdemos. nunca brigamos, então empate técnico." },
    { speaker: "kielop", text: "...não é assim que funciona." }
  ]
];
