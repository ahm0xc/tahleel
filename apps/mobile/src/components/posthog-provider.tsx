import React from "react";

interface PostHogStub {
  capture: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  alias: (newId: string) => void;
  screen: (name: string, properties?: Record<string, any>) => void;
}

const PostHogContext = React.createContext<PostHogStub>({
  capture: () => {},
  identify: () => {},
  alias: () => {},
  screen: () => {},
});

export function usePostHog(): PostHogStub {
  return React.useContext(PostHogContext);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const stub: PostHogStub = {
    capture: () => {},
    identify: () => {},
    alias: () => {},
    screen: () => {},
  };

  return (
    <PostHogContext.Provider value={stub}>{children}</PostHogContext.Provider>
  );
}
