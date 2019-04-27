import * as _ from "lodash"
import assert from "assert"

import * as ut from "./util"

export
class permutation_t {
  /**
   * A permutation is encoded by
   * the result of its action on [1, 2, ..., n].
   * I call this result "sequence".
   */
  readonly sequence: Array <number>
  readonly size: number

  constructor (sequence: Array <number>) {
    this.sequence = sequence
    this.size = sequence.length
  }

  get (i: number): number {
    return this.sequence [i]
  }

  *[Symbol.iterator] () {
    for (let v of this.sequence) {
      yield v
    }
  }

  *pairs () {
    let i = 0
    for (let x of this.sequence) {
      yield [i, x] as [number, number]
      i += 1
    }
  }

  *inv_pairs () {
    let i = 0
    for (let x of this.sequence) {
      yield [x, i] as [number, number]
      i += 1
    }
  }

  inv (): permutation_t {
    let sequence = Array.from (this.inv_pairs ())
      .sort ((x, y) => x [0] - y [0])
      .map (x => x [1])
    return new permutation_t (sequence)
  }

  mul (that: permutation_t): permutation_t {
    let sequence = new Array ()
    for (let i of that.sequence) {
      sequence.push (this.sequence [i])
    }
    return new permutation_t (sequence)
  }

  eq (that: permutation_t): boolean {
    return _.isEqual (this.sequence, that.sequence)
  }

  lt (that: permutation_t): boolean {
    assert (this.size === that.size)
    return this.lt_after (that, 0)
  }

  private lt_after (that: permutation_t, n: number): boolean {
    if (n >= this.size) {
      return false
    }

    let x = this.get (n)
    let y = that.get (n)

    if (x < y) {
      return true
    } else if (x === y) {
      return this.lt_after (that, n + 1)
    } else {
      return false
    }
  }

  lte (that: permutation_t): boolean {
    return this.lte_after (that, 0)
  }

  private lte_after (that: permutation_t, n: number): boolean {
    if (n >= this.size) {
      return true
    }

    let x = this.get (n)
    let y = that.get (n)

    if (x < y) {
      return true
    } else if (x === y) {
      return this.lte_after (that, n + 1)
    } else {
      return false
    }
  }

  gt (that: permutation_t): boolean {
    return that.lt (this)
  }

  gte (that: permutation_t): boolean {
    return that.lte (this)
  }

  static id (size: number): permutation_t {
    return new permutation_t (
      Array.from (ut.range (0, size))
    )
  }

  tuck (i: number, j: number): permutation_t {
    let sequence = new Array ()
    for (let k of ut.range (0, this.size)) {
      if (i <= k && k < j) {
        sequence [k] = this.get (k+1)
      } else if (k === j) {
        sequence [k] = this.get (i)
      } else {
        sequence [k] = this.get (k)
      }
    }
    return new permutation_t (sequence)
  }

  // TODO
  // static from_cycle

  // TODO
  // canonical_cycle

  // TODO
  // lehmer_code (): Array <number>
}
