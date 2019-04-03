import { set_t } from "./set"
import { field_t } from "./field"
import { abelian_group_t } from "./group"
import { vector_space_t } from "./vector-space"
import { affine_space_t } from "./affine-space"
import { eqv } from "./eqv"

import { ndarray_t } from "./ndarray"

// We can not define matrix_t as subclass of ndarray_t,
// because methods such as `proj` and `slice` on ndarray_t
// return ndarray_t instead of matrix_t,
// such methods can not be generic over ndarray_t's subclasses.

// Due to the lack of dependent type,
// dimension is checked at runtime.

export
class matrix_t {
  protected array: ndarray_t
  readonly shape: Array <number>

  constructor (array: ndarray_t) {
    if (array.order !== 2) {
      throw new Error ("array order should be 2")
    }
    this.array = array
    this.shape = array.shape
  }

  get (x: number, y: number): number {
    return this.array.get ([x, y])
  }

  set (x: number, y: number, v: number) {
    this.array.set ([x, y], v)
  }

  slice (
    x: [number, number] | null,
    y: [number, number] | null,
  ): matrix_t {
    return new matrix_t (this.array.slice ([x, y]))
  }

  copy_array (): ndarray_t {
    return this.array.copy ()
  }

  row (i: number): vector_t {
    return new vector_t (this.array.proj ([i, null]))
  }

  col (i: number): vector_t {
    return new vector_t (this.array.proj ([null, i]))
  }

  eq (that: matrix_t): boolean {
    return this.array.eq (that.copy_array ())
  }
}

export
class vector_t {
  protected array: ndarray_t
  readonly shape: Array <number>
  readonly size: number

  constructor (array: ndarray_t) {
    if (array.order !== 1) {
      throw new Error ("array order should be 1")
    }
    this.array = array
    this.shape = array.shape
    this.size = array.size
  }

  get (i: number): number {
    return this.array.get ([i])
  }

  set (i: number, v: number) {
    this.array.set ([i], v)
  }

  slice (i: [number, number]): vector_t {
    return new vector_t (this.array.slice ([i]))
  }

  copy_array (): ndarray_t {
    return this.array.copy ()
  }

  eq (that: vector_t): boolean {
    return this.array.eq (that.copy_array ())
  }
}

export
class point_t {
  constructor () {

  }
}

// I do not define abstract inner product space yet.
// because the axioms involves conjugation of complex structure,
// which I do not yet fully understand.


// There is only one Euclidean space of each dimension,
// and since dimension is handled at runtime,
// I define euclidean_space_t as concrete class.

// export
// class euclidean_space_t
// extends affine_space_t <number, vector_t, point_t> {

// }
