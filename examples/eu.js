let assert = require ("assert")

let eu = require ("../lib/euclidean-space")
let log = require ("../lib/util") .log

{
  let m = eu.matrix ([
    [ 2, -1],
    [-1,  2],
  ])

  let b = eu.vector ([
    0,
    3,
  ])

  let v = eu.vector ([
    1,
    2,
  ])


  // m.table ()
  // v.table ()
  // m.act (v) .table ()

  assert (
    m.act (v) .eq (b)
  )
}

{
  let m = eu.matrix ([
    [ 2, -1,  0],
    [-1,  2, -1],
    [ 0, -3,  4],
  ])

  let b = eu.vector ([
    0,
    -1,
    4,
  ])

  let v = eu.vector ([
    0,
    0,
    1,
  ])

  // m.table ()
  // v.table ()
  // m.act (v) .table ()

  assert (
    m.act (v) .eq (b)
  )
}

{
  let m = eu.matrix ([
    [1, 2, 1],
    [3, 8, 1],
    [0, 4, 1],
  ])

//   let b = eu.vector ([
//     0,
//     -1,
//     4,
//   ])

  let v = eu.vector ([
    0,
    0,
    1,
  ])

  m.table ()
  v.table ()
  m.act (v) .table ()

//   assert (
//     m.act (v) .eq (b)
//   )
}

{
  let m = eu.matrix ([
    [ 1, 0, 0],
    [-3, 1, 0],
    [ 0, 0, 1],
  ])

  let n = eu.matrix ([
    [1, 0, 0],
    [3, 1, 0],
    [0, 0, 1],
  ])

  assert (
    m.mul (n) .eq (n.mul (m))
  )

  assert (
    m.mul (n) .eq (eu.matrix ([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]))
  )

  m.mul (n) .table ()
}

{
  let m = eu.matrix ([
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 5, 35],
  ])
  m.row_echelon_form () .table ()
}
