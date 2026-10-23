# 🛠️ Ferramentas

## Código

| Ferramenta | Uso |
|---|---|
| **TypeScript** | Linguagem principal (POO) |
| **Phaser 3** | Engine 2D: cenas, sprites, física, tilemaps, câmera |
| **Vite** | Build/dev server |
| **Node + Express** | API REST no backend |
| **Prisma ou Drizzle** | ORM para PostgreSQL |
| **ESLint + Prettier** | Qualidade de código |
| **Vitest** | Testes unitários (combate, skills, balanceamento) |

## Design / Arte

| Tipo | Ferramenta | Nota |
|---|---|---|
| Pixel art | **Aseprite** (pago) ou **LibreSprite/Piskel** (grátis) | Exportar spritesheet p/ Phaser |
| Mapas | **Tiled** (grátis) | Phaser carrega `.tmx/.json` nativamente |
| Tilesets | **Kenney.nl** e **itch.io** (CC) | Base pra Lilly/Kielop |
| Música/SFX | **jsfxr**, **BeepBox**, **Audacity** | SFX grátis; chiptune levinho |
| UI/protótipos | **Figma** | Menu, HUD, caixa de diálogo |
| GDD | **Notion** ou `docs/` em Markdown | |
| Diagramas de classes | **draw.io** ou Mermaid no README | Hierarquia Entity/Player/etc. |

## Deploy (Render.com)

1. **Banco:** New → PostgreSQL → copiar `DATABASE_URL` como env var do server.
2. **Server:** New → Web Service → build `npm i && npm run build` → start `node dist/index.js`.
3. **Client:** New → Static Site → build `npm run build` (Vite → `dist/`).
