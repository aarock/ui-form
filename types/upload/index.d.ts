import { ReactNode } from "react";
import { AnyVariables, UseQueryArgs, UseMutationResponse, OperationResult } from "urql";
import Upload, { PresignedVariableAccess, PresignedResultAccess, ChunkFile } from "./upload.class.js";
import { UploadDropZoneProps } from "./drop-zone.js";
import { type YStackProps } from "@aarock/ui-core";
export { default as Upload } from "./upload.class.js";
export type PresignOptions<MV extends AnyVariables> = Omit<UseQueryArgs<MV>, "query">;
export type UploaderProps<M, MV extends AnyVariables> = YStackProps & {
    usePresignMutation: () => UseMutationResponse<M, MV>;
    variableAccess?: PresignedVariableAccess<MV>;
    resultAccess?: PresignedResultAccess<OperationResult<M, MV>>;
    types?: string[];
    chunkSize?: number;
    chunkFile?: ChunkFile;
    onComplete?: (upload: Upload) => void;
    dropZoneProps?: Partial<Omit<UploadDropZoneProps, "onFiles">>;
    maxFiles?: number;
    isMultiple?: boolean;
    render?: (uploads: Upload[]) => ReactNode;
};
export declare function Uploader<M, MV extends AnyVariables>({ types, maxFiles, usePresignMutation, variableAccess, resultAccess, chunkSize, chunkFile, onComplete, dropZoneProps, render, ...props }: UploaderProps<M, MV>): any;
//# sourceMappingURL=index.d.ts.map