
import { createUploadthing } from "@uploadthing/react";
import type { OurFileRouter } from "../../../server/uploadthing";

export const { useUploadThing } = createUploadthing<OurFileRouter>();
