# A Combinatorial Description of cell-complex

- Author: Xie Yuheng
- Date: 2019-05-06

To explain how I model cell-complex,
I use javascript-like pseudo code to describe data structure.

For example, the structure of `graph_t`,
- `id_t` is a serial number uniquely identify a vertex or an edge
- `dic_t <K, V>` is a dictionary (a finite mapping) from `K`, to `V`

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
  dom: spherical_t
  cod: cell_complex_t
  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
  // here we can not simply use:
  //   `dic: dic_t <id_t, id_t>`
}

class spherical_t extends cell_complex_t {
  spherical_evidence: spherical_evidence_t
}
```
