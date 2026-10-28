import Phaser from "phaser";
import { BaseDuplaScene } from "./BaseDuplaScene";
import { quest } from "../systems/QuestSystem";

/**
 * CityScene — praça da cidadezinha: casas, praça com SwapZone (banco)
 * e a porta da trilha leste (travada até a quest ser aceita com Evy).
 */
export class CityScene extends BaseDuplaScene {
  constructor() {
    super("City");
  }

  protected get locationName(): string {
    return "PRAÇA DA CIDADEZINHA";
  }

  create(data?: { x?: number; y?: number }): void {
    this.setupScene({
      width: 1400,
      height: 860,
      floorColor: 0x2d3149,
      spawn: { x: data?.x ?? 480, y: data?.y ?? 620 }
    });

    // prédios decorativos
    this.add.rectangle(280, 210, 190, 150, 0x3a3f63).setStrokeStyle(3, 0x8d5524);
    this.add.text(280, 210, "CASA DA\nSENHORINHA", { fontSize: "10px", color: "#c9d1f2", align: "center" }).setOrigin(0.5);
    this.add.rectangle(600, 180, 160, 120, 0x3a3f63).setStrokeStyle(3, 0x8d5524);
    this.add.text(600, 180, "LOJA", { fontSize: "12px", color: "#c9d1f2" }).setOrigin(0.5);
    this.add.rectangle(980, 210, 220, 140, 0x3a3f63).setStrokeStyle(3, 0x8d5524);
    this.add.text(980, 210, "(workspace\nfuturo)", { fontSize: "10px", color: "#5d628c", align: "center" }).setOrigin(0.5);

    // árvores
    for (const x of [160, 780, 1240])
      this.add.circle(x, 300, 34, 0x2a9140).setStrokeStyle(2, 0x1b6b2d).setData("tree", true);

    // portas dos prédios (Fase 2+)
    this.add.rectangle(280, 285, 34, 10, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.rectangle(600, 240, 30, 10, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);

    // portas do bar (entrada) e da trilha leste
    this.add.rectangle(120, 700, 60, 16, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(120, 670, "bar 🍺", { fontSize: "10px", color: "#ffd75e" }).setOrigin(0.5);
    this.addDoor(120, 700, 110, 50, "Bar", { x: 480, y: 420 });

    this.add.rectangle(1330, 420, 60, 70, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(1330, 380, "trilha leste", { fontSize: "10px", color: "#ffd75e" }).setOrigin(0.5);
    this.addDoor(1330, 420, 90, 110, "Trail", { x: 150, y: 450 }, {
      locked: () => quest.stage === 0,
      lockedLines: [
        { speaker: "npc", text: "(placa) 'TRILHA LESTE FECHADA — pelo Barman Evy, por motivações a esclarecer'." },
        { speaker: "kielop", text: "Conversar com o raposa parece o caminho." }
      ]
    });

    // ⭐ SwapZone: banco da praça
    this.add.rectangle(700, 520, 80, 22, 0x7a4b2a).setStrokeStyle(2, 0xffca6b);
    this.add.text(700, 540, "banco tranquilo", { fontSize: "9px", color: "#ffd75e" }).setOrigin(0.5);
    this.addSwapZone(700, 520, 140, 70);

    this.physics.add.collider(
      [this.players.lilly, this.players.kielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      this.physics.add.staticGroup()
    );
  }
}
