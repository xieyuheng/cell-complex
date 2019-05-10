import * as _ from "lodash"

import * as cg from "../combinatorial-game"
import { random_bot_t } from "./bots/rand"

type player_t = "X" | "O"

type mark_t = "_" | "X" | "O"

type row_t = [ mark_t, mark_t, mark_t ]

type state_t = [ row_t, row_t, row_t ]

let empty_state: state_t = [
  [ "_", "_", "_" ],
  [ "_", "_", "_" ],
  [ "_", "_", "_" ],
]

type choice_t = [ number, number ]

class game_t
extends cg.game_t <player_t, state_t, choice_t> {
  choices (
    _p: player_t,
    s: state_t
  ): Array <choice_t> {
    let array: Array <choice_t> = []
    s.forEach ((row, x) => {
      row.forEach ((mark, y) => {
        if (s [x] [y] === "_")
          array.push ([x, y])
      })
    })
    return array
  }

  choose (
    p: player_t,
    ch: choice_t,
    s: state_t,
  ): state_t {
    let s1 = _.cloneDeep (s)
    let [x, y] = ch
    s1 [x] [y] = p
    return s1
  }

  win_p (
    p: player_t,
    s: state_t,
  ): boolean {
    return (row_win_p (p, s) ||
            column_win_p (p, s) ||
            diagonal_win_p (p, s))
  }
}

function row_win_p (
  p: player_t,
  s: state_t,
): boolean {
  return ((s [0] [0] === p &&
           s [0] [1] === p &&
           s [0] [2] === p) ||
          (s [1] [0] === p &&
           s [1] [1] === p &&
           s [1] [2] === p) ||
          (s [2] [0] === p &&
           s [2] [1] === p &&
           s [2] [2] === p))
}

function column_win_p (
  p: player_t,
  s: state_t,
): boolean {
  return ((s [0] [0] === p &&
           s [1] [0] === p &&
           s [2] [0] === p) ||
          (s [0] [1] === p &&
           s [1] [1] === p &&
           s [2] [1] === p) ||
          (s [0] [2] === p &&
           s [1] [2] === p &&
           s [2] [2] === p))
}

function diagonal_win_p (
  p: player_t,
  s: state_t,
): boolean {
  return ((s [0] [0] === p &&
           s [1] [1] === p &&
           s [2] [2] === p) ||
          (s [0] [2] === p &&
           s [1] [1] === p &&
           s [2] [0] === p))
}

class play_t
extends cg.play_t <player_t, state_t, choice_t> {
  next_player = this.tow_player_alternating

  state_log (s: state_t) {
    let repr = ""
    s.forEach ((row, x) => {
      row.forEach ((mark, y) => {
        repr += `${ mark } `
      })
      repr += "\n"
    })
    console.log (repr)
  }

  draw_p (): boolean {
    for (let p of this.players) {
      if (this.game.choices (p, this.last_state ()) .length > 0) {
        return false
      }
    }
    return true
  }
}

export
let tic_tac_toe = new game_t ()

export
let random_bot = new random_bot_t (tic_tac_toe)

export
function new_play (): play_t {
  let play = new play_t (
    tic_tac_toe, empty_state, "O", ["O", "X"])
  return play
}

// brute force the winning strategy
