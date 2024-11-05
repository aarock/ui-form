// import upload, { ChunkProgressCallback, UploadResult } from "./upload"

import { DragEvent, MouseEvent, useCallback, useState } from "react"
import {
  Button, type ButtonProps,
  YStack, type YStackProps,
  Text, type TextProps,
} from "@aarock/ui-core"

export type UploadDropZoneProps = YStackProps & {
    types?: string[]
    onFiles?: ( files: FileList | File[] ) => void
    buttonProps?: Partial<Omit<ButtonProps, "onPress">>
    messageProps?: Partial<TextProps>
}

export default function UploadDropZone ( {
    types,
    onFiles,
    buttonProps,
    messageProps,
    ...props
}: UploadDropZoneProps ) {

    const [ isDraggedOver, setDraggedOver ] = useState<boolean>( false )

    const onPressChoose = useCallback( () => {
        pick( types )
            .then( onFiles )
            .catch( () => { } )
    }, [ JSON.stringify( types ), onFiles ] )

    const onDragOver = useCallback( ( e: DragEvent<HTMLDivElement> ) => {
        e.preventDefault()
        setDraggedOver( true )
    }, [] )

    const onDragLeave = useCallback( ( e: DragEvent<HTMLDivElement> ) => {
        e.preventDefault()
        setDraggedOver( false )
    }, [] )

    const onDrop = useCallback( ( e: DragEvent<HTMLDivElement> ) => {
        e.preventDefault()
        setDraggedOver( false )
        const files = e.dataTransfer.files
        if ( files ) onFiles?.( files )
    }, [ onFiles ] )

    return <YStack
        flexGrow={1}

        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
        //@ts-ignore
        onDragOver={ onDragOver }
        //@ts-ignore
        onDragLeave={ onDragLeave }
        //@ts-ignore
        onDrop={ onDrop }
        // padding={ isDraggedOver ? 10 : 0 }
        // style={ {
        //     transition: "padding 100ms ease-out",
        //     padding: isDraggedOver ? 10 : 0
        // } }
        { ...props }
    >
        <Button variant="ghost" onPress={ onPressChoose } { ...buttonProps }>
          <Button.Icon name="upload" />
          <Button.Label children="Choose a file" />
        </Button>
        <Text p="$sm" color="$neutral10" children="Or drag and drop to upload..." { ...messageProps } />
    </YStack>
}

async function pick ( types?: string[] ): Promise<File[]> {
    return getDocumentAsync( types?.join(",") ).then( ( files ) => {
        return Array.from( files || [] ).filter( Boolean )
    } )
}

function getDocumentAsync ( accept?:string ): Promise<FileList | void> {

    var input = document?.createElement( 'input' )
    if (accept) input.accept = accept
    input.type = 'file'
    input.multiple = true

    return new Promise<FileList>( ( res, rej ) => {
        input.onchange = () => { res( input.files || new FileList() ) }
        input.onabort = () => rej( new Error( "Cancelled" ) )
        input.click()
    } )


}
