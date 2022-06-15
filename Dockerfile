FROM docker.io/golang:1.17-alpine AS build

WORKDIR /src
COPY . /src

RUN GOOS=js GOARCH=wasm go build -o /cue.wasm

FROM scratch
COPY --from=build /cue.wasm /
COPY --from=build /usr/local/go/misc/wasm/wasm_exec.js /
