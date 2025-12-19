import { createFormHookContexts, createFormHook, useStore, revalidateLogic, type AnyFormApi, UpdateMetaOptions } from '@tanstack/react-form'
import { useContext, type ReactNode } from 'react'
import { useScope } from "./scope.js"
import { type ZodType } from "zod/v3"

const { fieldContext, formContext, useFormContext: _useFormContext } = createFormHookContexts()
const { useAppForm } = createFormHook( { fieldContext, formContext, fieldComponents: {}, formComponents: {} } )
export const useFormContext = _useFormContext

export type Meta = {
  isDirty: boolean,
  isPristine: boolean,
  isTouched: boolean,
  isBlurred: boolean,
  isValid: boolean,
  isValidating: boolean,
  isSubmitted: boolean,
  isSubmitting: boolean,
}

export type Selector<T, SelectorResult> = ( state: T, meta: Meta ) => SelectorResult

export type FieldRenderProps<T> = { value: T, onValueChange: ( value: T ) => void }

export type FieldRenderEntry<T extends any[] | null | undefined> = NonNullable<T>[ number ]

export type FieldRenderUtils<T> = {
  get: ( name: string ) => unknown,
  set: ( name: string, value: unknown, opts?: UpdateMetaOptions ) => void
  insert: ( value: T extends Array<any> ? T[ number ] : never, index?: number ) => void
  remove: ( i: number ) => void
  reorder: ( from: number, to: number ) => void
}

export type FieldProps<T> = {
  name: string,
  defaultValue?: T,
  render?: (
    props: FieldRenderProps<T>,
    utils: FieldRenderUtils<T>
  ) => ReactNode
}

export function useForm<T> (
  defaultValue?: T,
  schema?: ZodType<any>,
  onSubmit?: ( input: T ) => void,
  onInvalid?: ( input: T ) => void,
) {

  const appForm = useAppForm( {
    defaultValues: defaultValue,
    validators: { onDynamic: schema as any },
    validationLogic: revalidateLogic(),
    onSubmit: ( { value } ) => onSubmit?.( schema?.parse( value ) || value ),
    onSubmitInvalid: ( { value } ) => onInvalid?.( value ),
  } )
  return [ appForm, formContext.Provider ] as const
}

export function useField<T, S> ( selector: Selector<T, S>, form?: AnyFormApi ): ReturnType<Selector<T, S>> {
  const { path } = useScope()
  const contextForm = useContext( formContext )
  const manualForm = form || contextForm
  if ( !manualForm?.store ) throw new Error( "useField must be called within a FormProvider or be passed a form as the second parameter." )
  return useStore( manualForm.store, state => selector( stateValueByDeepKey( state, path ), simplifyState( state ) as Meta ) )
}

export function useMeta ( form?: AnyFormApi ): Meta {
  const contextForm = useContext( formContext )
  const manualForm = form || contextForm
  if ( !manualForm?.store ) throw new Error( "useMeta must be called within a FormProvider or be passed a form as the second parameter." )
  return useStore( manualForm.store, state => simplifyState( state ) as Meta )
}

export function Field<T> ( { name, defaultValue, render }: FieldProps<T> ) {
  const { scope } = useScope()
  const form = useFormContext()
  return <form.Field
    name={ scope( name as string ) as never }
    defaultValue={ defaultValue as never }
  >{ field => {
    const value = field.state.value as T
    const valueArray = ( value || [] ) as any[]
    const lastIndex = Array.isArray( valueArray ) ? valueArray.length : 0
    return render?.( { value: value, onValueChange: val => field.handleChange( val as any ) }, {
      get: ( name ) => form.getFieldValue( scope( name as string ) as never ),
      set: ( name, value, opts ) => form.setFieldValue( scope( name as string ) as never, value as any, opts ),
      remove: ( index: number ) => { field.handleChange( valueArray?.toSpliced?.( index, 1 ) as never ) },
      insert: ( value: T, index: number = lastIndex ) => {
        console.log( value, lastIndex, valueArray, valueArray?.toSpliced?.( index, 0, value ) )
        field.handleChange( valueArray?.toSpliced?.( index, 0, value ) as never )
      },
      reorder: ( from: number, to: number ) => { field.handleChange( valueArray?.toSpliced?.( to, 0, valueArray?.splice?.( from, 1 ) ) as never ) },
    } )
  } }</form.Field>
}

function stateValueByDeepKey ( state: any, deepKey?: string ) {
  return ( deepKey || "" )?.split( "." )
    .reduce( ( acc, key ) =>
      acc?.[ key ] ?? acc as any,
      state?.values as any
    )
}

function simplifyState ( state: any ): Meta {
  return {
    isDirty: !state.isDefaultValue,
    isPristine: state.isPristine,
    isTouched: state.isTouched,
    isBlurred: state.isBlurred,
    isValid: state.isValid,
    isValidating: state.isValidating,
    isSubmitted: state.isSubmitted,
    isSubmitting: state.isSubmitting,
  }
}

