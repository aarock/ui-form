import { AnyVariables, UseQueryArgs, UseQueryResponse } from "urql";
import { ReactNode } from "react";
import { ControllerFieldState, ControllerRenderProps, DefaultValues, FieldValues, UseFormStateReturn } from "react-hook-form";
export type LazyPropsQueryOptions<QV extends AnyVariables> = Omit<UseQueryArgs<QV>, "query">;
export type LazyProps<T extends FieldValues, Q, QV extends AnyVariables> = {
    scope?: string;
    isNew?: boolean;
    useQuery: (options: LazyPropsQueryOptions<QV>) => UseQueryResponse<Q, QV>;
    variables: LazyPropsQueryOptions<QV>['variables'];
    valueAccess: (res: Q) => T;
    defaultValue?: DefaultValues<T>;
    render?: (field: LazyRenderProps<T>, fieldState: ControllerFieldState, formState: UseFormStateReturn<T>) => ReactNode;
};
export type LazyRenderProps<T extends FieldValues> = {
    value: T;
    onValueChange: ControllerRenderProps<T>['onChange'];
    onBlur: ControllerRenderProps<T>['onBlur'];
};
export declare function Lazy<T extends FieldValues, Q, QV extends AnyVariables>({ scope: scopePath, isNew, defaultValue, useQuery, variables, valueAccess, render }: LazyProps<T, Q, QV>): any;
//# sourceMappingURL=lazy.d.ts.map