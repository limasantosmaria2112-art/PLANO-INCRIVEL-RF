import Phaser from "phaser";

/**
 * Entity — classe base de tudo que existe no mundo:
 * jogadores, NPCs, inimigos e itens.
 */
export abstract class Entity extends Phaser.GameObjects.Container {
  protected sprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Sprite;
  /** key da spritesheet quando a entidade tem arte; null = fallback quadrado */
  protected spriteKey: string | null = null;
  /** direcao olhada agora (nomes batem com as animacoes do BootScene) */
  protected facing: "frente" | "tras" | "esquerda" | "direita" = "frente";
  protected speed = 140;
  /** último desvio usado — evita trocar de ângulo a cada frame (senão o bicho "gira") */
  private lastOffsetIndex = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, spriteKey?: string, displayHeight = 42) {
    super(scene, x, y);
    if (spriteKey && scene.textures.exists(spriteKey)) {
      // arte real do personagem, alinhada pelos pes na base do corpo fisico
      const frame = scene.textures.getFrame(spriteKey, 0);
      const sp = scene.add.sprite(0, 14, spriteKey, 0);
      sp.setOrigin(0.5, 1).setScale(displayHeight / frame.height);
      this.sprite = sp;
      this.spriteKey = spriteKey;
    } else {
      this.sprite = scene.add.rectangle(0, 0, 24, 24, color);
    }
    this.add(this.sprite);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // corpo físico EXATAMENTE do tamanho do sprite: o corpo padrão do
    // Container engloba a etiqueta de nome (invisível e mais larga),
    // fazendo encostar em paredes "que não aparecem" — removido aqui.
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 24);
    body.setOffset(-12, -12);
    body.setCollideWorldBounds(true);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  moveTowards(x: number, y: number, speed = this.speed): void {
    this.scene.physics.moveTo(this, x, y, speed);
  }

  /**
   * moveTowards com desvio simples de paredes: testa a rota à frente
   * (e rotas laterais em leque) antes de andar, então ninguém fica
   * empacado tentando atravessar um obstáculo em linha reta.
   */
  moveTowardsObstacles(
    x: number,
    y: number,
    walls: Phaser.Physics.Arcade.StaticGroup | undefined,
    speed = this.speed
  ): void {
    if (!walls || walls.getLength() === 0) {
      this.moveTowards(x, y, speed);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, x, y);
    const base = Phaser.Math.Angle.Between(this.x, this.y, x, y);
    // leque de rotas: reto primeiro, depois desliza pros lados e, por fim, recua
    const offsets = [0, 0.45, -0.45, 0.95, -0.95, 1.5, -1.5, 2.1, -2.1, Math.PI];
    const step = Math.min(Math.max(dist, 24), 44);

    // começa pelo desvio do frame anterior (histerese = movimento estável)
    const n = offsets.length;
    for (let i = 0; i < n; i++) {
      const idx = (this.lastOffsetIndex + i) % n;
      const a = base + offsets[idx];
      const px = this.x + Math.cos(a) * step;
      const py = this.y + Math.sin(a) * step;
      if (!this.probeBlocked(px, py, walls)) {
        this.lastOffsetIndex = idx;
        this.arcadeBody.setVelocity(Math.cos(a) * speed, Math.sin(a) * speed);
        return;
      }
    }

    // 100% cercado: anda devagar mesmo assim (não congela)
    this.arcadeBody.setVelocity(Math.cos(base) * speed * 0.35, Math.sin(base) * speed * 0.35);
  }

  private probeBlocked(x: number, y: number, walls: Phaser.Physics.Arcade.StaticGroup): boolean {
    const probe = new Phaser.Geom.Rectangle(x - 13, y - 13, 26, 26);
    return walls
      .getChildren()
      .some((c) => Phaser.Geom.Intersects.RectangleToRectangle(probe, (c as Phaser.GameObjects.Rectangle).getBounds()));
  }

  stop(): void {
    this.arcadeBody.stop();
  }

  /**
   * Anima o sprite conforme a velocidade do corpo fisico (andar/parar
   * e a direcao do movimento). Nao faz nada no fallback de quadrado.
   */
  updateAnimation(): void {
    if (!this.spriteKey || !(this.sprite instanceof Phaser.GameObjects.Sprite)) return;
    const v = this.arcadeBody.velocity;
    const andando = Math.hypot(v.x, v.y) > 5;
    if (andando) {
      if (Math.abs(v.x) >= Math.abs(v.y)) this.facing = v.x > 0 ? "direita" : "esquerda";
      else this.facing = v.y > 0 ? "frente" : "tras";
    }
    const key = `${this.spriteKey}-${andando ? "walk" : "idle"}-${this.facing}`;
    if (this.sprite.anims.currentAnim?.key !== key) this.sprite.play(key, true);
  }
}
