import {
  ndarray_t,
  Array1d, Array2d, Array3d,
} from "./ndarray"

// We can not define matrix_t as subclass of ndarray_t,
// because methods such as `proj` and `slice` on ndarray_t
// return ndarray_t instead of matrix_t,
// such methods can not be generic over ndarray_t's subclasses.

export
class matrix_t {
  readonly shape: Array <number>

  constructor (readonly array: ndarray_t) {
    if (array.order !== 2) {
      throw new Error ("array order should be 2")
    }
    this.shape = array.shape
  }

  // TODO
  // set
  // get
  // slice
  // put
  // proj
}
