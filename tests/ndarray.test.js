import test from "ava"

import * as nd from "../lib/ndarray"
import { permutation_t } from "../lib/permutation"
import * as ut from "../lib/util"

test ("shape_to_strides", t => {
  let shape = [2, 3, 4]
  let strides = nd.array_t.shape_to_strides (shape)
  t.deepEqual (strides, [12, 4, 1])
})

test ("new nd.array_t", t => {
  let shape = [3, 4]
  let strides = nd.array_t.shape_to_strides (shape)
  let buffer = new Float64Array (12)
  let x = new nd.array_t (buffer, shape, strides)
  t.true (x.get ([1, 2]) === 0)
  x.set ([1, 2], 666)
  t.true (x.get ([1, 2]) === 666)
  t.true (x.get ([0, 0]) === 0)

  t.throws (() => {
    let shape = [3, 4]
    let strides = nd.array_t.shape_to_strides (shape)
    let buffer = new Float64Array (11)
    let x = new nd.array_t (buffer, shape, strides)
  })
})

test ("from_1darray", t => {
  let x = nd.array_t.from_1darray ([0, 1, 2])
  t.true (x.get ([0]) === 0)
  t.true (x.get ([1]) === 1)
  t.true (x.get ([2]) === 2)
})

test ("from_2darray", t => {
  t.throws (() => {
    nd.array_t.from_2darray ([[0, 1, 2], [3, 4, 5, 6]])
  })

  let x = nd.array_t.from_2darray ([[0, 1, 2], [3, 4, 5]])
  t.true (x.get ([0, 0]) === 0)
  t.true (x.get ([0, 1]) === 1)
  t.true (x.get ([0, 2]) === 2)
  t.true (x.get ([1, 0]) === 3)
  t.true (x.get ([1, 1]) === 4)
  t.true (x.get ([1, 2]) === 5)
})

test ("from_3darray", t => {
  t.throws (() => {
    nd.array_t.from_3darray ([
      [[0, 1, 2], [3, 4, 5]],
      [[5, 4, 3], [2, 1, 0, 0]],
    ])
  })

  let x = nd.array_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 4, 3], [2, 1, 0]],
  ])
  t.true (x.get ([0, 0, 0]) === 0)
  t.true (x.get ([0, 0, 1]) === 1)
  t.true (x.get ([0, 0, 2]) === 2)
  t.true (x.get ([0, 1, 0]) === 3)
  t.true (x.get ([0, 1, 1]) === 4)
  t.true (x.get ([0, 1, 2]) === 5)
  t.true (x.get ([1, 0, 0]) === 5)
  t.true (x.get ([1, 0, 1]) === 4)
  t.true (x.get ([1, 0, 2]) === 3)
  t.true (x.get ([1, 1, 0]) === 2)
  t.true (x.get ([1, 1, 1]) === 1)
  t.true (x.get ([1, 1, 2]) === 0)
})

test ("from_buffer", t => {
  let x = nd.array_t.from_buffer (
    Float64Array.from ([
      0, 1, 2,  3, 4, 5,
      5, 4, 3,  2, 1, 0,
    ]),
    [2, 2, 3],
  )
  t.true (x.get ([0, 0, 0]) === 0)
  t.true (x.get ([0, 0, 1]) === 1)
  t.true (x.get ([0, 0, 2]) === 2)
  t.true (x.get ([0, 1, 0]) === 3)
  t.true (x.get ([0, 1, 1]) === 4)
  t.true (x.get ([0, 1, 2]) === 5)
  t.true (x.get ([1, 0, 0]) === 5)
  t.true (x.get ([1, 0, 1]) === 4)
  t.true (x.get ([1, 0, 2]) === 3)
  t.true (x.get ([1, 1, 0]) === 2)
  t.true (x.get ([1, 1, 1]) === 1)
  t.true (x.get ([1, 1, 2]) === 0)
})

