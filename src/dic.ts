/**
 * Map with `.toString ()` value as key.
 */
export
class dic_t <K , V> {
  protected val_map: Map <string, V>
  protected key_map: Map <string, K>
  readonly key_to_str: (k: K) => string

  constructor (key_to_str: (k: K) => string = JSON.stringify) {
    this.val_map = new Map ()
    this.key_map = new Map ()
    this.key_to_str = key_to_str
  }

  set (k: K, v: V) {
    let s = this.key_to_str (k)
    this.val_map.set (s, v)
    this.key_map.set (s, k)
  }

  has (k: K): boolean {
    let s = this.key_to_str (k)
    return this.val_map.has (s)
  }

  get (k: K): V {
    let s = this.key_to_str (k)
    let v = this.val_map.get (s)
    if (v === undefined) {
      throw new Error ("key no in dic")
    }
    return v
  }

  get size (): number {
    return this.val_map.size
  }
  
  to_array (): Array <[K, V]> {
    let array = new Array <[K, V]> ()
    for (let [s, v] of this.val_map) {
      let k = this.key_map.get (s) as K
      array.push ([k, v])
    }
    return array
  }

  merge_array (array: Array <[K, V]>): dic_t <K, V> {
    for (let [k, v] of array) {
      this.set (k, v)
    }
    return this
  }

  *[Symbol.iterator] () {
    for (let [s, v] of this.val_map) {
      let k = this.key_map.get (s) as K
      yield [k, v] as [K, V]
    }
  }

  *entries () {
    for (let [s, v] of this.val_map) {
      let k = this.key_map.get (s) as K
      yield [k, v] as [K, V]
    }
  }

  *keys () {
    for (let k of this.key_map.values ()) {
      yield k as K
    }
  }

  *values () {
    for (let v of this.val_map.values ()) {
      yield v as V
    }
  }

  key_array (): Array <K> {
    return new Array (...this.key_map.values ())
  }

  value_array (): Array <V> {
    return new Array (...this.val_map.values ())
  }

  clone (): dic_t <K, V> {
    let dic = new dic_t <K, V> (this.key_to_str)
    dic.val_map = new Map (this.val_map)
    dic.key_map = new Map (this.key_map)
    return dic
  }
}
