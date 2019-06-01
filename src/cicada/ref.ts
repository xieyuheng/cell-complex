import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
/* MUTUAL */ import { module_t } from "./core"

export
class ref_t extends gs.game_t {
  module: module_t
  name: string

  constructor (
    module: module_t,
    name: string,
  ) {
    super ()
    this.module = module
    this.name = name
  }

  copy (): ref_t {
    return new ref_t (
      this.module,
      this.name,
    )
  }

  deref (): gs.game_t {
    return this.module.game (this.name)
  }

  choices (player: gs.player_t): Array <gs.choice_t> {
    throw new Error ("can not play ref_t")
  }

  choose (choice: gs.choice_t): gs.game_t {
    throw new Error ("can not play ref_t")
  }

  report (): string {
    // let game = this.deref ()
    // return game.report ()
    return this.name
  }
}
