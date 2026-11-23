import Button from "./Button";

type Paged = { hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => unknown };

export default function LoadMore({ query }: { query: Paged }) {
      if (!query.hasNextPage) return null;
      return (
            <Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()} className="self-center">
                  Ver más
            </Button>
      );
}
