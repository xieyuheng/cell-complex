import assert from "assert"
import * as ut from "../util"

// Game semantics framework for logic and type system.

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
  abstract report (): any
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
  abstract report (): any

  info (label: string): this {
    console.group (label)
    ut.log (this.report ())
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
