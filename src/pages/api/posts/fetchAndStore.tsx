import { TRPCError } from "@trpc/server";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This is used to expose the fetchAndStore method from our trpc router.
 * We are then using this in the seed.js script to populate the db with the posts from the JSONPlaceholder API.
 */

const fetchAndStoreHandler = async (req: any, res: any) => {
  // Create context and caller
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  try {
    const response = await caller.posts.fetchAndStore(null);
    res.status(200).json(response);
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // An error from tRPC occured
      const httpCode = getHTTPStatusCodeFromTRPCError(cause);
      return res.status(httpCode).json(cause);
    }
    // Another error occured
    console.error(cause);
    res.status(500).json({ message: "Internal server error" });
  }
};

function getHTTPStatusCodeFromTRPCError(error: any) {
  switch (error.shape) {
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "notFound":
      return 404;
    case "inputValidation":
      return 400;
    default:
      return 500;
  }
}

export default fetchAndStoreHandler;
