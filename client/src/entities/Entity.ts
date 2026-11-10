import Phaser from "phaser";

/**
 * Entity — classe base de tudo que existe no mundo:
 * jogadores, NPCs, inimigos e itens.
 */
export abstract class Entity extends Phaser.GameObjects.Container {
  protected sprite: Phaser.GameObjects.Rectangle;
  protected speed = 140;
  /** último desvio usado — evita trocar de ângulo a cada frame (senão o bicho "gira") */
  private lastOffsetIndex = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    super(scene, x, y);
    this.sprite = scene.add.rectangle(0, 0, 24, 24, color);
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
}
