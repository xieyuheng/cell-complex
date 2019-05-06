import assert from "assert"

import { dic_t } from "./dic"

export
type id_t = number

export
class edge_t {
  constructor (
    public start: id_t,
    public end: id_t,
  ) {}
}

export
class graph_t {
  constructor (
    public vertex_count: number,
    public edge_dic: dic_t <id_t, edge_t>,
  ) {}
}
