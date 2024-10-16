/**
 * accessable routes without auth
 * @type {string[]}
 */
export const publicRoutes = ["/"];

export const authRoutes = ["/auth/login", "/auth/register", "/profile"];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/profile";
