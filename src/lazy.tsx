import { useEffect, useState } from "react"
import { AnyVariables, UseQueryArgs, UseQueryResponse } from "urql"
import { Field, FieldProps } from "./form.js"

export type LazyPropsQueryOptions<QV extends AnyVariables> = Omit<UseQueryArgs<QV>, "query">

export type LazyProps<T, Q, QV extends AnyVariables> = FieldProps<T> & {
  skip: boolean
  useQuery: ( options: LazyPropsQueryOptions<QV> ) => UseQueryResponse<Q, QV>
  variables: LazyPropsQueryOptions<QV>[ 'variables' ]
  access: ( res: Q ) => T,
}

export function Lazy<T, Q, QV extends AnyVariables> ( {
  skip,
  useQuery,
  variables,
  access,
  ...props
}: LazyProps<T, Q, QV> ) {

  const [ defaultValue, setDefaultValue ] = useState<T>()
  const pause = skip

  const [ { data, fetching, error } ] = useQuery( { variables, pause: skip } as LazyPropsQueryOptions<QV> )
  useEffect( () => { data && setDefaultValue( access( data ) ) }, [ data ] )

  if ( pause && fetching ) return null
  return <Field 
  // error={ error }
  // defaultValue={ defaultValue } 
  { ...props } 
  />

}