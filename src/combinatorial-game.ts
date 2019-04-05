import assert from "assert"
import * as _ from "lodash"

export
abstract class game_t <P, S, C> {
  abstract choices (p: P, s: S): Array <C>

  abstract choose (p: P, ch: C, s: S): S

  abstract win_p (p: P, s: S): boolean

  valid_choice_p (p: P, ch: C, s: S): boolean {
    let choices = this.choices (p, s)
    return choices.some ((x) => _.isEqual (x, ch))
  }
}

export
abstract class play_t <P, S, C> {
  constructor (
    public game: game_t <P, S, C>,
    public init_state: S,
    public init_player: P,
    public players: Array <P>,
    public moments: Array <{
      player: P,
      choice: C,
      state: S,
    }> = [],
  ) {}

  abstract next_player (): P

  beginning_p (): boolean {
    return this.moments.length === 0
  }

  last_moment (): {
    player: P,
    choice: C,
    state: S,
  } {
    if (this.beginning_p ()) {
      throw new Error ("play_t.last_moment")
    } else {
      let moment = this.moments.slice (-1) .pop ()
      return moment as {
        player: P,
        choice: C,
        state: S,
      }
    }
  }

  last_player (): P { return this.last_moment () .player }

  last_choice (): C { return this.last_moment () .choice }

  last_state (): S {
    if (this.beginning_p ()) {
      return this.init_state
    } else {
      return this.last_moment () .state
    }
  }

  tow_player_alternating (): P {
    if (this.players.length !== 2) {
      throw new Error ("play_t.tow_player_alternating fail")
    }
    let p0 = this.players [0]
    let p1 = this.players [1]
    if (this.beginning_p ()) {
      return this.init_player
    } else {
      switch (this.last_player ()) {
        case p0: return p1
        case p1: return p0
        default: throw new Error ("play_t.tow_player_alternating fail")
      }
    }
  }

  winner (): P | null {
    let s = this.last_state ()
    for (let p of this.players) {
      if (this.game.win_p (p, s)) {
        return p
      }
    }
    return null
  }

  state_log (s: S) {
    console.log (s)
  }

  move (p: P, ch: C) {
    if (this.next_player () === p) {
      let s = this.last_state ()
      if (this.game.valid_choice_p (p, ch, s)) {
        let next_state = this.game.choose (p, ch, s)
        this.moments.push ({
          player: p,
          choice: ch,
          state: next_state,
        })
      } else {
        console.log (
          `[warning]`,
          `invalid move: ${ ch } for player: ${ p }`,
        )
      }
    } else {
      console.log (
        `[warning]`,
        `next player should be ${ this.next_player () }`,
      )
    }
    this.state_log (this.last_state ())
    let w = this.winner ()
    if (w !== null) console.log (
      `[info]`,
      `winner is ${ w }`,
    )
  }
}

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
    public game: game_t <P, S, C>,
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

// export
// class mcts_bot_t <P, S, C> {
//   constructor (
//     // public game: game_t <P, S, C>,
//   ) {}

// }
