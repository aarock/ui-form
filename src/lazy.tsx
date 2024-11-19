import { AnyVariables, OperationResult, UseQueryArgs, UseQueryResponse } from "urql"
import { ReactNode, useEffect, useRef, useState } from "react"
import { Controller, ControllerFieldState, ControllerRenderProps, DefaultValues, FieldValues, UseFormStateReturn } from "react-hook-form"
import { Scope, useScope } from "./scope.js"
import { useForm } from "./form.js"

export type LazyPropsQueryOptions<QV extends AnyVariables> = Omit<UseQueryArgs<QV>,"query">

export type LazyProps<T extends FieldValues,Q,QV extends AnyVariables> = {
  scope?:string
  isNew?: boolean
  useQuery: ( options: LazyPropsQueryOptions<QV> ) => UseQueryResponse<Q,QV>
  variables: LazyPropsQueryOptions<QV>['variables']
  valueAccess: ( res: Q ) => T,
  defaultValue?: DefaultValues<T>
  render?: (
    field: LazyRenderProps<T>,
    fieldState: ControllerFieldState,
    formState: UseFormStateReturn<FieldValues>,
  ) => ReactNode
}

export type LazyRenderProps<T extends FieldValues> = {
  value: T
  onValueChange: ControllerRenderProps<T>['onChange']
  onBlur: ControllerRenderProps<T>['onBlur']
}

export function Lazy<T extends FieldValues,Q,QV extends AnyVariables> ({
  scope: scopePath,
  isNew,
  defaultValue,
  useQuery,
  variables,
  valueAccess,
  render
}: LazyProps<T,Q,QV> ) {

  const form = useForm()
  const { scope } = useScope()
  const [ { data, fetching, error } ] = useQuery( { variables, pause: isNew } as LazyPropsQueryOptions<QV> )
  const value = data ? valueAccess( data ) : defaultValue as T

  if ( !form) return <></>
  if ( !isNew && error) return <>{ error.message }</>
  if ( !isNew && fetching ) return <></>
  if ( !isNew && !value ) return <></>

  return <Controller
    name={ scope(scopePath) }
    control={ form.control }
    defaultValue={ defaultValue as T }
    // rules={{ required: isRequired }}
    render={ ({ field, fieldState, formState }) => <Scope path={ scopePath }>
      <LazyChildren value={ value } field={ field }>{
        render?.( {
          value: field.value,
          onValueChange: field.onChange,
          onBlur: field.onBlur,
        }, fieldState, formState )
      }</LazyChildren>
    </Scope> }
  />

}

type LazyChildrenProps<T extends FieldValues> = {
  value: T,
  field: ControllerRenderProps<T>
  children?: ReactNode
}

function LazyChildren<T extends FieldValues>( { value, field, children } : LazyChildrenProps<T> ) {

  const valueRef = useRef( value || null)
  const [ lazyValue, setValue ] = useState<T>()

  useEffect( () => {
    field?.onChange( valueRef?.current )
    setValue( value )
  }, [value ] )

  if ( !lazyValue ) return <></>
  return children

}
