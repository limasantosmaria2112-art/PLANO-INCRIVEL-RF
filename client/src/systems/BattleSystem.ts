import Phaser from "phaser";
import type { CharacterId, QuestionDialogueLine } from "shared";
import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import { dupla } from "./DuplaSingleton";
import { copiasKielop } from "./CopySystem";

export interface BattleHooks {
  /** vitória (com as falas da cópia, se houver) */
  onWin?: (copyLines: QuestionDialogueLine[]) => void;
  /** derrota (respawn) */
  onLose?: () => void;
  /** fugiu */
  onFlee?: () => void;
}

type Action = "attack" | "special" | "heal" | "flee";

/**
 * BattleSystem — combate híbrido por turnos com timer:
 * a dupla tem 5s para decidir a ação; se hesitar, o inimigo ataca.
 *
 * [A] atacar | [B] especial | [G] gatinho (cura, Lilly) | [F] fugir
 * Kielop copia a habilidade do inimigo que derrotar.
 */
export class BattleSystem {
  static readonly DECIDE_MS = 5000;

  private scene: Phaser.Scene;
  private players: Record<CharacterId, Player>;
  private box!: Phaser.GameObjects.Container;
  private enemyLabel!: Phaser.GameObjects.Text;
  private enemyBar!: Phaser.GameObjects.Rectangle;
  private playerLabel!: Phaser.GameObjects.Text;
  private playerBar!: Phaser.GameObjects.Rectangle;
  private message!: Phaser.GameObjects.Text;
  private actionsHint!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Rectangle;
  private timerTween?: Phaser.Tweens.Tween;
  private state: "idle" | "choose" | "resolve" | "over" = "idle";
  private enemy: Enemy | null = null;
  private hooks: BattleHooks = {};

  constructor(scene: Phaser.Scene, players: Record<CharacterId, Player>) {
    this.scene = scene;
    this.players = players;
    this.buildUI();

    const kb = scene.input.keyboard!;
    kb.on("keydown-A", () => this.onChoose("attack"));
    kb.on("keydown-B", () => this.onChoose("special"));
    kb.on("keydown-G", () => this.onChoose("heal"));
    kb.on("keydown-F", () => this.onChoose("flee"));
  }

  isOpen(): boolean {
    return this.state !== "idle";
  }

  private debugLog(ev: string): void {
    (window as unknown as { __planoLog?: unknown[] }).__planoLog?.push({
      t: Math.round(this.scene.time.now),
      ev,
      state: this.state,
      enemyHp: this.enemy?.hp
    });
  }

  start(enemy: Enemy, hooks: BattleHooks): void {
    if (this.isOpen()) return;
    this.enemy = enemy;
    this.hooks = hooks;
    this.state = "resolve";
    this.debugLog("start");
    this.players[dupla.active].stop();
    this.players[dupla.follower].stop();
    this.box.setVisible(true);
    this.actionsHint.setText("");
    this.message.setText(`${enemy.def.name} apareceu!\nA dupla se prepara...`);
    this.refreshBars();
    this.scene.time.delayedCall(750, () => this.showMenu());
  }

  /** não custa turno: Kielop sem cópia volta pro menu */
  private showMenu(): void {
    const player = this.players[dupla.active];
    const hint: string[] = ["[A] atacar"];
    if (player.id === "lilly") {
      hint.push("[B] slide 💥", "[G] gatinho 🐱 (cura)", "[F] fugir");
    } else {
      const copia = copiasKielop.habilidade;
      hint.push(
        copia ? `[B] ${copia.name} ⭐` : "Kielop: sem habilidade copiada — DERROTE um inimigo para copiar",
        "[F] fugir"
      );
    }
    this.actionsHint.setText(hint.join("    "));
    this.message.setText("Decidam a ação da dupla! (5 segundos)");
    this.state = "choose";
    this.debugLog("menu");

    // barra do timer esvaziando
    this.timerTween?.stop();
    this.timerBar.setScale(1, 1);
    this.timerTween = this.scene.tweens.add({
      targets: this.timerBar,
      scaleX: 0,
      duration: BattleSystem.DECIDE_MS,
      onComplete: () => {
        if (this.state !== "choose") return;
        this.state = "resolve";
        this.message.setText("Demoraram demais... o inimigo aproveitou!");
        this.scene.time.delayedCall(600, () => this.enemyTurn());
      }
    });
  }

  private onChoose(action: Action): void {
    if (this.state !== "choose") return;
    const player = this.players[dupla.active];
    this.stopTimer();
    this.state = "resolve";

    if (action === "attack") {
      this.hitEnemy(8 + Math.floor(Math.random() * 5), `${player.label} avança e ataca!`);
    } else if (action === "flee") {
      if (Math.random() < 0.6) {
        this.message.setText("A dupla escapou por pouco! 💨");
        this.scene.time.delayedCall(700, () => {
          const hooks = this.hooks;
          this.close();
          hooks.onFlee?.();
        });
      } else {
        this.message.setText("Não conseguiram escapar!");
        this.scene.time.delayedCall(700, () => this.enemyTurn());
      }
    } else if (action === "special") {
      if (player.id === "lilly") {
        this.hitEnemy(13 + Math.floor(Math.random() * 4), "Lilly faz o SLIDE atropelador! 💥");
      } else if (copiasKielop.habilidade) {
        const copia = copiasKielop.habilidade;
        this.hitEnemy(copia.power + Math.floor(Math.random() * 4), `Kielop usa ${copia.name} (copiada de ${copia.from})!`);
      } else {
        this.message.setText("Kielop não copiou ninguém ainda...\nVença uma batalha com ele no controle usando [A]!");
        this.showMenu();
      }
    } else if (action === "heal" && player.id === "lilly") {
      const healed = Math.min(10, player.maxHp - player.hp);
      player.hp += healed;
      this.refreshBars();
      this.message.setText(`Lilly vira GATINHO 🐱 e se regenera (+${healed} HP)!`);
      this.scene.time.delayedCall(700, () => this.enemyTurn());
    }
  }

