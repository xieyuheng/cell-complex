// 勉之 -- 免枝而有餘者勝

import * as hackenbush from "../lib/games/hackenbush"

import {
  id_t, vertex_t, edge_t, graph_t
} from "cell-complex/lib/graph-info"

import * as ng from "./ng"

class point_t {
  constructor (
    public x: number,
    public y: number,
  ) {}
}

type vertex_coord_t = point_t

type edge_coord_t = point_t
// control point of quadratic bézier curves

function affine_combination (
  points: Array <point_t>,
  coefficients: Array <number>,
): point_t {
  let p = new point_t (0, 0)
  for (let i = 0; i < points.length; i += 1) {
    let q = points[i]
    p.x += q.x * coefficients[i]
    p.y += q.y * coefficients[i]
  }
  return p
}

function bezier1 (
  t: number,
  p0: point_t,
  p1: point_t,
): point_t {
  let s = 1 - t
  return affine_combination ([p0, p1], [s, t])
}

function bezier2 (
  t: number,
  p0: point_t,
  p1: point_t,
  p2: point_t,
): point_t {
  return bezier1 (
    t,
    bezier1 (t, p0, p1),
    bezier1 (t, p1, p2))
}

function bezier3 (
  t: number,
  p0: point_t,
  p1: point_t,
  p2: point_t,
  p3: point_t,
): point_t {
  return bezier1 (
    t,
    bezier2 (t, p0, p1, p2),
    bezier2 (t, p1, p2, p3))
}

class geometry_t {
  constructor (
    public width: number,
    public height: number,
    public origin: point_t = new point_t (0, 0),
    public vertex_coord_map: Map <id_t, vertex_coord_t> = new Map (),
    public edge_coord_map: Map <id_t, edge_coord_t> = new Map (),
  ) {}
}

function point_distant (
  p: point_t,
  q: point_t,
): number {
  return Math.sqrt ((p.x - q.x) ** 2 + (p.y - q.y) ** 2)
}

function point_on_curve_p (
  p: point_t,
  curve_sample: Array <point_t>,
): boolean {
  for (let q of curve_sample) {
    if (point_distant (p, q) <= 10) {
      return true
    }
  }
  return false
}

function uniform_sample (
  start: number,
  end: number,
  step: number,
): Array <number> {
  let array: Array <number> = []
  let x = start
  while (x < end) {
    array.push (x)
    x += step
  }
  return array
}

function blue_point_on_edge (
  p: point_t,
  graph: graph_t <{}, { value: hackenbush.color_t }>,
  geometry: geometry_t,
): edge_t <{}, { value: hackenbush.color_t }> | null {
  for (let [_id, edge] of graph.edge_map) {
    let p0 = geometry.vertex_coord_map.get (edge.start) as point_t
    let p1 = geometry.vertex_coord_map.get (edge.end) as point_t
    let pc = geometry.edge_coord_map.get (edge.id) as point_t
    let curve_sample = uniform_sample (0, 1, 1/100)
      .map ((t) => bezier2 (t, p0, pc, p1))
    if (((edge.info.value === "blue") ||
         (edge.info.value === "green")) &&
        point_on_curve_p (p, curve_sample)) {
      return edge
    }
  }
  return null
}

function geometrize (
  width: number,
  height: number,
  graph: graph_t <{}, { value: hackenbush.color_t }>,
): geometry_t {
  let geometry = new geometry_t (width, height)

  let interval = (width * 0.9) / (graph.vertex_map.size - 1)
  let factor = (height * 0.9) / graph.edge_map.size

  let origin = new point_t (20, height / 2)
  geometry.origin = origin

  let id_to_point = (id: id_t): point_t => new point_t (
    id * interval + origin.x, origin.y)

  graph.vertex_map.forEach ((vertex) => {
    let p = id_to_point (vertex.id)
    geometry.vertex_coord_map.set (vertex.id, p)
  })

  graph.edge_map.forEach ((edge) => {
    let p0 = id_to_point (edge.start)
    let p1 = id_to_point (edge.end)
    let p = bezier1 (1/2, p0, p1)
    p.y = factor * edge.id
    // if (edge.id % 2 === 0) {
    //   p.y = factor * edge.id
    // } else {
    //   p.y = - factor * edge.id
    // }
    geometry.edge_coord_map.set (edge.id, p)
  })

  return geometry
}

class state_t {
  mouse: point_t

  constructor (
    public play: hackenbush.play_t,
    public geometry: geometry_t,
  ) {
    this.mouse = new point_t (0, 0)
  }
}

interface mousedown_t {
  kind: "mousedown",
  mouse: point_t,
}

interface mousemove_t {
  kind: "mousemove",
  mouse: point_t,
}

type event_t = mousedown_t | mousemove_t

let color_map = {
  red: "hsla(0, 80%, 60%, 0.6)",
  blue: "hsla(210, 80%, 60%, 0.6)",
  green: "hsla(120, 80%, 60%, 0.6)",
  gray: "hsla(120, 0%, 60%, 0.8)",
}

