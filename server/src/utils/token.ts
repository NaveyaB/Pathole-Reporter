import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config/env.js";
import type { SafeUser } from "../types/index.js";

export interface TokenPayload {
  sub: string;
  role: string;
  name: string;
}

export const signToken = (user: SafeUser): string => {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
    name: user.name,
  };
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const sanitizeUser = (
  user: SafeUser
): SafeUser & { password?: string } => {
  const { password: _password, ...safe } = user as SafeUser & { password: string };
  return safe;
};
