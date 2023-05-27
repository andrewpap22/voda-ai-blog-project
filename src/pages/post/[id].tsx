import { useRouter } from "next/router";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import Authenticated from "../authenticated";

const PostPage = () => {
  const router = useRouter();
  const postId: number = parseInt(router.query.id as string);

  /// wait for the router to be ready before fetching the post
  /// this is necessary because the router.query.id is undefined and thus might cause a server error.
  if (!router.isReady) return null;
  const postQuery = api.posts.getById.useQuery({ id: postId });

  if (!postQuery || !postQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading... &nbsp; <Icons.spinner />
      </div>
    );
  }

  if (postId === undefined || isNaN(postId)) {
    // Handle the error...
    return <div>Error: Invalid post ID.</div>;
  }

  if (postQuery.status === "error") {
    return <div>Error fetching post</div>;
  }

  return (
    <Authenticated>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <div className="rounded-md border-2 border-gray-200 p-4">
          <h2 className="text-2xl font-bold">{postQuery.data?.title}</h2>
          <p className="text-lg">{postQuery.data?.body}</p>
        </div>

        <Button
          className="mt-4"
          // the below is for a vercel deployment error
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={() => router.push("/")}
          variant="outline"
        >
          <Icons.home /> &nbsp; Return to home page
        </Button>
      </div>
    </Authenticated>
  );
};

export default PostPage;
