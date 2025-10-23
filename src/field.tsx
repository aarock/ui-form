import { ReactNode } from "react"
import { Controller, ControllerRenderProps, ControllerFieldState, UseFormStateReturn, FieldValues } from "react-hook-form"
import { useScope } from "./scope.js"
import { FormContext, useForm } from "./form.js"

export type FieldRenderProps = {
  value: ControllerRenderProps<any, any>[ 'value' ]
  onBlur: ControllerRenderProps<any, any>[ 'onBlur' ]
  onValueChange: ControllerRenderProps<any, any>[ 'onChange' ]
  state: UseFormStateReturn<FieldValues>
  insert: ( item: any ) => void
  remove: ( atIndex: number ) => void
  set: FormContext<any>[ 'setValue' ]
}

export type FieldState = Omit<ControllerFieldState, "invalid"> & {
  isInvalid: ControllerFieldState[ "invalid" ]
}

export type FieldProps = {
  name: string
  isRequired?: boolean
  // onValueChange: ControllerRenderProps<any, any>[ 'onChange' ]
  render?: ( props: FieldRenderProps, state: FieldState ) => ReactNode
}

export function Field ( { name, isRequired, render }: FieldProps ) {
  const { scope } = useScope()
  const form = useForm()
  const watched = form?.watch( scope( name ) )
  if ( !form ) return null
  return <Controller
    name={ scope( name ) }
    control={ form.control }
    rules={ { required: isRequired } }
    render={ ( { field, fieldState, formState } ) => {
      // const onBaseValueChange = ( ...params: any[] ) => {
        // field.onChange( ...params )
        // onValueChange?.( ...params )
      // }
      return <>{ render?.( {
        value: watched,
        state: formState,
        onBlur: field.onBlur,
        onValueChange: field.onChange,
        insert: ( items: any[], atIndex?: number ) => field.onChange( watched?.toSpliced?.( atIndex ?? watched.length, 0, ...keymap( items ) ) || keymap( items ) ),
        remove: ( atIndex: number ) => field.onChange( watched?.toSpliced?.( atIndex, 1 ) || [] ),
        set: form.setValue,
      }, {
        isInvalid: fieldState.invalid,
        isDirty: fieldState.isDirty,
        isTouched: fieldState.isTouched,
        isValidating: fieldState.isValidating,
      } ) }</>
    } }
  />
}

export function key () {
  return `${ Math.random() }`.slice( 2 )
}

export function keymap<T> ( arr: T[] ): T[] {
  return arr.map( t => {
    Object.assign( t as any, { key: key() } )
    return t
  } )
}
