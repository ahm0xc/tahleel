"use client";

import React, { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import { api } from "./client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      // change the ip address to whatever address the Metro server is running on
      // if you're using a Simulator 'localhost' should work fine
      links: [
        httpBatchLink({
          url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
          transformer: SuperJSON,
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
