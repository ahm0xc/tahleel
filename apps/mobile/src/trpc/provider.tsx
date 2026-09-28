"use client";

import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "@clerk/expo";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";

import { api } from "./client";
import { createQueryClient } from "./query-client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken, sessionId } = useAuth();

  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [queryClient] = useState(createQueryClient);
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
          transformer: SuperJSON,
          headers: async () => {
            const headers = new Headers({ "x-trpc-source": "expo" });
            const token = await getTokenRef.current();
            if (token) {
              headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
          },
        }),
      ],
    })
  );

  // Drop cached responses whenever the session changes so one account can never
  // read another account's protected data out of the query cache.
  useEffect(() => {
    if (sessionId) {
      queryClient.invalidateQueries();
    }
  }, [queryClient, sessionId]);

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
