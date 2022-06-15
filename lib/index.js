let loadWasm, wasmLoaded;

// if (typeof window !== "undefined") {
  window.WasmAPI = {};
  loadWasm = async (path) => {
    // expects wasm_exec.js loaded via script tag
    if (wasmLoaded) return WasmAPI;
    const go = new Go();
    const { instance } = await WebAssembly.instantiateStreaming(fetch(`/static/${path}`), go.importObject)
    go.run(instance);
    wasmLoaded = true;
    return WasmAPI;
  }
  // TODO: need to polyfill for node
// } else {
//   global.WasmAPI = {};
//   loadWasm = async (path) => {
//     require('./wasm_exec.js');
//     if (wasmLoaded) return WasmAPI;
//     const fs = require('fs');
//     const cueSource = fs.readFileSync(__dirname + "/" + path);
//     const cueArray = new Uint8Array(cueSource);
//     const go = new Go();
//     const { instance } = await WebAssembly.instantiate(cueArray, go.importObject);
//     go.run(instance);
//     wasmLoaded = true;
//     return WasmAPI;
//   }
// }

module.exports.toJSON = async (cueString) => {
  const cue = await loadWasm("cue.wasm")
  const result = cue.toJSON(cueString);
  if (result && result.error) throw result.error;
  return result.value;
}

module.exports.parse = async (cueString) => JSON.parse(await module.exports.toJSON(cueString));
