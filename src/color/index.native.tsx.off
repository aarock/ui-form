import ColorPickerBase, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker'
import { styled } from '@tamagui/core'
import { ColorProps } from '.'

export const ColorPicker = styled( ColorPickerBase, {
    name: 'ColorPicker',
    display: "flex",
    borderRadius: 0,
    flexGrow: 1,
} as const ) as any

export function Color ( { value, hasAlpha, swatches, onValueChange, ...rest }: ColorProps ) {
    const hasSwatches = !!swatches?.length
    const onSelectColor = ( { hex } ) => {
        "worklet"
        onValueChange?.( hex )
    }
    return <ColorPicker
        value={ value }
        onComplete={ onSelectColor }
        { ...rest }
    >
        <Preview />
        <Panel1 />
        <HueSlider />
        { hasAlpha && <OpacitySlider /> }
        { hasSwatches && <Swatches colors={ swatches } /> }
    </ColorPicker>
}