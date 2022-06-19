FROM docker.io/golang:1.18-alpine AS preprocess-go

WORKDIR /src
COPY . /src

RUN GOOS=js GOARCH=wasm go install

# strip out packages unsupported by tinygo at this time
RUN find /go/pkg/mod/cuelang.org/go@v0.4.3/ -type f -exec sed -i -e 's|_ "cuelang.org/go/pkg/encoding/json"||g' {} \;
RUN find /go/pkg/mod/cuelang.org/go@v0.4.3/ -type f -exec sed -i -e 's|_ "cuelang.org/go/pkg/encoding/yaml"||g' {} \;
RUN find /go/pkg/mod/cuelang.org/go@v0.4.3/ -type f -exec sed -i -e 's|_ "cuelang.org/go/pkg/tool.*"||g' {} \;
# gob encoding not supported by tinygo :( so stub out with json where applicable
RUN find /go/pkg/mod/cuelang.org/go@v0.4.3/ -type f -exec sed -i -e 's|gob|json|g' {} \;

FROM tinygo/tinygo:0.23.0 AS build-tinygo

WORKDIR /src
COPY . /src

# copy over only the exact go files needed to build cuecontext which is all we use
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/ /mods/cue/

# point cue at our slimmed version
RUN echo 'replace cuelang.org/go => /mods/cue/' >> go.mod

RUN tinygo build -o /src/lib/cue.wasm -target wasm ./main.go
RUN /src/scripts/inline-wasm.sh

FROM docker.io/golang:1.18-alpine AS build-go

WORKDIR /src
COPY . /src

RUN GOOS=js GOARCH=wasm go build -o /src/lib/cue.wasm
RUN /src/scripts/inline-wasm.sh

FROM node:16-alpine AS build-node

WORKDIR /src
COPY . /src
COPY --from=build-tinygo /src/lib/cue.wasm.inline.js /src/lib/cue.wasm.slim.inline.js
COPY --from=build-go /src/lib/cue.wasm.inline.js /src/lib/cue.wasm.full.inline.js
COPY --from=build-go /usr/local/go/misc/wasm/wasm_exec.js /src/lib/wasm_exec.full.js

RUN yarn install --frozen-lockfile
RUN npx microbundle -f cjs,esm

# redact wasm from sourcemaps, no need to bundle twice
# RUN find /src/dist/*.map -type f -exec sed -i -e 's|export default \\\".*\\\"|export default \\\"<cue-wasm-redacted>\\\"|g' {} \;

FROM scratch

COPY --from=build-node /src/dist /
