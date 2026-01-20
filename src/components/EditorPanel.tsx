import React, {useState, useEffect} from 'react'

type Props = { simulator:any; selected:string | null; onClose:()=>void; mode?: 'plan'|'simulate' }

export default function EditorPanel({simulator, selected, onClose, mode}:Props){
  const [local, setLocal] = useState<any>(null)

  useEffect(()=>{
    if(selected && selected.startsWith('barrel')){
      const parts = selected.split(':')
      const idx = Number(parts[1] || 0)
      const b = simulator.config.barrels[idx]
      const pos = b.pos || { x_m: 0, y_m: 0 }
      setLocal({height_m: b.height_m, volume_L: b.volume_L, floatEnabled: !!b.floatEnabled, floatSetpoint: b.floatSetpoint || 0.95, idx, pos})
    } else setLocal(null)
  },[selected, simulator])

  if(!selected) return <div className="editor">Select an item to edit</div>

  function apply(){
    if(selected && selected.startsWith('barrel') && local){
      const idx = Number(local.idx || 0)
      const b = simulator.config.barrels[idx]
      b.height_m = Number(local.height_m)
      b.volume_L = Number(local.volume_L)
      b.floatEnabled = !!local.floatEnabled
      b.floatSetpoint = Number(local.floatSetpoint)
      if(local.pos){
        b.pos = { x_m: Number(local.pos.x_m), y_m: Number(local.pos.y_m) }
        // sync runtime state
        simulator.barrels[idx].pos = { x_m: Number(local.pos.x_m), y_m: Number(local.pos.y_m) }
      }
    }
    onClose()
  }

  return (
    <div className="editor">
      <h3>Editor</h3>
      <div>Selected: {selected}</div>
      {local && (
        <div>
          <label>Barrel height (m):<input type="number" step="0.01" value={local.height_m} onChange={e=>setLocal({...local,height_m:e.target.value})} /></label>
          <label>Barrel volume (L):<input type="number" value={local.volume_L} onChange={e=>setLocal({...local,volume_L:e.target.value})} /></label>
          <label><input type="checkbox" checked={local.floatEnabled} onChange={e=>setLocal({...local,floatEnabled:e.target.checked})} /> Float valve enabled</label>
          <label>Float setpoint (fraction):<input type="number" step="0.01" min="0.5" max="1.0" value={local.floatSetpoint} onChange={e=>setLocal({...local,floatSetpoint:e.target.value})} /></label>
          {mode === 'plan' && (
            <>
              <label>Position X (m):<input type="number" step="0.01" value={local.pos?.x_m} onChange={e=>setLocal({...local,pos:{...local.pos,x_m:e.target.value}})} /></label>
              <label>Position Y (m):<input type="number" step="0.01" value={local.pos?.y_m} onChange={e=>setLocal({...local,pos:{...local.pos,y_m:e.target.value}})} /></label>
            </>
          )}
          <div style={{marginTop:8}}>
            <button onClick={apply}>Apply</button>
            <button onClick={onClose} style={{marginLeft:8}}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
