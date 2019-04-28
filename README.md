# Cicada Language

## Aims

- Implement and test mathematical theories in existing languages.
- Design new languages to formalize abstract mathematical structures.
- Questions are welcome -- [issues](https://github.com/xieyuheng/cicada/issues)

## Community

- We enforce C4 as collaboration protocol -- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- [Code of Conduct](CODE-OF-CONDUCT.md)
- Source code -- [github](https://github.com/xieyuheng/cicada), [gitlab](https://gitlab.com/xieyuheng/cicada/)
- IRC -- [#cicada-language](https://kiwiirc.com/nextclient/irc.freenode.net/#cicada-language)
- CI -- [gitlab-ci](https://gitlab.com/xieyuheng/cicada/pipelines)
- [cicada-rs](http://github.com/xieyuheng/cicada-rs) -- an old cicada attempt in rust

## Docs

- [API](https://api.cicada-lang.now.sh)

## Modules

### euclid (`eu`)

- euclidean space -- affine space with dot product
  - `matrix_t`, `vector_t` and `point_t`

- module over euclidean domain -- for generic algorithms

### combinatorial-game (`cg`)

- a game engine for n-player perfect information games
- example games:
  - tic-tac-toe
  - hackenbush -- [demo](http://hackenbush.combinatorial-game.surge.sh/)

### cell-complex (`cx`)

- cell-complex based low dimensional algebraic topology library
- example cell complexes:
  - torus

### homology (`hl`)

- cellular homology of cell-complex

- `examples/hl.ts`:

``` typescript
import * as cx from "cicada-lang/lib/cell-complex"
import * as hl from "cicada-lang/lib/homology"
import * as ut from "cicada-lang/lib/util"

class sphere_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let [south, middle, north] = bui.inc_points (3)
    let south_long = bui.attach_edge (south, middle)
    let north_long = bui.attach_edge (middle, north)
    let surf = bui.attach_face ([
      south_long,
      north_long,
      north_long.rev (),
      south_long.rev (),
    ])
    super (bui)
  }
}

class torus_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let toro = bui.attach_edge (origin, origin)
    let polo = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      toro,
      polo,
      toro.rev (),
      polo.rev (),
    ])
    super (bui)
  }
}

class klein_bottle_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let toro = bui.attach_edge (origin, origin)
    let cross = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      toro,
      cross,
      toro.rev (),
      cross,
    ])
    super (bui)
  }
}

class projective_plane_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let [start, end] = bui.inc_points (2)
    let left_rim = bui.attach_edge (start, end)
    let right_rim = bui.attach_edge (end, start)
    let surf = bui.attach_face ([
      left_rim, right_rim,
      left_rim, right_rim,
    ])
    super (bui)
  }
}

let report: any = {
  "sphere": hl.homology_group_report (new sphere_t ()),
  "torus": hl.homology_group_report (new torus_t ()),
  "klein_bottle": hl.homology_group_report (new klein_bottle_t ()),
  "projective_plane": hl.homology_group_report (new projective_plane_t ()),
}

ut.log (report)

// ==>

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

### cicada

- a dependently-typed programming language
- game semantics
- logic programming interface

## License

- [GPLv3](LICENSE)
