import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import passport from "passport";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { configurePassport } from "./lib/passport";
import { rateLimitMiddleware } from "./lib/rate-limit";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

configurePassport();
app.use(passport.initialize());
app.use(rateLimitMiddleware);

app.use("/api", router);
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

export default app;
