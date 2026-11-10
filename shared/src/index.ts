/**
 * shared — tipos e mecânicas usados por client e server.
 * Lógica de combate/dano deve morar aqui (testável com Vitest).
 */

export type CharacterId = "lilly" | "kielop";

export interface Skill {
  name: string;
  element: "physical" | "fire" | "water" | "shadow" | "heal";
  mpCost: number;
  power: number;
  /** De qual inimigo o Kielop copiou (null = habilidade própria) */
  copiedFrom: string | null;
}

export interface QuestionDialogueLine {
  speaker: CharacterId | "npc";
  text: string;
}

/** Linhas padrão exibidas quando uma troca de controle acontece.
 *  O autor é sempre o personagem que VAI assumir (o follower). */
export const SWAP_LINES: Record<CharacterId, QuestionDialogueLine[]> = {
  lilly: [
    { speaker: "lilly", text: "sai da frente, cérebro. minha vez de aparecer." },
    { speaker: "kielop", text: "...toma. só não escolha 'correr pro inimigo' de novo." }
  ],
  kielop: [
    { speaker: "kielop", text: "assumindo o comando. alguém aqui precisa ler o mapa." },
    { speaker: "lilly", text: "vai, tático. aceito você à minha frente." }
  ]
};
