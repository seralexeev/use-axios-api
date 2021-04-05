import { useCallback } from 'react';
import { useAxiosInstance } from './AxiosProvider';
import { AsyncResult } from './Result';
import { FetchResult, useFetch, UseFetchOptions } from './useFetch';
import { AxiosRequest, RequestOptions, useRequest } from './useRequest';

type Caller<R, P extends any[]> = (
    request: AxiosRequest,
) => P extends undefined ? () => () => AsyncResult<R> : (...args: P) => AsyncResult<R>;

export const createApiHook = <T extends Record<string, (request: AxiosRequest) => (...args: any) => any>>(
    t: T,
) => {
    return <R, P extends any[], E, S = R>(selector: (t: T) => Caller<R, P>, options: RequestOptions = {}) => {
        const axios = useAxiosInstance(true);
        const request = useRequest(axios, options);
        const caller = selector(t);

        type CallerArgs = Parameters<ReturnType<Caller<R, P>>>;
        type Result = ReturnType<Caller<R, P>> & {
            fetch: CallerArgs extends []
                ? (options?: UseFetchOptions<R, S>) => FetchResult<R, E, S>
                : (options: { args: CallerArgs } & UseFetchOptions<R, S>) => FetchResult<R, E, S>;
        };

        const result = useCallback((...p: any[]) => caller(request)(...p), [request]) as Result;
        result.fetch = ((options: any) => useFetch(result, options)) as any;

        return result;
    };
};
