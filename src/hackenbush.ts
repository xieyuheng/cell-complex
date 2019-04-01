import * as _ from "lodash"

import {
  id_t, vertex_t, edge_t, graph_t
} from "./graph"

import * as cg from "./combinatorial-game"

export
type player_t = "blue" | "red"

export
type color_t = "blue" | "red" | "green"

export
class position_t {
  constructor (
    public graph: graph_t <{}, { value: color_t }> = new graph_t (),
  ) {}

  // self-builder

  colored_edge (
    start: number,
    end: number,
    color: color_t,
  ): position_t {
    this.graph.vertex_map.set (start, new vertex_t (start, {}))
    this.graph.vertex_map.set (end, new vertex_t (end, {}))
    this.graph.edge (this.graph.edge_map.size, start, end, { value: color })
    return this
  }

  blue (start: number, end: number): position_t {
    return this.colored_edge (start, end, "blue")
  }

  red (start: number, end: number): position_t {
    return this.colored_edge (start, end, "red")
  }

  green (start: number, end: number): position_t {
    return this.colored_edge (start, end, "green")
  }
}

export
type choice_t = id_t

export
class game_t
extends cg.game_t <player_t, position_t, choice_t> {
  choices (
    p: player_t,
    pos: position_t,
  ): Array <choice_t> {
    let array: Array <choice_t> = []
    pos.graph.edge_map.forEach ((edge, id) => {
      if (edge.info.value === p ||
          edge.info.value === "green")
        array.push (id)
    })
    return array
  }

  choose (
    p: player_t,
    ch: choice_t,
    pos: position_t,
  ): position_t {
    let graph = pos.graph.clone ()
    graph.edge_map.delete (ch)
    return new position_t (
      graph.connected_component_of_vertex (0))
  }

  win_p (
    p: player_t,
    pos: position_t,
  ): boolean {
    for (let [_id, edge] of pos.graph.edge_map) {
      if (edge.info.value !== p && edge.info.value !== "green")
        return false
    }
    return true
  }
}

export
class play_t
extends cg.play_t <player_t, position_t, choice_t> {
  next_player = this.tow_player_alternating

  position_log (pos: position_t) {
    console.log ("------")
    pos.graph.edge_map.forEach ((edge, id) => {
      console.log (
        `#${ id }:`,
        `${ edge.info.value }`,
        `${ edge.start }`,
        `${ edge.end }`,
      )
    })
    console.log ("------")
  }
}

export
let hackenbush = new game_t ()

export
let random_bot = new cg.random_bot_t (hackenbush)

export
function new_play (bush: position_t): play_t {
  let play = new play_t (
    hackenbush, bush, "blue", ["blue", "red"])
  return play
}
