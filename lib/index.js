import "./polyfill.js";
import isString from 'lodash.isstring';
import pako from "pako";

global.CueWasmAPI = {}

export const init = async (variant = "full") => {
  if (CueWasmAPI[variant] && CueWasmAPI[variant].loaded) return CueWasmAPI[variant];

  let cueWasm;
  if (variant === "slim") {
    await import("./wasm_exec.slim.cjs");
    cueWasm = await import('./cue.wasm.slim.inline.js');
  } else {
    await import("./wasm_exec.full.cjs");
    cueWasm = await import('./cue.wasm.full.inline.js');
  }
  const cueBuff = Buffer.from(cueWasm.default, 'base64');
  const cueArray = new Uint8Array(cueBuff);
  const cueUnzipped = pako.ungzip(cueArray);
  const go = new Go();
  const { instance } = await WebAssembly.instantiate(cueUnzipped, go.importObject);
  go.run(instance);

  CueWasmAPI[variant] = (strings, ...values) => {
    // called when using the cue`` tagged template literal syntax
    const builtString = strings.map((s, i) => {
      let value = values[i];
      if (!value) return s;
      // don't quote strings to allow users to dynamically write cue vs.
      // just injecting json values
      if (!isString(value)) value = JSON.stringify(value);
      return s + value;
    }).join('')
    return CueWasmAPI[variant].parse(builtString)
  }
  CueWasmAPI[variant].toJSON = (cueString) => {
    if (Array.isArray(cueString)) {
      cueString = cueString.map(cs => isString(cs) ? cs : JSON.stringify(cs));
      cueString = cueString.join('\n');
    } else if (!isString(cueString)) {
      cueString = JSON.stringify(cueString)
    }
    const result = CueWasmAPI[variant].toJSONImpl(cueString);
    if (result && result.error) throw result.error;
    return result.value;
  };

  CueWasmAPI[variant].parse = (cueString) => JSON.parse(CueWasmAPI[variant].toJSON(cueString));

  CueWasmAPI[variant].toOpenAPI = (cueString) => {
    if (Array.isArray(cueString)) {
      cueString = cueString.map(cs => isString(cs) ? cs : JSON.stringify(cs));
      cueString = cueString.join('\n');
    } else if (!isString(cueString)) {
      cueString = JSON.stringify(cueString)
    }
    const result = CueWasmAPI[variant].toOpenAPIImpl(cueString);
    if (result && result.error) throw result.error;
    return result.value;
  };

  CueWasmAPI[variant].parseSchema = (cueString) => JSON.parse(CueWasmAPI[variant].toOpenAPI(cueString)).components.schemas;
  CueWasmAPI[variant].schema = (strings, ...values) => {
    // called when using the cue`` tagged template literal syntax
    const builtString = strings.map((s, i) => {
      let value = values[i];
      if (!value) return s;
      // don't quote strings to allow users to dynamically write cue vs.
      // just injecting json values
      if (!isString(value)) value = JSON.stringify(value);
      return s + value;
    }).join('')
    return CueWasmAPI[variant].parseSchema(builtString)
  }
  // ensure we don't overwrite the go functions with future variants
  CueWasmAPI[variant].toJSONImpl = CueWasmAPI._toJSONImpl
  CueWasmAPI[variant].toOpenAPIImpl = CueWasmAPI._toOpenAPIImpl
  // ensure later assignments to the global don't mess with this variant
  CueWasmAPI[variant].loaded = true;
  return CueWasmAPI[variant];
};
