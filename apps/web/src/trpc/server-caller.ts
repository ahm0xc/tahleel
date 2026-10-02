import { cache } from "react";

import { createCaller } from "@repo/trpc/root";
import { createTRPCContext } from "@repo/trpc/trpc";
import "server-only";

const createContext = cache(async () =>
  createTRPCContext({ headers: new Headers() })
);

export const serverCaller = createCaller(createContext);
