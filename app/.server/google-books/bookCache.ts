import { Book } from "~/.server/google-books/api";
import { singleton } from "~/utils/singleton.server";

class BookCache {
  private cache = new Map<string, Book>();

  get(id: string) {
    return this.cache.get(id) as Book | null;
  }

  set(id: string, book: Book) {
    this.cache.set(id, book);

    if (this.cache.size > 200) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
}

export const bookCache = singleton("bookCache", () => new BookCache());
