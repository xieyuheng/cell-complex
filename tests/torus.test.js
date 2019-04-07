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

  // log (torus.to_exp ())
})

test ("vertex_figure", t => {
  let torus = new torus_t ()
  let verf = new cx.vertex_figure_t (torus, torus.origin)

  // log (verf.to_exp ())

  let dic = new cx.im_dic_t ()
  dic.set (new cx.id_t (0, 0), new cx.im_t (new cx.id_t (0, 0), cx.empty_cell))
  dic.set (new cx.id_t (0, 1), new cx.im_t (new cx.id_t (0, 2), cx.empty_cell))
  dic.set (new cx.id_t (0, 2), new cx.im_t (new cx.id_t (0, 1), cx.empty_cell))
  dic.set (new cx.id_t (0, 3), new cx.im_t (new cx.id_t (0, 3), cx.empty_cell))
  let dom = new cx.endpoints_t ()
  let cod = new cx.discrete_complex_t (4)
  dic.set (new cx.id_t (1, 0), new cx.im_t (new cx.id_t (1, 0), new cx.cell_t (dom, cod, new cx.im_dic_t () .merge_array ([
    [new cx.id_t (0, 0), new cx.im_t (new cx.id_t (0, 0), cx.empty_cell)],
    [new cx.id_t (0, 1), new cx.im_t (new cx.id_t (0, 1), cx.empty_cell)],
  ]))))
  dic.set (new cx.id_t (1, 1), new cx.im_t (new cx.id_t (1, 1), new cx.cell_t (dom, cod, new cx.im_dic_t () .merge_array ([
    [new cx.id_t (0, 0), new cx.im_t (new cx.id_t (0, 1), cx.empty_cell)],
    [new cx.id_t (0, 1), new cx.im_t (new cx.id_t (0, 0), cx.empty_cell)],
  ]))))
  dic.set (new cx.id_t (1, 2), new cx.im_t (new cx.id_t (1, 2), new cx.cell_t (dom, cod, new cx.im_dic_t () .merge_array ([
    [new cx.id_t (0, 0), new cx.im_t (new cx.id_t (0, 1), cx.empty_cell)],
    [new cx.id_t (0, 1), new cx.im_t (new cx.id_t (0, 0), cx.empty_cell)],
  ]))))
  dic.set (new cx.id_t (1, 3), new cx.im_t (new cx.id_t (1, 3), new cx.cell_t (dom, cod, new cx.im_dic_t () .merge_array ([
    [new cx.id_t (0, 0), new cx.im_t (new cx.id_t (0, 1), cx.empty_cell)],
    [new cx.id_t (0, 1), new cx.im_t (new cx.id_t (0, 0), cx.empty_cell)],
  ]))))
  let iso = new cx.isomorphism_t (new cx.polygon_t (4), verf, dic)
  // log (iso.to_exp ())

  let iso2 = cx.isomorphic_to_polygon (verf)
  // log (iso2.to_exp ())

  t.true (iso2.eq (iso))

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
    .polygon.vertex_array.map ((p, i) => {
      t.true (
        verf.idx (torus.surf, p) .eq (new cx.id_t (1, i)))
    })
})
