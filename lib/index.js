import "./polyfill.js";
import "./wasm_exec.js";
import cueWasm from './cue.wasm.inline.js';
import isString from 'lodash.isstring';
import pako from "pako";

global.CueWasmAPI = function (strings, ...values) {
  // called when using the cue`` tagged template literal syntax
  const builtString = strings.map((s, i) => {
    let value = values[i];
    if (!value) return s;
    return s + JSON.stringify(value);
  }).join('')
  return CueWasmAPI.parse(builtString)
}

export const init = async () => {
  if (CueWasmAPI.loaded) return CueWasmAPI;
  const cueBuff = Buffer.from(cueWasm, 'base64');
  const cueArray = new Uint8Array(cueBuff);
  const cueUnzipped = pako.ungzip(cueArray);
  const go = new Go();
  const { instance } = await WebAssembly.instantiate(cueUnzipped, go.importObject);
  go.run(instance);
  CueWasmAPI.loaded = true;
  return CueWasmAPI;
};

CueWasmAPI.toJSON = (cueString) => {
  if (Array.isArray(cueString)) {
    cueString = cueString.map(cs => isString(cs) ? cs : JSON.stringify(cs));
    cueString = cueString.join('\n');
  } else if (!isString(cueString)) {
    cueString = JSON.stringify(cueString)
  }
  const result = CueWasmAPI.toJSONImpl(cueString);
  if (result && result.error) throw result.error;
  return result.value;
};

CueWasmAPI.parse = (cueString) => JSON.parse(CueWasmAPI.toJSON(cueString));
