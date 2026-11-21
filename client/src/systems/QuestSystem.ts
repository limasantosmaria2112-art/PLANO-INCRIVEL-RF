export type QuestStage = 0 | 1 | 2 | 3;

const LABELS: Record<QuestStage, string> = {
  0: "Quest: converse com Evy, o barman 🦊",
  1: "Quest: a Bebida — siga pela trilha leste até a casa das crianças",
  2: "Quest: a Bebida — o ritual acordou o Kennedito Revivido. Resolva isso na casa",
  3: "Quest: a Bebida — concluída ✅"
};

/** stage 2 com a batalha vencida: hora de voltar ao bar */
const LABEL_POS_BATALHA = "Quest: a Bebida — a batalha acabou. Volte ao bar e conte tudo ao Evy 🦊";

/**
 * QuestSystem — por ora o prólogo tem uma quest guiada sequencial.
 * A partir do stage 2 (examinar o círculo com a bebida na casa),
 * `ritualAtivado` fica true: o Cachorrinho Revivido 🐶 desperta e
 * passa a patrulhar a trilha leste.
 */
export class QuestSystem {
  private _stage: QuestStage = 0;
  private _ritualAtivado = false;
  private _kenneditoResolvido = false;

  get stage(): QuestStage {
    return this._stage;
  }

  get ritualAtivado(): boolean {
    return this._ritualAtivado;
  }

  /** o Kennedito Revivido foi derrotado (libera o final com o Evy) */
  get kenneditoResolvido(): boolean {
    return this._kenneditoResolvido;
  }

  get label(): string {
    if (this._stage === 2 && this._kenneditoResolvido) return LABEL_POS_BATALHA;
    return LABELS[this._stage];
  }

  advance(): void {
    if (this._stage < 2) {
      this._stage++;
      if (this._stage === 2) this._ritualAtivado = true; // círculo examinado → kennedito desperta
    }
  }

  /** estágio final: conta pro Evy no bar → encerra o prólogo */
  finalizar(): void {
    this._stage = 3;
  }

  marcarKenneditoResolvido(): void {
    this._kenneditoResolvido = true;
  }

  reset(): void {
    this._stage = 0;
    this._ritualAtivado = false;
    this._kenneditoResolvido = false;
  }
}

export const quest = new QuestSystem();
