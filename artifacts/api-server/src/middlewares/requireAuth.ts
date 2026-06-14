import type { Request, Response, NextFunction } from "express";
import { getUserFromRequest } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      currentUser?: import("@workspace/db").User | null;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (user.status !== "active") {
    res.status(403).json({ error: "Account not active" });
    return;
  }
  req.currentUser = user;
  next();
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const user = await getUserFromRequest(req);
  req.currentUser = user;
  next();
}
