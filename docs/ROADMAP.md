# 🗺️ Roadmap

## Fase 0 — Base (semana 1–2)
- Setup monorepo, Vite + Phaser rodando, ESLint, Prisma conectado ao Postgres do Render
- Classes `Entity`, `Player`, `Lilly`, `Kielop` com movimento básico

## Fase 1 — Mundo (semana 3–4) ✅ IMPLEMENTADA
- Mapas encadeados via código (Bar = Every's Tipsy, City/praça, Trail, KidsHouse),
  colisões, câmera, portas entre cenas — Tiled entra depois para arte final
- **Evy o barman raposa 🦊** com diálogo em camadas (quest + conversas repetíveis)
- NPC + DialogueSystem (caixa de texto), quest "A Bebida" com HUD
- **Troca de controle via SwapZone** (mesa do bar + banco da praça, diálogo icônico) ✅

## Fase 2 — Combate (semana 5–7)
- `BattleScene`: menu com **timer de 5s** (atacar/curar/skill/fugir)
- Dano/elementos em `shared/` (testável com Vitest)
- Kielop copia skill de inimigo derrotado; Lilly troca de forma
- Inimigos da trilha (encontros simples)

## Fase 3 — Persistência (semana 8–9)
- Login, save/load via API + Postgres no Render
- Inventário, quests, deploy completo (client static + server + banco)

## Fase 4 — Chefão e polish (semana 10+)
- Boss Cerberus (3 partes com HP próprio)
- Mascote doguinho ), música/SFX, balanceamento, ranking
