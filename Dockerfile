FROM docker.io/golang:1.18-alpine AS build-go

WORKDIR /src
COPY . /src
ENV GOGC=1000
RUN GOOS=js GOARCH=wasm go build -o /src/lib/cue.wasm
RUN /src/scripts/inline-wasm.sh

FROM node:16-alpine AS build-node

WORKDIR /src
COPY . /src
COPY --from=build-go /src/lib/cue.wasm.inline.js /src/lib/cue.wasm.full.inline.js
COPY --from=build-go /usr/local/go/misc/wasm/wasm_exec.js /src/lib/wasm_exec.full.cjs

RUN yarn install --frozen-lockfile
RUN npx microbundle -f cjs,esm,modern

# redact wasm from sourcemaps, no need to bundle twice
RUN find /src/dist/cue.wasm.*.map -type f -exec sed -i -e 's|export default \\\".*\\\"|export default \\\"<cue-wasm-redacted>\\\"|g' {} \;

FROM scratch

COPY --from=build-node /src/dist /
