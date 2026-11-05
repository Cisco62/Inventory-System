import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    handler: "/handler",
    signIn: "/sign-in",
    signUp: "/sign-in",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
    oauthCallback: "/handler/oauth-callback",
  },
  // Set base URL from environment variable or use current origin
  baseUrl: process.env.NEXT_PUBLIC_STACK_BASE_URL || 
    (typeof window !== "undefined" ? window.location.origin : undefined),
});
