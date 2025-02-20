
import { createUploadthing } from "uploadthing/server";
const f = createUploadthing();

const auth = (req: Request) => ({ id: (req as any).user?.id ?? null }); 

export const uploadRouter = {
  productImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const user = auth(req);
      if (!user.id) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    })
};

export type OurFileRouter = typeof uploadRouter;
