import assert from "assert"

export
function log <T> (x: T) {
  console.dir (x, { depth: null })
}

/**
 * left close, right open integer interval.
 */
export
function* range (lo: number, hi: number) {
  let i = lo
  while (i < hi) {
    yield i
    i += 1
  }
}

export
function repeats <T> (x: T, n: number): Array <T> {
  let array = new Array ()
  for (let _ of range (0, n)) {
    array.push (x)
  }
  return array
}
