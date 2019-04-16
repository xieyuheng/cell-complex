import test from "ava"

import * as hackenbush from "../lib/hackenbush"

test ("hackenbush", t => {
  let bush = new hackenbush.state_t ()
      .blue (0, 1)
      .blue (0, 1)
      .blue (1, 2)
      .red (0, 1)
      .red (0, 1)
      .green (0, 1)

  let play = hackenbush.new_play (bush)

  play.move ("blue", 0)
  play.move ("red", 3)
  play.move ("blue", 1)
  play.move ("red", 4)

  t.pass ()
})

test ("random_bot", t => {
  let bush = new hackenbush.state_t ()
      .blue (0, 1)
      .blue (0, 1)
      .blue (1, 2)
      .red (0, 1)
      .red (0, 1)
      .green (0, 1)

  let play = hackenbush.new_play (bush)

  let bot = hackenbush.random_bot

  while (play.winner () === null) {
    let p = play.next_player ()
    let s = play.last_state ()
    let ch = bot.next_choice (p, s)
    play.move (p, ch)
  }

  t.pass ()
})
