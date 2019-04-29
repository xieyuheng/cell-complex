import assert from "assert"

import * as ut from "./util"

export
function mod (
  x: number,
  y: number,
): number {
  let m = x % y
  if (m < 0) {
    return m + Math.abs (y)
  } else {
    return m
  }
}

export
function divmod (
  x: number,
  y: number,
): [number, number] {
  let m = mod (x, y)
  let d = (x - m) / y
  return [d, m]
}

export
function div (
  x: number,
  y: number,
): number {
  let m = mod (x, y)
  return (x - m) / y
}

export
function gcd (
  x: number,
  y: number,
): number {
  while (y !== 0) {
    if (Math.abs (y) > Math.abs (x)) {
      [x, y] = [y, x];
    } else {
      let r = mod (x, y);
      [x, y] = [y, r];
    }
  }
  return x
}

export
function array_gcd (
  array: Array <number>
): number {
  return array.reduce ((acc, cur) => gcd (acc, cur))
}

export
function gcd_ext (
  x: number,
  y: number,
): [number, [number, number]] {
  let old_s = 1
  let old_t = 0
  let old_r = x

  let s = 0
  let t = 1
  let r = y

  while (r !== 0) {
    if (Math.abs (r) > Math.abs (old_r)) {
      [
        s, t, r,
        old_s, old_t, old_r,
      ] = [
        old_s, old_t, old_r,
        s, t, r,
      ]
    } else {
      let q = div (old_r, r);
      [old_r, r] = [r, old_r - (q * r)];
      [old_s, s] = [s, old_s - (q * s)];
      [old_t, t] = [t, old_t - (q * t)];
    }
  }
  return [old_r, [old_s, old_t]]
}

export
function gcd_ext_p (
  x: number,
  y: number,
  res: [number, [number, number]],
): boolean {
  let [d, [s, t]] = res
  return ((gcd (x, y) === d) &&
          (s*x + t*y === d))
}

export
function array_dot (
  x: Array <number>,
  y: Array <number>,
): number {
  assert (x.length === y.length)
  let sum = 0
  for (let i of ut.range (0, x.length)) {
    sum += x [i] * y [i]
  }
  return sum
}

export
function array_gcd_ext_p (
  array: Array <number>,
  res: [number, Array <number>],
): boolean {
  let [d, ext] = res
  return ((array_gcd (array) === d) &&
          (array_dot (array, ext) === d))
}

export
function array_gcd_ext (
  array: Array <number>
): [number, Array <number>] {
  let ext = new Array ()
  let d = array.reduce ((acc, cur) => {
    let [d, [s, t]] = gcd_ext (acc, cur)
    if (ext.length === 0) {
      ext = [s, t]
    } else {
      ext = ext.map (x => x * s)
      ext.push (t)
    }
    return d
  })
  return [d, ext]
}
