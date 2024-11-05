import { PropsWithChildren, createContext, useContext } from "react"

export type ScopeProps = { path?: string, scope: ( name?: string ) => string }

const Context = createContext<ScopeProps>( { path: undefined, scope: x => x || "" } )

export function useScope () {
    return useContext( Context )
}

export function Scope ( { children, path }: Partial<ScopeProps> & PropsWithChildren ) {
    const { path: parentPath } = useScope()
    return <Context.Provider value={ {
        scope: name => [ parentPath, path, name ].filter( Boolean ).join( "." ),
        path: [ parentPath, path ].filter( Boolean ).join( "." ) || undefined,
    } }>{ children }</Context.Provider>
}
