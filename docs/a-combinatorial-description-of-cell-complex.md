# A Combinatorial Description of cell-complex

------
- Author: Xie Yuheng
- Date: 2019-05-06
- Keywords: cell-complex, data structure.
------

To explain how I model cell-complex,
I use javascript-like pseudo code to describe data structure.

For example, the structure of `graph_t`,
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
  /**
   * `dom` -- domain
   * `cod` -- codomain
   */
  dom: spherical_t
  cod: cell_complex_t

  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
  /**
   * here we can not simply use: `dic: dic_t <id_t, id_t>`,
   * I found this only when trying to construct `vertex_figure` of `cell_complex`.
   */
}

class spherical_t extends cell_complex_t {
  spherical_evidence: spherical_evidence_t
  /**
   * `spherical_t` extends `cell_complex_t` by adding field `spherical_evidence`,
   * which contains a homeomorphism between the `cell_complex`
   *   and a standard sphere (for example, boundary of n-simplex or n-cube),
   * where homeomorphism is defined as iosmorphism after subdivisions,
   * and iosmorphism between two cell-complexes is
   *   a generalization of iosmorphism between two graphs.
   */
}

class spherical_evidence_t {
  // [detail definition omitted]
}
```
