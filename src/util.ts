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
function* ranges (array: Array <[number, number]>) {
  for (let [lo, hi] of array) {
    for (let i of range (lo, hi)) {
      yield i
    }
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

export
function map_eq <K, V> (
  x: Map <K, V>,
  y: Map <K, V>,
  eq: (v: V, w: V) => boolean,
): boolean {
  if (x.size !== y.size) { return false }
  for (let k of x.keys ()) {
    let v = x.get (k)
    let w = y.get (k)
    if (v === undefined) {
      return false
    } else if (w === undefined) {
      return false
    } else if (! eq (v, w)) {
      return false
    }
  }
  return true
}

export
function array_eq <V> (
  x: Array <V>,
  y: Array <V>,
  eq: (v: V, w: V) => boolean,
): boolean {
  if (x.length !== y.length) { return false }
  for (let i of range (0, x.length)) {
    let v = x [i]
    let w = y [i]
    if (! eq (v, w)) {
      return false
    }
  }
  return true
}
