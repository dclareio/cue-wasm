//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"encoding/json"
	"reflect"
	"syscall/js"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/ast"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/encoding/openapi"

	"github.com/mitchellh/mapstructure"
)

func main() {
	wait := make(chan struct{}, 0)
	api := js.Global().Get("CueWasmAPI")
	api.Set("_toJSONImpl", js.FuncOf(toJSON))
	api.Set("_toOpenAPIImpl", js.FuncOf(toOpenAPI))
	api.Set("_toASTImpl", js.FuncOf(toAST))
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

	jsonBytes, err := value.MarshalJSON()
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err.Error(),
		}
	}
	return map[string]interface{}{
		"value": string(jsonBytes),
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
			"error": err.Error(),
		}
	}
	jsonBytes, err := genOpenAPI(inst)
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err.Error(),
		}
	}
	return map[string]interface{}{
		"value": string(jsonBytes),
		"error": nil,
	}
}

func With(v interface{}) {
	panic(v)
}
func On(err error) {
	if err != nil {
		panic(err)
	}
}

func Expect(value interface{}, err error) interface{} {
	On(err)
	return value
}

func toAST(this js.Value, args []js.Value) interface{} {
	ctx := cuecontext.New()
	value := ctx.CompileString(args[0].String())

	err:= value.Err()
	if err != nil {
		return map[string]interface{}{
			"value": "",
			"error": err.Error(),
		}
	}
	astBytes, err := json.Marshal(encodeToPrimitives(value.Source()))
	return map[string]interface{}{
		"value": string(astBytes),
		"error": err,
	}
}

func newNodeEncoder(result *map[string]interface{}) *mapstructure.Decoder {
	return Expect(mapstructure.NewDecoder(&mapstructure.DecoderConfig{
		DecodeHook:  encodeHook,
		ErrorUnused: true,
		Result:      result,
	})).(*mapstructure.Decoder)
}
func newMapEncoder(result *map[string]interface{}) *mapstructure.Decoder {
	return Expect(mapstructure.NewDecoder(&mapstructure.DecoderConfig{
		ErrorUnused: true,
		Result:      result,
	})).(*mapstructure.Decoder)
}
func encodeNode(node ast.Node) map[string]interface{} {
	var result map[string]interface{}
	On(newNodeEncoder(&result).Decode(node))
	return result
}

func encodeToPrimitives(node ast.Node) map[string]interface{} {
	return encodeNode(node)
}


func unwrapNode(node ast.Node) map[string]interface{} {
	switch x := node.(type) {
	default:
		return encodeMap(x)
	}
}


func encodeMap(source interface{}) map[string]interface{} {
	var result map[string]interface{}
	On(newMapEncoder(&result).Decode(source))
	return result
}


func mapIdent(ident *ast.Ident) interface{} {
	mapped := map[string]interface{}{
		"Name": ident.Name,
		"NamePos":   ident.NamePos,
	}
	return mapped
}
func mapIdents(idents []*ast.Ident) []interface{} {
	items := make([]interface{}, len(idents))
	for i, ident := range idents {
		items[i] = mapIdent(ident)
	}
	return items
}

func DeclsToNodes(decls []ast.Decl) []ast.Node {
	nodes := make([]ast.Node, len(decls))
	for i, decl := range decls {
		nodes[i] = decl
	}
	return nodes
}
func ExprsToNodes(exprs []ast.Expr) []ast.Node {
	nodes := make([]ast.Node, len(exprs))
	for i, expr := range exprs {
		nodes[i] = expr
	}
	return nodes
}
func AttributesToNodes(attrs []*ast.Attribute) []ast.Node {
	nodes := make([]ast.Node, len(attrs))
	for i, attr := range attrs {
		nodes[i] = attr
	}
	return nodes
}
func ClausesToNodes(clauses []ast.Clause) []ast.Node {
	nodes := make([]ast.Node, len(clauses))
	for i, clause := range clauses {
		nodes[i] = clause
	}
	return nodes
}
func ImportSpecsToNodes(importSpecs []*ast.ImportSpec) []ast.Node {
	nodes := make([]ast.Node, len(importSpecs))
	for i, importSpec := range importSpecs {
		nodes[i] = importSpec
	}
	return nodes
}
func mapNodes(nodes []ast.Node) []interface{} {
	items :=  make([]interface{}, len(nodes))
	for i, item := range nodes {
		if node, ok := item.(ast.Node); ok {
			items[i] = encodeNode(node)
		} else {
			items[i] = item
		}
	}
	return items
}
func nodeInner(nodeMap map[string]interface{}) map[string]interface{} {
	for k, v := range nodeMap {
		if node, ok := v.(ast.Node); ok {
			nodeMap[k] = encodeNode(node)
		}
	}
	return nodeMap
}

func encodeHook(sourceType reflect.Type, targetType reflect.Type, source interface{}) (interface{}, error) {
	if ident, ok := source.(*ast.Ident); ok {
		mapped := map[string]interface{}{
			"Name": ident.Name,
			"NamePos":   ident.NamePos, // todo resolve Node and Scope (cyclic graph).
		}
		return mapped, nil
	}
	if node, ok := source.(ast.Node); ok {
		mapped := unwrapNode(node) // will still have Node interface values in map values.
		return nodeInner(mapped), nil // remap inner Node interface values
	}
	if decls, ok := source.([]ast.Decl); ok {
		nodes := DeclsToNodes(decls)
		return mapNodes(nodes), nil
	}
	if exprs, ok := source.([]ast.Expr); ok {
		nodes := ExprsToNodes(exprs)
		return mapNodes(nodes), nil
	}
	if idents, ok := source.([]*ast.Ident); ok {
		return mapIdents(idents), nil
	}
	if importSpecs, ok := source.([]*ast.ImportSpec); ok {
		nodes := ImportSpecsToNodes(importSpecs)
		return mapNodes(nodes), nil
	}
	if attrs, ok := source.([]*ast.Attribute); ok {
		nodes := AttributesToNodes(attrs)
		return mapNodes(nodes), nil
	}
	if clauses, ok := source.([]ast.Clause); ok {
		nodes := ClausesToNodes(clauses)
		return mapNodes(nodes), nil
	}
	return source, nil
}