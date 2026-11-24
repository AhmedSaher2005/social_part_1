import { PORT } from "./config/config.service";
import express, { Errback, NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import {
  AppError,
  GlobalErrorHandling,
} from "./common/utils/globalErrorHandling";
import authRouter from "./modules/auth/auth.controller.js";
import ConnectionDB from "./DB/connectionDB.js";
import RedisService from "./DB/connectionRedis.js";
import { S3Service } from "./common/service/s3.service";
import { pipeline } from "stream/promises";
import { SuccessResponse } from "./common/utils/success.response";
import notificationServisce from "./common/service/notification.servisce";

const app = express();
const port = PORT;
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 35,
  message: {
    sucssess: false,
    message: "Too Many Requests",
  },
});
const bootstrap = async () => {
  app.use(cors({}));
  app.use(limiter);
  app.use(helmet());
  app.use(express.json());
  await ConnectionDB();
  await RedisService.Connect();

  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "welcome on my app...😘" });
  });
  app.post(
    "/send-notification",
    async (req: Request, res: Response, next: NextFunction) => {
      await notificationServisce.sendNotification({
        token: req.body.token,
        data: { title: "Hello", body: "Hiiii" },
      });
    },
  );

  app.use("/auth", authRouter);

  app.get(
    "/upload/pre-signed/*path",
    SuccessResponse(async (req: Request, res: Response, next: NextFunction) => {
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const { download } = req.query as { download: string };
      const url = await new S3Service().getpresignedUrl({
        Key,
        download: download ?? undefined,
      });
      return { data: url };
    }),
  );
  app.get(
    "/upload",
    SuccessResponse(async (req: Request, res: Response, next: NextFunction) => {
      const { folderName } = req.query as { folderName: string };
      const { Contents } = await new S3Service().getFiles(folderName);
      const data = Contents?.map((file) => {
        return { key: file.Key };
      });
      return { data: data };
    }),
  );

  app.get(
    "/upload/*path",
    async (req: Request, res: Response, next: NextFunction) => {
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const { download } = req.query;
      const result = await new S3Service().getFile(Key);
      const stream = result.Body as NodeJS.ReadableStream;
      res.setHeader("Content-Type", result.ContentType!);
      res.setHeader("cross-origin-resource-policy", "cross-origin");
      if (download && download === "true") {
        res.setHeader(
          "Content-disposition",
          `attachment; filename="${path.pop()}"`,
        );
      }

      pipeline(stream, res);
    },
  );

  app.use("{/*demo}", (req, res, next) => {
    throw new AppError(
      `url:${req.originalUrl} with method:${req.method} not found`,
      404,
    );
  });
  app.use(GlobalErrorHandling);
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};

export default bootstrap;
