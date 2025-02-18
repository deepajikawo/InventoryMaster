import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { ImageIcon, UploadCloud } from "lucide-react";

interface DropZoneProps {
  className?: string;
  onImageDrop: (file: File) => void;
  currentImageUrl?: string;
}

export function DropZone({ className, onImageDrop, currentImageUrl }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageDrop(acceptedFiles[0]);
      }
    },
    [onImageDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary",
        className
      )}
    >
      <input {...getInputProps()} />
      {currentImageUrl ? (
        <div className="relative aspect-square w-full">
          <img
            src={currentImageUrl}
            alt="Product"
            className="object-cover rounded-md w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
            <UploadCloud className="h-8 w-8 text-white" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4">
          <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? "Drop the image here" : "Drag & drop or click to select"}
          </p>
        </div>
      )}
    </div>
  );
}
