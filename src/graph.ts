import assert from "assert"

import { dic_t } from "./dic"

export
type id_t = number

export
class vertex_t {
  constructor (
    public id: id_t,
  ) {}
}

export
class edge_t {
  constructor (
    public id: id_t,
    public start: id_t,
    public end: id_t,
  ) {}
}

export
class graph_t {
  constructor (
    public vertex_dic: dic_t <id_t, vertex_t>,
    public edge_dic: dic_t <id_t, edge_t>,
  ) {}
}
