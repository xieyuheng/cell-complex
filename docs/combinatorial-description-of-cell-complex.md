# Combinatorial Description of cell-complex

- Author: Xie Yuheng
- Date: 2019-05-06

To explain how I model cell-complex,
I start from how one might model graph,
and generalize the model to higher dimension recursively.

TODO

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
```
