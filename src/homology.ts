import assert from "assert"

import * as ut from "./util"
import { dic_t } from "./dic"
import * as int from "./int"
import * as cx from "./cell-complex"

export
function boundary_vector (
  com: cx.cell_complex_t,
  cell: cx.cell_t,
): int.vector_t {
  if (cell.dim === 0) {
    return int.vector_t.zeros (0)
  } else if (cell.dim === 1) {
    let edge = cell as cx.edge_t
    let size = com.vertex_array.length
    let vector = int.vector_t.zeros (size)
    vector.update_at (edge.start.ser (com), n => n - 1n)
    vector.update_at (edge.end.ser (com), n => n + 1n)
    return vector
  } else if (cell.dim === 2) {
    let face = cell as cx.face_t
    let size = com.edge_array.length
    let vector = int.vector_t.zeros (size)
    for (let e of face.circuit) {
      if (e instanceof cx.edge_rev_t) {
        vector.update_at (e.rev.ser (com), n => n - 1n)
      } else {
        vector.update_at (e.ser (com), n => n + 1n)
      }
    }
    return vector
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
  for (let cell of com.cell_array (dim)) {
    matrix.set_col (cell.ser (com), boundary_vector (com, cell))
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
