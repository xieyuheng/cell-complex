import assert from "assert"

export
function log (x: any) {
  console.dir (x, { depth: null })
}

/**
 * left close, right open integer interval.
 */
export
function* range (lo: number, hi: number) {
  assert (hi - lo >= 1)
  let i = lo
  while (i < hi) {
    yield i
    i += 1
  }
}
