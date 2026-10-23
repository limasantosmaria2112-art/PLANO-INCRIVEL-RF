import Phaser from "phaser";
import type { CharacterId } from "shared";
import { Lilly } from "../entities/Lilly";
import { Kielop } from "../entities/Kielop";
import { Player, type WASDKeys } from "../entities/Player";
import { DialogueSystem } from "../systems/DialogueSystem";
import { dupla } from "../systems/DuplaSingleton";
import { quest } from "../systems/QuestSystem";

interface Zone {
  rect: Phaser.GameObjects.Rectangle;
  prompt: string;
  handler: () => void;
}

/**
 * BaseDuplaScene — infra compartilhada de qualquer mapa com a dupla:
 * movimento do controle ativo + follower, diálogo, zonas interativas
 * (NPCs, SwapZones, portas) e HUD.
 */
export abstract class BaseDuplaScene extends Phaser.Scene {
  protected players!: Record<CharacterId, Player>;
  protected dialogue!: DialogueSystem;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasd!: WASDKeys;
  protected hud!: Phaser.GameObjects.Text;
  protected zones: Zone[] = [];

  /** Nome do lugar exibido no HUD (ex: "BAR — interior") */
  protected abstract get locationName(): string;

  protected setupScene(opts: {
    width: number;
    height: number;
    floorColor?: number;
    spawn?: { x: number; y: number };
  }): void {
    const { width, height } = opts;
    this.add.rectangle(width / 2, height / 2, width, height, opts.floorColor ?? 0x2d3149);

    const spawn = opts.spawn ?? { x: width / 2, y: height / 2 };
    this.players = { lilly: new Lilly(this, spawn.x, spawn.y), kielop: new Kielop(this, spawn.x + 46, spawn.y) };

    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.players[dupla.active], true, 0.12, 0.12);
    dupla.onChange((active) => this.cameras.main.startFollow(this.players[active], true, 0.12, 0.12));
    if (dupla.active !== "lilly") this.cameras.main.startFollow(this.players[dupla.active], true, 0.12, 0.12);

    this.dialogue = new DialogueSystem(this);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey("W"),
      A: this.input.keyboard!.addKey("A"),
      S: this.input.keyboard!.addKey("S"),
      D: this.input.keyboard!.addKey("D")
    };
    this.input.keyboard!.on("keydown-E", () => this.tryInteract());

    this.hud = this.add
      .text(12, 10, "", { fontSize: "13px", color: "#ffffff", backgroundColor: "#00000077", padding: { x: 6, y: 4 } })
      .setDepth(900)
      .setScrollFactor(0);
  }

  /** Registra uma área interativa invisível (NPC, porta, objeto...) */
  protected addZone(x: number, y: number, w: number, h: number, prompt: string, handler: () => void): void {
    this.zones.push({
      rect: this.add.rectangle(x, y, w, h, 0x000000, 0.001),
      prompt,
      handler
    });
  }

  /** ⭐ SwapZone: lugar tranquilo onde a troca de controle acontece com diálogo */
  protected addSwapZone(x: number, y: number, w: number, h: number, visual?: Phaser.GameObjects.Rectangle): void {
    this.addZone(x, y, w, h, "lugar tranquilo — sentar e conversar ([E] troca de personagem)", () => {
      this.dialogue.start(dupla.getSwapLines(dupla.active), () => dupla.toggle());
    });
  }

  /** Porta entre cenas (com trava opcional por quest) */
  protected addDoor(
    x: number,
    y: number,
    w: number,
    h: number,
    toScene: string,
    spawn?: { x: number; y: number },
    opts?: { locked?: () => boolean; lockedLines?: { speaker: "lilly" | "kielop" | "npc"; text: string }[] }
  ): void {
    this.addZone(x, y, w, h, "porta — [E] entrar", () => {
      if (opts?.locked?.()) {
        this.dialogue.start(opts.lockedLines ?? []);
        return;
      }
      this.scene.start(toScene, spawn);
    });
  }

  private nearZone(): Zone | undefined {
    const active = this.players[dupla.active];
    return this.zones.find((z) =>
      Phaser.Geom.Intersects.RectangleToRectangle(active.arcadeBody as unknown as Phaser.Geom.Rectangle, z.rect.getBounds())
    );
  }

  protected tryInteract(): void {
    if (this.dialogue.isOpen()) {
      this.dialogue.advance();
      return;
    }
    this.nearZone()?.handler();
  }

  update(): void {
    const active = this.players[dupla.active];
    const follower = this.players[dupla.follower];

    if (!this.dialogue.isOpen()) {
      active.handleInput(this.cursors, this.wasd);
      const dist = Phaser.Math.Distance.BetweenPoints(follower, active);
      if (dist > 56) follower.moveTowards(active.x, active.y - 64);
      else follower.stop();
    } else {
      active.stop();
      follower.stop();
    }

    const z = this.nearZone();
    this.hud.setText([`📍 ${this.locationName}`, quest.label, z ? `💬 ${z.prompt}` : ""]);
  }
}
