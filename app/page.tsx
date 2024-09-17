import Book from "./components/Book";
import { BookType, Purchase, User } from "./types/types";
import { getAllBooks } from "./lib/microcms/client";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "./lib/next-auth/options";

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Home() {
  const { contents } = await getAllBooks();
  const session = await getServerSession(nextAuthOptions);
  const user = session?.user as User;

  let purchaseBookIds: string[] = [];

  if (user) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/purchases/${user.id}`,
      { cache: "no-store" }
    );
    const purchasesData = await response.json();
    const purchasedIds = purchasesData.map(
      (purchase: Purchase) => purchase.bookId
    );

    return (
      <>
        <main className="flex flex-wrap justify-center items-center md:mt-32 mt-20">
          <h2 className="text-center w-full font-bold text-3xl mb-2">
            Book Commerce
          </h2>
          {contents.map((book: BookType) => (
            <Book
              key={book.id}
              book={book}
              isPurchased={purchasedIds.includes(book.id)}
            />
          ))}
        </main>
      </>
    );
  }
}
