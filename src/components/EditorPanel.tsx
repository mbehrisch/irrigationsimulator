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

  if(!selected) return <div className="editor p-4 rounded-lg">Select an item to edit</div>

  function apply(){
    if(selected && selected.startsWith('barrel') && local){
      const idx = Number(local.idx || 0)
      const b = simulator.config.barrels[idx]
      // preserve old stored volume to avoid sudden level jumps
      const oldRadius = b.radius_m || 0.3
      const oldArea = Math.PI * Math.pow(oldRadius, 2)
      const oldLevel = simulator.barrels[idx]?.level_m || 0
      const storedVolume = oldArea * oldLevel

      // apply config changes
      b.height_m = Number(local.height_m)
      b.volume_L = Number(local.volume_L)
      b.floatEnabled = !!local.floatEnabled
      b.floatSetpoint = Number(local.floatSetpoint)
      if(local.pos){
        b.pos = { x_m: Number(local.pos.x_m), y_m: Number(local.pos.y_m) }
        // sync runtime position immediately
        simulator.barrels[idx].pos = { x_m: Number(local.pos.x_m), y_m: Number(local.pos.y_m) }
      }

      // compute new area (if radius present in config)
      const newRadius = b.radius_m || oldRadius
      const newArea = Math.PI * Math.pow(newRadius, 2)
      const newLevelTarget = Math.min(b.height_m, storedVolume / Math.max(1e-9, newArea))

      // animate level change smoothly and keep barrel frozen during animation
      const runtimeBarrel = simulator.barrels[idx]
      if(runtimeBarrel){
        runtimeBarrel.frozen = true
        const from = runtimeBarrel.level_m || 0
        const to = newLevelTarget
        const duration = 400
        const start = performance.now()
        function stepAnim(now:number){
          const t = Math.min(1, (now - start)/duration)
          runtimeBarrel.level_m = from + (to - from) * t
          if(t < 1) requestAnimationFrame(stepAnim)
          else runtimeBarrel.frozen = false
        }
        requestAnimationFrame(stepAnim)
      }
    }
    onClose()
  }

  return (
    <div className="editor p-4 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Editor</h3>
        <div className="text-sm text-slate-400">{selected}</div>
      </div>
      {local && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300">Barrel height (m)</label>
            <input className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600" type="number" step="0.01" value={local.height_m} onChange={e=>setLocal({...local,height_m:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Barrel volume (L)</label>
            <input className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600" type="number" value={local.volume_L} onChange={e=>setLocal({...local,volume_L:e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <input id="float" className="h-4 w-4" type="checkbox" checked={local.floatEnabled} onChange={e=>setLocal({...local,floatEnabled:e.target.checked})} />
            <label htmlFor="float" className="text-sm text-slate-300">Float valve enabled</label>
          </div>
          <div>
            <label className="block text-sm text-slate-300">Float setpoint (fraction)</label>
            <input className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600" type="number" step="0.01" min="0.5" max="1.0" value={local.floatSetpoint} onChange={e=>setLocal({...local,floatSetpoint:e.target.value})} />
          </div>
          {mode === 'plan' && (
            <>
              <div>
                <label className="block text-sm text-slate-300">Position X (m)</label>
                <input className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600" type="number" step="0.01" value={local.pos?.x_m} onChange={e=>setLocal({...local,pos:{...local.pos,x_m:e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm text-slate-300">Position Y (m)</label>
                <input className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600" type="number" step="0.01" value={local.pos?.y_m} onChange={e=>setLocal({...local,pos:{...local.pos,y_m:e.target.value}})} />
              </div>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={apply} className="btn">Apply</button>
            <button onClick={onClose} className="btn bg-slate-600">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
