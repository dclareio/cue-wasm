FROM docker.io/golang:1.18-alpine AS preprocess-go

WORKDIR /src
COPY . /src
# mod cue to remove single reference to gob and replace with json
RUN GOOS=js GOARCH=wasm go install
# replace gob/yaml encodings with json to get cue to compile, shouldn't
# impact our usage
RUN find /go/pkg/mod/cuelang.org/go@v0.4.3/ -type f -exec sed -i -e 's|gob|json|g' {} \;
RUN find /go/pkg/mod/cuelang.org/go@v0.4.3/ -type f -exec sed -i -e 's|yaml|json|g' {} \;

FROM tinygo/tinygo:0.23.0 AS build-go

WORKDIR /src
COPY . /src
COPY --from=preprocess-go /go/pkg/mod/cuelang.org/go@v0.4.3/ /mods/cue/
# RUN tinygo -h

RUN echo 'replace cuelang.org/go => /mods/cue/' >> go.mod
RUN tinygo build -o /src/lib/cue.wasm -target wasm ./main.go
RUN /src/scripts/inline-wasm.sh

FROM node:16-alpine AS build-node

WORKDIR /src
COPY . /src
COPY --from=build-go /src/lib/cue.wasm.inline.js /src/lib/
COPY --from=build-go /usr/local/tinygo/targets/wasm_exec.js /src/lib/

RUN yarn install --frozen-lockfile
RUN npx microbundle

FROM scratch

COPY --from=build-node /src/dist /


