import Phaser from "phaser";
import { DuplaManager } from "./DuplaManager";

/** Singleton global: o estado da dupla persiste entre cenas. */
export const dupla = new DuplaManager();

/** Re-exporta o tipo pra conveniência das cenas. */
export type { DuplaManager };
