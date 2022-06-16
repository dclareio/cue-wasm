if (crypto.webcrypto) {
  global.crypto = crypto.webcrypto
}
import './wasm_exec.js';
import cueWasm from './cue.wasm.inline.js'
import pako from "pako";

global.CueWasmAPI = {};
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
  const result = CueWasmAPI.toJSONImpl(cueString);
  if (result && result.error) throw result.error;
  return result.value;
};

CueWasmAPI.parse = (cueString) => JSON.parse(CueWasmAPI.toJSON(cueString));
