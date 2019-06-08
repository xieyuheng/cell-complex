import assert from "assert"

export
function TODO (): never {
  throw new Error ("TODO")
}

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

export
function panic (message: string): never {
  throw new Error (message)
}

export
function map2obj <V> (
  map: Map <string, V>
): { [key: string]: V } {
  let obj: any = {}
  for (let [k, v] of map.entries ()) {
    obj [k] = v
  }
  return obj
}

export
function obj2map <V> (
  obj: { [key: string]: V }
): Map <string, V> {
  let map = new Map <string, V> ()
  for (let k in obj) {
    map.set (k, obj [k])
  }
  return map
}

export
type to_map_t <V> = Map <string, V> | { [key: string]: V }

export
function map_from <V> (
  x: Map <string, V> | { [key: string]: V }
): Map <string, V> {
  if (x instanceof Map) {
    return x
  } else {
    return obj2map (x)
  }
}

export
function mapmap <K, A, B> (
  map: Map <K, A>,
  f: (a: A) => B,
): Map <K, B> {
  let new_map = new Map ()
  for (let [k, a] of map.entries ()) {
    new_map.set (k, f (a))
  }
  return new_map
}
