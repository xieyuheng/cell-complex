import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { ref_t } from "./ref"
import { union_t, member_t } from "./union"
import { record_t, field_t } from "./record"
import { pi_t, arg_t, ret_t } from "./pi"
import { path_t, step_t } from "./path"

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

  shallow_copy (): module_t {
    return new module_t (
      this.name,
      new Map (this.game_map),
    )
  }

  copy (): module_t {
    return new module_t (
      this.name,
      ut.mapmap (this.game_map, game => game.copy ()),
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

  ref (name: string): ref_t {
    return new ref_t (this, name)
  }

  union (name: string, array: Array <string>): this {
    let map = new Map ()
    for (let sub_name of array) {
      map.set (sub_name, this.ref (sub_name))
    }
    this.define (name, new union_t (name, map))
    return this
  }

  record (name: string, obj: { [key: string]: string }): this {
    // TODO should be obj: { [key: string]: exp_t }
    let map = ut.mapmap (
      ut.obj2map (obj),
      (sub_name) => this.ref (sub_name),
    )
    this.define (name, new record_t (name, map))
    return this
  }

  pi (
    name: string,
    args_obj: { [key: string]: string },
    ret_name: string,
  ): this {
    // TODO should be obj: { [key: string]: exp_t }
    let args = ut.mapmap (
      ut.obj2map (args_obj),
      (name) => this.ref (name) .deref (),
    )
    let ret = this.ref (ret_name) .deref ()
    this.define (name, new pi_t (args, ret))
    return this
  }
}
