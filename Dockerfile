# TODO: provide "full" build along with slim on npm
FROM docker.io/golang:1.18-alpine AS build-go

WORKDIR /src
COPY . /src

RUN GOOS=js GOARCH=wasm go build -o /src/lib/cue.wasm
RUN /src/scripts/inline-wasm.sh

FROM node:16-alpine AS build-node

WORKDIR /src
COPY . /src
COPY --from=build-go /src/lib/cue.wasm.inline.js /src/lib/
COPY --from=build-go /usr/local/go/misc/wasm/wasm_exec.js /src/lib/

RUN yarn install --frozen-lockfile
RUN npx microbundle
RUN find /src/dist/*.map -type f -exec sed -i -e 's|export default \\\".*\\\"|export default \\\"<cue-wasm-redacted>\\\"|' {} \;

FROM scratch

COPY --from=build-node /src/dist /
