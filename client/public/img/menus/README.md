# Sprites do Menu

Arquivos de sprites para uso no MenuScene (Ruptura-FononiCa).

## Estrutura

Esta pasta contiene:
- `lilly-sprite.png` — Sprites front-face da Lilly (metamorfa rosa)
- `kielop-sprite.png` — Sprites front-face do Kielop (humano azul)
- `backdrop-lights.png` — Abas luminosas do bar (opcional)
- `menu-bg.png` — Fundo estilizado do bar (opcional)

## Tamanhos Recomendados

### Lilly
- Sprites: 500x500px
- Coretos: 90x120px
- Cores indicadas: Rosé #FF69B4

### Kielop
- Sprites: 500x500px
- Coretos: 90x120px
- Cores indicadas: Blue #1E90FF

### Lâmpadas/Abas
- Abas: ~150-300px raio
- Cores: Amber #FFD700, Orange #FF6B35, White #FFFFFF

## Como Usar

No MenuScene, atualize a função `makePortrait()` para carregar os sprites de verdade:

```typescript
private makePortrait(x: number, y: number, color: number, sprite: string, label: string): void {
  const frame = this.add.sprite(x, y, sprite).setOrigin(0.5);
  frame.setScale(0.8);

  this.add.text(x, y, label.toUpperCase(), {
    fontSize: "14px",
    color: "#FFE4B5",
    fontStyle: "bold"
  }).setOrigin(0.5);

  this.tweens.add({
    targets: frame,
    y: "-=6",
    scaleX: 1.02,
    scaleY: 1.02,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.inOut"
  });
}
```

## Atalhos Alocações

- Lilly: `sprites/menus/lilly-sprite.png`
- Kielop: `sprites/menus/kielop-sprite.png`