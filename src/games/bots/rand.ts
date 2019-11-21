import * as cg from "../../combinatorial-game"

import * as ut from "../../util"

export
class random_bot_t <P, S, C> {
  constructor (
    public game: cg.game_t <P, S, C>,
  ) {}

  next_choice (
    p: P,
    s: S,
  ): C {
    let choices = this.game.choices (p, s)
    if (choices.length !== 0) {
      return ut.rand_member (choices)
    } else {
      throw new Error ("random_bot_t.next_choice fail")
    }
  }
}
