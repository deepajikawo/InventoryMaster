import { createUploadthing, type FileRouter } from "uploadthing/server";
import type { Request } from "express";

const f = createUploadthing();

interface AuthedRequest extends Request {
  user?: Express.User;
}

export const uploadRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const authReq = req as unknown as AuthedRequest;
      if (!authReq.user?.isAdmin) throw new Error("Unauthorized");
      return { userId: authReq.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;