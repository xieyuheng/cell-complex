/**
 * Game semantics of dependent type system.
 */

import assert from "assert"

import * as ut from "../util"

export
type player_t = "verifier" | "falsifier"

export
function opponent_player (player: player_t) {
  return player === "verifier"
    ? "falsifier"
    : "verifier"
}

export
abstract class choice_t {
  abstract repr (): string
}

/**
 * constrains:
 * - normal play
 * - no draw
 * - each game only have one valid player
 *   i.e. the order of play is always controlled by the game
 */

export
abstract class game_t {
  abstract player: player_t
  abstract choices: Array <choice_t>
  abstract choose (choice: choice_t): game_t
  abstract report (): this

  info (label: string): this {
    console.group (label)
    this.report ()
    console.groupEnd ()
    return this
  }

  end_p (): boolean {
    /**
     * normal play -- current player loss.
     */
    return this.choices.length === 0
  }
}
