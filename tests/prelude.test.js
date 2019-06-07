import test from "ava"

import * as ut from "../lib/util"

import {
  option_t, some_t, none_t,
  result_t, ok_t, err_t,
} from "../lib/prelude"

test ("option_t.bind", t => {
  t.deepEqual (
    new some_t (3),
    option_t
      .pure (1)
      .bind (x => option_t.pure (x + 1))
      .bind (x => option_t.pure (x + 1))
  )

  t.deepEqual (
    new none_t (),
    option_t
      .pure (1)
      .bind (x => new none_t ())
      .bind (x => new some_t (x + 1))
  )

  t.deepEqual (
    new some_t (3),
    option_t
      .pure (1)
      .bind (x => new some_t (x + 1))
      .bind (x => new some_t (x + 1))
  )

  t.pass ()
})

test ("result_t.bind", t => {
  t.deepEqual (
    new ok_t (3),
    result_t
      .pure (1)
      .bind (x => result_t.ok (x + 1))
      .bind (x => result_t.ok (x + 1))
  )

  t.deepEqual (
    new ok_t (10 + 1 + 10),
    result_t.pure (10) .bind (x => {
      return result_t.ok (x + 1) .bind (y => {
        return result_t.ok (y + x)
      })
    })
  )

  t.deepEqual (
    new ok_t (10 + 1 + 10),
    new ok_t (10) .bind (x => {
      return new ok_t (x + 1) .bind (y => {
        return new ok_t (y + x)
      })
    })
  )

  t.deepEqual (
    new err_t ("an error"),
    result_t
      .pure (1)
      .bind (x => result_t.err ("an error"))
      .bind (x => result_t.ok (x + 1))
  )

  t.pass ()
})
