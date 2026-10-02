import { exampleRouter } from "./routers/example.js";
import { friendsRouter } from "./routers/friends.js";
import { notificationsRouter } from "./routers/notifications.js";
import { streaksRouter } from "./routers/streaks.js";
import { usersRouter } from "./routers/users.js";
import { createCallerFactory, createTRPCRouter } from "./trpc.js";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  streaks: streaksRouter,
  friends: friendsRouter,
  users: usersRouter,
  notifications: notificationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
