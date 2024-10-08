# Turborepo starter

This is an official starter Turborepo.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/suciphus-suapp`: the main app
- `suciphus-mainframe`: a frontend application served at `http://localhost:3001`
- `admin`: an admin dashboard served at `http://localhost:3000`

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```sh
pnpm build
```

### Develop

#### Start geth

Using installed suave-geth

```sh
suave-geth --suave-dev
```

Local suave-geth build

```sh
./build/bin/geth \
 --dev \
 --dev.gaslimit 5000000000 \
 --http \
 --http.addr "0.0.0.0" \
 --http.port 8545 \
 --http.api "eth,web3,net,clique,debug" \
 --http.corsdomain "*" \
 --allow-insecure-unlock \
 --keystore "$HOME/.suave-dev/keystore" \
 --unlock "0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F" \
 --password "$HOME/.suave-dev/password.txt" \
 --ws \
 --suave.eth.remote_endpoint "http://localhost:8548" \
 --miner.gasprice 0 \
 --rpc.gascap 10000000000 \
 --networkid 16813125 \
 --suave.eth.external-whitelist "*" \
 --verbosity 3
```

#### Set up Supabase

To get supabase running locally, follow their [self-hosting guide](https://supabase.com/docs/guides/self-hosting/docker).

Make note of these variables from your supabase deployment's environment (or .env file):

- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `SERVICE_ROLE_KEY`

#### Build & Deploy contracts

Build contracts & generate typescript bindings:

```sh
cd ./packages/suciphus-suapp
pnpm i
pnpm contracts:build
pnpm contracts:deploy
pnpm build
cd -
```

Populate environment files:

- *In the admin app's .env file, the `SUPABASE_URL` variable should point to the supabase postgres DB; it's composed of the postgres-related variables we noted earlier:*

  `SUPABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`

  > This example assumes you're using the default user `postgres`; you may need to change this if not self-hosting supabase.

  `SUPABASE_SERVICE_KEY` should be populated with `SERVICE_ROLE_KEY` from earlier.

  ```sh
  cd apps/admin && cp .env.example .env
  vim .env
  cd -
  ```

- *The user-facing app can use default values:*

  ```sh
  cd apps/suciphus-mainframe && cp .env.example .env && cd -
  ```

Install dependencies:

```sh
pnpm i
```

To develop all apps and packages, run the following command:

```sh
pnpm dev
```

This will start both `suciphus-mainframe` and `admin` apps:

- `suciphus-mainframe` is accessible at `http://localhost:3001/player` for testing prompts.
- `admin` can be accessed at `http://localhost:3000/admin/` to view the admin dashboard.

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```sh
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```sh
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
