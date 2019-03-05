// game classification
// - two players
// - complete information
// - partizan game

class game_t [position_t, choice_t] (
  var L_choices: (position_t) => List [choice_t],
  var R_choices: (position_t) => List [choice_t],
  var L_move: (choice_t, position_t) => position_t,
  var R_move: (choice_t, position_t) => position_t,
)

class int_game_t (
  var k: Int
) extends game_t [Int, Int] (
  L_choices = (x) => List (1, 2, 3),
  R_choices = (x) => List (1, 2, 3),
  L_move = (x, y) => 1,
  R_move = (x, y) => 1,
)
