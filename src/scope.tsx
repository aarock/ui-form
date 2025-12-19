import { PropsWithChildren, createContext, useContext, Context as TContext } from "react"
// import { Path } from "react-hook-form"

export type ScopeProps<T> = { path?: string, scope: ( name?: string ) => unknown }

const Context = createContext<ScopeProps<any>>( { path: undefined, scope: x => x || "" } )

export function useScope<T>(): ScopeProps<T> {
    return useContext( Context as unknown as TContext<ScopeProps<T>> )
}

export function Scope<T>( { children, path }: Partial<ScopeProps<T>> & PropsWithChildren ) {
    const { path: parentPath } = useScope<T>()
    return <Context.Provider value={ {
        scope: name => [ parentPath, path, name ].filter( Boolean ).join( "." ),
        path: [ parentPath, path ].filter( Boolean ).join( "." ) || undefined,
    } }>{ children }</Context.Provider>
}
