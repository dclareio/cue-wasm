//go:build js && wasm
// +build js,wasm

package main

import (
	// "syscall/js"

	"cuelang.org/go/cue/cuecontext"
)


func main() {
	// api := js.Global().Get("CueWasmAPI")
	// api.Set("toJSONImpl", js.FuncOf(toJSON))
	// <-make(chan bool)
}

func toJSON(cueString string) interface{} {
	ctx := cuecontext.New()
	value := ctx.CompileString(cueString)

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
