import Phaser from "phaser";
import type { CharacterId, QuestionDialogueLine } from "shared";
import { Lilly } from "../entities/Lilly";
import { Kielop } from "../entities/Kielop";
import { Player, type WASDKeys } from "../entities/Player";
import { DuplaManager } from "../systems/DuplaManager";
import { DialogueSystem } from "../systems/DialogueSystem";

interface SwapZone {
  zone: Phaser.GameObjects.Rectangle;
  lines: QuestionDialogueLine[];
}

export class WorldScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: WASDKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;

  private players!: Record<CharacterId, Player>;
  private dupla = new DuplaManager();
  private dialogue!: DialogueSystem;
  private hint!: Phaser.GameObjects.Text;
  private swapZones: SwapZone[] = [];

  constructor() {
    super("World");
  }

  create(): void {
    // "mundo" placeholder: chão e algumas paredes
    this.add.rectangle(480, 270, 1800, 1200, 0x2d3149);
    const walls = this.physics.add.staticGroup();
    [
      [280, 190, 160, 18],
      [680, 190, 160, 18],
      [480, 380, 240, 18]
    ].forEach(([x, y, w, h]) =>
      walls.add(this.add.rectangle(x, y, w, h, 0x45496b) as unknown as Phaser.Physics.Arcade.Sprite)
    );

    // SwapZone: "mesa tranquila" onde dá pra trocar de personagem
    const table = this.add.rectangle(480, 470, 90, 50, 0x7a4b2a).setStrokeStyle(2, 0xffca6b);
    this.add.text(480, 505, "mesa tranquila", { fontSize: "10px", color: "#ffd75e" }).setOrigin(0.5);
    this.swapZones.push({
      zone: this.add.rectangle(480, 460, 130, 70, 0x000000, 0.001),
      lines: [] // preenchido na troca
    });

    const spawnLilly = this.players?.lilly ?? new Lilly(this, 480, 300);
    const spawnKielop = this.players?.kielop ?? new Kielop(this, 530, 300);
    this.players = { lilly: spawnLilly, kielop: spawnKielop };

    this.physics.add.collider(
      [spawnLilly, spawnKielop] as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[],
      walls
    );

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey("W"),
      A: this.input.keyboard!.addKey("A"),
      S: this.input.keyboard!.addKey("S"),
      D: this.input.keyboard!.addKey("D")
    };
    this.interactKey = this.input.keyboard!.addKey("E");

    this.dialogue = new DialogueSystem(this);
    this.interactKey.on("down", () => this.tryInteract());

    this.hint = this.add
      .text(480, 40, "Setas/WASD: mover | E: interagir/trocar", {
        fontSize: "13px",
        color: "#c9d1f2",
        backgroundColor: "#00000088"
      })
      .setOrigin(0.5)
      .setDepth(800);

    this.cameras.main.setBounds(0, 0, 1800, 1200);
    this.cameras.main.startFollow(spawnLilly, true, 0.12, 0.12);

    this.dupla.onChange((active) => this.cameras.main.startFollow(this.players[active], true, 0.12, 0.12));
  }

  update(): void {
    const active = this.players[this.dupla.active];
    const follower = this.players[this.dupla.follower];

    if (!this.dialogue.isOpen()) {
      active.handleInput(this.cursors, this.wasd);
      this.followTarget(follower, active);
    } else {
      active.stop();
      follower.stop();
    }

    const nearZone = this.swapZones.some((sz) =>
      Phaser.Geom.Rectangle.Overlaps(
        active.arcadeBody as unknown as Phaser.Geom.Rectangle,
        sz.zone.getBounds()
      )
    );
    this.hint.setText(nearZone ? "mesa tranquila — [E] sentar e conversar" : "Setas/WASD: mover | E: interagir/trocar");
  }

  private tryInteract(): void {
    if (this.dialogue.isOpen()) {
      this.dialogue.advance();
      return;
    }
    const active = this.players[this.dupla.active];
    const near = this.swapZones.find((sz) =>
      Phaser.Geom.Rectangle.Overlaps(
        active.arcadeBody as unknown as Phaser.Geom.Rectangle,
        sz.zone.getBounds()
      )
    );
    if (!near) return;

    // quem está no controle pede pro outro assumir (a fala icônica!)
    near.lines = this.dupla.getSwapLines(this.dupla.active);
    this.dialogue.start(near.lines, () => this.dupla.toggle());
  }

  private followTarget(follower: Player, target: Player): void {
    const dist = Phaser.Math.Distance.BetweenPoints(follower, target);
    if (dist > 48) {
      follower.moveTowards(target.x, target.y - 60);
    } else {
      follower.stop();
    }
  }
}
