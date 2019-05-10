import {
  id_t, vertex_t, edge_t, graph_t
} from "../graph-info"

import * as cg from "../combinatorial-game"
import { random_bot_t } from "./bots/rand"

export
type player_t = "blue" | "red"

export
type color_t = "blue" | "red" | "green"

export
class state_t {
  constructor (
    public graph: graph_t <{}, { value: color_t }> = new graph_t (),
  ) {}

  // self-builder

  colored_edge (
    start: number,
    end: number,
    color: color_t,
  ): state_t {
    this.graph.vertex_map.set (start, new vertex_t (start, {}))
    this.graph.vertex_map.set (end, new vertex_t (end, {}))
    this.graph.edge (this.graph.edge_map.size, start, end, { value: color })
    return this
  }

  blue (start: number, end: number): state_t {
    return this.colored_edge (start, end, "blue")
  }

  red (start: number, end: number): state_t {
    return this.colored_edge (start, end, "red")
  }

  green (start: number, end: number): state_t {
    return this.colored_edge (start, end, "green")
  }
}

export
type choice_t = id_t

export
class game_t
extends cg.game_t <player_t, state_t, choice_t> {
  choices (
    p: player_t,
    s: state_t,
  ): Array <choice_t> {
    let array: Array <choice_t> = []
    s.graph.edge_map.forEach ((edge, id) => {
      if (edge.info.value === p ||
          edge.info.value === "green")
        array.push (id)
    })
    return array
  }

  choose (
    p: player_t,
    ch: choice_t,
    s: state_t,
  ): state_t {
    let graph = s.graph.copy ()
    graph.edge_map.delete (ch)
    return new state_t (
      graph.connected_component_of_vertex (0))
  }

  win_p (
    p: player_t,
    s: state_t,
  ): boolean {
    for (let [_id, edge] of s.graph.edge_map) {
      if (edge.info.value !== p && edge.info.value !== "green")
        return false
    }
    return true
  }
}

export
class play_t
extends cg.play_t <player_t, state_t, choice_t> {
  next_player = this.tow_player_alternating

  state_log (s: state_t) {
    console.log ("------")
    s.graph.edge_map.forEach ((edge, id) => {
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
let random_bot = new random_bot_t (hackenbush)

export
function new_play (bush: state_t): play_t {
  let play = new play_t (
    hackenbush, bush, "blue", ["blue", "red"])
  return play
}
