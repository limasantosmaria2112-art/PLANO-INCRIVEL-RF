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

/** Linhas padrão exibidas quando uma troca de controle acontece */
export const SWAP_LINES: Record<CharacterId, QuestionDialogueLine[]> = {
  lilly: [
    { speaker: "lilly", text: "KILOP POR FAVOR ME DEIXA ASSUMIR O COMANDO VAIIII" },
    { speaker: "kielop", text: "...tá bom, tá bom. Nada de correr em direção ao inimigo." }
  ],
  kielop: [
    { speaker: "kielop", text: "Lilly, deixa que eu vou." },
    { speaker: "lilly", text: "Tá! Mas se tropeçar em ninguém, eu ri." }
  ]
};
