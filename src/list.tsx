import { Button, ButtonProps, Text, TextProps, YStack, YStackProps, useFloatingContext } from "@aarock/ui-core"

export function List ( props: YStackProps ) {
    return <YStack
        p={ 4 }
        gap={ 1 }
        bg="$neutral1"
        borderRadius="$sm"
        borderColor="$neutral6"
        borderWidth={ 1 }

        shadowColor="$shadow2"
        shadowRadius={ 4 }
        shadowOffset={ { width: 0, height: 2 } }

        { ...props }
    />
}

type ListItemProps = { isSelected?: boolean }
function ListItem ( { children, isSelected, onPress, ...props }: ButtonProps & ListItemProps ) {
    const { setOpen } = useFloatingContext()
    return <Button size="$sm" borderRadius="$sm" variant="option" { ...props } isActive={ isSelected } onPress={ event => {
        setOpen( false )
        onPress?.( event )
    } }>
        <Button.Label children={ children } />
    </Button>
}

function ListText ( { ...props }: TextProps ) {
    return <Text fontSize={ 14 } borderRadius="$sm" { ...props } />
}

List.Item = ListItem
List.Text = ListText