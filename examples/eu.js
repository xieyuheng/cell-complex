let eu = require ("cicada-lang/lib/euclidean-space")
let log = require ("cicada-lang/lib/util") .log

{
  let m = eu.matrix_t.from_array ([
    [ 2, -1],
    [-1,  2],
  ])

  let v = eu.vector_t.from_array ([
    1,
    2,
  ])

  m.table ()
  v.table ()
  m.act (v) .table ()
}

{
  let m = eu.matrix_t.from_array ([
    [ 2, -1],
    [-1,  2],
  ])

  let v = eu.vector_t.from_array ([
    1,
    2,
  ])

  m.table ()
  v.table ()
  m.act (v) .table ()
}

