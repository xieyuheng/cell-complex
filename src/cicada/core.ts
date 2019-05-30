import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { union_t } from "./union"
import { record_t } from "./record"
import { arrow_t, ante_t } from "./arrow"
import { dot_t } from "./dot"

// Top level API of game semantics of cicada language.

export
function dot (name: string): dot_t {
  return new dot_t (name)
}

export
class module_t {
  game_map: Map <string, gs.game_t>

  constructor () {
    this.game_map = new Map ()
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

  arrow (
    name: string,
    ante_obj: { [key: string]: string },
    succ_name: string,
  ): this {
    // TODO should be obj: { [key: string]: exp_t }
    let map = ut.mapmap (
      ut.obj2map (ante_obj),
      (sub_name) => this.ref (sub_name),
    )
    let ante = new ante_t (map)
    let succ = this.ref (succ_name)
    this.define (name, new arrow_t ({ ante, succ }))
    return this
  }
}

export
class ref_t extends gs.game_t {
  module: module_t
  name: string

  constructor (module: module_t, name: string) {
    super ()
    this.module = module
    this.name = name
  }

  get player (): gs.player_t {
    let game = this.module.game (this.name)
    return game.player
  }

  get choices (): Array <gs.choice_t> {
    let game = this.module.game (this.name)
    return game.choices
  }

  choose (choice: gs.choice_t): gs.game_t {
    let game = this.module.game (this.name)
    return game.choose (choice)
  }

  report (): object {
    let game = this.module.game (this.name)
    return game.report ()
  }
}
