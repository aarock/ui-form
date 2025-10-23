import type { AnyVariables, UseQueryExecute, UseQueryResponse, UseMutationResponse, OperationResult } from "urql"
import { useForm as useFormBase, FieldValues, UseFormReturn, DefaultValues } from "react-hook-form"
import { ReactNode, createContext, useCallback, useContext } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ZodType as Schema } from "zod"


export type FormContext<T extends FieldValues> = UseFormReturn<T>
const Context = createContext<FormContext<any>|undefined>( undefined )
export function useForm () { return useContext( Context ) }

export type FormProps<
  T extends FieldValues,
  Q, QV extends AnyVariables,
  M, MV extends AnyVariables,
> = {
  // useQuery: ( options: Omit<UseQueryArgs<QV>,"query"> ) => UseQueryResponse<Q,QV>
  // variables: UseQueryArgs<QV>
  query: UseQueryResponse<Q,QV>
  mutation: UseMutationResponse<M,MV>
  valueAccess: ( res: Q ) => T,
  eventAccess: ( res: M ) => Event,
  schema?: Schema
  isNew?: boolean
  additionalTypenames?: string[],
  defaultValue?: DefaultValues<T>
  onError?: (error:Error) => void
  onComplete?: (input:T, event:Event, original: T ) => void
  render?: (value:T, props:FormRenderProps<T> ) => ReactNode
}

export type Event = {
  id?: string;
  sourceId?: string;
  sourceDiff?: any;
  isDraft?: boolean;
  isPending?: boolean;
  isUndone?: boolean;
}

export type ExtendedOperationResult<M, MV extends AnyVariables> = OperationResult<M, MV> & { errors?:Error[] }

export type FormRenderProps<T extends FieldValues> = UseFormReturn<T> & {
  onReset: () => void
  onSubmit: () => void
}

export function Form<
  T extends FieldValues,
  Q, QV extends AnyVariables,
  M, MV extends AnyVariables,
> ( {
  query,
  mutation,
  valueAccess,
  eventAccess,
  schema,

  isNew,
  onError,
  onComplete,
  render,
  defaultValue = {} as DefaultValues<T>,
  additionalTypenames = []
}: FormProps<T,Q,QV,M,MV> ) {
  
  const [ , save ] = mutation
  const [ { data, fetching, error }, refetch ] = query
  const original = data ? valueAccess( data ) : undefined
  const value = isNew ? defaultValue as T : original
  
  const resolver = schema ? zodResolver( schema as any ) : undefined
  const form = useFormBase<T>( { resolver, defaultValues: defaultValue, values: value } )

  const watched = form.watch()

    const onBaseSubmit = useCallback((input: T) => {
      return save({ input } as unknown as MV, { additionalTypenames }).then( (result: ExtendedOperationResult<M, MV> & { errors?:Error[] }) => {
          const data = result.data
          const errors = result.error ? [result.error] : result.errors || []
          errors?.forEach( ({ name = "Error", message }) => {
            const error = new Error(message)
            error.name = name
            throw error
          } )
          if( data ) onComplete?.( input, eventAccess(data), value || defaultValue as T )
        } )
        .catch( onError )
    }, [ value ] )

    const onSubmit = useCallback( () => form.handleSubmit( onBaseSubmit, console.warn )(), [ onBaseSubmit ] )
    const onReset = useCallback( () => form.reset(), [] )

    if( !value ) return <></>

    return <Context.Provider value={ form }>
      <form style={ { display: "flex", flexGrow: 1 } }
      onError={ console.warn }
      onSubmit={ event =>{
        event.preventDefault()
        event.stopPropagation()
        onSubmit()
      } } >{ render?.( watched, { ...form, onSubmit, onReset } ) }</form>
    </Context.Provider>
}
