// pages/post/[id].tsx
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const PostPage = () => {
  const router = useRouter();
  const postId: number = parseInt(router.query.id as string);

  const postQuery = api.posts.getById.useQuery({ id: postId });

  useEffect(() => {
    const fetchData = async () => {
      if (postId && !isNaN(postId)) {
        await postQuery.refetch();
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (postId === undefined || isNaN(postId)) {
    // Handle the error...
    return <div>Error: Invalid post ID.</div>;
  }

  if (postQuery.status === "loading") {
    return <div>Loading...</div>;
  }

  if (postQuery.status === "error") {
    return <div>Error fetching post</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="rounded-md border-2 border-gray-200 p-4">
        <h2 className="text-2xl font-bold">{postQuery.data?.title}</h2>
        <p className="text-lg">{postQuery.data?.body}</p>
      </div>

      <Button
        className="mt-4"
        onClick={() => router.push("/")}
        variant="outline"
      >
        <Icons.home /> &nbsp; Return to home page
      </Button>
    </div>
  );
};

export default PostPage;
