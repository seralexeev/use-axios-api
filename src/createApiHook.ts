import { useCallback } from 'react';
import { useAxiosInstance } from './AxiosProvider';
import { AsyncResult } from './Result';
import { AxiosRequest, RequestOptions, useRequest } from './useRequest';

type Caller<R, P extends any[]> = (
    request: AxiosRequest,
) => P extends undefined ? () => () => AsyncResult<R> : (...args: P) => AsyncResult<R>;

export const createApiHook = <
    P extends any[],
    R,
    TCallback extends (...params: P) => AsyncResult<R>,
    T extends Record<string, (request: AxiosRequest) => TCallback>
>(
    t: T,
) => {
    return <TCaller extends Caller<any, any>>(selector: (t: T) => TCaller, options: RequestOptions = {}) => {
        const axios = useAxiosInstance(true);
        const request = useRequest(axios, options);
        const caller = selector(t) as any;

        // eslint-disable-next-line react-hooks/exhaustive-deps
        return useCallback((...p: any[]) => caller(request)(...p), [request]) as ReturnType<TCaller>;
    };
};
