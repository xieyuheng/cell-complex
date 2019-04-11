let assert = require ("assert")

let eu = require ("cicada-lang/lib/euclidean-space")
let log = require ("cicada-lang/lib/util") .log

{
  let m = eu.matrix_t.from_array ([
    [ 2, -1],
    [-1,  2],
  ])

  let b = eu.vector_t.from_array ([
    0,
    3,
  ])

  let v = eu.vector_t.from_array ([
    1,
    2,
  ])


  m.table ()
  v.table ()
  m.act (v) .table ()

  assert (
    m.act (v) .eq (b)
  )
}

{
  let m = eu.matrix_t.from_array ([
    [ 2, -1,  0],
    [-1,  2, -1],
    [ 0, -3,  4],
  ])

  let b = eu.vector_t.from_array ([
    0,
    -1,
    4,
  ])

  let v = eu.vector_t.from_array ([
    0,
    0,
    1,
  ])

  m.table ()
  v.table ()
  m.act (v) .table ()

  assert (
    m.act (v) .eq (b)
  )
}