test ("proj", t => {
  let y = nd.array_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 4, 3], [2, 1, 0]],
  ])

  t.throws (() => {
    y.proj ([0, null])
  })

  {
    let x = y.proj ([0, null, null])
    t.true (x.get ([0, 0]) === 0)
    t.true (x.get ([0, 1]) === 1)
    t.true (x.get ([0, 2]) === 2)
    t.true (x.get ([1, 0]) === 3)
    t.true (x.get ([1, 1]) === 4)
    t.true (x.get ([1, 2]) === 5)
  }

  {
    let x = y.proj ([0, null, 0])
    t.true (x.get ([0]) === 0)
    t.true (x.get ([1]) === 3)
    x = x.copy ()
    t.true (x.get ([0]) === 0)
    t.true (x.get ([1]) === 3)
  }

  {
    let x = y.proj ([1, null, null])
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 4)
    t.true (x.get ([0, 2]) === 3)
    t.true (x.get ([1, 0]) === 2)
    t.true (x.get ([1, 1]) === 1)
    t.true (x.get ([1, 2]) === 0)
  }

  {
    let x = y.proj ([1, null, 2])
    t.true (x.get ([0]) === 3)
    t.true (x.get ([1]) === 0)
    x = x.copy ()
    t.true (x.get ([0]) === 3)
    t.true (x.get ([1]) === 0)
  }
})

test ("slice", t => {
  let y = nd.array_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 5, 0], [6, 6, 0]],
    [[5, 4, 3], [2, 1, 0]],
  ])

  t.throws (() => {
    y.slice ([null, [0, 2]])
  })

  {
    let x = y
        .proj ([1, null, null])
        .slice ([null, [0, 2]])
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
    x = x.copy ()
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
  }

  {
    let x = y
        .slice ([null, null, [0, 2]])
        .proj ([1, null, null])
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
    x = x.copy ()
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
  }
})

test ("put", t => {
  let y = nd.array_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 5, 0], [6, 6, 0]],
    [[5, 4, 3], [2, 1, 0]],
  ])

  {
    y.put (
      [null, null, [0, 2]],
      nd.array_t.from_3darray ([
        [[9, 9], [9, 9]],
        [[9, 9], [9, 9]],
        [[9, 9], [9, 9]],
      ]))
    let x = y
        .slice ([null, null, [0, 2]])
        .proj ([1, null, null])
    t.true (x.get ([0, 0]) === 9)
    t.true (x.get ([0, 1]) === 9)
    t.true (x.get ([1, 0]) === 9)
    t.true (x.get ([1, 1]) === 9)
    x = x.copy ()
    t.true (x.get ([0, 0]) === 9)
    t.true (x.get ([0, 1]) === 9)
    t.true (x.get ([1, 0]) === 9)
    t.true (x.get ([1, 1]) === 9)
  }
})

test ("numbers", t => {
  {
    let x = nd.array_t.numbers (6, [2, 2])
    t.true (x.get ([0, 0]) === 6)
    t.true (x.get ([0, 1]) === 6)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
  }

  {
    let x = nd.array_t.zeros ([2, 2])
    t.true (x.get ([0, 0]) === 0)
    t.true (x.get ([0, 1]) === 0)
    t.true (x.get ([1, 0]) === 0)
    t.true (x.get ([1, 1]) === 0)
  }

  {
    let x = nd.array_t.ones ([2, 2])
    t.true (x.get ([0, 0]) === 1)
    t.true (x.get ([0, 1]) === 1)
    t.true (x.get ([1, 0]) === 1)
    t.true (x.get ([1, 1]) === 1)
  }
})

test ("fill", t => {
  let x = nd.array_t.numbers (6, [2, 2])
  t.true (x.get ([0, 0]) === 6)
  t.true (x.get ([0, 1]) === 6)
  t.true (x.get ([1, 0]) === 6)
  t.true (x.get ([1, 1]) === 6)
  x.fill (0)
  t.true (x.get ([0, 0]) === 0)
  t.true (x.get ([0, 1]) === 0)
  t.true (x.get ([1, 0]) === 0)
  t.true (x.get ([1, 1]) === 0)
})

test ("print", t => {
  nd.array_t.zeros ([10]) .print ()
  nd.array_t.zeros ([2, 3]) .print ()
  nd.array_t.zeros ([2, 3, 4]) .print ()
  nd.array_t.zeros ([2, 3, 4, 5]) .print ()
  nd.array_t.zeros ([2, 3, 4, 5]) .print ()
  t.pass ()
})

