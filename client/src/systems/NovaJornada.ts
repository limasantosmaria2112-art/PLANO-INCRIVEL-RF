import { quest } from "./QuestSystem";
import { copiasKielop } from "./CopySystem";
import { dupla } from "./DuplaSingleton";

/**
 * Zera o estado de sessão pra começar uma jornada do zero.
 * Usado pelo "COMEÇAR" do menu e pelo "JOGAR DE NOVO" da tela final.
 * Sem isso, a quest e a habilidade copiada sobrevivem ao replay e o
 * Evy fica sem diálogo (stage 3 na primeira conversa).
 */
export function novaJornada(): void {
  quest.reset();
  copiasKielop.habilidade = null;
  dupla.switchTo("lilly");
}
