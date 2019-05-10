import * as cg from "../../combinatorial-game"

function get_random_int (max: number): number {
  return Math.floor (Math.random () * Math.floor (max))
}

function get_random_sample <T> (array: Array <T>): T {
  let i = get_random_int (array.length)
  return array [i]
}

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
      return get_random_sample (choices)
    } else {
      throw new Error ("random_bot_t.next_choice fail")
    }
  }
}
