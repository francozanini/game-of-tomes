export async function fetchBooks(searchTerm: string) {
  return await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=40&printType=books`,
  )
    .then((res) => res.json() as Promise<BooksResponse>)
    .then((res) => uniqueByTitleAndAuthor(res.items).slice(0, 5));
}

function uniqueByTitleAndAuthor(books: Book[]) {
  const uniqueBooks = new Map<string, Book>();

  for (const book of books) {
    const key = `${book.volumeInfo.title} ${book.volumeInfo.authors?.join(
      ", ",
    )}`;
    uniqueBooks.set(key, book);
  }

  return Array.from(uniqueBooks.values());
}

export type Book = {
  id: string;
  volumeInfo: {
    title: string;
    previewLink: string;
    imageLinks: {
      extraLarge: string;
      large: string;
      small: string;
      medium: string;
      thumbnail: string;
      smallThumbnail: string;
    } | null;
    authors: string[] | null;
    industryIdentifiers: {
      type: string;
      identifier: string;
    }[];
  };
  language: string;
  saleInfo: {
    country: string;
    saleability: string;
    isEbook: boolean;
  };
};
type BooksResponse = {
  items: Book[];
};
