const g = 9.80665
const rho = 1000 // water kg/m3

export const DEFAULTS = {
  greenhouseHeight_m: 2.00,
  barrel: { height_m: 1.40, volume_L: 220, radius_m: 0.3 },
  pipe_diameter_m: 0.0127,
  panels: [ {w_m:3.0, h_m:1.25, countNorth:2, countSouth:2} ],
  seasonal_rain_mmph: { spring:0.5, summer:1.0, fall:0.8, winter:0.5 }
}

function mmph_to_mps(mmph){ return (mmph/1000)/3600 }

export function createSimulator(config){
  const state = {
    config: JSON.parse(JSON.stringify(config)),
    startTime: Date.now(),
    currentTime: Date.now(),
    timeScale: 1,
    barrelLevel_m: 0.0,
    running: true,
    onUpdate: ()=>{}
  }

  // initial fill: empty
  state.barrelLevel_m = 0

  function heightToPressure_mbar(height_m){
    const p = rho * g * height_m // Pa
    return p/100 // convert to mbar approx
  }

  function orificeFlow_m3s(area_m2, head_m, Cd=0.6){
    if(head_m<=0) return 0
    return area_m2 * Cd * Math.sqrt(2*g*head_m)
  }

  function step(dt_ms){
    // simple model: rain adds to barrel via collection area from panels
    const season = 'summer' // simplified for now
    const rain_mps = mmph_to_mps(state.config.seasonal_rain_mmph[season])

    // collection area total (m2)
    const panels = state.config.panels[0]
    const totalPanels = (panels.countNorth + panels.countSouth) * (panels.w_m * panels.h_m)
    const collected_m3s = totalPanels * rain_mps

    // barrel inflow
    const inflow = collected_m3s

    // outflow via pipe depending on head (height of water to outlet height)
    const outletHeight = state.config.greenhouseHeight_m
    const head = Math.max(0, state.barrelLevel_m - (outletHeight - state.config.barrel.height_m))
    const pipeArea = Math.PI * Math.pow(state.config.pipe_diameter_m/2,2)
    const outflow = orificeFlow_m3s(pipeArea, head)

    // update barrel level: convert volumes
    const barrelArea = Math.PI * Math.pow(state.config.barrel.radius_m,2)
    const dV = (inflow - outflow) * (dt_ms/1000)
    const dH = dV / barrelArea
    state.barrelLevel_m = Math.max(0, state.barrelLevel_m + dH)

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
    setTimeScale(v){ state.timeScale = v },
    set onUpdate(fn){ state.onUpdate = fn },
    set running(v){ state.running = v }
  }
}
