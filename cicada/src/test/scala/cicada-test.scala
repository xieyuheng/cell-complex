import org.scalatest.FunSuite

class cicada_test_t extends FunSuite {
  test ("module") {
    var module = new module_obj_t
    println (module)
    assert (1 === 1)
  }
}
