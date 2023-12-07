---
# layout: node-js
status: released
redirect_from: get-started/using-typescript
---

# Using TypeScript

While CAP itself is written in _JavaScript_, it's possible to use _TypeScript_ within your project as outlined here.


## Enable TypeScript Support

Follow these steps to add TypeScript support:

1. Install typescript packages globally:

    ```sh
    npm i -g typescript ts-node
    ```

2. Add a _tsconfig.json_ file to your project.

    You need to provide a _tsconfig.json_ file in which you configure how you want
    to use TypeScript. See the [official TypeScript documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for more details.



## Developing with `cds-ts` { #cds-ts}

Use the `cds-ts` CLI command instead of `cds` to avoid having to precompile TypeScript files to JavaScript each time and speed up development:

```sh
cds-ts serve world.cds
```

```sh
cds-ts watch
```

When using the binary `cds-ts`, the [ts-node](https://github.com/TypeStrong/ts-node) engine is used to start the project instead of the default node engine.

::: warning
Note that this binary should be used **for development only**. For productive usage
always precompile TypeScript code to JavaScript due to performance reasons and use the `cds` binary.
:::


### Writing TypeScript Files

Once you've setup everything correctly, you can start writing TypeScript files
instead of JavaScript files. This applies for service handlers, as well as a custom _server.ts_ file or database _init.ts_ seeding files.

### Samples

You can also download the [*Hello World!* TypeScript sample](https://github.com/SAP-samples/cloud-cap-samples/tree/master/hello) or try out the [Full Stack TypeScript App](https://github.com/SAP-samples/btp-full-stack-typescript-app).

## Testing with `ts-jest`

Run your Jest tests with preset `ts-jest` without precompiling TypeScript files.

1. Install `ts-jest` locally:

    ```sh
    npm add ts-jest
    ```

2. Tell Jest to use the preset `ts-jest`, e.g. in your _jest.config.js_:

    ```js
    module.exports = {
      preset: "ts-jest",
      globalSetup: "./test/setup.ts"
    };
    ```

3. Set `CDS_TYPESCRIPT` environment variable:

    This is necessary, because it isn't possible to programmatically detect that the preset `ts-jest` is used and we've to
    know whether we need to look for _.ts_ or _.js_ files.

    File _./test/setup.ts_, content:

    ```js
    module.exports = async () => {
      process.env.CDS_TYPESCRIPT = "true";
    };
    ```

4. Run your tests as usual:

    ```sh
    jest
    ```



## TypeScript APIs in `@sap/cds`

The package `@sap/cds` is shipped with TypeScript declarations. These declarations are used automatically when you write TypeScript files, but also enable IntelliSense and type checking for standard JavaScript development in Visual Studio Code.

Use them like this:

```ts
import { Request } from '@sap/cds'

function myHandler(req: Request) { }
```

Types are available even in JavaScript through [JSDoc comments](https://jsdoc.app/):

```js
/**
 * @param { import('@sap/cds').Request } req
 */
function myHandler(req) { }
```

### Type Imports

Import types through the [`cds` facade class](../node.js/cds-facade) only:

##### **Good:** {.good}

```ts
import { ... } from '@sap/cds' // [!code ++]
```

##### **Bad:** {.bad}

Never code against paths inside `@sap/cds/apis/`:

```ts
import { ... } from '@sap/cds/apis/events' // [!code --]
```

### Community

#### Help us improve the types

We invite you to contribute and help us complete the typings as appropriate.  Find the [sources on GitHub](https://github.com/cap-js/cds-types) and open a pull request or an issue.

Still, as `@sap/cds` is a JavaScript library, typings aren't always up to date. You should expect a delay for typings related to the latest release, even gaps, and errors.



## Generating Model Types Automatically

The [`cds-typer` package](https://www.npmjs.com/package/@cap-js/cds-typer) offers a way to derive TypeScript definitions from a CDS model to give you enhanced code completion and a certain degree of type safety when implementing services.

```js
class CatalogService extends cds.ApplicationService { init() {
    const { Book } = require('#cds-models/sap/capire/bookshop')

    this.before('CREATE', Book, req => {
        req.data.…  // known to be a Book. Code completion suggests:
              // ID (number)
              // title (string)
              // author (Author)
              // createdAt (Date)
              // …
    })
}}
```

You can find extensive documentation in a [dedicated chapter](../tools/cds-typer), together with a [quickstart guide](../tools/cds-typer#cds-typer-vscode) to get everything up and running.
