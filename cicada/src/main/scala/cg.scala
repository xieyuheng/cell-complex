trait game_t {
  type position_t
  type choice_t
  val init_position: position_t
  def L_choices (position: position_t): List [choice_t]
  def R_choices (position: position_t): List [choice_t]
  def L_move (choice: choice_t, position: position_t): position_t
  def R_move (choice: choice_t, position: position_t): position_t
}

class int_game_t extends game_t {
  type position_t = Int
  type choice_t = Int
  val init_position = 0
  def L_choices (x: Int) = List (1, 2, 3)
  def R_choices (x: Int) = List (1, 2, 3)
  def L_move (x: Int, y: Int) = 1
  def R_move (x: Int, y: Int) = 1
}