let deep_color_map = {
  red: "hsla(0, 80%, 60%, 0.9)",
  blue: "hsla(210, 80%, 60%, 0.9)",
  green: "hsla(120, 80%, 60%, 0.9)",
}

class engine_t
extends ng.engine_t <HTMLCanvasElement, state_t, event_t> {
  receive (): void {
    let event = this.event_queue.shift ()

    if (event === undefined) { return }

    if (event.kind === "mousemove") {
      this.state.mouse.x = event.mouse.x
      this.state.mouse.y = event.mouse.y
    } else if (event.kind === "mousedown") {
      this.state.mouse.x = event.mouse.x
      this.state.mouse.y = event.mouse.y
      let play = this.state.play
      let geometry = this.state.geometry
      let s = play.last_state ()
      let edge = blue_point_on_edge (
        event.mouse, s.graph, geometry)
      if ((edge !== null) &&
          (play.winner () === null)) {
        play.move ("blue", edge.id)
        let bot = hackenbush.random_bot
        let p = play.next_player ()
        let ch = bot.next_choice (p, s)
        window.setTimeout (() => play.move (p, ch), 600)
        // if (play.winner () === null) {}
        // [todo] winner screen
      }
    }

    this.receive ()
  }

  rander (): void {
    let width = this.state.geometry.width
    let height = this.state.geometry.height
    this.canvas.width = width
    this.canvas.height = height

    let mouse = this.state.mouse
    let x = mouse.x
    let y = mouse.y

    let play = this.state.play
    let s = play.last_state ()

    let geometry = this.state.geometry
    let origin = geometry.origin

    let ctx = this.canvas.getContext ("2d") as CanvasRenderingContext2D

    ctx.save ()

    ctx.clearRect (0, 0, width, height)

    ctx.beginPath ()
    ctx.arc (origin.x, origin.y, 8, 0, Math.PI * 2, true)
    ctx.closePath ()
    let winner = play.winner ()
    if (winner === null) {
      ctx.fillStyle = color_map ["gray"]
    } else {
      ctx.fillStyle = color_map [winner]
    }
    ctx.fill ()

    ctx.beginPath ()
    ctx.arc (x, y, 6, 0, Math.PI * 2, true)
    ctx.closePath ()
    ctx.fillStyle = color_map ["blue"]
    ctx.fill ()

    let draw_edge = (
      edge: edge_t <{}, { value: hackenbush.color_t }>,
      color_style: string,
    ) => {
      ctx.beginPath ()
      let p0 = geometry.vertex_coord_map.get (edge.start) as point_t
      let p1 = geometry.vertex_coord_map.get (edge.end) as point_t
      let pc = geometry.edge_coord_map.get (edge.id) as point_t
      ctx.lineCap = "round"
      ctx.lineWidth = 5
      ctx.strokeStyle = color_style
      ctx.moveTo (p0.x, p0.y)
      ctx.quadraticCurveTo (pc.x, pc.y, p1.x, p1.y)
      ctx.stroke ()
    }

    s.graph.edge_map.forEach ((edge) => {
      draw_edge (edge, color_map [edge.info.value])
    })

    let edge = blue_point_on_edge (
      mouse, s.graph, geometry)

    if (edge !== null) {
      draw_edge (edge, deep_color_map [edge.info.value])
    }

    ctx.restore ()
  }

  //////

  init (): void {
    let width = this.canvas.width
    let height = this.canvas.height
    let play = this.state.play
    let s = play.last_state ()
    let geometry = geometrize (
      width, height, play.init_state.graph)
    console.log (play.init_state.graph)
    console.log (geometry)
  }

  run (): void {
    this.receive ()
    this.rander ()
    window.requestAnimationFrame (() => this.run ())
  }
}

let bush = new hackenbush.state_t ()
  .blue (0, 1)
  .blue (0, 1)
  .blue (1, 2)
  .red (0, 2)
  .red (0, 1)
  .red (0, 1)
  .green (0, 1)

let play = hackenbush.new_play (bush)

let geometry = geometrize (
  window.innerWidth,
  window.innerHeight,
  play.init_state.graph)

let engine: engine_t = new engine_t (
  document.getElementById ("canvas") as HTMLCanvasElement,
  new state_t (play, geometry))

function get_mouse (
  canvas: HTMLCanvasElement,
  event: MouseEvent,
): point_t {
  let x, y
  let r = canvas.getBoundingClientRect ()
  x = Math.round (event.clientX - r.left)
  y = Math.round (event.clientY - r.top)
  return new point_t (x, y)
}

export
function init (): void {
  window.addEventListener ("resize", () => {
    engine.state.geometry = geometrize (
      window.innerWidth,
      window.innerHeight,
      engine.state.play.init_state.graph)
  })

  engine.canvas.addEventListener ("mousedown", (event) => {
    if (event.button !== 0) { return }
    engine.event_queue.push ({
      kind: "mousedown",
      mouse: get_mouse (engine.canvas, event),
    })
  })

  engine.canvas.addEventListener ("mousemove", (event) => {
    engine.event_queue.push ({
      kind: "mousemove",
      mouse: get_mouse (engine.canvas, event),
    })
  })

  engine.init ()
  engine.run ()
}
