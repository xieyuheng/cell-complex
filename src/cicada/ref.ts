import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
/* MUTUAL */ import { module_t } from "./core"

export
class ref_t extends gs.game_t {
  m: module_t
  name: string

  constructor (
    m: module_t,
    name: string,
  ) {
    super ()
    this.m = m
    this.name = name
  }

  copy (): ref_t {
    return new ref_t (
      this.m,
      this.name,
    )
  }

  deref (): gs.game_t {
    return this.m.game (this.name)
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
