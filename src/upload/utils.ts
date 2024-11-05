
export type FunctionReturningPromise<T> = () => Promise<T>

export class QueueAbortedError extends Error {
    name = "QueueAbortedError"
    message = "The queue was aborted"
}
export class RetryAbortedError extends Error {
    name = "RetryAbortedError"
    message = "The retry handler was aborted"
}

export class Queue<T> {

    private isAborted: boolean = false
    private items: FunctionReturningPromise<T>[] = []

    constructor (
        // private onResolve?: ( value: T ) => void,
        // private onReject?: ( err: Error ) => void,
    ) { }

    async dequeue (): Promise<T | void> {
        // console.log( 'dequeue next of:', this.items.length )
        this.isAborted = false
        if ( !this.items[ 0 ] ) return Promise.resolve()
        return this.items[ 0 ]()
            // .then( r => this.onResolve?.( r ) )
            // .catch( err => this.onReject?.( err ) )
            .then( () => this.items.shift() )
            .then( () => {
                if ( this.isAborted ) throw new QueueAbortedError()
                return this.dequeue()
                // this.onReject?.( new QueueAbortedError() ) : this.dequeue()
            } )
    }

    public enqueue ( func: FunctionReturningPromise<T> ) {
        this.items.push( func )
    }

    public abort () {
        this.items = []
        this.isAborted = true
    }

}

export async function wait ( ms: number ) {
    return new Promise( r => setTimeout( r, ms ) )
}

export async function retry<T> ( fn: FunctionReturningPromise<T>, delay: number, retries: number, onRetry?: ( i: number ) => void ): Promise<T> {
    return new Promise( ( res, rej ) => {
        return fn().then( res ).catch( err => {
            if ( err.name === "RetryAbortError" ) return rej( err )
            if ( retries < 1 ) return rej( err )
            onRetry?.( retries )
            return wait( delay )
                .then( () => retry( fn, delay, retries - 1, onRetry ) )
                .then( res )
                .catch( rej )
        } )
    } )
}

// const goodAPICall = ( resp: string ) => new Promise<string>( ( resolve, reject ) => {
//     const time = 5000
//     setTimeout( () => { resolve( resp ) }, time )
// } )

// const badAPICall = ( resp: string ) => new Promise<string>( ( resolve, reject ) => {
//     const time = 5000
//     setTimeout( () => { reject( resp ) }, time )
// } )
