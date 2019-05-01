# Cicada Language

## Aims

- Implement and test mathematical theories in existing languages
- Design new languages to formalize abstract mathematical structures
- Questions are welcome -- [issues](https://github.com/xieyuheng/cicada/issues)

## Community

- We enforce C4 as collaboration protocol -- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- [Code of Conduct](CODE-OF-CONDUCT.md)
- Source code -- [github](https://github.com/xieyuheng/cicada), [gitlab](https://gitlab.com/xieyuheng/cicada/)
- IRC -- [#cicada-language](https://kiwiirc.com/nextclient/irc.freenode.net/#cicada-language)
- CI -- [gitlab-ci](https://gitlab.com/xieyuheng/cicada/pipelines)
- [cicada-rs](http://github.com/xieyuheng/cicada-rs) -- an old cicada attempt in rust

## Modules

- `npm install cicada-lang`

- [API Docs](https://api.cicada-lang.now.sh)

- Try [examples](https://github.com/xieyuheng/cicada/tree/master/examples)
  - use [`node`](https://github.com/nodejs/node) to run examples written in javascript
  - use [`ts-node`](https://github.com/TypeStrong/ts-node) to run examples written in typescript

- Contents:
  - [int](#int)
  - [num](#num)
  - [euclid](#eu-euclid)
  - [combinatorial-game](#cg-combinatorial-game)
  - [cell-complex](#cx-cell-complex)
  - [homology](#hl-homology)
  - [cicada-core](#cc-cicada-core)
  - [cicadascript](#cs-cicadascript)

### `int` int

- basic number theory
  - native js `BigInt`

#### `examples/int-module.ts`:

``` typescript
import assert from "assert"

import * as ut from "cicada-lang/lib/util"
import * as int from "cicada-lang/lib/int"

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

  let A = matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ])

  let S = matrix ([
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

- basic float number
  - native js `Number`
  - `epsilon` for numerical stability

#### `examples/num-linear-algebra.ts`:

``` typescript
import assert from "assert"

import * as ut from "cicada-lang/lib/util"
import * as num from "cicada-lang/lib/num"

{
  /**
   * `reduced_row_echelon_form` is like `row_canonical_form`
   *   it reduces pivots to one
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

### `gh` graph

- [work in progress]
- graph theory -- one dimensional cell-complex

### `hl` homology

- [cellular homology](https://en.wikipedia.org/wiki/Cellular_homology) of cell-complex

#### `examples/four-ways-to-glue-a-square.ts`:

![Flatsurfaces.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Flatsurfaces.svg)

``` typescript
import * as cx from "cicada-lang/lib/cell-complex"
import * as hl from "cicada-lang/lib/homology"
import * as ut from "cicada-lang/lib/util"
```

![Spherecycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Spherecycles1.svg)

``` typescript
class sphere_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let [south, middle, north] = builder.inc_points (3)
    let south_long = builder.attach_edge (south, middle)
    let north_long = builder.attach_edge (middle, north)
    let surf = builder.attach_face ([
      south_long,
      north_long,
      north_long.rev (),
      south_long.rev (),
    ])
    super (builder)
  }
}
```

![Toruscycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Toruscycles1.svg)

``` typescript
class torus_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let origin = builder.inc_one_point ()
    let toro = builder.attach_edge (origin, origin)
    let polo = builder.attach_edge (origin, origin)
    let surf = builder.attach_face ([
      toro,
      polo,
      toro.rev (),
      polo.rev (),
    ])
    super (builder)
  }
}
```

![Kleincycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Kleincycles1.svg)

``` typescript
class klein_bottle_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let origin = builder.inc_one_point ()
    let toro = builder.attach_edge (origin, origin)
    let cross = builder.attach_edge (origin, origin)
    let surf = builder.attach_face ([
      toro,
      cross,
      toro.rev (),
      cross,
    ])
    super (builder)
  }
}
```

![Projectivecycles1.svg](https://github.com/xieyuheng/image-link/blob/master/homology/Projectivecycles1.svg)

``` typescript
class projective_plane_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let [start, end] = builder.inc_points (2)
    let left_rim = builder.attach_edge (start, end)
    let right_rim = builder.attach_edge (end, start)
    let surf = builder.attach_face ([
      left_rim, right_rim,
      left_rim, right_rim,
    ])
    super (builder)
  }
}
```

- calculate [homology groups](https://en.wikipedia.org/wiki/Homology_(mathematics)):

``` typescript
let report: any = {
  "sphere": hl.homology_group_report (new sphere_t ()),
  "torus": hl.homology_group_report (new torus_t ()),
  "klein_bottle": hl.homology_group_report (new klein_bottle_t ()),
  "projective_plane": hl.homology_group_report (new projective_plane_t ()),
}

ut.log (report)

{ sphere:
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
     euler_characteristic: 1 } }
```

- Pictures by Guy Inchbald, a.k.a. [Steelpillow](https://commons.wikimedia.org/wiki/User:Steelpillow)

### `cc` cicada-core

- [work in progress]
- a dependently-typed programming language
- game semantics
- logic programming interface

### `cs` cicadascript

- [work in progress]
- js syntax frontend of cicada-core

## License

- [GPLv3](LICENSE)
