import type { CharacterId, QuestionDialogueLine } from "shared";
import { SWAP_LINES } from "shared";

type Listener = (active: CharacterId) => void;

/**
 * DuplaManager — guarda quem está "no controle" e avisa a cena.
 * A troca NÃO é tecla: acontece em SwapZones (lugares tranquilos),
 * sempre precedida de um diálogo.
 */
export class DuplaManager {
  private _active: CharacterId = "lilly";
  private listeners: Listener[] = [];

  get active(): CharacterId {
    return this._active;
  }

  get follower(): CharacterId {
    return this._active === "lilly" ? "kielop" : "lilly";
  }

  switchTo(id: CharacterId): void {
    if (id === this._active) return;
    this._active = id;
    this.listeners.forEach((l) => l(id));
  }

  toggle(): void {
    this.switchTo(this.follower);
  }

  /** Falas da troca, com madeira da personagem que REVINDICA o comando */
  getSwapLines(requester: CharacterId): QuestionDialogueLine[] {
    return SWAP_LINES[requester];
  }

  onChange(cb: Listener): void {
    this.listeners.push(cb);
  }
}
