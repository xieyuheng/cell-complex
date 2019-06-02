import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { union_t } from "./union"
import { record_t } from "./record"
import { pi_t, arg_t, ret_t } from "./pi"
import { path_t, step_t } from "./path"
import { member_t } from "./member"
import { field_t } from "./field"

// Top level API of game semantics of cicada language.

export
function path (steps: Array <step_t>): path_t {
  return new path_t (steps)
}

export
let step = {
  member: (name: string) => new member_t (name),
  field: (name: string) => new field_t (name),
  arg: (name: string) => new arg_t (name),
  ret: () => new ret_t (),
}

export
class module_t {
  name: string
  game_map: Map <string, gs.game_t>

  constructor (
    name: string,
    game_map: Map <string, gs.game_t> = new Map (),
  ) {
    this.name = name
    this.game_map = game_map
  }

  /**
   * due to the design of `ref_t`,
   *   we can not imp deep copy here.
   */
  shallow_copy (): module_t {
    return new module_t (
      this.name,
      new Map (this.game_map),
    )
  }

  define (name: string, game: gs.game_t): this {
    this.game_map.set (name, game)
    return this
  }

  game (name: string): gs.game_t {
    let game = this.game_map.get (name)
    if (game !== undefined) {
      return game
    } else {
      throw new Error (`undefined game: ${name}`)
    }
  }
}
