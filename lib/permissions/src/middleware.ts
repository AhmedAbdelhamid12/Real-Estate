import type { Request, Response, NextFunction } from "express";
import { resolvePermission } from "./resolver";

export function withPermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.currentUser;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const hasPermission = await resolvePermission(user.id, permissionKey, user.role);
    if (!hasPermission) {
      res.status(403).json({ error: "Forbidden: insufficient permissions" });
      return;
    }
    next();
  };
}

export function withRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.currentUser;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ error: "Forbidden: role not permitted" });
      return;
    }
    next();
  };
}
