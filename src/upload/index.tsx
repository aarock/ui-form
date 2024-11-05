import { ReactNode, useState } from "react"
import { AnyVariables, UseQueryArgs, UseMutationResponse, OperationResult } from "urql"
import Upload, { PresignedVariableAccess, PresignedResultAccess, ChunkFile, DEFAULT_RESULT_ACCESS, DEFAULT_VARIABLE_ACCESS } from "./upload.class.js"
import UploadDropZone, { UploadDropZoneProps } from "./drop-zone.js"
import { YStack, type YStackProps, Text } from "@aarock/ui-core"
import useUploads from "./use-uploads.js"

export { default as Upload } from "./upload.class.js"
export type PresignOptions<MV extends AnyVariables> = Omit<UseQueryArgs<MV>,"query">
export type UploaderProps<M,MV extends AnyVariables> = YStackProps & {

    usePresignMutation: () => UseMutationResponse<M,MV>
    variableAccess?: PresignedVariableAccess<MV>
    resultAccess?: PresignedResultAccess<OperationResult<M,MV>>

    types?: string[]
    chunkSize?: number
    chunkFile?: ChunkFile
    onComplete?: ( upload: Upload ) => void
    dropZoneProps?: Partial<Omit<UploadDropZoneProps, "onFiles">>
    // fileProps?: Partial<Omit<UploadFileProps, "upload" | "onDismiss" | "onComplete">>

    maxFiles?: number
    isMultiple?: boolean
    render?: (uploads:Upload[]) => ReactNode
}

export function Uploader<M,MV extends AnyVariables> ( {
    types,
    maxFiles = Infinity,
    usePresignMutation,
    variableAccess = DEFAULT_VARIABLE_ACCESS,
    resultAccess = DEFAULT_RESULT_ACCESS,
    chunkSize,
    chunkFile,
    onComplete,
    dropZoneProps,
    // fileProps,
    render,
    ...props
}: UploaderProps<M,MV> ) {

    const [ uploaderError, setUploaderError ] = useState<Error>()
    const [ , presign ] = usePresignMutation()

    const [ uploads, onFiles ] = useUploads(
      ( file, eTags) => presign( variableAccess( file, eTags ) ).then( resultAccess ),
      { chunkSize, chunkFile, onComplete, onError: setUploaderError }
    )

    return <><YStack
        borderWidth={2}
        borderStyle="dashed"
        borderColor="$neutral5"
        borderRadius="$lg"
        overflow="hidden"
        padding="$sm"
        {...props}>

      {/*<Reveal>*/}
        { uploads.length < maxFiles && <UploadDropZone
          types={types}
          onFiles={ files => {
            setUploaderError(undefined)
            onFiles(files)
          } }
          {...dropZoneProps}
        /> }
      {/*</Reveal>*/}


      { render?.( uploads )  }

    </YStack>
    { !!uploaderError && <Text color="$danger9">{ uploaderError.message }</Text> }
    </>
}

// type CollapsableStackProps<T> = {
//     data?: T[]
//     keys?: ( item: T ) => number | string
//     renderItem?: ( item: T, index: number ) => ReactNode
// }

// function CollapsableStack<T> ( { data = [], keys, renderItem }: CollapsableStackProps<T> ) {

//     const transitions = useTransition( data, {
//         delay: 600,
//         from: { x: 0 },
//         enter: { x: 1 },
//         leave: { x: 0 },
//         config: config.stiff,
//         keys,
//     } )

//     return transitions( ( _springs, item, transition, index ) => {
//         return <CollapsableStackItem
//             item={ item }
//             data={ data }
//             key={ transition.key }
//             isOpen={ data.includes( item ) ? true : false }
//             children={ renderItem?.( item, index ) || null }
//             duration={ 2000 }
//         />
//     } )
// }

// const CollapsableStackItem = memo( ( props: any ) => {
//     return <Reveal { ...props } />
// } )
