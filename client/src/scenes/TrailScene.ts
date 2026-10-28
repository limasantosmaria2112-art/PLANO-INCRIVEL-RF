import Phaser from "phaser";
import { BaseDuplaScene } from "./BaseDuplaScene";
import type { EnemyDef } from "../entities/Enemy";

/**
 * TrailScene — Ato 2: trilha perigosa entre a praça e a casa das crianças.
 * Fase 2 chegou: bandido e bicho bravo patrulham a trilha (combate por turnos).
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
        { speaker: "kielop", text: "Eita... essa CACETADA agora é minha. Tá copiada, tá salva." },
        { speaker: "lilly", text: "Ele copiou até brutalidade, esse menino é um capacho de conhecimento!" }
      ]
    }
  };

  private static readonly CACHORRINHO: EnemyDef = {
    id: "cachorrinho",
    name: "Cachorrinho Revivido 🐶",
    color: 0xd08b3a,
    maxHp: 34,
    power: 8,
    grants: {
      name: "Rosnado Sônico",
      power: 17,
      lines: [
        { speaker: "kielop", text: "O cachorrinho que não devia ter sido revivido... e agora me dá poder sônico." },
        { speaker: "lilly", text: "NAPUTA, KIELOP PEGOU O ATAQUE DO BEIJO DA MORTE." }
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
    ].forEach(([x, y, w, h]) => walls.add(this.add.rectangle(x, y, w, h, 0x16301a).setStrokeStyle(2, 0x2a9140)));
    this.physics.add.collider(
      [this.players.lilly, this.players.kielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      walls
    );

    // vegetação e placas
    for (const [x, y] of [[200, 700], [550, 200], [980, 780], [1350, 220], [1550, 780]] as [number, number][])
      this.add.rectangle(x, y, 18, 24, 0x2a9140).setStrokeStyle(2, 0x1b6b2d);

    this.addZone(760, 620, 200, 90, "placa — [E] ler", () => {
      this.dialogue.start([
        { speaker: "npc", text: "(placa) 'CUIDADO — BANDIDO MAGRO e o CACHORRINHO REVIVIDO patrulham à frente. Dica: [A] bate, [B] é o especial, [F] foge; quem vence copia!'" },
        { speaker: "lilly", text: "AÍ SIM! QUERO BATER GENTE!!" },
        { speaker: "kielop", text: "...não é 'bater gente', é aprendizado tático. Por mim, ok." }
      ]);
    });

    // fases chegaram: bicho bravo e bandido patrulham a trilha
    this.addEnemy(430, 450, TrailScene.BANDIDO, [{ x: 360, y: 450 }, { x: 640, y: 450 }]);
    this.addEnemy(1330, 470, TrailScene.CACHORRINHO, [{ x: 1290, y: 470 }, { x: 1600, y: 470 }]);

    // caminhadinha: luz de vaga-lume decorativa
    for (const [x, y] of [[400, 320], [1200, 480]] as [number, number][]) {
      const gl = this.add.circle(x, y, 8, 0xfff176);
      this.tweens.add({ targets: gl, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    }

    // porta ao fim da trilha
    this.add.rectangle(1750, 450, 40, 120, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(1750, 400, "casa 🏠", { fontSize: "10px", color: "#ffd75e" }).setOrigin(0.5);
    this.addDoor(1750, 450, 80, 200, "KidsHouse", { x: 480, y: 420 });
  }
}
