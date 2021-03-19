import hash from 'object-hash';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { AsyncResult, isError, ResultError } from './Result';

type FetchResultExtra<R, E> = {
    loading: boolean;
    error: ResultError<E> | null;
    refetch: () => AsyncResult<R, E>;
    refetching: boolean;
    setData: Dispatch<SetStateAction<R | undefined>>;
};

export type FetchResult<R, E> = [R | undefined, FetchResultExtra<R, E>];

export type UseFetchOptions = {
    skip?: boolean;
    version?: number;
};

export function useFetch<R, E>(caller: () => AsyncResult<R, E>, options?: UseFetchOptions): FetchResult<R, E>;
export function useFetch<P extends any[], R, E>(
    caller: (...args: P) => AsyncResult<R, E>,
    options: { args: P } & UseFetchOptions,
): FetchResult<R, E>;
export function useFetch<P, R, E>(caller: (args: P) => AsyncResult<R, E>, options?: any): FetchResult<R, E> {
    const { args, skip = false, version = 0 } = options || {};

    const [data, setData] = useState<R | undefined>(undefined);
    const [error, setError] = useState<ResultError<E> | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [refetching, setRefetching] = useState(false);
    const count = useRef(0);

    const refetch = useCallback(
        () => {
            setRefetching(true);

            if (count.current === 0) {
                setLoading(true);
            }

            const version = ++count.current;

            return caller(args as any)
                .then((res) => {
                    if (isError(res)) {
                        setError(res);
                    } else {
                        setData(res);
                        setError(null);
                    }
                    return res;
                })
                .finally(() => {
                    if (version === 1) {
                        setLoading(false);
                    }

                    if (count.current === version) {
                        setRefetching(false);
                    }
                });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hash(args ?? ''), caller],
    );

    useEffect(() => {
        if (!skip) {
            void refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch, skip, version]);

    return [data, { loading, error, refetch, refetching, setData }];
}
