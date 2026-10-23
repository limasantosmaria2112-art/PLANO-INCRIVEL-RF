# 🏛️ Arquitetura

## Visão geral

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  FRONTEND (web) │────▶│  BACKEND (API)   │────▶│  BANCO DE DADOS │
│  Phaser 3 + TS  │     │  Node + Express  │     │  Postgres Render│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

Monorepo (npm workspaces):

```
PLANO-INCRIVEL-RF/
├── client/          # jogo Phaser 3 (TypeScript + Vite)
├── server/          # API REST (Node + Express + TS)
├── shared/          # tipos, mecânicas e economia compartilhados
└── docs/            # GDD, diagramas UML, balanceamento
```

## Estrutura de classes (client/src)

```
src/
├── entities/
│   ├── Entity.ts            # classe base ✅
│   ├── Player.ts            # abstrata — Lilly e Kielop herdam ✅
│   ├── entities/Lilly.ts    # metamorfa: troca de formas ✅ (formas: Fase 2+)
│   ├── entities/Kielop.ts   # copia habilidades de inimigos ✅ (cópia: Fase 2+)
│   ├── entities/Npc.ts      # NPCs com interações em camadas ✅ (Evy o barman 🦊)
├── systems/
│   ├── CombatSystem.ts      # turnos + timer de 5s (Fase 2)
│   ├── DuplaManager.ts      # controle ativo/follower + troca via SwapZone ✅
│   ├── DialogueSystem.ts    # caixa de diálogo, falas sequenciais ✅
│   ├── SwapZone             # locais tranquilos p/ troca (em BaseDuplaScene) ✅
│   ├── QuestSystem.ts       # quest "A Bebida" sequencial ✅
│   ├── MetamorphosisSystem.ts   # Fase 2+ (revelação gradual do poder!)
│   ├── CopySkillSystem.ts       # Fase 2+
│   ├── InventorySystem.ts       # Fase 3
│   └── SaveSystem.ts            # Fase 3
├── scenes/                  # fluxo do pró-ogo: cenas encadeadas ✅
│   ├── BootScene / MenuScene
│   ├── BarScene             # Ato 1 — Evy 🦊 + quest + 1ª SwapZone ✅
│   ├── CityScene            # praça: casas, banco SwapZone, porta da trilha ✅
│   ├── TrailScene           # Ato 2 — trilha (nexos/combates na Fase 2) ✅
│   ├── KidsHouseScene       # Ato 3 — círculo do ritual + crianças ✅
│   ├── BattleScene          # Fase 2 — combate híbrido
│   └── UIScene              # Fase 2+
├── ui/
└── core/                    # GameConfig, EventBus, ResourceManager
```

## Padrões de projeto

| Padrão | Onde usar |
|---|---|
| Strategy | Formas da Lilly / habilidades copiadas pelo Kielop |
| State | Fases do combate (decisão → execução → resultado) |
| Factory | Criação de inimigos, NPCs e itens |
| Observer/EventBus | Desacoplar UI ↔ lógica |

## Combat System híbrido

- Semi-tempo real: menu por turnos, porém com **timer de 5s** para decidir.
- Se o tempo acabar: ação aleatória ou "defender".
- Boss Cerberus: 3 partes (cabeças) com HP independente.
