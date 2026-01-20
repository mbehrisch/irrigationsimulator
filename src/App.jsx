import React, {useState, useEffect} from 'react'
import Canvas2D from './components/Canvas2D'
import EditorPanel from './components/EditorPanel'
import { createSimulator, DEFAULTS } from './sim/simulator'

export default function App(){
  const [sim] = useState(() => createSimulator(DEFAULTS))
  const [selected, setSelected] = useState(null)
  const [timeScale, setTimeScale] = useState(1)

  useEffect(() => {
    sim.setTimeScale(timeScale)
  }, [timeScale, sim])

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
          <div className="timestamps">
            <div>Start: {new Date(sim.startTime).toLocaleString()}</div>
            <div>Sim time: {new Date(sim.currentTime).toLocaleString()}</div>
          </div>
        </div>
      </header>

      <main>
        <Canvas2D simulator={sim} onSelect={setSelected} />
        <EditorPanel simulator={sim} selected={selected} onClose={()=>setSelected(null)} />
      </main>
    </div>
  )
}
