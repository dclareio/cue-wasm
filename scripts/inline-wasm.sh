#!/usr/bin/env sh
cat <<EOF>lib/cue.wasm.inline.js
export default "$(cat lib/cue.wasm | gzip | base64 -w0)"
EOF
