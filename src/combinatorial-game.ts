import * as _ from "lodash"

export
abstract class game_t <player_t, position_t, choice_t> {
  abstract choices (p: player_t, pos: position_t): Array <choice_t>

  abstract choose (p: player_t, ch: choice_t, pos: position_t): position_t

  abstract win_p (p: player_t, pos: position_t): boolean

  valid_choice_p (p: player_t, ch: choice_t, pos: position_t): boolean {
    let choices = this.choices (p, pos)
    return choices.some ((x) => _.isEqual (x, ch))
  }
}

export
abstract class play_t <player_t, position_t, choice_t> {
  constructor (
    public game: game_t <player_t, position_t, choice_t>,
    public init_position: position_t,
    public init_player: player_t,
    public players: Array <player_t>,
    public moments: Array <{
      player: player_t,
      choice: choice_t,
      position: position_t,
    }> = [],
  ) {}

  abstract next_player (): player_t

  beginning_p (): boolean {
    return this.moments.length === 0
  }

  last_moment (): {
    player: player_t,
    choice: choice_t,
    position: position_t,
  } {
    if (this.beginning_p ()) {
      throw new Error ("play_t.last_moment")
    } else {
      let moment = this.moments.slice (-1) .pop ()
      return moment as {
        player: player_t,
        choice: choice_t,
        position: position_t,
      }
    }
  }

  last_player (): player_t { return this.last_moment () .player }

  last_choice (): choice_t { return this.last_moment () .choice }

  last_position (): position_t {
    if (this.beginning_p ()) {
      return this.init_position
    } else {
      return this.last_moment () .position
    }
  }

  tow_player_alternating (): player_t {
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

  winner (): player_t | null {
    let pos = this.last_position ()
    for (let p of this.players) {
      if (this.game.win_p (p, pos)) {
        return p
      }
    }
    return null
  }

  position_log (pos: position_t) {
    console.log (pos)
  }

  move (p: player_t, ch: choice_t) {
    if (this.next_player () === p) {
      let pos = this.last_position ()
      if (this.game.valid_choice_p (p, ch, pos)) {
        let next_pos = this.game.choose (p, ch, pos)
        this.moments.push ({
          player: p,
          choice: ch,
          position: next_pos,
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
    this.position_log (this.last_position ())
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
class random_bot_t <player_t, position_t, choice_t> {
  constructor (
    public game: game_t <player_t, position_t, choice_t>,
  ) {}

  next_choice (
    p: player_t,
    pos: position_t,
  ): choice_t {
    let choices = this.game.choices (p, pos)
    if (choices.length !== 0) {
      return get_random_sample (choices)
    } else {
      throw new Error ("random_bot_t.next_choice fail")
    }
  }
}

// export
// class mcts_bot_t <player_t, position_t, choice_t> {
//   constructor (
//     // public game: game_t <player_t, position_t, choice_t>,
//   ) {}

// }
