'use client'
import { UploadButton } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

const ImageUpload = () => {
  return (
    <div>
        <UploadButton endpoint="imageUploader" />
    </div>
  )
}

export default ImageUpload