import { default as dayjs } from "dayjs"
import { Blur, Box, Button, ButtonProps, Floating } from "@aarock/ui-core"
import { Calendar } from "./calendar.js"

export type DateFieldProps = ButtonProps & {
    icon?: string
    format?: string
    value?: string
    onValueChange?: ( newValue: string ) => void
}

export default function DateField ( {
    icon = "calendar",
    value = "2000-01-01",
    format = "YYYY-MM-DD",
    onValueChange,
    ...props
}: DateFieldProps ) {

    const day = dayjs( value )

    return <Floating
        edgeOffset={ 4 }
        triggerOffset={ 4 }
        isClickable
        placement="bottom">
        <Floating.Trigger>
            <Button size="$sm" { ...props }>
                { !!icon && <Button.Icon size="$sm" color="$neutral9" name={ icon } /> }
                { !!day?.isValid() && <Button.Label>{ day.format( format ) }</Button.Label> }
                <Button.Spacer />
                <Button.Icon size="$sm" color="$neutral9" name="chevrons-vertical" />
            </Button>
        </Floating.Trigger>
        <Floating.Content>
            <Blur
                position="absolute"
                borderRadius="$md"
                borderColor="$neutral6"
                borderWidth={ 1 }
                variant="strong"
                p="$md"
            >
                <Calendar value={ value } onValueChange={ onValueChange } />
            </Blur>
        </Floating.Content>
    </Floating>
}