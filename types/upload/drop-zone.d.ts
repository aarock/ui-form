import { type ButtonProps, type YStackProps, type TextProps } from "@aarock/ui-core";
export type UploadDropZoneProps = YStackProps & {
    types?: string[];
    onFiles?: (files: FileList | File[]) => void;
    buttonProps?: Partial<Omit<ButtonProps, "onPress">>;
    messageProps?: Partial<TextProps>;
};
export default function UploadDropZone({ types, onFiles, buttonProps, messageProps, ...props }: UploadDropZoneProps): any;
//# sourceMappingURL=drop-zone.d.ts.map