  private hitEnemy(dmg: number, msg: string): void {
    const enemy = this.enemy!;
    enemy.hp = Math.max(0, enemy.hp - dmg);
    this.refreshBars();
    this.message.setText(`${msg} (-${dmg})`);
    this.scene.tweens.add({ targets: this.box, x: "+=7", duration: 50, yoyo: true, repeat: 1 });
    this.scene.time.delayedCall(750, () => (enemy.hp <= 0 ? this.winSequence() : this.enemyTurn()));
  }

  private enemyTurn(): void {
    const player = this.players[dupla.active];
    const dmg = (this.enemy?.def.power ?? 6) + Math.floor(Math.random() * 4);
    player.hp = Math.max(0, player.hp - dmg);
    this.refreshBars();
    this.message.setText(`${this.enemy?.def.name ?? "O inimigo"} contra-ataca! (-${dmg})`);
    this.scene.tweens.add({ targets: this.box, x: "-=7", duration: 50, yoyo: true, repeat: 1 });
    this.scene.time.delayedCall(750, () => (player.hp <= 0 ? this.loseSequence() : this.showMenu()));
  }

  private winSequence(): void {
    this.state = "over";
    this.debugLog("win");
    let msg = `${this.enemy!.def.name} foi derrotado! ⭐`;
    const copyLines: QuestionDialogueLine[] = [];

    if (this.players[dupla.active].id === "kielop") {
      const g = this.enemy!.def.grants;
      copiasKielop.habilidade = { from: this.enemy!.def.name, name: g.name, power: g.power };
      msg += `\nKielop copiou: ${g.name}!`;
      copyLines.push(...g.lines);
    }

    // vitória revigora a dupla
    this.players.lilly.hp = this.players.lilly.maxHp;
    this.players.kielop.hp = this.players.kielop.maxHp;
    this.refreshBars();
    this.message.setText(msg);
    this.actionsHint.setText("");

    this.scene.time.delayedCall(1800, () => {
      const hooks = this.hooks;
      const lines = copyLines;
      this.close();
      hooks.onWin?.(lines);
    });
  }

  private loseSequence(): void {
    this.state = "over";
    this.message
      .setText("A dupla foi derrotada...\nVoltam ao início da trilha, renovados.")
      .setColor("#ff9d9d");
    this.actionsHint.setText("");
    this.scene.time.delayedCall(1900, () => {
      const hooks = this.hooks;
      this.close();
      hooks.onLose?.();
    });
  }

  private stopTimer(): void {
    this.timerTween?.stop();
  }

  private close(): void {
    this.state = "idle";
    this.debugLog("close");
    this.enemy = null;
    this.hooks = {};
    this.box.setVisible(false);
  }

  private refreshBars(): void {
    const enemy = this.enemy;
    if (enemy) {
      this.enemyLabel.setText(`${enemy.def.name}   ${enemy.hp}/${enemy.def.maxHp} HP`);
      this.enemyBar.setScale(Math.max(0, enemy.hp / enemy.def.maxHp), 1);
    }
    const player = this.players[dupla.active];
    this.playerLabel.setText(`${player.label}   ${player.hp}/${player.maxHp} HP`);
    this.playerBar.setScale(Math.max(0, player.hp / player.maxHp), 1);
    // espelho de debug (console do browser): window.__planoDebug
    (window as unknown as { __planoDebug?: unknown }).__planoDebug = {
      state: this.state,
      enemyHp: enemy?.hp,
      msg: this.message.text
    };
  }

  private buildUI(): void {
    const bg = this.scene.add
      .rectangle(0, 0, 720, 330, 0x0b0c15, 0.96)
      .setStrokeStyle(3, 0xffffff);

    this.enemyLabel = this.scene.add.text(-344, -150, "", { fontSize: "14px", color: "#ff9d9d" });
    this.scene.add.rectangle(-344, -112, 260, 12, 0x3a1c22).setOrigin(0, 0);
    this.enemyBar = this.scene.add.rectangle(-344, -112, 260, 12, 0xd95f5f).setOrigin(0, 0);

    this.playerLabel = this.scene.add.text(-344, -80, "", { fontSize: "13px", color: "#9de8a5" });
    this.scene.add.rectangle(-344, -50, 260, 12, 0x1c3a24).setOrigin(0, 0);
    this.playerBar = this.scene.add.rectangle(-344, -50, 260, 12, 0x61c96a).setOrigin(0, 0);

    this.message = this.scene.add.text(-320, 10, "", {
      fontSize: "17px",
      color: "#ffffff",
      wordWrap: { width: 660 },
      lineSpacing: 6
    });

    this.actionsHint = this.scene.add.text(-344, 118, "", {
      fontSize: "13px",
      color: "#9aa4c0",
      wordWrap: { width: 680 }
    });

    this.scene.add.rectangle(-344, 152, 688, 8, 0x2a2f4a).setOrigin(0, 0);
    this.timerBar = this.scene.add.rectangle(-344, 152, 688, 8, 0xffd75e).setOrigin(0, 0);

    this.box = this.scene.add
      .container(this.scene.scale.width / 2, this.scene.scale.height / 2 - 20, [
        bg, this.enemyLabel, this.enemyBar, this.playerLabel, this.playerBar,
        this.message, this.actionsHint, this.timerBar
      ])
      .setDepth(1500)
      .setScrollFactor(0)
      .setVisible(false);
  }
}
