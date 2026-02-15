/**
 * NOTE:
 * Next.js Middleware is only loaded from:
 *   - /middleware.ts (project root), or
 *   - /src/middleware.ts
 *
 * A file at /src/app/middleware.ts is NOT used by Next.js routing.
 * However, TypeScript will still compile it because tsconfig includes "src/**/*".
 *
 * Keeping this as an empty module prevents placeholder text from breaking builds.
 */
export {};
