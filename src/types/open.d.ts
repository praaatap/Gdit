// Type declarations for external modules

declare module 'open' {
    interface Options {
        wait?: boolean;
        background?: boolean;
        newInstance?: boolean;
        allowNonzeroExitCode?: boolean;
        app?: {
            name: string | readonly string[];
            arguments?: readonly string[];
        };
    }

    function open(target: string, options?: Options): Promise<import('child_process').ChildProcess>;
    export default open;
}
