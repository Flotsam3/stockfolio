import jwt from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || "";
    const payload = jwt.verify(token, secret);
    return payload as { id?: string; email?: string; iat?: number; exp?: number };
  } catch (error) {
    return null;
  }
}
