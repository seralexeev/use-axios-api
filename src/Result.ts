export type ResultError<T = unknown> = {
    __error: boolean;
    code: string;
    message: string;
    payload?: T;
    error?: any;
};

export type Result<T, P = unknown> = T | ResultError<P>;
export type AsyncResult<T = unknown, P = unknown> = Promise<Result<T, P>>;

export const ifSuccess = <OldResult, Error, NewResult>(map: (res: OldResult) => NewResult | Promise<NewResult>) => {
    return (res: Result<OldResult, Error>) => {
        if (isSuccess(res)) {
            return map(res);
        }

        return res;
    };
};

export const ifError = <T, P, R>(map: (res: ResultError<P>) => R | Promise<R>) => {
    return (res: Result<T, P>) => {
        if (isError(res)) {
            return map(res);
        }

        return res;
    };
};

export const isError = <T, P>(result: Result<T, P>): result is ResultError<P> => {
    return typeof result === 'object' && result !== null && '__error' in result;
};

export const isSuccess = <T, P>(result: T | ResultError<P>): result is T => !isError(result);

export const makeError = <P>(
    code: string,
    message: string,
    data: { payload?: P; error?: any } = {},
): ResultError<P> => {
    return { __error: true, code, message, ...data };
};
