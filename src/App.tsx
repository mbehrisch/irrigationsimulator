import React, {useState, useEffect} from 'react'
import Canvas2D from './components/Canvas2D'
import EditorPanel from './components/EditorPanel'
import { createSimulator, DEFAULTS } from './sim/simulator'

export default function App(){
  const [sim] = useState<any>(() => createSimulator(DEFAULTS))
  const [selected, setSelected] = useState<string | null>(null)
  const [timeScale, setTimeScale] = useState<number>(1)
  const [perspective, setPerspective] = useState<'side'|'top'>('side')
  const [mode, setMode] = useState<'plan'|'simulate'>('simulate')

  useEffect(() => {
    sim.setTimeScale(timeScale)
  }, [timeScale, sim])

  useEffect(() => {
    // plan mode pauses simulation, simulate mode runs it
    sim.running = mode === 'simulate'
  }, [mode, sim])

  return (
    <div className="app">
      <header>
        <h1>Greenhouse Gravity Irrigation Simulator</h1>
        <div className="controls">
          <label>Time scale:
            <select value={timeScale} onChange={e=>setTimeScale(Number(e.target.value))}>
              <option value={1}>1x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
            </select>
          </label>
          <label>Perspective:
            <select value={perspective} onChange={e=>setPerspective(e.target.value as any)}>
              <option value="side">Side (default)</option>
              <option value="top">Top (plan)</option>
            </select>
          </label>

          <label>Mode:
            <select value={mode} onChange={e=>setMode(e.target.value as any)}>
              <option value="simulate">Simulate</option>
              <option value="plan">Plan (edit layout)</option>
            </select>
          </label>
          <div className="timestamps">
            <div>Start: {new Date(sim.startTime).toLocaleString()}</div>
            <div>Sim time: {new Date(sim.currentTime).toLocaleString()}</div>
          </div>
        </div>
      </header>

      <main>
        <Canvas2D simulator={sim} onSelect={setSelected} perspective={perspective} mode={mode} />
        <EditorPanel simulator={sim} selected={selected} onClose={()=>setSelected(null)} mode={mode} />
      </main>
    </div>
  )
}
