import React, {useState, useEffect} from 'react'

export default function EditorPanel({simulator, selected, onClose}){
  const [local, setLocal] = useState(null)

  useEffect(()=>{
    if(selected==='barrel'){
      setLocal({height_m: simulator.config.barrel.height_m, volume_L: simulator.config.barrel.volume_L})
    } else setLocal(null)
  },[selected, simulator])

  if(!selected) return <div className="editor">Select an item to edit</div>

  function apply(){
    if(selected==='barrel'){
      simulator.config.barrel.height_m = Number(local.height_m)
      simulator.config.barrel.volume_L = Number(local.volume_L)
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
          <div style={{marginTop:8}}>
            <button onClick={apply}>Apply</button>
            <button onClick={onClose} style={{marginLeft:8}}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
