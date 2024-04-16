import { LoaderFunctionArgs } from "@remix-run/node";
import { createEventStream } from "~/.server/events/stream";
import { bookSuggestionEvent } from "~/.server/events/emitter";

export function loader({ request }: LoaderFunctionArgs) {
  return createEventStream(request, bookSuggestionEvent);
}
