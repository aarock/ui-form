import { ButtonProps } from "@aarock/ui-core";
import { ReactNode } from "react";
export type SelectProps<T> = ButtonProps & {
    icon?: string;
    label?: string;
    value?: T | T[];
    options?: T[];
    onSelect?: (options: T) => void;
    getKey?: (options: T) => string;
    render?: (options: T) => ReactNode;
};
export default function Select<T>({ icon, label, options, onSelect, getKey, render, ...props }: SelectProps<T>): any;
//# sourceMappingURL=select.d.ts.map