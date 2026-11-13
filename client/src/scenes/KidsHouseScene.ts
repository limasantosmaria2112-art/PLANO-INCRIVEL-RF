import Phaser from "phaser";
import { BaseDuplaScene } from "./BaseDuplaScene";
import { quest } from "../systems/QuestSystem";
import type { EnemyDef } from "../entities/Enemy";
import type { QuestionDialogueLine } from "shared";

/**
 * KidsHouseScene — Ato 3: interior da casa das três crianças.
 * Sem combate contra elas. Ao examinar o círculo com a bebida,
 * o ritual desperta o Kennedito Revivido — DENTRO da casa.
 */
export class KidsHouseScene extends BaseDuplaScene {
  private static readonly KENNNEDITO: EnemyDef = {
    id: "kennedito",
    name: "Kennedito Revivido 🐶",
    color: 0xd08b3a,
    maxHp: 34,
    power: 8,
    grants: {
      name: "Rosnado Sônico",
      power: 17,
      lines: [
        { speaker: "kielop", text: "o Rosnado Sônico agora é meu, por direito de vencedor. o kennedito tinha técnica, admito." },
        { speaker: "lilly", text: "latiu ondas de choque em nós. respeitável, pra um bicho de estimação." }
      ]
    }
  };

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
      walls.add(this.add.rectangle(x, y, w, h, 0x6b3524).setStrokeStyle(3, 0xffca6b))
    );
    this.physics.add.collider(
      [this.players.lilly, this.players.kielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      walls
    );
    this.wallsGroup = walls;

    // móveis: cama de gêmeos, ração, cachorrinho fofo 🐕
    this.add.rectangle(180, 180, 110, 70, 0x7a4b2a).setStrokeStyle(2, 0xffca6b);
    this.add.text(180, 180, "cama", { fontSize: "9px", color: "#ffd75e" }).setOrigin(0.5);
    this.add.rectangle(800, 190, 70, 50, 0x6b3d1f).setStrokeStyle(2, 0xffca6b);
    this.add.text(800, 190, "ração", { fontSize: "9px", color: "#ffd75e" }).setOrigin(0.5);
    this.add.text(760, 225, "🐕", { fontSize: "14px" }).setOrigin(0.5);

    // círculo do ritual
    this.add.circle(480, 340, 70, 0x000000, 0.0).setStrokeStyle(3, 0xff4d6d);
    this.add.text(480, 340, "ritual", { fontSize: "12px", color: "#ff8fa3" }).setOrigin(0.5);
    this.addZone(480, 340, 180, 180, "círculo do ritual — [E] examinar", () => this.examineRitual());

    // porta do fundo até a trilha
    this.add.rectangle(480, 548, 70, 16, 0x1a1c2c).setStrokeStyle(2, 0x8d5524);
    this.add.text(480, 525, "🚪 pátio", { fontSize: "9px", color: "#c9d1f2" }).setOrigin(0.5);
    this.addDoor(480, 540, 110, 40, "Trail", { x: 1650, y: 450 });

    // vela piscando
    const c = this.add.circle(620, 340, 5, 0xffd75e);
    this.tweens.add({ targets: c, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });

    // ritual já feito? o kennedito continua aqui, patrulhando o quarto
    if (quest.ritualAtivado) this.spawnDog();
  }

  private examineRitual(): void {
    if (quest.stage === 2) {
      this.dialogue.start(RITUAL_DONE_LINES);
      return;
    }
    // o diálogo termina → o ritual desperta o kennedito NA SALA
    this.dialogue.start(RITUAL_LINES, () => {
      quest.advance(); // stage 1 → 2 (ativada ritual e o kennedito)
      this.spawnDog();
    });
  }

  /** O Kennedito Revivido surge dentro da casa, ao lado do círculo */
  private spawnDog(): void {
    this.addEnemy(800, 260, KidsHouseScene.KENNNEDITO, [{ x: 780, y: 280 }, { x: 620, y: 360 }], {
      // derrotado → libera o final do prólogo no diálogo do Evy
      onWin: () => quest.marcarKenneditoResolvido()
    });
  }
}

const RITUAL_LINES: QuestionDialogueLine[] = [
  { speaker: "lilly", text: "círculo rosa gigante no meio da sala. sutileza nível maquete." },
  { speaker: "npc", text: "(voz minúscula) 'n-era... pra ninguém ver...'" },
  { speaker: "kielop", text: "três crianças, uma garrafa roubada, necromancia recreativa. não julgo. muito." },
  { speaker: "npc", text: "(a voz) 'só queríamos reviver o cachorrinho! tinha um jeito!'" },
  { speaker: "lilly", text: "tecnicamente: houve cachorro revivido. nota da criatividade: alta. do resultado: em processamento." },
  { speaker: "kielop", text: "sobre isso. o resultado acaba de entrar em posição de patrulha, certo?" },
  { speaker: "npc", text: "(a voz) '...desculpa mesmo. ele defende a ração AGORA.'" },
  { speaker: "lilly", text: "um cão guardião de ração necromanciado. terça-feira produtiva." }
];

const RITUAL_DONE_LINES: QuestionDialogueLine[] = [
  { speaker: "npc", text: "(a voz) 'o brilho tá mais forte. isso é ruim ou pior?'" },
  { speaker: "lilly", text: "é pior. ele tá do lado da ração me olhando como quem escolhe o lanche." }
];
