import { PropsWithChildren } from "react";
export type ScopeProps = {
    path?: string;
    scope: (name?: string) => string;
};
export declare function useScope(): any;
export declare function Scope({ children, path }: Partial<ScopeProps> & PropsWithChildren): any;
//# sourceMappingURL=scope.d.ts.map