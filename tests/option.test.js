import test from "ava"

import * as ut from "../lib/util"

import { option_t, some_t, none_t } from "../lib/option"

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
