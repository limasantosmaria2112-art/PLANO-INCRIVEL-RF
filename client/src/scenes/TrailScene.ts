import Phaser from "phaser";
import { BaseDuplaScene } from "./BaseDuplaScene";
import type { EnemyDef } from "../entities/Enemy";

/**
 * TrailScene — Ato 2: trilha perigosa entre a praça e a casa das crianças.
 * O Bandido Magro patrulha (combate por turnos). O cachinho fica na casa.
 */
export class TrailScene extends BaseDuplaScene {
  private static readonly BANDIDO: EnemyDef = {
    id: "bandido",
    name: "Bandido Magro",
    color: 0x9e6b58,
    maxHp: 26,
    power: 6,
    grants: {
      name: "Cacetada",
      power: 14,
      lines: [
        { speaker: "kielop", text: "a Cacetada agora é minha. obrigado pela aula de violência aplicada." },
        { speaker: "lilly", text: "ele nos ensinou usando o próprio rosto. professor nato." }
      ]
    }
  };

  constructor() {
    super("Trail");
  }

  protected get locationName(): string {
    return "TRILHA LESTE";
  }

  create(data?: { x?: number; y?: number }): void {
    this.setupScene({
      width: 1800,
      height: 900,
      floorColor: 0x1f2a1c,
      spawn: { x: data?.x ?? 150, y: data?.y ?? 450 }
    });

    const walls = this.physics.add.staticGroup();
    // paredes curvadas formando a trilha
    [
      [300, 260, 500, 22], [900, 360, 22, 320], [700, 620, 500, 22],
      [1250, 520, 22, 300], [1400, 350, 380, 22], [1650, 620, 22, 320]
    ].forEach(([x, y, w, h]) => walls.add(this.add.rectangle(x, y, w, h, 0x2f6b3f).setStrokeStyle(3, 0xa8e06a)));
    this.physics.add.collider(
      [this.players.lilly, this.players.kielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      walls
    );
    this.wallsGroup = walls;

    // vegetação e placas
    for (const [x, y] of [[200, 700], [550, 200], [980, 780], [1350, 220], [1550, 780]] as [number, number][])
      this.add.rectangle(x, y, 18, 24, 0x2a9140).setStrokeStyle(2, 0x1b6b2d);

    this.addZone(760, 620, 200, 90, "placa — [E] ler", () => {
      this.dialogue.start([
        { speaker: "npc", text: "(placa) 'CUIDADO — BANDIDO MAGRO à frente. contratos curiosos por aqui. [A] bate, [B] é o especial, [F] foge; quem vence copia!'" },
        { speaker: "lilly", text: "'bandido magro, trabalho honesto.' o mercado tá difícil pra todo mundo." },
        { speaker: "kielop", text: "bater é técnica. ordem: técnica primeiro, depois bater." }
      ]);
    });

    // o bandido patrulha a trilha (o Cachorrinho Revivido vive na casa)
    this.addEnemy(430, 450, TrailScene.BANDIDO, [{ x: 360, y: 450 }, { x: 640, y: 450 }]);

    // caminhadinha: luz de vaga-lume decorativa
    for (const [x, y] of [[400, 320], [1200, 480]] as [number, number][]) {
      const gl = this.add.circle(x, y, 8, 0xfff176);
      this.tweens.add({ targets: gl, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    }

    // porta ao fim da trilha
    this.add.rectangle(1750, 450, 40, 120, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(1750, 400, "casa 🏠", { fontSize: "10px", color: "#ffd75e" }).setOrigin(0.5);
    this.addDoor(1750, 450, 80, 200, "KidsHouse", { x: 480, y: 420 });

    // porta a oeste: VOLTA pra praça (antes era caminho só de ida)
    this.add.rectangle(50, 450, 40, 120, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(50, 385, "praça 🏙", { fontSize: "10px", color: "#ffd75e" }).setOrigin(0.5);
    this.addDoor(50, 450, 80, 200, "City", { x: 1270, y: 420 });
  }
}