test ("map", t => {
  let x = nd.array_t.numbers (3, [2, 2])
  t.true (x.get ([0, 0]) === 3)
  t.true (x.get ([0, 1]) === 3)
  t.true (x.get ([1, 0]) === 3)
  t.true (x.get ([1, 1]) === 3)
  x = x.map (n => n + 3)
  t.true (x.get ([0, 0]) === 6)
  t.true (x.get ([0, 1]) === 6)
  t.true (x.get ([1, 0]) === 6)
  t.true (x.get ([1, 1]) === 6)
})

test ("indexes", t => {
  let y = nd.array_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 4, 3], [2, 1, 0]],
  ])

  t.deepEqual (Array.from (y.indexes ()), [
    [ 0, 0, 0 ],
    [ 0, 0, 1 ],
    [ 0, 0, 2 ],
    [ 0, 1, 0 ],
    [ 0, 1, 1 ],
    [ 0, 1, 2 ],
    [ 1, 0, 0 ],
    [ 1, 0, 1 ],
    [ 1, 0, 2 ],
    [ 1, 1, 0 ],
    [ 1, 1, 1 ],
    [ 1, 1, 2 ],
  ])

  let x = y.proj ([0, null, null])

  t.deepEqual (Array.from (x.indexes ()), [
    [ 0, 0 ],
    [ 0, 1 ],
    [ 0, 2 ],
    [ 1, 0 ],
    [ 1, 1 ],
    [ 1, 2 ],
  ])

  x = x.copy ()

  t.deepEqual (Array.from (x.indexes ()), [
    [ 0, 0 ],
    [ 0, 1 ],
    [ 0, 2 ],
    [ 1, 0 ],
    [ 1, 1 ],
    [ 1, 2 ],
  ])
})

test ("reshape", t => {
  let y = nd.array_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 4, 3], [2, 1, 0]],
  ])


  t.deepEqual (
    y.reshape (new permutation_t ([1, 0, 2])) .shape,
    [2, 2, 3],
  )

  let x = y.proj ([1, null, null])

  t.deepEqual (
    x.reshape (new permutation_t ([1, 0])) .shape,
    [3, 2],
  )

  let z = nd.array_t.from_2darray ([
    [5, 2],
    [4, 1],
    [3, 0],
  ])

  t.true (
    x.reshape (new permutation_t ([1, 0])) .eq (z)
  )

  t.pass ()
})

test ("append", t => {
  let x = nd.array_t.from_2darray ([
    [0, 1, 2],
    [3, 4, 5],
  ])

  let y = nd.array_t.from_2darray ([
    [0, 1, 2],
    [3, 4, 5],
  ])

  t.true (
    x.append (0, y) .eq (nd.array_t.from_2darray ([
      [0, 1, 2],
      [3, 4, 5],
      [0, 1, 2],
      [3, 4, 5],
    ]))
  )

  t.true (
    x.append (1, y) .eq (nd.array_t.from_2darray ([
      [0, 1, 2, 0, 1, 2],
      [3, 4, 5, 3, 4, 5],
    ]))
  )

  t.pass ()
})

test ("permute", t => {
  let x = nd.array_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 4, 3], [2, 1, 0]],
  ])

  t.true (
    x.permute (
      0, new permutation_t ([1, 0])
    ) .eq (nd.array_t.from_3darray ([
      [[5, 4, 3], [2, 1, 0]],
      [[0, 1, 2], [3, 4, 5]],
    ]))
  )

  t.true (
    x.permute (
      2, new permutation_t ([1, 0, 2])
    ) .eq (nd.array_t.from_3darray ([
      [[1, 0, 2], [4, 3, 5]],
      [[4, 5, 3], [1, 2, 0]],
    ]))
  )

  t.pass ()
})

test ("from_lower_order", t => {
  let x = nd.array_t.from_lower_order ([
    nd.array ([1, 2, 3]),
    nd.array ([4, 5, 6]),
  ])

  let y = nd.array ([
    [1, 2, 3],
    [4, 5, 6],
  ])

  t.true (x.eq (y))
})

test ("nd.array_t.add", t => {
  let x = nd.array_t.ones ([2, 3])
  let y = nd.array ([
    [2, 2, 2],
    [2, 2, 2],
  ])

  t.true (x.add (x) .eq (y))
})
