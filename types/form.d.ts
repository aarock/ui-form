import type { AnyVariables, UseQueryResponse, UseMutationResponse, OperationResult } from "urql";
import { FieldValues, UseFormReturn, DefaultValues } from "react-hook-form";
import { ReactNode } from "react";
import { Schema } from "zod";
export type FormContext<T extends FieldValues> = UseFormReturn<T>;
export declare function useForm(): any;
export type FormProps<T extends FieldValues, Q, QV extends AnyVariables, M, MV extends AnyVariables> = {
    query: UseQueryResponse<Q, QV>;
    mutation: UseMutationResponse<M, MV>;
    valueAccess: (res: Q) => T;
    eventAccess: (res: M) => Event;
    schema?: Schema;
    isNew?: boolean;
    additionalTypenames?: string[];
    defaultValue?: DefaultValues<T>;
    onError?: (error: Error) => void;
    onComplete?: (input: T, event: Event, original: T) => void;
    render?: (value: T, props: FormRenderProps<T>) => ReactNode;
};
export type Event = {
    id?: string;
    sourceId?: string;
    sourceDiff?: any;
    isDraft?: boolean;
    isPending?: boolean;
    isUndone?: boolean;
};
export type ExtendedOperationResult<M, MV extends AnyVariables> = OperationResult<M, MV> & {
    errors?: Error[];
};
export type FormRenderProps<T extends FieldValues> = UseFormReturn<T> & {
    onReset: () => void;
    onSubmit: () => void;
};
export declare function Form<T extends FieldValues, Q, QV extends AnyVariables, M, MV extends AnyVariables>({ query, mutation, valueAccess, eventAccess, schema, isNew, onError, onComplete, render, defaultValue, additionalTypenames }: FormProps<T, Q, QV, M, MV>): any;
//# sourceMappingURL=form.d.ts.map