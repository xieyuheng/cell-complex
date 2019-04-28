import assert from "assert"

import { dic_t } from "./dic"
import * as eu from "./euclid"
import * as cx from "./cell-complex"
import { integral_module_t } from "./integral-module"

export
class chain_t {
  readonly com: cx.cell_complex_t
  readonly dim: number
  readonly vector: eu.vector_t

  constructor (
    com: cx.cell_complex_t,
    dim: number,
    vector: eu.vector_t,
  ) {
    this.dim = dim
    this.com = com
    this.vector = vector
  }

  static zeros (
    dim: number,
    com: cx.cell_complex_t,
  ): chain_t {
    return new chain_t (
      com, dim,
      eu.vector_t.zeros (com.size_of_dim (dim)))
  }

  update_at (
    id: cx.id_t,
    f: (v: number) => number,
  ): chain_t {
    this.vector.update_at (id.ser, f)
    return this
  }

  down (matrix: eu.matrix_t): chain_t {
    let [m, n] = matrix.shape
    assert (m === this.com.size_of_dim (this.dim - 1))
    assert (n === this.com.size_of_dim (this.dim))
    return new chain_t (
      this.com,
      this.dim - 1,
      this.vector.trans (matrix))
  }

  up (matrix: eu.matrix_t): chain_t {
    let [m, n] = matrix.shape
    assert (m === this.com.size_of_dim (this.dim + 1))
    assert (n === this.com.size_of_dim (this.dim))
    return new chain_t (
      this.com,
      this.dim + 1,
      this.vector.trans (matrix))
  }

  boundary (): chain_t {
    return this.down (
      boundary_matrix (this.com, this.dim)
    )
  }

  add (that: chain_t): chain_t {
    assert (this.dim === that.dim)
    return new chain_t (
      this.com,
      this.dim,
      this.vector.add (that.vector))
  }

  zero_p (): boolean {
    return this.vector.zero_p ()
  }

  cycle_p (): boolean {
    return this.boundary () .zero_p ()
  }

  print () {
    console.log (`dim: ${this.dim}`)
    this.vector.print ()
  }
}

export
function boundary_of_basis (
  com: cx.cell_complex_t,
  id: cx.id_t,
): chain_t {
  let boundary = chain_t.zeros (id.dim - 1, com)
  if (id.dim === 0) {
    return boundary
  } else if (id.dim === 1) {
    let edge = com.get_edge (id)
    boundary.update_at (edge.start, n => n - 1)
    boundary.update_at (edge.end, n => n + 1)
    return boundary
  } else if (id.dim === 2) {
    let face = com.get_face (id)
    for (let e of face.circuit) {
      if (e instanceof cx.rev_id_t) {
        boundary.update_at (e.rev (), n => n - 1)
      } else {
        boundary.update_at (e, n => n + 1)
      }
    }
    return boundary
  } else {
    throw new Error ("can only calculate dim 0, 1, 2 yet")
  }
}

export
function boundary_matrix (
  com: cx.cell_complex_t,
  dim: number,
): eu.matrix_t {
  let m = com.size_of_dim (dim - 1)
  let n = com.size_of_dim (dim)
  let matrix = eu.matrix_t.zeros (m, n)
  for (let id of com.id_in_dim (dim)) {
    let boundary = boundary_of_basis (com, id)
    matrix.set_col (id.ser, boundary.vector)
  }
  return matrix
}

export
function homology_group (
  com: cx.cell_complex_t,
  dim: number,
): integral_module_t {
  let low = boundary_matrix (com, dim)
  let high = boundary_matrix (com, dim + 1)
  let kernel = low.int_kernel ()
  let image = high.int_image ()
  let matrix = kernel.int_solve_matrix (image)
  if (matrix === null) {
    throw new Error ("[internal] int_solve_matrix fail")
  } else {
    return integral_module_t.from_smith_normal_form (
      matrix.smith_normal_form ()
    )
  }
}
