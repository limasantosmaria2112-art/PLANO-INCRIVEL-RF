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

interface ActionButton {
  action: Action;
  rect: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

/**
 * BattleSystem — combate por turnos com timer: a dupla tem 5s para
 * decidir; se hesitar, o inimigo ataca.
 *
 * Visual: painel moldurado, HP bars animadas com "trail de dano",
 * avatares com punch-in, camera shake, flash, partículas e número
 * de dano flutuante; menu de ações em botões; datilografia pulável.
 */
export class BattleSystem {
  static readonly DECIDE_MS = 5000;

  private scene: Phaser.Scene;
  private players: Record<CharacterId, Player>;
  private box!: Phaser.GameObjects.Container;
  private dim!: Phaser.GameObjects.Rectangle;
  private enemyLabel!: Phaser.GameObjects.Text;
  private enemyBar!: Phaser.GameObjects.Rectangle;
  private enemyTrail!: Phaser.GameObjects.Rectangle;
  private playerLabel!: Phaser.GameObjects.Text;
  private playerBar!: Phaser.GameObjects.Rectangle;
  private playerTrail!: Phaser.GameObjects.Rectangle;
  private message!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Rectangle;
  private timerTween?: Phaser.Tweens.Tween;
  private enemyAvatar!: Phaser.GameObjects.Rectangle;
  private playerAvatar!: Phaser.GameObjects.Rectangle;
  private buttons: ActionButton[] = [];
  private state: "idle" | "choose" | "resolve" | "over" = "idle";
  private enemy: Enemy | null = null;
  private hooks: BattleHooks = {};

  /** datilografia */
  private typing?: Phaser.Time.TimerEvent;
  private fullText = "";
  private shownChar = 0;

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

  /* ───── datilografia ───── */

  private isTyping(): boolean {
    return !!this.typing;
  }

  private skipTyping(): void {
    this.typing?.remove();
    this.typing = undefined;
    this.message.setText(this.fullText);
  }

  private say(text: string, instant = false): void {
    this.fullText = text;
    if (instant) {
      this.skipTyping();
      return;
    }
    this.shownChar = 0;
    this.message.setText("");
    this.typing?.remove();
    this.typing = this.scene.time.addEvent({
      delay: 16,
      repeat: text.length - 1,
      callback: () => {
        this.shownChar++;
        this.message.setText(text.slice(0, this.shownChar));
        if (this.shownChar >= text.length) {
          this.typing?.remove();
          this.typing = undefined;
        }
      }
    });
  }

  private debugLog(ev: string): void {
    (window as unknown as { __planoLog?: unknown[] }).__planoLog?.push({
      t: Math.round(this.scene.time.now),
      ev,
      state: this.state,
      enemyHp: this.enemy?.hp
    });
  }

  /* ───── fluxo ───── */

  start(enemy: Enemy, hooks: BattleHooks): void {
    if (this.isOpen()) return;
    this.enemy = enemy;
    this.hooks = hooks;
    this.state = "resolve";
    this.debugLog("start");
    this.players[dupla.active].stop();
    this.players[dupla.follower].stop();
    this.dim.setVisible(true);
    this.box.setVisible(true);
    this.hideButtons();
    this.enemyAvatar.setFillStyle(enemy.def.color);
    this.say(`${enemy.def.name} chegou.\nA dupla não parece empolgada.`);
    this.refreshBars();
    this.scene.time.delayedCall(750, () => this.showMenu());
  }

