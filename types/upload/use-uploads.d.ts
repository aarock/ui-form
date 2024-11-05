import Upload, { PresignFile, UploadsOptions } from "./upload.class.js";
export type UseUploads = [
    uploads: Upload[],
    onFiles: (files?: FileList | File[] | null) => void
];
export default function useUploads(presign: PresignFile, options?: UploadsOptions): UseUploads;
//# sourceMappingURL=use-uploads.d.ts.map