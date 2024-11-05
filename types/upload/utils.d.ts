export type FunctionReturningPromise<T> = () => Promise<T>;
export declare class QueueAbortedError extends Error {
    name: string;
    message: string;
}
export declare class RetryAbortedError extends Error {
    name: string;
    message: string;
}
export declare class Queue<T> {
    private isAborted;
    private items;
    constructor();
    dequeue(): Promise<T | void>;
    enqueue(func: FunctionReturningPromise<T>): void;
    abort(): void;
}
export declare function wait(ms: number): Promise<unknown>;
export declare function retry<T>(fn: FunctionReturningPromise<T>, delay: number, retries: number, onRetry?: (i: number) => void): Promise<T>;
//# sourceMappingURL=utils.d.ts.map