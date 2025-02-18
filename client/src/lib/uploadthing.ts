import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../../../server/uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

export const { UploadButton, UploadDropzone, Uploader } = generateComponents<OurFileRouter>();