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
  // to_intersection (): intersection_t
}

export
class conical_hull_t {
  matrix: num.matrix_t

  constructor (
    matrix: num.matrix_t,
  ) {
    this.matrix = matrix
  }

  // TODO
  // to_linear_intersection (): linear_intersection_t
}

export
class intersection_t {
  argumented: num.matrix_t

  constructor (
    argumented: num.matrix_t,
  ) {
    this.argumented = argumented
  }

  // homogenize (): linear_intersection_t {
  // TODO
  // }

  // TODO
  // to_convex_conical_hull (): [convex_hull_t, conical_hull_t] {}

  // TODO
  // proj (): intersection_t {}
}

// TODO
class linear_intersection_t {
  argumented: num.matrix_t

  constructor (
    argumented: num.matrix_t,
  ) {
    this.argumented = argumented
  }

  // TODO
  // to_conical_hull (): conical_hull_t {}

  // TODO
  // proj (): linear_intersection_t {}
}

// TODO
// class polytope_t {}
