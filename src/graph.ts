export type id_t = number

export
class vertex_t <V> {
  constructor (
    public id: id_t,
    public info: V,
  ) {}

  // - shallow clone
  clone (): vertex_t <V> {
    return new vertex_t (this.id, this.info)
  }

  more_info <I> (info: I): vertex_t <V & I> {
    return new vertex_t (this.id, {
      ...this.info,
      ...info,
    })
  }
}

export
class edge_t <V, E> {
  constructor (
    public id: id_t,
    public start: id_t,
    public end: id_t,
    public info: E,
  ) {}

  // - shallow clone
  clone (): edge_t <V, E> {
    return new edge_t (this.id, this.start, this.end, this.info)
  }

  more_info <I> (info: I): edge_t <V, E & I> {
    return new edge_t (this.id, this.start, this.end, {
      ...this.info,
      ...info,
    })
  }
}

export
class graph_t <V, E> {
  // simple graph representation
  // - in the following "O" notation V and E denote sizes

  // - space ~ O (V + E)
  constructor (
    public vertex_map: Map <id_t, vertex_t <V>> = new Map (),
    public edge_map: Map <id_t, edge_t <V, E>> = new Map (),
  ) {}

  // self-builder
  // - side-effect on existing object under the same id

  vertex (
    v: id_t,
    info: V,
  ): graph_t <V, E> {
    if (this.vertex_map.has (v)) throw new Error (
      `[error] graph_t.vertex fail`
    )
    else this.vertex_map.set (v, new vertex_t (v, info))
    return this
  }

  edge (
    e: id_t,
    start: id_t,
    end: id_t,
    info: E,
  ): graph_t <V, E> {
    if (this.edge_map.has (e)) throw new Error (
      `[error] graph_t.edge fail`
    )
    else this.edge_map.set (e, new edge_t (e, start, end, info))
    return this
  }

  // - shallow clone
  // - time ~ O (V + E)
  clone (): graph_t <V, E> {
    let graph: graph_t <V, E> = new graph_t ()
    this.vertex_map.forEach ((vertex, id) => {
      graph.vertex_map.set (id, vertex)
    })
    this.edge_map.forEach ((edge, id) => {
      graph.edge_map.set (id, edge)
    })
    return graph
  }

  // - time ~ O (E)
  // - with side-effect on the set
  connected_vertex_set (vertex_set: Set <id_t>): Set <id_t> {
    for (let edge of this.edge_map.values ()) {
      if (vertex_set.has (edge.start))
        vertex_set.add (edge.end)
      else if (vertex_set.has (edge.end))
        vertex_set.add (edge.start)
    }
    return vertex_set
  }

  // - time ~ O (E)
  connected_vertex_set_of_vertex (v: id_t): Set <id_t> {
    return this.connected_vertex_set (new Set ([v]))
  }

  // - time ~ O (E)
  connected_vertex_p (v1: id_t, v2: id_t): boolean {
    return this
      .connected_vertex_set_of_vertex (v1)
      .has (v2)
  }

  // - time ~ O (V + E)
  subgraph_of_vertex_set (
    vertex_set: Set <id_t>
  ): graph_t <V, E> {
    let subgraph: graph_t <V, E> = new graph_t ()
    this.vertex_map.forEach ((vertex, id) => {
      if (vertex_set.has (id))
        subgraph.vertex_map.set (id, vertex)
    })
    this.edge_map.forEach ((edge, id) => {
      if (vertex_set.has (edge.start) ||
          vertex_set.has (edge.end))
        subgraph.edge_map.set (id, edge)
    })
    return subgraph
  }

  // - connected component is max connected subgraph
  // - time ~ O (V + E)
  connected_component_of_vertex (v: id_t): graph_t <V, E> {
    return this.subgraph_of_vertex_set (
      this.connected_vertex_set_of_vertex (v))
  }
}
