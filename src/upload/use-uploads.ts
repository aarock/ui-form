import { useCallback, useEffect, useState } from "react"
import Upload, { CalculateETag, ChunkFile, PresignFile, UploadsOptions } from "./upload.class.js"

export type UseUploads = [
    uploads: Upload[],
    onFiles: ( files?: FileList | File[] | null ) => void,
]

export default function useUploads (
  presign: PresignFile,
  options?: UploadsOptions
): UseUploads {

    const [ uploads, setUploads ] = useState<Upload[]>( [] )
    const [ dismissed, setDismissed ] = useState<Upload[]>( [] )

    useEffect( () => {
        const incomplete = uploads.filter( u => !u.isComplete )
        const pending = incomplete.filter( u => u.isPending )
        const next = incomplete.filter( u => !u.isPending )
        const limit = Math.min( ( options?.maxConcurrentUploads || Infinity ) - pending.length, next.length )
        const set = next.slice( 0, limit )
        uploads.forEach(upload => {
            upload.onAbort( () => setUploads( uploads => uploads.filter( u => u !== upload ) ) )
            upload.onDismiss( () => setDismissed( dismissed => [ ...dismissed, upload ] ) )
            upload.onComplete( () => options?.onComplete?.( upload ) )
        })
        set.forEach( upload => {
            upload.send()
        } )
    }, [ uploads ] )

    const onFiles = useCallback( async ( files?: FileList | File[] | null ) => {
        const validFiles = Array.from( files || [] ).filter( Boolean )
        const newUploads = validFiles.map( file => new Upload( file, presign, options ) )
        return Promise.all( newUploads.map( upload => upload.presign() ) )
          .then( () => newUploads.length && setUploads( acc => [ ...acc, ...newUploads ] ) )
          .catch( options?.onError )
    }, [
        uploads,
        JSON.stringify(options),
        options?.onError,
    ] )

    return [
        uploads.filter( upload => !dismissed.includes( upload ) ),
        onFiles,
    ]

}
