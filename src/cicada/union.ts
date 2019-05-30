import assert from "assert"

import * as ut from "../util"

import * as gs from "./game-semantics"
import { dot_t } from "./dot"

export
class union_t extends gs.game_t {
  name: string
  map: Map <string, gs.game_t>

  constructor (
    name: string,
    map: Map <string, gs.game_t>,
  ) {
    super ()
    this.name = name
    this.map = map
  }

  get player (): gs.player_t { return "verifier" }

  get choices (): Array <gs.choice_t> {
    return Array.from (this.map.keys ())
      .map (name => (new dot_t (name)))
  }

  report (): this {
    console.log (`kind: union_t`)
    console.log (`name: ${this.name}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${this.end_p ()}`)
    return this
  }

  choose (dot: dot_t): gs.game_t {
    let game = this.map.get (dot.name)
    if (game === undefined) {
      throw new Error (`unknown dot.name: ${dot.name}`)
    } else {
      return game
    }
  }
}
