import { ControllerRenderProps, ControllerFieldState } from "react-hook-form";
import { ReactNode } from "react";
import { FormContext } from "./form.js";
export type FieldRenderProps = {
    value: ControllerRenderProps<any, any>['value'];
    onBlur: ControllerRenderProps<any, any>['onBlur'];
    onValueChange: ControllerRenderProps<any, any>['onChange'];
    insert: (item: any) => void;
    remove: (atIndex: number) => void;
    set: FormContext<any>['setValue'];
};
export type FieldState = Omit<ControllerFieldState, "invalid"> & {
    isInvalid: ControllerFieldState["invalid"];
};
export type FieldProps = {
    name: string;
    isRequired?: boolean;
    render?: (props: FieldRenderProps, state: FieldState) => ReactNode;
};
export declare function Field({ name, isRequired, render }: FieldProps): any;
export declare function key(): string;
export declare function keymap<T>(arr: T[]): T[];
//# sourceMappingURL=field.d.ts.map