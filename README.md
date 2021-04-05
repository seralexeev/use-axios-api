# use-axios-api

## Usage example

```ts
import React, { VFC } from 'react';
import * as ReactDOM from 'react-dom';
import { AxiosProvider, AxiosRequest, createApiHook, ifSuccess } from '../src';

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
    httpBinGet: ({ get }: AxiosRequest) => () =>
        get<{ status: string }>('https://httpbin.org/get').then(ifSuccess((x) => [x])),
        
    httpBinStatus: ({ get }) => (status: string) => get<{ status: string }>(`https://httpbin.org/status/${status}`),
});

const Component: VFC = () => {
    const [data, { loading, refetch, refetching }] = useApi((x) => x.httpBinGet).fetch({
        onData: (prev = [], data) => [...prev, ...data],
    });

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
    const [data, { loading, refetch, refetching, error }] = useApi((x) => x.httpBinStatus).fetch({
        args: ['500'],
    });

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
    const [data, { loading, refetch, refetching }] = useApi((x) => x.httpBinGet).fetch({
        skip: true,
    });

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
```
