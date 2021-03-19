import React, { FC, VFC } from 'react';
import * as ReactDOM from 'react-dom';
import { AxiosProvider, createApiHook, useFetch } from '../src';

const App = () => {
    return (
        <AxiosProvider>
            <Component />
            <ComponentStatus />
            <ComponentImperative />
        </AxiosProvider>
    );
};

const useApi = createApiHook({
    httpBinGet: ({ get }) => () => get<any>('https://httpbin.org/get'),
    httpBinStatus: ({ get }) => (status: string) => get<any>(`https://httpbin.org/status/${status}`),
});

const Component: VFC = () => {
    const [data, { loading, refetch, refetching }] = useFetch(
        useApi((x) => x.httpBinGet),
        { onData: (prev: any[] = [], data) => [...prev, data] },
    );

    if (loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            {refetching ? <span>refetching</span> : <button onClick={refetch}>refetch</button>}
            <pre>data: {JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

const ComponentStatus: VFC = () => {
    const [data, { loading, refetch, refetching, error }] = useFetch(
        useApi((x) => x.httpBinStatus),
        { args: ['500'] },
    );

    if (loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            {refetching ? <span>refetching</span> : <button onClick={refetch}>click to refetch error</button>}
            <pre>data: {JSON.stringify(data, null, 2)}</pre>
            <pre>error: {JSON.stringify(error, null, 2)}</pre>
        </div>
    );
};

const ComponentImperative: VFC = () => {
    const [data, { loading, refetch, refetching }] = useFetch(
        useApi((x) => x.httpBinGet),
        { skip: true },
    );

    if (loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            {refetching ? <span>refetching</span> : <button onClick={refetch}>click to initial fetch</button>}
            <pre>data: {JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
