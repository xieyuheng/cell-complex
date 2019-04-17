import test from "ava"

import * as ut from "../lib/util"
import * as nd from "../lib/ndarray"
import * as pd from "../lib/panel-data"

import { permutation_t } from "../lib/permutation"


test ("new pd.data_t", t => {
  let axes = pd.axes ([
    ["Alice", pd.axis (["silent", "betray"])],
    ["Bob", pd.axis (["silent", "betray"])],
    ["payoff", pd.axis (["Alice", "Bob"])],
  ])

  let prisoner_s_dilemma = new pd.data_t (
    pd.axes ([
      ["Alice", pd.axis (["silent", "betray"])],
      ["Bob", pd.axis (["silent", "betray"])],
      ["payoff", pd.axis (["Alice", "Bob"])],
    ]),
    nd.array ([
      [[-1, -1], [-3, -0]],
      [[-0, -3], [-2, -2]],
    ]),
  )
  prisoner_s_dilemma.print ()
  t.pass ()
})

test ("pd.data_t.proj", t => {
  let axes = pd.axes ([
    ["Alice", pd.axis (["silent", "betray"])],
    ["Bob", pd.axis (["silent", "betray"])],
    ["payoff", pd.axis (["Alice", "Bob"])],
  ])

  let prisoner_s_dilemma = new pd.data_t (
    pd.axes ([
      ["Alice", pd.axis (["silent", "betray"])],
      ["Bob", pd.axis (["silent", "betray"])],
      ["payoff", pd.axis (["Alice", "Bob"])],
    ]),
    nd.array ([
      [[-1, -1], [-3, -0]],
      [[-0, -3], [-2, -2]],
    ]),
  )

  prisoner_s_dilemma.proj (pd.index ([
    ["Alice", "betray"],
  ])) .print ()

  t.pass ()
})

test ("new pd.series_t", t => {
  let x = pd.series (
    "abc",
    pd.axis (["a", "b", "c"]),
    nd.array ([1, 2, 3]),
  )

  // x.print ()

  t.pass ()
})

test ("pd.frame_t.from_rows", t => {
  let frame = pd.frame_t.from_rows (
    "rows", "cols", [
      pd.series ("row1",
                 pd.axis (["col1", "col2"]),
                 nd.array ([1, 2])),
      pd.series ("row2",
                 pd.axis (["col1", "col2"]),
                 nd.array ([3, 4])),
    ])

  t.true (
    frame.data.get (pd.index ([
      ["rows", "row1"],
      ["cols", "col2"],
    ])) === 2
  )

  t.true (
    frame.data.get (pd.index ([
      ["cols", "col2"],
      ["rows", "row1"],
    ])) === 2
  )
})

test ("pd.frame_t.from_cols", t => {
  let frame = pd.frame_t.from_cols (
    "rows", "cols", [
      pd.series ("col1",
                 pd.axis (["row1", "row2"]),
                 nd.array ([1, 3])),
      pd.series ("col2",
                 pd.axis (["row1", "row2"]),
                 nd.array ([2, 4])),
    ])

  t.true (
    frame.data.get (pd.index ([
      ["rows", "row1"],
      ["cols", "col2"],
    ])) === 2
  )

  t.true (
    frame.data.get (pd.index ([
      ["cols", "col2"],
      ["rows", "row1"],
    ])) === 2
  )
})

test ("pd.frame_t.row & col", t => {
  let frame = pd.frame_t.from_rows (
    "rows", "cols", [
      pd.series ("row1",
                 pd.axis (["col1", "col2"]),
                 nd.array ([1, 2])),
      pd.series ("row2",
                 pd.axis (["col1", "col2"]),
                 nd.array ([3, 4])),
    ])

  t.true (
    frame.row ("row1") .get ("col1") === 1
  )

  t.true (
    frame.row ("row1") .get ("col2") === 2
  )

  t.true (
    frame.row ("row1") .get ("col1") ===
      frame.col ("col1") .get ("row1")
  )

  t.true (
    frame.row ("row1") .get ("col2") ===
      frame.col ("col2") .get ("row1")
  )

  t.pass ()
})

test ("pd.frame_t *row & *col", t => {
  let frame = pd.frame_t.from_rows (
    "rows", "cols", [
      pd.series ("row1",
                 pd.axis (["col1", "col2"]),
                 nd.array ([1, 2])),
      pd.series ("row2",
                 pd.axis (["col1", "col2"]),
                 nd.array ([3, 4])),
    ])

  for (let row of frame.rows ()) {
    // row.print ()
  }

  for (let col of frame.cols ()) {
    // col.print ()
  }

  t.pass ()
})

test ("pd.frame_t.print", t => {
  {
    let frame = pd.frame_t.from_rows (
      "rows", "cols", [
        pd.series ("row1",
                   pd.axis (["col1", "col2"]),
                   nd.array ([1, 2])),
        pd.series ("row2",
                   pd.axis (["col1", "col2"]),
                   nd.array ([3, 4])),
      ])

    // frame.print ()
  }

  {
    let frame = pd.frame_t.from_cols (
      "rows", "cols", [
        pd.series ("col1",
                   pd.axis (["row1", "row2"]),
                   nd.array ([1, 3])),
        pd.series ("col2",
                   pd.axis (["row1", "row2"]),
                   nd.array ([2, 4])),
      ])

    // frame.print ()
  }

  t.pass ()
})
