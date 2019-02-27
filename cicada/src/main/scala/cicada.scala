class id_t {}

class name_t (
  str: String,
) {}

class body_t {
  var map: Map [name_t, obj_t] = Map ()
}

trait exp_t {}

trait obj_t {}

class var_obj_t (
  id: id_t,
  name: name_t,
  t: obj_t,
) extends obj_t {}

class disj_obj_t (
  name: name_t,
  sub_type_names: List [name_t],
  body: body_t,
) extends obj_t {}

class conj_obj_t (
  name: name_t,
  body: body_t,
) extends obj_t {}

class data_obj_t (
  name: name_t,
  body: body_t,
) extends obj_t {}

class tt_obj_t (
) extends obj_t {}

class module_obj_t extends obj_t {
  var body = new body_t
  def define (name: name_t, obj: obj_t) {
    body.map += (name -> obj)
  }
}

object main {
  def main (args: Array [String]) = {
    var module = new module_obj_t
    module.define (new name_t ("type"), new tt_obj_t)
    module.define (new name_t ("type2"), new tt_obj_t)
    println (module.body)
  }
}
