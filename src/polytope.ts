import assert from "assert"

import * as ut from "./util"
import * as num from "./num"

export
class convex_hull_t {
  matrix: num.matrix_t

  constructor (
    matrix: num.matrix_t,
  ) {
    this.matrix = matrix
  }

  // homogenize (): conical_hull_t {
  // TODO
  // }

  // TODO
  // dual (): halfspace_intersection_t
}

export
class conical_hull_t {

}

export
class halfspace_intersection_t {
  argumented: num.matrix_t

  constructor (
    argumented: num.matrix_t,
  ) {
    this.argumented = argumented
  }

  // homogenize (): linear_halfspace_intersection_t {
  // TODO
  // }

  // TODO
  // proj (): {}
}

// TODO
class linear_halfspace_intersection_t {

}
