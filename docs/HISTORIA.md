# 📜 História — Prólogo "A Bebida"

## Sinopse

Lilly e Kielop se encontram em um bar e pedem a mesma bebida. O garçom informa que
não há a bebida porque **3 trombadinhas roubaram** a última. A dupla vai em busca
da bebida, enfrenta imprevistos no caminho e descobre que os "trombadinhas" são
**3 crianças** que usaram a bebida num **ritual para reviver um cachorrinho
querido** — mas reviveram um **Cerberus**.

Lilly e Kielop derrotam o Cerberus, voltam ao bar e a cena final é a dupla
finalmente bebendo a bebida desejada e conversando.

## Mundo (4 mapas no Tiled)

```
[1] CITY (cidadezinha do bar) ──▶ [2] TRAIL (trilha perigosa) ──▶ [3] KIDS' HOUSE (casa + pátio)
│
└── [4] BAR (interior) — abre e fecha o prólogo
```

## Personagens

### 🦊 Evy — o barman (raposa com corpo de humano)
- Amigável e conversador; **tem interações em camadas**: fala da quest, conversas
  aleatórias repetíveis ("sabia que raposa com corpo de humano...") e falas
  diferentes conforme o progresso (antes/depois da trilha/depois do Cerberus).
- Nome definitivo: **Evy**.

### ⭐ Mecânica central: "Refúgio de Troca" (SwapZone)

A troca de personagem **não é uma tecla** — acontece em **lugares tranquilos**
(bar, casa de uma senhorinha, banco de praça), onde a dupla senta e conversa:

> *Chegam na mesa → sentam →*
> **LILLY:** "KIELOP POR FAVOR ME DEIXA ASSUMIR O COMANDO VAIIII" → controles mudam ✅

- Cada `SwapZone` no mapa tem seu próprio diálogo (bar = mesa tranquila,
  praça = banco). SwapZones já implementadas: **mesa do bar** (Ato 1) e
  **banco da praça** (City).
- Trocar de controle exige uma "parada" num lugar seguro → ritmo de exploração
  e valorização dos refúgios.

### 🧬 O poder da Lilly — oculto dos jogadores

Metamorfose para **qualquer coisa, viva ou morta** — mas os jogadores descobrem
aos poucos:

- **Fase 1 (prólogo):** só formas pequenas de animais (gatinho para buracos) —
  *jogador acha: "ela vira bicho"*
- **Fase 2:** plantas/objetos vivos (árvore para pontes quebradas)
- **Fase 3:** coisas **inanimadas** (cadeira, estátua) — momento "WHOA, ELA VIRA QUALQUER COISA?!"
- **Revelação:** poder é ilimitado; desbloqueio segue confiança da própria Lilly
  (gating narrativo → nunca há exploits, e a limitação tem sempre "des-culpa" de lore).

### 😀 Personalidades (contraste)

| | Lilly 🌸 | Kielop 🌀 |
|---|---|---|
| Temperamento | **Animada, caótica, impulsiva** ("VAIIII") | **Tranquilo, seco, sarcástico** |
| Poder | Metamorfose oculta/ilimitada | Copia habilidades |
| Energia no diálogo | CAPS e exclamações | "..." e respostas mansas |
| Nas trocas | Quem SEMPRE quer assumir o comando | Quem relutante aceita |

## Ato 1 — O Bar 🍺 (tutorial suave)

- Interior do bar; Kielop já no balcão, Lilly entra e pede a mesma bebida.
- Tutorial: movimentar a dupla, falar com NPCs (garçom), caixa de diálogo.
- Quest: *"Recuperar a Bebida Especial"* → journal do jogador.

## Ato 2 — A Trilha 🌳 (tutorial de combate)

- 2–3 encontros com inimigos fracos (ratos de esgoto, frutas furiosas etc.).
- Primeira utilização do **combate híbrido com timer de 5s**.
- **Tutorial de Kielop:** derrotar um inimigo e copiar a skill dele (primeira cópia).
- **Tutorial de Lilly:** caminho bloqueado que só passa transformando em forma animal
  (buraco pequeno → gatinho).

## Ato 3 — A Casa das Crianças 🐕

- As 3 crianças confessam o ritual. **NÃO há combate com elas.**
- Cutscene curta do ritual: círculo, bebida derramada, um brilho... e um **latido triplo** 🐺.
- O **Cerberus** aparece.

## Ato 4 — Chefão: Cerberus 🐺

- **3 cabeças = 3 partes com HP próprio**: atacar cabeça errada tem consequência.
- **Kielop:** copia "Fogo Triplo" / "Mordida Flamejante" do Cerberus.
- **Lilly:** metamorfose para resistir ao uivo (efeito de stun).
- Ao derrotar: o ritual ** transforma positivamente um dos doguinhos revividos**, que **fica com o grupo** (mascote!).

## Ato 5 — Epílogo do Bar 🍻

- Volta ao bar; bebida na mesa; diálogo curto com opções de resposta (dialog tree).
- Fim do prólogo → tela de título → **save via API** → transição pro mundo aberto.

## Tonalidade

Comédia leve + emocional (o doguinho 💔). Pixel art colorida e fofa.
