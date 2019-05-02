import assert from "assert"

import * as ut from "./util"
import * as num from "./num"

/**
 * convex hull of finite points,
 * represented by col_vectors of a matrix.
 */

export
class convex_hull_t {
  matrix: num.matrix_t

  constructor (
    matrix: num.matrix_t
  ) {
    this.matrix = matrix
  }

  /**
   * sum of points sets == minkowski sum of convex hull
   */
  sum (that: convex_hull_t): convex_hull_t {
    return new convex_hull_t (
      this.matrix.append_cols (that.matrix)
    )
  }

  /**
   * from affine d-space to linear (d+1)-space.
   */
  // homogenize (): convex_hull_t {
  // TODO
  // }

  // TODO
  // dual (): halfspace_intersection_t
}

export
class conical_hull_t {
  // TODO

  // TODO
  // dual (): linear_halfspace_intersection_t
}

// TODO
// class convex_conical_hull_t

/**
 * intersection of closed halfspaces:
 *   `matrix.mul (col_vector) .lte (vector)`

 * A halfspace is a `row_vector` + a `value`,
 * interpreted as an inequality:
 *   `row_vector.dot (col_vector) <= value`
*/

export
class halfspace_intersection_t {
  matrix: num.matrix_t
  vector: num.vector_t

  constructor (
    matrix: num.matrix_t,
    vector: num.vector_t,
  ) {
    this.matrix = matrix
    this.vector = vector
  }

  /**
   * from affine d-space to linear (d+1)-space.
   */
  // homogenize (): linear_halfspace_intersection_t {
  // TODO
  // }
}

// TODO
// class linear_halfspace_intersection_t
