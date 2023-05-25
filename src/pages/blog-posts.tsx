import { SignOutButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useEffect } from "react";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const Blog: NextPage = () => {
  const postsQuery = api.posts.getAll.useQuery();
  const fetchAndStoreQuery = api.posts.fetchAndStore.useQuery(null, {
    onSuccess: () => {
      postsQuery.refetch();
    },
  });

  useEffect(() => {
    // Fetch posts from JSONPlaceholder API and store them in the DB when the component mounts
    fetchAndStoreQuery.refetch();
  }, [fetchAndStoreQuery]);

  if (postsQuery.status === "loading") {
    return <div>Loading...</div>;
  }

  if (postsQuery.status === "error") {
    return <div>Error fetching posts</div>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <h1 className="text-6xl font-bold">📚 Blog</h1>
        <p className="mt-3 text-2xl">Welcome to the Voda-AI Blog Project!</p>

        <hr className="my-6 w-full border-2 border-gray-200" />

        <div className="rounded-md border-2 border-gray-200 p-4">
          {postsQuery.data?.map((post: any, idx: number) => (
            <div key={post.id} className="mb-4">
              <h2 className="text-2xl font-bold">{idx}: &nbsp; {post.title}</h2>
              <p className="text-lg">{post.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center">
          <Button>
            <Icons.doorOpen /> <SignOutButton />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Blog;
