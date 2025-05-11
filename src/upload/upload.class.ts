import { PresignAccessError, UploadAbortedError, UploadAbortFailedError, UploadError, UploadIncompleteError } from "./errors.js"
import { Queue, retry, RetryAbortedError } from "./utils.js"
import war from 'crypto-js/lib-typedarrays.js'
import md5 from 'crypto-js/md5.js'

export const MIN_CHUNK_SIZE = 1024 * 1024 * 5
export const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 8
export const DEFAULT_RETRY_COUNT = 10
export const DEFAULT_RETRY_INTERVAL = 1000
export const DEFAULT_VARIABLE_ACCESS: PresignedVariableAccess<any> = ( file, eTags ) => ( { name: file.name, parts: eTags.length } )
export const DEFAULT_RESULT_ACCESS: PresignedResultAccess<any> = ( data ) => {
    if ( !!data.data ) for ( let key in data.data ) {
        if ( data.data[ key ][ 'key' ] ) return data.data[ key ]
    }
    return data
}
export const DEFAULT_CHUNK_FILE: ChunkFile = ( file, pos, _len, end ) => Promise.resolve( file.slice( pos, end ) )
export const DEFAULT_CALCULATE_ETAG: CalculateETag = async ( blob ) => {
    const arrayBuffer = await blob.arrayBuffer() as any
    const wordArray = war.create( arrayBuffer )
    return md5( wordArray ).toString()
}

export type PresignedVariableAccess<MV> = ( file: File, eTags: string[] ) => MV
export type PresignedResultAccess<M> = ( res: M ) => PresignResult | undefined
export type PresignFile = ( file: File, eTags: string[] ) => Promise<PresignResult | undefined>
export type ChunkFile = ( file: File | Blob, pos: number, len: number, end: number ) => Promise<Blob>
export type CalculateETag = ( blob: Blob ) => Promise<string>

export type PresignResult = {
    key: string
    uploadUrls: string[]
    publicUrl: string
    privateUrl: string
    abortUrl?: string | null
    completeUrl?: string | null
}

export default class Upload {

    public name: string = ""
    public size: number = 0
    public type: string = ""

    public id: string = ""
    public key: string = ""
    public keyPath: string = ""
    public keyName: string = ""

    public uploadUrls: string[] = []
    public completeUrl?: string
    public abortUrl?: string
    public publicUrl: string = ""
    public privateUrl: string = ""

    public chunkSize: number = DEFAULT_CHUNK_SIZE
    public chunkFile: ChunkFile = DEFAULT_CHUNK_FILE
    public calculateETag: CalculateETag = DEFAULT_CALCULATE_ETAG
    public autoRetryCount: number = DEFAULT_RETRY_COUNT
    public autoRetryIntervalMs: number = DEFAULT_RETRY_INTERVAL

    public parts: number = 0
    public eTags: string[] = []
    public blobs: Blob[] = []
    public chunks: Chunk[] = []
    public queue: Queue<void> = new Queue()

    public isReady: boolean = false
    public isPaused: boolean = false
    public isComplete: boolean = false
    public isPending: boolean = false
    public isAborted: boolean = false

    public progress: number = 0
    public error?: Error

    constructor ( public file: File, public presignFile: PresignFile, public options?: UploadsOptions ) {
        this.name = this.file.name
        this.size = this.file.size
        this.type = this.file.type
        this.chunkSize = Math.max( MIN_CHUNK_SIZE, options?.chunkSize || DEFAULT_CHUNK_SIZE )
        this.chunkFile = options?.chunkFile || DEFAULT_CHUNK_FILE
        this.calculateETag = options?.calculateETag || DEFAULT_CALCULATE_ETAG
        this.autoRetryCount = options?.autoRetryCount || DEFAULT_RETRY_COUNT
        this.autoRetryIntervalMs = options?.autoRetryIntervalMs || DEFAULT_RETRY_INTERVAL
        this.parts = Math.ceil( file.size / this.chunkSize )
    }

    public presign = async () => {

      for ( let i = 0; i < this.parts; i++ ) {
          const start = i * this.chunkSize
          const len = ( start + this.chunkSize ) >= this.file.size ? this.file.size - start : this.chunkSize
          const end = ( start + this.chunkSize ) >= this.file.size ? this.file.size : start + this.chunkSize
          const blob = await this.chunkFile( this.file, start, len, end )
          const eTag = await this.calculateETag( blob )
          this.blobs.push( blob )
          this.eTags.push( eTag )
      }

      console.log("PRESIGN", this, this.presignFile )

      return this.presignFile( this.file, this.eTags ).then( res => {
        console.log("PRESIGNED",res)
        if ( !res || !res.key || !res.uploadUrls.length ) throw new PresignAccessError()
        const { key, uploadUrls, abortUrl, completeUrl, privateUrl, publicUrl } = res
        const keyParts = key?.split( "/" ) || [ "" ]
        this.isReady = true
        this.id = key
        this.key = key
        this.keyPath = keyParts.length > 1 ? keyParts.slice( 0, -1 ).join( "/" ) : ""
        this.keyName = keyParts.pop() || key || ""
        this.uploadUrls = uploadUrls
        this.publicUrl = publicUrl
        this.privateUrl = privateUrl
        this.completeUrl = completeUrl || undefined
        this.abortUrl = abortUrl || undefined
        this.chunks = uploadUrls.map( ( url, i ) => new Chunk( url, this.blobs[ i ] ) )
      } ).catch( err => {
          console.warn(err)
          this.triggerError( err )
          throw err
      } )
    }

