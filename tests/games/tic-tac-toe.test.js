import test from "ava"

import * as tic_tac_toe from "../../lib/games/tic-tac-toe"

test ("tic_tac_toe", t => {
  let play = tic_tac_toe.new_play ()

  play.move ("O", [1, 1])
  play.move ("X", [1, 2])
  play.move ("O", [0, 1])
  play.move ("X", [0, 2])
  play.move ("O", [2, 1])

  t.pass ()
})

// test ("random_bot", t => {
//   let play = tic_tac_toe.new_play ()

//   let bot = tic_tac_toe.random_bot

//   while (play.winner () === null) {
//     if (play.draw_p ()) {
//       return
//     }
//     let p = play.next_player ()
//     let s = play.last_state ()
//     let ch = bot.next_choice (p, s)
//     play.move (p, ch)
//   }

//   t.pass ()
// })
