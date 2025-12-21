import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/sign-in",
    signUp: "/sign-in",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  },
  // Explicitly set the base URL for production
  ...(typeof window !== "undefined" && {
    baseUrl: window.location.origin,
  }),
});
