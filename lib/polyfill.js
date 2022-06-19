import getRandomValues from 'polyfill-crypto.getrandomvalues';

if (typeof global === 'undefined') {
  window.global = window
}
if (!global.crypto) {
  global.crypto = { getRandomValues };
}
if (global.crypto.webcrypto) {
  global.crypto = crypto.webcrypto
}