  /** estado "choose": decide a ação e volta pro menu */
  private showMenu(): void {
    const player = this.players[dupla.active];
    const copia = copiasKielop.habilidade;
    this.say("Decidam rápido. O timer não espera.");
    this.state = "choose";
    this.debugLog("menu");

    // rótulos dinâmicos (a cópia do Kielop vira o [B])
    this.buttons.forEach((b) => {
      if (b.action === "special") {
        b.label.setText(player.id === "lilly" ? "[B] Slide 💥" : copia ? `[B] ${copia.name} ⭐` : "[B] nada copiado");
      }
      if (b.action === "heal") b.label.setText(player.id === "lilly" ? "[G] Gatinho 🐱" : "[G] —");
    });
    // teclas disponíveis: [A][B][F] sempre, [G] só pra Lilly
    const toShow: Action[] = ["attack", "special", "flee"];
    if (player.id === "lilly") toShow.push("heal");
    this.showButtons(toShow);

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
        this.hideButtons();
        this.say("Pensaram demais. Erro clássico.", true);
        this.scene.time.delayedCall(600, () => this.enemyTurn());
      }
    });
  }

  private onChoose(action: Action): void {
    if (this.state !== "choose") return;
    if (this.isTyping()) {
      this.skipTyping();
      return;
    }
    // [G] só pertence à Lilly — Kielop não pode "gastar o turno" com cura
    if (action === "heal" && this.players[dupla.active].id !== "lilly") return;
    const player = this.players[dupla.active];
    this.stopTimer();
    this.state = "resolve";
    this.hideButtons();

    if (action === "attack") {
      const dmg = 8 + Math.floor(Math.random() * 5);
      this.punchIn(this.playerAvatar);
      this.say(`${player.label} avança e bate. Simples. Funciona.`);
      this.hitEnemy(dmg);
    } else if (action === "flee") {
      if (Math.random() < 0.6) {
        this.say(`${player.label} puxa o outro pelo braço. Saída limpa. 💨`);
        this.scene.time.delayedCall(700, () => {
          const hooks = this.hooks;
          this.close();
          hooks.onFlee?.();
        });
      } else {
        this.say("Fuga falhou. Confronto inevitável.", true);
        this.scene.time.delayedCall(700, () => this.enemyTurn());
      }
    } else if (action === "special") {
      if (player.id === "lilly") {
        const dmg = 13 + Math.floor(Math.random() * 4);
        this.punchIn(this.playerAvatar);
        this.say("Lilly faz o slide atropelador. Estilo é um bônus aceitável.");
        this.hitEnemy(dmg);
      } else if (copiasKielop.habilidade) {
        const copia = copiasKielop.habilidade;
        const dmg = copia.power + Math.floor(Math.random() * 4);
        this.punchIn(this.playerAvatar);
        this.say(`Kielop usa ${copia.name} (copiada de ${copia.from}).`);
        this.hitEnemy(dmg);
      } else {
        this.say("Kielop não copiou ninguém ainda.\nDerrube um inimigo com ele no controle usando [A].", true);
        this.scene.time.delayedCall(900, () => this.showMenu());
        return;
      }
    } else if (action === "heal" && player.id === "lilly") {
      const healed = Math.min(10, player.maxHp - player.hp);
      player.hp += healed;
      this.refreshBars();
      this.floatText(this.playerAvatar, `+${healed}`, "#9de8a5");
      this.say(`Lilly vira GATINHO 🐱 e regenera (+${healed} HP).`);
      this.scene.time.delayedCall(700, () => this.enemyTurn());
    }
  }

  private hitEnemy(dmg: number): void {
    const enemy = this.enemy!;
    enemy.hp = Math.max(0, enemy.hp - dmg);
    this.refreshBars();
    this.impactFX(this.enemyAvatar, dmg);
    this.scene.time.delayedCall(750, () => (enemy.hp <= 0 ? this.winSequence() : this.enemyTurn()));
  }

  private enemyTurn(): void {
    const player = this.players[dupla.active];
    const dmg = (this.enemy?.def.power ?? 6) + Math.floor(Math.random() * 4);
    player.hp = Math.max(0, player.hp - dmg);
    this.refreshBars();
    this.punchIn(this.playerAvatar);
    this.impactFX(this.playerAvatar, dmg);
    this.say(`${this.enemy?.def.name ?? "O inimigo"} contra-ataca.`);
    this.scene.time.delayedCall(750, () => (player.hp <= 0 ? this.loseSequence() : this.showMenu()));
  }

  private winSequence(): void {
    this.state = "over";
    this.debugLog("win");
    let msg = `${this.enemy!.def.name} foi derrotado. ⭐`;
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
    this.say(msg);

    this.scene.time.delayedCall(1800, () => {
      const hooks = this.hooks;
      const lines = copyLines;
      this.close();
      hooks.onWin?.(lines);
    });
  }

  private loseSequence(): void {
    this.state = "over";
    this.say("A dupla foi derrotada...\nVoltam ao começo, renovados.");
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
    this.hideButtons();
    this.skipTyping();
    this.box.setVisible(false);
    this.dim.setVisible(false);
  }

  /* ───── barras / refresh ───── */

  private refreshBars(): void {
    const enemy = this.enemy;
    if (enemy) {
      this.enemyLabel.setText(`${enemy.def.name}   ${enemy.hp}/${enemy.def.maxHp} HP`);
      const r = Math.max(0, enemy.hp / enemy.def.maxHp);
      this.barTo(this.enemyBar, r);
      this.barTo(this.enemyTrail, r, 400); // trail amarelo "atrasado"
    }
    const player = this.players[dupla.active];
    this.playerLabel.setText(`${player.label}   ${player.hp}/${player.maxHp} HP`);
    const pr = Math.max(0, player.hp / player.maxHp);
    this.barTo(this.playerBar, pr);
    this.barTo(this.playerTrail, pr, 400);
    // espelho de debug (console do browser): window.__planoDebug
    (window as unknown as { __planoDebug?: unknown }).__planoDebug = {
      state: this.state,
      enemyHp: enemy?.hp,
      msg: this.fullText
    };
  }

  /** barra animada; o "trail" demora mais = efeito de dano acumulando */
  private barTo(bar: Phaser.GameObjects.Rectangle, ratio: number, delay = 0): void {
    this.scene.tweens.add({
      targets: bar,
      scaleX: ratio,
      duration: delay > 0 ? 420 : 140,
      delay,
      ease: "Sine.out"
    });
  }

  /* ───── FX ───── */

  private punchIn(avatar: Phaser.GameObjects.Rectangle): void {
    this.scene.tweens.add({ targets: avatar, scale: 1.25, duration: 70, yoyo: true });
  }

  private impactFX(avatar: Phaser.GameObjects.Rectangle, dmg: number): void {
    this.scene.cameras.main.shake(110, 0.004);
    const flash = this.scene.add.rectangle(avatar.x, avatar.y, avatar.width + 10, avatar.height + 10, 0xffffff, 0.8);
    this.box.add(flash);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 140, onComplete: () => flash.destroy() });

    // faíscas simples (tweens — sem depender de emitters)
    for (let i = 0; i < 8; i++) {
      const spark = this.scene.add.circle(avatar.x, avatar.y, Phaser.Math.Between(2, 4), 0xffd75e);
      this.box.add(spark);
      const a = Math.random() * Math.PI * 2;
      const d = Phaser.Math.Between(26, 60);
      this.scene.tweens.add({
        targets: spark,
        x: avatar.x + Math.cos(a) * d,
        y: avatar.y + Math.sin(a) * d,
        alpha: 0,
        duration: 360,
        onComplete: () => spark.destroy()
      });
    }
    this.floatText(avatar, `-${dmg}`, "#ff9d9d");
  }

  private floatText(avatar: Phaser.GameObjects.Rectangle, t: string, color: string): void {
    const txt = this.scene.add
      .text(avatar.x, avatar.y - 34, t, {
        fontSize: "22px",
        color,
        fontStyle: "bold",
        stroke: "#0a0b14",
        strokeThickness: 4
      })
      .setOrigin(0.5);
    this.box.add(txt);
    this.scene.tweens.add({ targets: txt, y: txt.y - 34, alpha: 0, duration: 620, onComplete: () => txt.destroy() });
  }

  /* ───── botões de ação ───── */

  private showButtons(actions: Action[]): void {
    this.buttons.forEach((b) => {
      const on = actions.includes(b.action);
      b.rect.setVisible(on);
      b.label.setVisible(on);
      b.glow.setVisible(on);
      b.rect.setAlpha(on ? 1 : 0.25);
      b.label.setAlpha(on ? 1 : 0.4);
    });
  }

  private hideButtons(): void {
    this.buttons.forEach((b) => {
      b.rect.setVisible(false);
      b.glow.setVisible(false);
      b.label.setVisible(false);
    });
  }

  /* ───── build da UI ───── */

  private buildUI(): void {
    const W = 760;
    const H = 340;
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2 - 20;

    // escurece o mundo atrás da caixa
    this.dim = this.scene.add
      .rectangle(cx, cy, this.scene.scale.width, this.scene.scale.height, 0x05060c, 0.55)
      .setDepth(1400)
      .setScrollFactor(0)
      .setVisible(false);

    // painel com moldura dupla
    const g = this.scene.add.graphics();
    g.fillStyle(0x101225, 0.97);
    g.fillRoundedRect(-(W / 2), -(H / 2), W, H, 14);
    g.lineStyle(3, 0xffffff, 0.95);
    g.strokeRoundedRect(-(W / 2), -(H / 2), W, H, 14);
    g.lineStyle(1, 0x9aa4c0, 0.35);
    g.strokeRoundedRect(-(W / 2) + 5, -(H / 2) + 5, W - 10, H - 10, 10);
    // cabeçalho
    g.fillStyle(0x3a1c22, 1);
    g.fillRoundedRect(-(W / 2) + 6, -(H / 2) + 6, W - 12, 34, { tl: 12, tr: 12, bl: 0, br: 0 });

    this.enemyLabel = this.scene.add.text(-340, -159, "", { fontSize: "15px", color: "#ffd75e", fontStyle: "bold" });

    // ---- barras: fundo escuro, trail amarelo, barra viva ----
    const barY = -104;
    const barW = 280;
    this.scene.add.rectangle(-340, barY, barW, 14, 0x2a1218).setOrigin(0, 0);
    this.enemyTrail = this.scene.add.rectangle(-340, barY, barW, 14, 0xffd75e).setOrigin(0, 0);
    this.enemyBar = this.scene.add.rectangle(-340, barY, barW, 14, 0xd95f5f).setOrigin(0, 0);

    this.playerLabel = this.scene.add.text(-340, -76, "", { fontSize: "13px", color: "#9de8a5" });
    const pbarY = -56;
    this.scene.add.rectangle(-340, pbarY, barW, 14, 0x121e22).setOrigin(0, 0);
    this.playerTrail = this.scene.add.rectangle(-340, pbarY, barW, 14, 0xffd75e).setOrigin(0, 0);
    this.playerBar = this.scene.add.rectangle(-340, pbarY, barW, 14, 0x61c96a).setOrigin(0, 0);

    // ---- avatares à direita ----
    this.enemyAvatar = this.scene.add.rectangle(250, -90, 84, 84, 0xd08b3a).setStrokeStyle(3, 0xffffff);
    this.playerAvatar = this.scene.add.rectangle(250, 20, 64, 64, 0x5bc8ff).setStrokeStyle(3, 0xffffff);

    // ---- mensagem com datilografia ----
    this.message = this.scene.add.text(-340, -22, "", {
      fontSize: "16px",
      color: "#ffffff",
      wordWrap: { width: 540 },
      lineSpacing: 6
    });

    // ---- timer ----
    const tY = 104;
    this.scene.add.rectangle(-340, tY, 660, 8, 0x2a2f4a).setOrigin(0, 0);
    this.timerBar = this.scene.add.rectangle(-340, tY, 660, 8, 0xffd75e).setOrigin(0, 0);

    // ---- botões de ação ----
    const defs: { action: Action; key: string; label: string; color: number }[] = [
      { action: "attack", key: "A", label: "[A] Atacar", color: 0x61c96a },
      { action: "special", key: "B", label: "[B] Slide 💥", color: 0xffd75e },
      { action: "heal", key: "G", label: "[G] Gatinho 🐱", color: 0x9de8a5 },
      { action: "flee", key: "F", label: "[F] Fugir", color: 0xff9d9d }
    ];
    const bW = 158;
    const bH = 42;
    const bY = 140;
    const gap = 12;
    const total = defs.length * bW + (defs.length - 1) * gap;
    defs.forEach((d, i) => {
      const x = -(total / 2) + i * (bW + gap) + bW / 2;
      const rect = this.scene.add
        .rectangle(x, bY, bW, bH, 0x1c2144)
        .setStrokeStyle(2, d.color)
        .setVisible(false);
      const glow = this.scene.add.rectangle(x, bY, bW, bH, d.color, 0).setStrokeStyle(2, d.color).setVisible(false);
      const label = this.scene.add
        .text(x, bY, d.label, { fontSize: "13px", color: "#ffffff" })
        .setOrigin(0.5)
        .setVisible(false);
      rect.setInteractive({ useHandCursor: true });
      rect.on("pointerover", () => glow.setAlpha(0.2));
      rect.on("pointerout", () => glow.setAlpha(0));
      rect.on("pointerdown", () => this.onChoose(d.action));
      this.buttons.push({ action: d.action, rect, glow, label });
    });

    this.box = this.scene.add
      .container(cx, cy, [])
      .setDepth(1500)
      .setScrollFactor(0)
      .setVisible(false);

    // adicionar tudo ao box depois (ordem no gráfico deve ficar atrás)
    this.box.add([
      g,
      this.enemyLabel,
      this.enemyTrail,
      this.enemyBar,
      this.playerLabel,
      this.playerTrail,
      this.playerBar,
      this.enemyAvatar,
      this.playerAvatar,
      this.message,
      this.timerBar,
      this.scene.add.text(250, -150, "inimigo", { fontSize: "10px", color: "#ff9d9d" }).setOrigin(0.5),
      this.scene.add.text(250, 60, "dupla", { fontSize: "10px", color: "#9de8a5" }).setOrigin(0.5)
    ]);
    this.box.add(this.buttons.flatMap((b) => [b.glow, b.rect, b.label]));
  }
}
