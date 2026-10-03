import { verifyToken } from "@clerk/backend";

/**
 * Inferred from the SDK rather than imported from `@clerk/types`, which is not a
 * direct dependency of this package.
 */
export type SessionClaims = NonNullable<
  Awaited<ReturnType<typeof verifyToken>>
>;

export type TRPCAuth =
  | {
      isAuthenticated: true;
      userId: string;
      sessionId: string | null;
      claims: SessionClaims;
    }
  | {
      isAuthenticated: false;
      userId: null;
      sessionId: null;
      claims: null;
    };

const SIGNED_OUT: TRPCAuth = {
  isAuthenticated: false,
  userId: null,
  sessionId: null,
  claims: null,
};

const BEARER_PATTERN = /^bearer\s+(.+)$/i;
const SESSION_COOKIE_NAME = "__session";

/**
 * Pulls the session JWT out of the request headers, or `null` when the caller is
 * anonymous. Never throws: a malformed header or cookie is simply "no session".
 */
function readSessionToken(headers: Headers): string | null {
  const authorization = headers.get("authorization");
  if (authorization) {
    // Indexed group rather than a named one: named capture groups require an
    // ES2018 target, and consumers compile this source with older targets.
    const token = BEARER_PATTERN.exec(authorization)?.[1]?.trim();
    if (token) return token;
  }

  const cookie = headers.get("cookie");
  if (!cookie) return null;

  for (const pair of cookie.split(";")) {
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() !== SESSION_COOKIE_NAME) continue;

    const value = pair.slice(separator + 1).trim();
    if (!value) return null;

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

function readAuthorizedParties(): string[] | undefined {
  // Annotated because `process.env` is not consistently typed for consumers that
  // compile this package against a non-Node `lib`.
  const raw: string | undefined = process.env.CLERK_AUTHORIZED_PARTIES;
  if (!raw) return undefined;

  const parties = raw
    .split(",")
    .map((party) => party.trim())
    .filter(Boolean);

  return parties.length > 0 ? parties : undefined;
}

let hasWarnedAboutMissingKeys = false;

/**
 * Resolves the auth state for a single request.
 *
 * Failure modes are deliberately folded into "signed out" rather than thrown: an
 * expired or tampered token should surface as a `401` from a protected procedure,
 * not as a `500`. Only `protectedProcedure` is expected to reject anonymous
 * callers, and it does so by checking `auth.isAuthenticated`.
 */
export async function resolveAuth(headers: Headers): Promise<TRPCAuth> {
  const token = readSessionToken(headers);
  if (!token) return SIGNED_OUT;

  const jwtKey = process.env.CLERK_JWT_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!jwtKey && !secretKey) {
    if (!hasWarnedAboutMissingKeys) {
      hasWarnedAboutMissingKeys = true;
      console.warn(
        "[trpc] Neither CLERK_JWT_KEY nor CLERK_SECRET_KEY is set, so every request is treated as signed out. See apps/web/.env.example."
      );
    }
    return SIGNED_OUT;
  }

  try {
    // `verifyToken` prefers `jwtKey` (networkless) and falls back to `secretKey`
    // (fetches + caches the JWKS). `authorizedParties` guards the cookie flow
    // against subdomain cookie leakage and is only applied when configured.
    const claims = await verifyToken(token, {
      jwtKey,
      secretKey,
      authorizedParties: readAuthorizedParties(),
    });

    if (!claims.sub) return SIGNED_OUT;

    return {
      isAuthenticated: true,
      userId: claims.sub,
      sessionId: typeof claims.sid === "string" ? claims.sid : null,
      claims,
    };
  } catch (error) {
    console.warn("[trpc] Clerk session token was rejected:", error);
    return SIGNED_OUT;
  }
}
