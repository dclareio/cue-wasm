<div align="center">

  <h1>Cue Wasm</h1>

  <p>
    Wasm bindings for cue. Works with node 16+ and modern browsers thanks to <a href="https://github.com/developit/microbundle">microbundle</a>
  </p>


<!-- Badges -->
<p>
  <a href="https://github.com/dclareio/cue-wasm/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/dclareio/cue-wasm" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/dclareio/cue-wasm" alt="last update" />
  </a>
  <a href="https://github.com/dclareio/cue-wasm/network/members">
    <img src="https://img.shields.io/github/forks/dclareio/cue-wasm" alt="forks" />
  </a>
  <a href="https://github.com/dclareio/cue-wasm/stargazers">
    <img src="https://img.shields.io/github/stars/dclareio/cue-wasm" alt="stars" />
  </a>
  <a href="https://github.com/dclareio/cue-wasm/issues/">
    <img src="https://img.shields.io/github/issues/dclareio/cue-wasm" alt="open issues" />
  </a>
  <a href="https://github.com/dclareio/cue-wasm/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/dclareio/cue-wasm.svg" alt="license" />
  </a>
</p>

<h4>
    <a href="https://github.com/dclareio/cue-wasm">Documentation</a>
  <span> · </span>
    <a href="https://github.com/dclareio/cue-wasm/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/dclareio/cue-wasm/issues/">Request Feature</a>
  </h4>
</div>

<br />

<!-- Table of Contents -->
# :notebook_with_decorative_cover: Table of Contents

- [Features](#dart-features)
- [Getting Started](#toolbox-getting-started)
  * [Prerequisites](#bangbang-prerequisites)
  * [Installation](#gear-installation)
  * [Run Locally](#running-run-locally)
- [Usage](#eyes-usage)
- [Roadmap](#compass-roadmap)
- [Contributing](#wave-contributing)
  * [Code of Conduct](#scroll-code-of-conduct)
- [License](#warning-license)
- [Contact](#handshake-contact)
- [Acknowledgements](#gem-acknowledgements)


<!-- Features -->
## :dart: Features

- Cue to json `cue.toJSON()`
- Cue to js object `cue.parse()`
- Highly optimized - 1.5MB gzipped bundle size

## 	:toolbox: Getting Started

### :gear: Installation

Install cue-wasm with yarn

```bash
  yarn add cue-wasm
```

<!-- Run Locally -->
### :running: Build Locally

Clone the project

```bash
  git clone https://github.com/dclareio/cue-wasm.git
```

Go to the project directory

```bash
  cd cue-wasm
```

Install dependencies

```bash
  yarn
```

Build the library (requires docker)

```bash
  yarn build
```


<!-- Usage -->
## :eyes: Usage

```javascript
import CUE from 'cue-wasm'

// inititalize the wasm bindings to use cue
const cue = await CUE.init();

// basic API
cue.parse('hello: "world"')  // returns { hello: "world" }

// Tagged template literals
const mergeObj = { test: "test" }
const obj = cue`
  key: "val"
  test: string
  ${mergeObj}
`; // returns { test: "test", key: "val" }

// note that for strings you'll need to quote them manually if you
// don't want cue to interpret them literally. This allows dynamically
// writing cue e.g.

cue`test: ${"test"}` // evaluates `test: test` vs.
cue`test: "${"test"}"` // evaluates `test: "test"`
```

<!-- Roadmap -->
## :compass: Roadmap

* [x] CUE -> JSON/JS
* [ ] JSON/JS -> CUE
* [x] Use [TinyGo](https://tinygo.org/) to slim down wasm further (currently a bit of a hack, but works well!)
* [ ] JSONSchema -> CUE
* [ ] CUE -> JSONSchema
* [ ] Typescripe Types -> CUE
* [ ] CUE -> Typescripe Types
* [ ] Protobufs -> CUE
* [ ] CUE -> Protobufs

<!-- Contributing -->
<!-- ## :wave: Contributing

<a href="https://github.com/dclareio/cue-wasm/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=dclareio/cue-wasm" />
</a>


Contributions are always welcome!

See `contributing.md` for ways to get started. -->


<!-- Code of Conduct -->
<!-- ### :scroll: Code of Conduct

Please read the [Code of Conduct](https://github.com/dclareio/cue-wasm/blob/master/CODE_OF_CONDUCT.md) -->


<!-- License -->
## :warning: License

Distributed under the MIT License. See LICENSE for more information.


<!-- Contact -->
## :handshake: Contact

[@dclario](https://twitter.com/dclareio) - https://dclare.io - contact@dclare.io - **We do consulting!!**

Project Link: [https://github.com/dclareio/cue-wasm](https://github.com/dclareio/cue-wasm)

<!-- Acknowledgments -->
## :gem: Acknowledgements

 - [CUE](https://github.com/cue-lang/cue)
 - [microbundle](https://github.com/developit/microbundle)
