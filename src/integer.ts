import assert from "assert"

import * as ut from "./util"

export
function div (
  x: number,
  y: number,
): number {
  return Math.floor (x / y)
}

export
function mod (
  x: number,
  y: number,
): number {
  return x % y
}

export
function divmod (
  x: number,
  y: number,
): [number, number] {
  return [div (x, y), mod (x, y)]
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
  return Math.abs (x)
}

export
function gcd_of_array (
  array: Array <number>
): number {
  return array.reduce ((acc, cur) => gcd (acc, cur))
}

export
function extended_gcd (
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
      [old_r, r] = [r, old_r - q * r];
      [old_s, s] = [s, old_s - q * s];
      [old_t, t] = [t, old_t - q * t];
    }
  }

  if (old_r < 0) {
    return [-old_r, [-old_s, -old_t]]
  } else {
    return [old_r, [old_s, old_t]]
  }
}

export
function extended_gcd_p (
  x: number,
  y: number,
  res: [number, [number, number]],
): boolean {
  let [d, [s, t]] = res
  return (gcd (x, y) === d) && (s*x + t*y === d)
}
