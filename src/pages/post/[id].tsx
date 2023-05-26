// pages/post/[id].tsx
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "~/utils/api";

const PostPage = () => {
  const router = useRouter();
  let postId: number | undefined;

  if (typeof router.query.id === "string") {
    postId = parseInt(router.query.id);
  }

  if (postId === undefined || isNaN(postId)) {
    // Handle the error...
    return <div>Error: Invalid post ID.</div>;
  }

  const postQuery = api.posts.getById.useQuery({ id: postId });

  useEffect(() => {
    if (postId) {
      postQuery.refetch();
    }
  }, [postId]);

  if (postQuery.status === "loading") {
    return <div>Loading...</div>;
  }

  if (postQuery.status === "error") {
    return <div>Error fetching post</div>;
  }

  return (
    <div className="rounded-md border-2 border-gray-200 p-4">
      <h2 className="text-2xl font-bold">{postQuery.data?.title}</h2>
      <p className="text-lg">{postQuery.data?.body}</p>
    </div>
  );
};

export default PostPage;
