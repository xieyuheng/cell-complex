# Cicada

## Aims

- Libraries and tools for topological and geometric modeling

## Community

- We enforce C4 as collaboration protocol -- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- [Code of Conduct](CODE-OF-CONDUCT.md)
- Source code -- [github](https://github.com/xieyuheng/cicada), [gitlab](https://gitlab.com/xieyuheng/cicada/)
- [cicada-rs](http://github.com/xieyuheng/cicada-rs) -- an old version of the same project written in rust
- IRC -- [#cicada-language](https://kiwiirc.com/nextclient/irc.freenode.net/#cicada-language)
- CI -- [gitlab-ci](https://gitlab.com/xieyuheng/cicada/pipelines)

## Contributing

- Prepare: `npm install`
- Compile: `npx tsc`
- Compile and watch: `npx tsc --watch`
- Run all tests: `npx ava`
- Run specific test file: `npx ava -sv <path to the test file>`

## Docs

- [A Recursive Combinatorial Description of cell-complex](https://github.com/xieyuheng/cicada/blob/master/docs/a-recursive-combinatorial-description-of-cell-complex.md)
  - A paper about the definition of cell-complex in this project

## Modules

- `npm install cicada-lang`

- [API Docs](https://api.cicada-lang.now.sh)

- Try [examples](https://github.com/xieyuheng/cicada/tree/master/examples)

- Contents:
  - [int](#int)
  - [num](#num)
  - [euclid](#eu-euclid)
  - [combinatorial-game](#cg-combinatorial-game)
  - [cell-complex](#cx-cell-complex)
  - [homology](#hl-homology)
  - [cicadascript](#cs-cicadascript)

### `int` int

#### [`examples/int-module.js`](examples/int-module.js):

``` javascript
let assert = require ("assert") .strict

let ut = require ("cicada-lang/lib/util")
let int = require ("cicada-lang/lib/int")

{
  /**
   * generic `row_canonical_form`
   *   i.e. `hermite_normal_form` for integers
   */

  let A = int.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ])

  let B = int.matrix ([
    [1, 0, -11, 2],
    [0, 3, 28, -2],
    [0, 0, 61, -13],
  ])

  assert (
    A.row_canonical_form () .eq (B)
  )
}

{
  /**
   * generic `diag_canonical_form`
   *   i.e. `smith_normal_form` for integers
   */

  let A = int.matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ])

  let S = int.matrix ([
    [2, 0, 0],
    [0, 6, 0],
    [0, 0, -12],
  ])

  assert (
    A.diag_canonical_form () .eq (S)
  )
}

{
  /**
   * solve linear diophantine equations
   */

  let A = int.matrix ([
    [1, 2, 3, 4, 5, 6, 7],
    [1, 0, 1, 0, 1, 0, 1],
    [2, 4, 5, 6, 1, 1, 1],
    [1, 4, 2, 5, 2, 0, 0],
    [0, 0, 1, 1, 2, 2, 3],
  ])

  let b = int.vector ([
    28,
    4,
    20,
    14,
    9,
  ])

  let solution = A.solve (b)

  if (solution !== null) {
    solution.print ()

    assert (
      A.act (solution) .eq (b)
    )
  }
}
```

### `num` num

- with config-able `epsilon` for numerical stability

#### [`examples/num-linear-algebra.js`](examples/num-linear-algebra.js):

``` javascript
let assert = require ("assert") .strict

let ut = require ("cicada-lang/lib/util")
let num = require ("cicada-lang/lib/num")

{
  /**
   * `reduced_row_echelon_form` reduces pivots to one
   *   while respecting `epsilon` for numerical stability
   */

  let A = num.matrix ([
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 5, 35],
  ])

  let B = num.matrix ([
    [1, 0, -2, -3],
    [0, 1, 1, 4],
    [0, 0, 0, 0],
  ])

  A.reduced_row_echelon_form () .print ()

  assert (
    A.reduced_row_echelon_form () .eq (B)
  )
}
```

### `eu` euclid

- [module theory](https://en.wikipedia.org/wiki/Module_(mathematics)) over [euclidean ring](https://en.wikipedia.org/wiki/Euclidean_ring)
  - for generic matrix algorithms

### `cg` combinatorial-game

- a game engine for n-player perfect information games
- example games:
  - tic-tac-toe
  - hackenbush -- [demo](http://hackenbush.combinatorial-game.surge.sh/)

### `cx` cell-complex

- cell-complex based low dimensional algebraic topology library
- [`docs/a-recursive-combinatorial-description-of-cell-complex.md`](docs/a-recursive-combinatorial-description-of-cell-complex.md)

### `gh` graph

- [TODO]
- graph theory -- one dimensional cell-complex

### `hl` homology

- [cellular homology](https://en.wikipedia.org/wiki/Cellular_homology) of cell-complex

#### [`examples/four-ways-to-glue-a-square.js`](examples/four-ways-to-glue-a-square.js):

- The following pictures are made by Guy Inchbald, a.k.a. [Steelpillow](https://commons.wikimedia.org/wiki/User:Steelpillow)

![Flatsurfaces.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Flatsurfaces.svg)

``` javascript
let cx = require ("cicada-lang/lib/cell-complex")
let hl = require ("cicada-lang/lib/homology")
let ut = require ("cicada-lang/lib/util")
```

![Spherecycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Spherecycles1.svg)

``` javascript
class sphere_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertexes (["south", "middle", "north"])
    this.attach_edge ("south_long", ["south", "middle"])
    this.attach_edge ("north_long", ["middle", "north"])
    this.attach_face ("surf", [
      "south_long",
      "north_long",
      ["north_long", "rev"],
      ["south_long", "rev"],
    ])
  }
}
```

![Toruscycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Toruscycles1.svg)

``` javascript
class torus_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertex ("origin")
    this.attach_edge ("toro", ["origin", "origin"])
    this.attach_edge ("polo", ["origin", "origin"])
    this.attach_face ("surf", [
      "toro",
      "polo",
      ["toro", "rev"],
      ["polo", "rev"],
    ])
  }
}
```

![Kleincycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Kleincycles1.svg)

``` javascript
class klein_bottle_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertex ("origin")
    this.attach_edge ("toro", ["origin", "origin"])
    this.attach_edge ("cross", ["origin", "origin"])
    this.attach_face ("surf", [
      "toro",
      "cross",
      ["toro", "rev"],
      "cross",
    ])
  }
}
```

![Projectivecycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Projectivecycles1.svg)

``` javascript
class projective_plane_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertexes (["start", "end"])
    this.attach_edge ("left_rim", ["start", "end"])
    this.attach_edge ("right_rim", ["end", "start"])
    this.attach_face ("surf", [
      "left_rim", "right_rim",
      "left_rim", "right_rim",
    ])
  }
}

```

- calculate [homology groups](https://en.wikipedia.org/wiki/Homology_(mathematics)):

``` javascript
let report = {
  "sphere": hl.report (new sphere_t ()),
  "torus": hl.report (new torus_t ()),
  "klein_bottle": hl.report (new klein_bottle_t ()),
  "projective_plane": hl.report (new projective_plane_t ()),
}

ut.log (report)

let expected_report = {
  sphere:
   { '0': { betti_number: 1, torsion_coefficients: [] },
     '1': { betti_number: 0, torsion_coefficients: [] },
     '2': { betti_number: 1, torsion_coefficients: [] },
     euler_characteristic: 2 },
  torus:
   { '0': { betti_number: 1, torsion_coefficients: [] },
     '1': { betti_number: 2, torsion_coefficients: [] },
     '2': { betti_number: 1, torsion_coefficients: [] },
     euler_characteristic: 0 },
  klein_bottle:
   { '0': { betti_number: 1, torsion_coefficients: [] },
     '1': { betti_number: 1, torsion_coefficients: [ 2 ] },
     '2': { betti_number: 0, torsion_coefficients: [] },
     euler_characteristic: 0 },
  projective_plane:
   { '0': { betti_number: 1, torsion_coefficients: [] },
     '1': { betti_number: 0, torsion_coefficients: [ 2 ] },
     '2': { betti_number: 0, torsion_coefficients: [] },
     euler_characteristic: 1 }
}
```

### `cs` cicadascript

A dependently-typed programming language
- with javascript-like syntax
- based on game semantics
- for interactive theorem proving
- and practical verification tasks

[examples (preview)](https://github.com/xieyuheng/cicada/tree/master/examples/cicadascript)

## License

- [GPLv3](LICENSE)
