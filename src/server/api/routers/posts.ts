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
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
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
