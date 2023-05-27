import axios from "axios";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const JSONPlaceholderPostSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().optional(),
        pageSize: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const page = input.page ?? 1;
      const pageSize = input.pageSize ?? 20;

      const skip = (page - 1) * pageSize;

      const rawPosts = await ctx.prisma.post.findMany({
        skip: skip,
        take: pageSize,
      });

      const userId = ctx.user?.id;

      // Transform rawPosts to include isLiked property
      const posts = await Promise.all(
        rawPosts.map(async (post) => {
          let isLiked = false;

          if (userId) {
            // Only check if userId is not null or undefined
            isLiked =
              (await ctx.prisma.likedPost.findFirst({
                where: {
                  postId: post.id,
                  userId: userId,
                },
              })) !== null;
          }

          return {
            ...post,
            isLiked,
          };
        })
      );

      const totalPostsCount = await ctx.prisma.post.count();

      return {
        posts,
        pagination: {
          page,
          pageSize,
          totalPostsCount,
          totalPages: Math.ceil(totalPostsCount / pageSize),
        },
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      return post;
    }),

  likePost: publicProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        const likedPost = await ctx.prisma.likedPost.create({
          data: {
            userId: userId,
            postId: input.postId,
          },
        });

        return likedPost;
      } catch (error) {
        throw new Error(
          "Failed to like post. Ensure the post exists and hasn't been liked already."
        );
      }
    }),

  unlikePost: publicProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        const likedPost = await ctx.prisma.likedPost.deleteMany({
          where: {
            userId: userId,
            postId: input.postId,
          },
        });

        return likedPost;
      } catch (error) {
        throw new Error(
          "Failed to unlike post. Ensure the post exists and has been liked first."
        );
      }
    }),

  unlikeAllPosts: publicProcedure
    .input(z.object({}))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      await ctx.prisma.likedPost.deleteMany({
        where: {
          userId: userId,
        },
      });

      return { success: true };
    }),

  myLikedPosts: publicProcedure
    .input(z.object({}))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const likedPosts = await ctx.prisma.likedPost.findMany({
        where: {
          userId: userId,
        },
        include: {
          Post: true,
        },
      });

      return likedPosts.map((lp) => lp.Post);
    }),

  fetchAndStore: publicProcedure.input(z.null()).query(async ({ ctx }) => {
    // Fetch posts from JSONPlaceholder API
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    // Validate the API response
    const JSONPlaceholderPostArraySchema = z.array(JSONPlaceholderPostSchema);
    const posts = JSONPlaceholderPostArraySchema.parse(response.data);

    // Upsert posts into the database
    for (const post of posts) {
      await ctx.prisma.post.upsert({
        where: { id: post.id },
        update: { title: post.title, body: post.body, userId: post.userId },
        create: {
          id: post.id,
          title: post.title,
          body: post.body,
          userId: post.userId,
        },
      });
    }

    return { message: "Posts updated successfully" };
  }),
});
