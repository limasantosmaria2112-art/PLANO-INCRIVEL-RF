export type QuestStage = 0 | 1 | 2;

const LABELS: Record<QuestStage, string> = {
  0: "Quest: converse com Evy (barman do bar)",
  1: "Quest: a Bebida — vá pela trilha leste até a casa",
  2: "Quest: a Bebida — o ritual despertou o cachorro revivido: resolva isso na casa"
};

/**
 * QuestSystem — por ora o prólogo tem uma quest guiada sequencial.
 * A partir do stage 2 (examinar o círculo com a bebida na casa),
 * `ritualAtivado` fica true: o Cachorrinho Revivido 🐶 desperta e
 * passa a patrulhar a trilha leste.
 */
export class QuestSystem {
  private _stage: QuestStage = 0;
  private _ritualAtivado = false;

  get stage(): QuestStage {
    return this._stage;
  }

  get ritualAtivado(): boolean {
    return this._ritualAtivado;
  }

  get label(): string {
    return LABELS[this._stage];
  }

  advance(): void {
    if (this._stage < 2) {
      this._stage++;
      if (this._stage === 2) this._ritualAtivado = true; // círculo examinado → dog desperta
    }
  }

  reset(): void {
    this._stage = 0;
    this._ritualAtivado = false;
  }
}

export const quest = new QuestSystem();