    public send = async () => {

        if ( this.isPending ) this.triggerResume()
        else this.isPending = true
        this.chunks.forEach( chunk => {

            if ( !!chunk.isComplete ) return Promise.resolve()
            this.queue.enqueue( async () => {
                if ( this.isAborted ) throw new UploadAbortedError()
                await chunk.send().then( () => this.triggerProgress() ).catch( err => {
                    this.isPending = false
                    // we re-throw the error here to let the queue catch
                    // it so that we dont try to continue sending more
                    // chunks if previous ones fail. The user should
                    // be given the option to manually retry...
                    throw err
                } )
            } )

        } )

        return this.queue.dequeue()
            .then( () => { this.complete() } )
            .catch( ( err ) => {
                if ( err.name !== "QueueAbortedError" ) this.triggerError( err )
            } )
    }

    public pause = async () => {
        this.queue.abort()
        this.triggerPause()
    }

    public abort = async () => {
        this.chunks.forEach( chunk => chunk.abort() )
        this.queue.abort()
        this.triggerAbort()
        if ( !this.abortUrl ) throw new UploadAbortedError()
        return fetch( this.abortUrl, { method: "DELETE" } )
            .then( _res => { throw new UploadAbortedError() } )
            .catch( err => { throw new UploadAbortFailedError( err.message ) } )
            .catch( this.triggerError )
    }
    
    public dismiss = async () => {
        this.triggerDismiss()
    }

    private async complete () {
        if ( !this.completeUrl ) return Promise.resolve( this.triggerComplete() )
        return fetch( this.completeUrl, {
            method: "POST",
            body: `<?xml version="1.0" encoding="UTF-8"?>\n`
                + `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">\n`
                + this.eTags.map( ( tag, i ) => `<Part><ETag>${ tag }</ETag><PartNumber>${ i + 1 }</PartNumber></Part>` ).join( '\n' )
                + `</CompleteMultipartUpload>`
        } ).then( res => {
            if ( !res.ok ) throw new UploadIncompleteError( res.statusText )
            this.triggerComplete()
        } )
    }

    private progressCB?: ( pct: number ) => void
    public onProgress = ( cb?: ( pct: number ) => void ) => { this.progressCB = cb }
    private triggerProgress () {
        this.progress = Math.floor( 100 * this.chunks.filter( c => c.isComplete ).length / this.chunks.length )
        if ( this.progressCB ) this.progressCB?.( this.progress )
    }

    private pauseCB?: () => void
    public onPause = ( cb?: () => void ) => { this.pauseCB = cb }
    private triggerPause = () => {
        this.isPending = true
        if ( this.pauseCB ) this.pauseCB?.()
    }

    private resumeCB?: () => void
    public onResume = ( cb?: () => void ) => { this.resumeCB = cb }
    private triggerResume = () => {
        this.isPending = false
        if ( this.resumeCB ) this.resumeCB?.()
    }

    private abortCB?: () => void
    public onAbort = ( cb?: () => void ) => { this.abortCB = cb }
    private triggerAbort = () => {
        this.progress = 0
        this.isComplete = false
        this.isPending = true
        this.isAborted = true
        if ( this.abortCB ) this.abortCB?.()
    }
    
    private dismissCB?: () => void
    public onDismiss = ( cb?: () => void ) => { this.dismissCB = cb }
    private triggerDismiss = () => {
        if ( this.isComplete && this.dismissCB ) this.dismissCB?.()
    }

    private completeCB?: ( upload: Upload ) => void
    public onComplete = ( cb?: ( upload: Upload ) => void ) => { this.completeCB = cb }
    private triggerComplete = () => {
        this.isComplete = true
        this.isPending = false
        if ( this.completeCB ) this.completeCB?.( this )
    }

    private errorCB?: ( err: Error ) => void
    public onError = ( cb?: ( err: Error ) => void ) => { this.errorCB = cb }
    private triggerError = ( err: Error ) => {
        this.isComplete = false
        this.isPending = false
        if ( this.errorCB ) this.errorCB?.( err )
    }
}

export type UploadsOptions = {
    calculateETag?: CalculateETag,
    chunkFile?: ChunkFile,
    chunkSize?: number,
    autoRetryCount?: number,
    autoRetryIntervalMs?: number
    maxConcurrentUploads?: number,
    onError?: ( err?: Error ) => void,
    onComplete?: ( upload: Upload ) => void,
}

export class Chunk {

    public isAborted: boolean = false
    public isComplete: boolean = false
    public isPending: boolean = false

    constructor (
        public uploadUrl: string,
        public blob: Blob,
        private autoRetryCount: number = DEFAULT_RETRY_COUNT,
        private autoRetryIntervalMs: number = DEFAULT_RETRY_INTERVAL,
    ) { }

    async send () {
        this.isPending = true
        return retry( async () => {
            if ( this.isAborted ) throw new RetryAbortedError()
            return fetch( this.uploadUrl, {
                method: "PUT",
                body: this.blob
            } ).then( res => {
                if ( !res.ok ) throw new UploadError( res.statusText )
                this.isComplete = true
                this.isPending = false
            } )
        }, this.autoRetryIntervalMs, this.autoRetryCount )
            .catch( err => {
                this.isComplete = false
                this.isPending = false
                throw err
            } )
    }

    public abort () {
        this.isAborted = true
        this.autoRetryCount = 0
    }

}

// export interface IUpload {
//     name: string
//     size: number
//     type: string

//     id: string
//     key: string
//     keyPath: string
//     keyName: string
//     abortUrl: string
//     completeUrl: string
//     publicUrl: string
//     privateUrl: string
//     uploadUrls: string[]

//     isReady: boolean
//     isPaused: boolean
//     isComplete: boolean
//     isPending: boolean
//     isAborted: boolean

//     progress: number
//     error?: Error
// }
