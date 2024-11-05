import { Box, Button, ButtonProps, Floating } from "@aarock/ui-core"
import { List } from "./list"
import { ReactNode } from "react"

export type SelectProps<T> = ButtonProps & {
    icon?: string
    label?: string
    value?: T | T[]
    options?: T[]
    onSelect?: ( options: T ) => void
    getKey?: ( options: T ) => string
    render?: ( options: T ) => ReactNode
}

export default function Select<T> ( { icon, label, options, onSelect, getKey, render, ...props }: SelectProps<T> ) {
    return <Floating
        edgeOffset={ 4 }
        triggerOffset={ 4 }
        isClickable
        placement="bottom">
        <Floating.Trigger>
            <Button size="$sm" { ...props }>
                { !!icon && <Button.Icon size="$sm" color="$neutral9" name={ icon } /> }
                { !!label && <Button.Label>{ label }</Button.Label> }
                <Button.Spacer />
                <Button.Icon size="$sm" color="$neutral9" name="chevrons-vertical" />
            </Button>
        </Floating.Trigger>
        <Floating.Content>
            <Box position="absolute" zIndex={ 500 }>
                <List>{ options?.map( ( option, i ) => <List.Item
                    key={ getKey?.( option ) || i }
                    children={ render?.( option ) }
                    justifyContent="center"
                    onPress={ () => onSelect?.( option ) }
                /> ) }</List>
            </Box>
        </Floating.Content>
    </Floating>
}