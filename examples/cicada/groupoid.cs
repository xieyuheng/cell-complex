import { category_t } from "./category.cs"

class groupoid_t {
  cat: category_t

  object_t = this.cat.object_t
  arrow_t = this.cat.arrow_t

  id = this.cat.id
  compose = this.cat.compose

  inv (f: this.arrow_t): this.arrow_t

  arrow_iso (f: this.arrow_t): iso_t (
    cat = this.cat,
    iso = f,
    inv = this.inv (f),
  )
}
