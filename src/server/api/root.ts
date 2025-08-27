import { insuranceTypeRouter } from "@/server/api/routers/insurance-type";
import { insurancesRouter } from "@/server/api/routers/insurances";
import { insurersRouter } from "@/server/api/routers/insurers";
import { officesRouter } from "@/server/api/routers/offices";
import { advisorsRouter } from "@/server/api/routers/advisors";
import { usersRouter } from "@/server/api/routers/users";
import { adminRouter } from "@/server/api/routers/admin";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  insuranceType: insuranceTypeRouter,
  insurances: insurancesRouter,
  insurers: insurersRouter,
  offices: officesRouter,
  advisors: advisorsRouter,
  users: usersRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.example.hello({ text: "world" });
 *       ^? { greeting: "Hello world" }
 */
export const createCaller = createCallerFactory(appRouter);
