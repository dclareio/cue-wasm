FROM docker.io/golang:1.18-alpine AS preprocess-go

WORKDIR /src
COPY . /src
# mod cue to remove single reference to gob and replace with json
RUN GOOS=js GOARCH=wasm go install
# remove reference to pkg which is unused and allows us to reduce package size
RUN find /go/pkg/mod/cuelang.org/go@v0.4.3/ -type f -exec sed -i -e 's|_ "cuelang.org/go/pkg"||g' {} \;

FROM tinygo/tinygo:0.23.0 AS build-go

WORKDIR /src
COPY . /src

# copy over only the exact go files needed to build cuecontext which is all we use
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/go.mod /mods/cue/
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/go.sum /mods/cue/
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/ast /mods/cue/cue/ast
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/build /mods/cue/cue/build
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/cuecontext /mods/cue/cue/cuecontext
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/errors /mods/cue/cue/errors
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/format /mods/cue/cue/format
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/literal /mods/cue/cue/literal
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/parser /mods/cue/cue/parser
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/scanner /mods/cue/cue/scanner
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/token /mods/cue/cue/token
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/builtin.go /mods/cue/cue/builtin.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/context.go /mods/cue/cue/context.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/errors.go /mods/cue/cue/errors.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/path.go /mods/cue/cue/path.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/instance.go /mods/cue/cue/instance.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/op.go /mods/cue/cue/op.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/query.go /mods/cue/cue/query.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/cue/types.go /mods/cue/cue/types.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/internal/core /mods/cue/internal/core
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/internal/astinternal /mods/cue/internal/astinternal
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/internal/source /mods/cue/internal/source
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/internal/types /mods/cue/internal/types
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/internal/attrs.go /mods/cue/internal/attrs.go
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/internal/internal.go /mods/cue/internal/internal.go

# point cue at our slimmed version
RUN echo 'replace cuelang.org/go => /mods/cue/' >> go.mod

RUN tinygo build -o /src/lib/cue.wasm -target wasm ./main.go
RUN /src/scripts/inline-wasm.sh

FROM node:16-alpine AS build-node

WORKDIR /src
COPY . /src
COPY --from=build-go /src/lib/cue.wasm.inline.js /src/lib/

RUN yarn install --frozen-lockfile
RUN npx microbundle

# redact wasm from sourcemaps, no need to bundle twice
RUN find /src/dist/*.map -type f -exec sed -i -e 's|export default \\\".*\\\"|export default \\\"<cue-wasm-redacted>\\\"|' {} \;

FROM scratch

COPY --from=build-node /src/dist /
