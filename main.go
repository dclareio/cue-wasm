//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"encoding/json"
	"syscall/js"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/cue/load"
	"cuelang.org/go/encoding/openapi"
)

func main() {
	wait := make(chan struct{}, 0)
	api := js.Global().Get("CueWasmAPI")
	api.Set("toJSONImpl", js.FuncOf(toJSON))
	api.Set("toJSONSchemaImpl", js.FuncOf(toJSONSchema))
	<-wait
}

func toJSON(this js.Value, args []js.Value) interface{} {
	ctx := cuecontext.New()
	value := ctx.CompileString(args[0].String())

	err:= value.Err()
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err.Error(),
		}
	}

	json, err := value.MarshalJSON()
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err.Error(),
		}
	}
	return map[string]interface{}{
		"value": string(json),
		"error": nil,
	}
}

func toJSONSchema(this js.Value, args []js.Value) interface{} {
	buildInstances := load.Instances([]string{"-"}, &load.Config{
		Stdin: bytes.NewBufferString(args[0].String()),
	})
	insts := cue.Build(buildInstances)

	b, err := openapi.Gen(insts[0], nil)
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err,
		}
	}

	var out bytes.Buffer
	err = json.Indent(&out, b, "", "   ")
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err,
		}
	}
	return map[string]interface{}{
		"value": string(out.Bytes()),
		"error": nil,
	}
}
