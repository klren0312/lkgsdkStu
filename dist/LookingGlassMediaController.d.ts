export declare function LookingGlassMediaController(): Promise<void>;
declare const resolveWhenIdle: {
    request: ((callback: IdleRequestCallback, options?: IdleRequestOptions | undefined) => number) & typeof requestIdleCallback;
    cancel: ((handle: number) => void) & typeof cancelIdleCallback;
    promise: (num: any) => Promise<unknown>;
};
export { resolveWhenIdle };
