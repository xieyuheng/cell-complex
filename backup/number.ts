import { group_t, abelian_group_t } from "./group"
import { field_t } from "./field"

export
class number_add_group_t extends group_t <number> {
  constructor () {
    super ()
  }

  eq (x: number, y: number): boolean {
    return x === y
  }

  id = 0

  mul (x: number, y: number): number {
    return x + y
  }

  inv (x: number): number {
    return - x
  }
}

{
  let group = new number_add_group_t ()

  group.assoc (1, 2, 3)
  group.assoc (3, 2, 1)
  group.id_left (1)
  group.id_left (3)
  group.id_left (1)
  group.id_left (3)
  group.id_inv (1)
  group.id_inv (3)
}

export
class number_add_abelian_group_t extends abelian_group_t <number> {
  constructor () {
    super ()
  }

  eq (x: number, y: number): boolean {
    return x === y
  }

  id = 0

  add (x: number, y: number): number {
    return x + y
  }

  neg (x: number): number {
    return - x
  }
}

{
  let abel = new number_add_abelian_group_t ()

  abel.assoc (1, 2, 3)
  abel.assoc (3, 2, 1)
  abel.id_left (1)
  abel.id_left (3)
  abel.id_left (1)
  abel.id_left (3)

  abel.id_neg (1)
  abel.id_neg (3)

  abel.commu (1, 2)
  abel.commu (3, 2)
}

export
class number_field_t extends field_t <number> {
  constructor () {
    super ()
  }

  eq (x: number, y: number): boolean {
    return x === y
  }

  add_id = 0

  add (x: number, y: number): number {
    return x + y
  }

  neg (x: number): number {
    return - x
  }

  mul_id = 1

  mul (x: number, y: number): number {
    return x * y
  }

  pure_inv (x: number): number {
    return 1 / x
  }
}

{
  let field = new number_field_t ()

  field.add_assoc (1, 2, 3)
  field.add_assoc (3, 2, 1)
  field.add_id_left (1)
  field.add_id_left (3)
  field.add_id_right (1)
  field.add_id_right (3)
  field.add_id_neg (1)
  field.add_id_neg (3)

  field.mul_assoc (1, 2, 3)
  field.mul_assoc (3, 2, 1)
  field.mul_id_left (1)
  field.mul_id_left (3)
  field.mul_id_right (1)
  field.mul_id_right (3)
  field.mul_id_inv (1)
  field.mul_id_inv (3)

  field.distr (1, 2, 3)
  field.distr (3, 2, 1)
}
