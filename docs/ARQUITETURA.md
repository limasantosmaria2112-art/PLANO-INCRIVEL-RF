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
│   ├── Entity.ts            # classe base
│   ├── Player.ts            # abstrata — Lilly e Kielop herdam
│   ├── entities/Lilly.ts    # metamorfa: troca de formas
│   ├── entities/Kielop.ts   # copia habilidades de inimigos
│   ├── entities/Npc.ts
│   └── entities/Enemy.ts
├── systems/
│   ├── CombatSystem.ts      # turnos + timer de 5s
│   ├── MetamorphosisSystem.ts
│   ├── CopySkillSystem.ts
│   ├── InventorySystem.ts
│   ├── DialogueSystem.ts    # árvores de diálogo + cutscenes
│   ├── QuestSystem.ts
│   └── SaveSystem.ts
├── scenes/
│   ├── BootScene.ts
│   ├── MenuScene.ts
│   ├── WorldScene.ts
│   ├── BattleScene.ts
│   └── UIScene.ts
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
