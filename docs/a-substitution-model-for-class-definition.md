# A Substitution Model for Class Definition

I wish the following remark can make my idea more clear.

in the definition of `class spherical_t`

``` typescript
class spherical_t extends cell_complex_t {
  spherical_evidence: spherical_evidence_t
}
```

substitute `extends cell_complex_t` by the definition of `class cell_complex_t`

``` typescript
class cell_complex_t {
  cell_dic: dic_t <id_t, cell_t>
}
```

we get

``` typescript
class spherical_t {
  spherical_evidence: spherical_evidence_t
  cell_dic: dic_t <id_t, cell_t>
}
```

substitute the above definition of `class spherical_t` and `class cell_complex_t`
in to the definition of `class cell_t`

``` typescript
class cell_t {
  dom: spherical_t
  cod: cell_complex_t
  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
}
```

we get

``` typescript
class cell_t {
  dom: {
    spherical_evidence: spherical_evidence_t
    cell_dic: dic_t <id_t, cell_t>
  }
  cod: {
    cell_dic: dic_t <id_t, cell_t>
  }
  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
}
```

substitute the definition of `class spherical_evidence_t` into the above definition of `class cell_t`
we get

``` typescript
class cell_t {
  dom: {
    spherical_evidence: {
      /**
       * [detail definition omitted]
       */
    }
    cell_dic: dic_t <id_t, cell_t>
  }
  cod: {
    cell_dic: dic_t <id_t, cell_t>
  }
  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
}
```

if I do not omit the `[detail definition]` in above structure
I will get something roughly like

``` typescript
class cell_t {
  dom: {
    spherical_evidence: {
      "isomorphism": "isomorphism between two cell-complexes A and B"
      "subdivision of dom": "A is a subdivision of this dom"
      "subdivision of standard n-sphere": "B is a subdivision of a standard n-sphere"
    }
    cell_dic: dic_t <id_t, cell_t>
  }
  cod: {
    cell_dic: dic_t <id_t, cell_t>
  }
  dic: dic_t <id_t, { id: id_t, cell: cell_t }>
}
```
