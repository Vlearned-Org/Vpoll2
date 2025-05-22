export const JWT_KEY = process.env.JWT_KEY || "secretKey";
export const JWT_TTL = process.env.JWT_TTL || 900;
export const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || 86400;
export const REFRESH_TOKEN_TTL_LONG_LIVED =
  process.env.REFRESH_TOKEN_TTL_LONG_LIVED || 2592000;
