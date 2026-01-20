const g = 9.80665
const rho = 1000 // water kg/m3

export const DEFAULTS: any = {
  greenhouseHeight_m: 2.00,
  // support multiple barrels; each barrel can be different
  // `pos` is in meters (x,y) relative to greenhouse plan (for top view)
  barrels: [ { height_m: 1.40, volume_L: 220, radius_m: 0.3, floatEnabled: true, floatSetpoint: 0.95, pos: { x_m: 0.5, y_m: 0.5 } } ],
  pipe_diameter_m: 0.0127,
  panels: [ {w_m:3.0, h_m:1.25, countNorth:2, countSouth:2} ],
  seasonal_rain_mmph: { spring:0.5, summer:1.0, fall:0.8, winter:0.5 }
}

function mmph_to_mps(mmph:number){ return (mmph/1000)/3600 }

export function createSimulator(config: any){
  const state: any = {
    config: JSON.parse(JSON.stringify(config)),
    startTime: Date.now(),
    currentTime: Date.now(),
    timeScale: 1,
    // per-barrel levels
    barrels: [],
    running: true,
    onUpdate: ()=>{}
  }

  // initialize barrel levels and positions
  state.barrels = state.config.barrels.map((b:any)=>({ level_m: 0, pos: { x_m: b.pos?.x_m || 0, y_m: b.pos?.y_m || 0 } }))

  function orificeFlow_m3s(area_m2:number, head_m:number, Cd=0.6){
    if(head_m<=0) return 0
    return area_m2 * Cd * Math.sqrt(2*g*head_m)
  }

  function step(dt_ms:number){
    // simple model: rain adds to barrel via collection area from panels
    const season = 'summer' // simplified for now
    const rain_mps = mmph_to_mps(state.config.seasonal_rain_mmph[season])

    // collection area total (m2)
    const panels = state.config.panels[0]
    const totalPanels = (panels.countNorth + panels.countSouth) * (panels.w_m * panels.h_m)
    const collected_m3s = totalPanels * rain_mps

    // simple distribution: for now all collected water flows into barrel[0]
    let inflow = collected_m3s

    // apply float valve: if first barrel has floatEnabled and is above setpoint, block inflow
    const b0 = state.config.barrels[0]
    if(b0.floatEnabled){
      const level0 = state.barrels[0].level_m
      if(level0 >= b0.height_m * (b0.floatSetpoint || 0.95)){
        inflow = 0 // stop filling when float valve closed (simple model)
      }
    }

    // compute per-barrel outflow and update levels independently
    const pipeArea = Math.PI * Math.pow(state.config.pipe_diameter_m/2,2)
    for(let i=0;i<state.config.barrels.length;i++){
      const cb = state.config.barrels[i]
      const level = state.barrels[i].level_m
      // head measured relative to outlet (greenhouse outlet height)
      const outletHeight = state.config.greenhouseHeight_m
      const head = Math.max(0, level - (outletHeight - cb.height_m))
      const outflow = orificeFlow_m3s(pipeArea, head)

      const barrelArea = Math.PI * Math.pow(cb.radius_m,2)
      // inflow goes only to barrel 0 for now
      const myInflow = i===0 ? inflow : 0
      const dV = (myInflow - outflow) * (dt_ms/1000)
      const dH = dV / barrelArea
      state.barrels[i].level_m = Math.max(0, state.barrels[i].level_m + dH)
      // keep barrel position synchronized with config when edited in plan mode
      state.barrels[i].pos = { x_m: state.config.barrels[i].pos?.x_m ?? state.barrels[i].pos.x_m, y_m: state.config.barrels[i].pos?.y_m ?? state.barrels[i].pos.y_m }
    }

    state.currentTime += dt_ms * state.timeScale
    state.onUpdate(state)
  }

  let last = Date.now()
  function tick(){
    const now = Date.now()
    const dt = now - last
    last = now
    if(state.running){
      step(dt)
    }
    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)

  return {
    ...state,
    startTime: state.startTime,
    get currentTime(){ return state.currentTime },
    setTimeScale(v:number){ state.timeScale = v },
    set onUpdate(fn:Function){ state.onUpdate = fn },
    set running(v:boolean){ state.running = v }
  }
}
