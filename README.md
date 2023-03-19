# three.js webpack

Started project for three.js. Configured with webpack as a bundler.

## Development

Install dependencies:

```bash
npm install
```

Start webpack development server

```bash
npm run start
```
## Deployment

Run prettier

```bash
npm run format
```

Bundle your code

```bash
npm run build
```

Problems with newer Node version:

```
$env:NODE_OPTIONS="--openssl-legacy-provider"

or
set NODE_OPTIONS=--openssl-legacy-provider
or
export NODE_OPTIONS=--openssl-legacy-provider
```
