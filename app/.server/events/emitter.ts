import { singleton } from "~/utils/singleton.server";
import { EventEmitter } from "events";

export const emitter = singleton("emitter", () => new EventEmitter());

export const bookSuggestionEvent = "NewBookSuggestion";
export function emitBookSuggestion() {
  emitter.emit(bookSuggestionEvent);
}
