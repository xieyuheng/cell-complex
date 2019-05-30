import assert from "assert"

import * as ut from "../util"

import * as gs from "./game-semantics"

/**
 * type of types, game of games.
 */
export
class type_t extends gs.game_t {
  /**
   * `type_t` is like a dynamic union,
   *   thus its player is verifier.
   */
  get player (): gs.player_t { return "verifier" }

  get choices (): Array <gs.choice_t> {
    throw new Error ("TODO")
  }

  choose (choice: gs.choice_t): gs.game_t {
    throw new Error ("TODO")
  }

  report (): this {
    console.log (`kind: type_t`)
    console.log (`player: ${this.player}`)
    // TODO
    return this
  }
}
