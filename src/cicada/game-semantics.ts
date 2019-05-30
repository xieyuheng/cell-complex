import assert from "assert"
import * as ut from "../util"

/**
 * Game semantics framework for logic and type system.

 * constrains:
 * - two players -- verifier and falsifier
 * - normal play
 * - no draw
 * - the order of play is not strict
 *   - sometimes we can swap the order of local plays
 * - different choices have different effect -- monomorphism
 * - different players have different choices
 *   - choice belong to player,
 *     given a choice, we know which player is playing the choice.
 */

export
abstract class game_t {
  abstract choices (player: player_t): Array <choice_t>
  abstract choose (choice: choice_t): game_t

  abstract copy <G extends game_t> (): game_t
  abstract report (): any

  info (label: string): this {
    console.group (label)
    ut.log (this.report ())
    console.groupEnd ()
    return this
  }

  loss_p (player: player_t): boolean {
    /**
     * normal play -- current player loss.
     */
    let choices = this.choices (player)
    return choices.length === 0
  }

  end_p (): boolean {
    return this.loss_p ("verifier") || this.loss_p ("falsifier")
  }
}

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
