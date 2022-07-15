//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"encoding/json"
	"syscall/js"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/encoding/openapi"
)

func main() {
	wait := make(chan struct{}, 0)
	api := js.Global().Get("CueWasmAPI")
	api.Set("_toJSONImpl", js.FuncOf(toJSON))
	api.Set("_toOpenAPIImpl", js.FuncOf(toOpenAPI))
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

func genOpenAPI(inst *cue.Instance) ([]byte, error) {
	b, err := openapi.Gen(inst, nil)
	if err != nil {
			return nil, err
	}

	var out bytes.Buffer
	err = json.Indent(&out, b, "", "   ")
	if err != nil {
			return nil, err
	}

	return out.Bytes(), nil
}

func toOpenAPI(this js.Value, args []js.Value) interface{} {
	var r cue.Runtime
	inst, err := r.Compile("", args[0].String())
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err,
		}
	}
	jsonBytes, err := genOpenAPI(inst)
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err,
		}
	}
	return map[string]interface{}{
		"value": string(jsonBytes),
		"error": nil,
	}
}
