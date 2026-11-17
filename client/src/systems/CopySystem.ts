/** Guarda a habilidade que o Kielop copiou ao derrotar um inimigo. */
export interface CopiaHabilidade {
  from: string;
  name: string;
  power: number;
}

export const copiasKielop: { habilidade: CopiaHabilidade | null } = { habilidade: null };
