import Phaser from "phaser";
import { Entity } from "./Entity";
import type { QuestionDialogueLine } from "shared";

/** Habilidade que o Kielop copia ao derrotar o inimigo */
export interface HabilidadeCopiavel {
  name: string;
  power: number;
  lines: QuestionDialogueLine[];
}

export interface EnemyDef {
  id: string;
  name: string;
  color: number;
  maxHp: number;
  /** dano base do contra-ataque */
  power: number;
  grants: HabilidadeCopiavel;
}

/**
 * Enemy — inimigo de mapa que patrulha entre pontos.
 * Ao encostar na dupla, dispara o BattleSystem (combate por turnos).
 */
export class Enemy extends Entity {
  readonly def: EnemyDef;
  hp: number;

  private goals: { x: number; y: number }[];
  private gi = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    def: EnemyDef,
    goals: { x: number; y: number }[]
  ) {
    super(scene, x, y, def.color);
    this.def = def;
    this.hp = def.maxHp;
    this.goals = goals;
    this.speed = 55; // patrulha devagar

    // etiqueta com o nome
    const tag = scene.add.text(0, -30, def.name, {
      fontSize: "10px",
      color: "#ff9d9d",
      backgroundColor: "#00000099"
    }).setOrigin(0.5);
    this.add(tag);

    // animação de "respirar" assutadora
    scene.tweens.add({ targets: this.sprite, scaleX: 1.15, duration: 500, yoyo: true, repeat: -1 });
  }

  update(): void {
    const goal = this.goals[this.gi];
    if (Phaser.Math.Distance.Between(this.x, this.y, goal.x, goal.y) < 10) {
      this.gi = (this.gi + 1) % this.goals.length;
    } else {
      this.moveTowards(goal.x, goal.y);
    }
  }
}
