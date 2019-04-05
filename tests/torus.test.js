import test from "ava"

import { dic_t } from "../dist/dic"

import * as cx from "../dist/cell-complex"

import { torus_t } from "../dist/torus"

import { log } from "./util"

test ("from_exp", t => {
  let torus = new torus_t ()
  let exp = torus.to_exp ()
  let com = cx.cell_complex_t.from_exp (exp)
  t.deepEqual (exp, com.to_exp ())
})

test ("vertex_figure", t => {
  let torus = new torus_t ()
  let verf = new cx.vertex_figure_t (torus, torus.origin)

  log (verf.to_exp ())

  let id_dic = new dic_t ()
  id_dic.set (new cx.id_t (0, 0), new cx.id_t (0, 0))
  id_dic.set (new cx.id_t (0, 1), new cx.id_t (0, 2))
  id_dic.set (new cx.id_t (0, 2), new cx.id_t (0, 1))
  id_dic.set (new cx.id_t (0, 3), new cx.id_t (0, 3))
  id_dic.set (new cx.id_t (1, 0), new cx.id_t (1, 0))
  id_dic.set (new cx.id_t (1, 1), new cx.id_t (1, 1))
  id_dic.set (new cx.id_t (1, 2), new cx.id_t (1, 2))
  id_dic.set (new cx.id_t (1, 3), new cx.id_t (1, 3))
//   let iso = new cx.isomorphism_t (
//     new cx.polygon_t (4), verf, id_dic)

  t.true (
    verf.idx (
      torus.polo,
      torus.get_edge (torus.polo) .endpoints.start,
    ) .eq (new cx.id_t (0, 0))
  )
  t.true (
    verf.idx (
      torus.polo,
      torus.get_edge (torus.polo) .endpoints.end,
    ) .eq (new cx.id_t (0, 1))
  )
  t.true (
    verf.idx (
      torus.toro,
      torus.get_edge (torus.toro) .endpoints.start,
    ) .eq (new cx.id_t (0, 2))
  )
  t.true (
    verf.idx (
      torus.toro,
      torus.get_edge (torus.toro) .endpoints.end,
    ) .eq (new cx.id_t (0, 3))
  )

  torus.get_face (torus.surf)
    .polygon.point_array.map ((p, i) => {
      t.true (
        verf.idx (torus.surf, p) .eq (new cx.id_t (1, i)))
    })
})
