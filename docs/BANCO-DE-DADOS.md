# 🗄️ Banco de Dados e API

## Schema SQL (PostgreSQL no Render.com)

```sql
players(id, username, password_hash, created_at)
saves(id, player_id, lilly_level, kielop_level, gold, playtime,
      position_x, position_y, active_companion, updated_at)
inventory(id, save_id, item_id, quantity)
skills(id, owner_type, owner_id, name, element, mp_cost, power, copied_from)
    -- `copied_from`: guarda de qual inimigo o Kielop copiou 🔁
quests(id, save_id, quest_id, stage, completed)
enemy_kills(save_id, enemy_id, kills)  -- ranking/estatísticas
```

## Endpoints

```
POST /auth/register | /auth/login      → JWT
GET  /save/:playerId                   → carregar jogo
POST /save                             → salvar progresso
GET  /ranking                          → top jogadores
GET  /enemies/:id, /skills             → dados balanceados do servidor
```

## Autenticação

- **JWT** para sessão do jogador.
- Fase inicial: saves locais (localStorage) com sincronização optativa.
