import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import leadsRouter from "./leads";
import projectsRouter from "./projects";
import resaleRouter from "./resale";
import clientsRouter from "./clients";
import plannerRouter from "./planner";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";
import permissionsRouter from "./permissions";
import heartbeatRouter from "./heartbeat";
import delaysRouter from "./delays";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(leadsRouter);
router.use(projectsRouter);
router.use(resaleRouter);
router.use(clientsRouter);
router.use(plannerRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(reportsRouter);
router.use(permissionsRouter);
router.use(heartbeatRouter);
router.use(delaysRouter);
router.use(uploadRouter);

export default router;
