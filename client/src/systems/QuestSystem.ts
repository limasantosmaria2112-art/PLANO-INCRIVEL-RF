export type QuestStage = 0 | 1 | 2;

const LABELS: Record<QuestStage, string> = {
  0: "Quest: converse com Evy (barman do bar)",
  1: "Quest: a Bebida — vá pela trilha leste até a casa",
  2: "Quest: a Bebida — verifique o círculo na casa"
};

/**
 * QuestSystem — por ora o prólogo tem uma quest guiada sequencial.
 */
export class QuestSystem {
  private _stage: QuestStage = 0;

  get stage(): QuestStage {
    return this._stage;
  }

  get label(): string {
    return LABELS[this._stage];
  }

  advance(): void {
    if (this._stage < 2) this._stage++;
  }

  reset(): void {
    this._stage = 0;
  }
}

export const quest = new QuestSystem();
