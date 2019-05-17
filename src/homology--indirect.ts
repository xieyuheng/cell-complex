import assert from "assert"

import * as ut from "./util"
import { dic_t } from "./dic"
import * as int from "./int"
import * as cx from "./cell-complex--indirect"

export
class chain_t {
  readonly com: cx.cell_complex_t
  readonly dim: number
  readonly vector: int.vector_t

  constructor (
    com: cx.cell_complex_t,
    dim: number,
    vector: int.vector_t,
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
      int.vector_t.zeros (com.dim_size (dim)))
  }

  update_at (
    id: cx.id_t,
    f: (v: bigint) => bigint,
  ): chain_t {
    this.vector.update_at (id.ser, f)
    return this
  }

  down (matrix: int.matrix_t): chain_t {
    let [m, n] = matrix.shape
    assert (m === this.com.dim_size (this.dim - 1))
    assert (n === this.com.dim_size (this.dim))
    return new chain_t (
      this.com,
      this.dim - 1,
      this.vector.trans (matrix))
  }

  up (matrix: int.matrix_t): chain_t {
    let [m, n] = matrix.shape
    assert (m === this.com.dim_size (this.dim + 1))
    assert (n === this.com.dim_size (this.dim))
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
    boundary.update_at (edge.start, n => n - 1n)
    boundary.update_at (edge.end, n => n + 1n)
    return boundary
  } else if (id.dim === 2) {
    let face = com.get_face (id)
    for (let e of face.circuit) {
      if (e instanceof cx.rev_id_t) {
        boundary.update_at (e.rev (), n => n - 1n)
      } else {
        boundary.update_at (e, n => n + 1n)
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
): int.matrix_t {
  let m = com.dim_size (dim - 1)
  let n = com.dim_size (dim)
  let matrix = int.matrix_t.zeros (m, n)
  for (let id of com.id_in_dim (dim)) {
    let boundary = boundary_of_basis (com, id)
    matrix.set_col (id.ser, boundary.vector)
  }
  return matrix
}

export
function homology_diag_canonical (
  com: cx.cell_complex_t,
  dim: number,
): int.matrix_t {
  let low = boundary_matrix (com, dim)
  let high = boundary_matrix (com, dim + 1)
  let kernel = low.kernel ()
  let image = high.image ()
  let matrix = kernel.solve_matrix (image)
  if (matrix === null) {
    throw new Error ("[internal] solve_matrix fail")
  } else {
    return matrix.diag_canonical_form ()
  }
}

export
function euler_characteristic (
  com: cx.cell_complex_t,
): number {
  let n = 0
  for (let d of ut.range (0, com.dim + 1)) {
    if (d % 2 === 0) {
      n += betti_number (homology_diag_canonical (com, d))
    } else {
      n -= betti_number (homology_diag_canonical (com, d))
    }
  }
  return n
}

export
function betti_number (
  diag_canonical: int.matrix_t
): number {
  let [m, n] = diag_canonical.shape
  let r = diag_canonical.rank ()
  return m - r
}

export
function torsion_coefficients (
  diag_canonical: int.matrix_t
): Array <number> {
  let array = new Array ()
  let invariant_factors = diag_canonical.diag ()
  for (let v of invariant_factors.values ()) {
    let n = Number (int.abs (v))
    if (n !== 0 && n !== 1) {
      array.push (n)
    }
  }
  return array
}

export
function report (
  com: cx.cell_complex_t,
) {
  let obj: any = {}
  for (let d of ut.range (0, com.dim + 1)) {
    let diag_canonical = homology_diag_canonical (com, d)
    obj [d] = {
      betti_number: betti_number (diag_canonical),
      torsion_coefficients: torsion_coefficients (diag_canonical),
    }
  }
  obj ["euler_characteristic"] = euler_characteristic (com)
  return obj
}
