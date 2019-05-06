# A Recursive Combinatorial Description of cell-complex

------
- Author: Xie Yuheng
- Date: 2019-05-06
- Keywords: cell-complex, data structure.
------

## Abstract

I provide a recursive combinatorial description of cell-complex, with the hope that it will serves as a stepstone for further formalization and experiments in algebraic topology.

### Contains

- [Introduction](#introduction)
- [graph as an example (to let readers be familiar with the pseudo code)](#graph-as-an-example-to-let-readers-be-familiar-with-the-pseudo-code)
- [cell-complex](#cell-complex)
- [cell-complex (again with comments)](#cell-complex-again-with-comments)
- [note about incidence matrix](#note-about-incidence-matrix)
- [future works](#future-works)

## Introduction

To explain how I model cell-complex,
I use javascript-like pseudo code to describe data structure.

## graph as an example (to let readers be familiar with the pseudo code)

- the prefix `_t` denotes type
- `id_t` is a serial number uniquely identify a vertex or an edge
- `dic_t <K, V>` is a dictionary (a finite mapping) from `K` to `V`

``` typescript
type id_t = number

class vertex_t {}

class edge_t {
  start: id_t
  end: id_t
}

class graph_t {
  vertex_dic: dic_t <id_t, vertex_t>
  edge_dic: dic_t <id_t, edge_t>
}
```

## cell-complex

`cell_complex_t` can be viewed as generation of `graph_t` to higher dimension,
- merge `vertex_dic` and `edge_dic` to `cell_dic`
- add `dim` field in `id_t` to distinguish dimension

``` typescript
class id_t {
  dim: number
  ser: number
}

class cell_complex_t {
  cell_dic: dic_t <id_t, cell_t>
}

class cell_t {
  dom: spherical_t
  cod: cell_complex_t
  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
}

class spherical_t extends cell_complex_t {
  spherical_evidence: spherical_evidence_t
}

class spherical_evidence_t {
  /**
   * [detail definition omitted]
   */
}
```

## cell-complex (again with comments)

- comments are written in `/** ... */`

``` typescript
class id_t {
  dim: number
  ser: number
}

class cell_complex_t {
  cell_dic: dic_t <id_t, cell_t>
  /**
   * TODO
   */
}

class cell_t {
  /**
   * `dom` -- domain
   * `cod` -- codomain
   */
  dom: spherical_t
  cod: cell_complex_t

  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
  /**
   * Here the `dic` is a surjective mapping
   *   from id of `dom` to id to `cod`.
   * which serves as a record of
   *   how the cells in `dom` is mapped to the cells in `cod`.

   * Here we can not simply use:
   *   `dic: dic_t <id_t, id_t>`
   * we also need to record
   *   how the boundary of a cell `A` in `dom`
   *   is mapped to the boundary of a cell `B` in `cod`.
   * we can record this extra information by another cell `C`
   *   `C.dom == A.dom`
   *   `C.cod == B.dom`

   * I found this only when trying to construct `vertex_figure` of `cell_complex`,
   * without the extra information,
   *   it will be impossible to construct `vertex_figure`,
   * and the construction of `vertex_figure` is important for checking
   *   whether a `cell_complex` is a `manifold`.
   */
}

class spherical_t extends cell_complex_t {
  spherical_evidence: spherical_evidence_t
  /**
   * `spherical_t` is special `cell_complex_t`
   *   it extends `cell_complex_t` by adding field `spherical_evidence`,
   * which contains a homeomorphism between the `cell_complex`
   *   and a standard sphere (for example, boundary of n-simplex or n-cube),
   * where homeomorphism between two cell-complexes
   *   is defined as iosmorphism after subdivisions,
   * and iosmorphism between two cell-complexes is
   *   a generalization of iosmorphism between two graphs.

   * It is known that TODO.
   */
}

class spherical_evidence_t {
  /**
   * [detail definition omitted]
   */
}
```

## Note about incidence matrix

`dic_t` can be viewed as sparse matrix.

The recursive definition of `cell_t` means that, instead of incidence matrix, we need higher order incidence tensor to describe cell-complex.

## Future works

TODO

## Reference

TODO
