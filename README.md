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

cue.parse('hello: "world"')  // returns { hello: "world" }
```

<!-- Roadmap -->
## :compass: Roadmap

* [x] CUE -> JSON/JS
* [ ] JSON/JS -> CUE
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

Distributed under the no License. See LICENSE for more information.


<!-- Contact -->
## :handshake: Contact

[@dclario](https://twitter.com/dclareio) - contact@dclare.io - **We do consulting!!**

Project Link: [https://github.com/dclareio/cue-wasm](https://github.com/dclareio/cue-wasm)

<!-- Acknowledgments -->
## :gem: Acknowledgements

 - [CUE](https://github.com/cue-lang/cue)
 - [microbundle](https://github.com/developit/microbundle)
