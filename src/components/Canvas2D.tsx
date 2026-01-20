import React, {useRef, useEffect, useState} from 'react'

type Props = { simulator:any; onSelect:(id:string)=>void; perspective?: 'side'|'top'; mode?: 'plan'|'simulate' }

export default function Canvas2D({simulator, onSelect, perspective = 'side', mode = 'simulate'}:Props){
  const ref = useRef<HTMLCanvasElement | null>(null)
  const [metrics, setMetrics] = useState<any>({})
  const selectedIdx = useRef<number>(0)
  const dragging = useRef<{idx:number,offsetX:number,offsetY:number} | null>(null)

  useEffect(()=>{
    simulator.onUpdate = (s:any)=>{
      // collect basic metrics (levels of barrels)
      setMetrics({levels: s.barrels.map((b:any)=>b.level_m)})
    }
  },[simulator])

  useEffect(()=>{
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf:number

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.fillStyle = '#dfeff6'
      ctx.fillRect(0, canvas.height-80, canvas.width, 80)

      const barrels = simulator.config.barrels
      // common layout vars
      const barrelW = 80
      const barrelMaxH = 200
      const baseY = canvas.height-80
      const gap = 20

      // background for top view
      if(perspective === 'top'){
        ctx.fillStyle = '#e9f2f6'
        ctx.fillRect(0,0,canvas.width,canvas.height-80)
      }

      if(perspective === 'side'){
        let x = 40
        for(let i=0;i<barrels.length;i++){
          const b = barrels[i]
          const level = simulator.barrels[i]?.level_m || 0
          const levelRatio = Math.min(1, level / b.height_m)
          const levelH = barrelMaxH * levelRatio

          // barrel outline
          ctx.fillStyle = '#c8e6ff'
          ctx.fillRect(x, baseY-barrelMaxH, barrelW, barrelMaxH)
          // water
          ctx.fillStyle = '#1e90ff'
          ctx.fillRect(x, baseY-levelH, barrelW, levelH)

          // selection outline
          if(i === selectedIdx.current){
            ctx.strokeStyle = '#ffea00'
            ctx.lineWidth = 3
            ctx.strokeRect(x-2, baseY-barrelMaxH-2, barrelW+4, barrelMaxH+4)
          }

          x += barrelW + gap
        }
        // main outlet pipe (visual)
        ctx.strokeStyle = '#444'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(40 + barrels.length*(barrelW+gap), baseY-20)
        ctx.lineTo(canvas.width-40, baseY-20)
        ctx.stroke()
      } else {
        // top-down view: map positions (meters) to canvas coordinates
        const areaW = 6.0 // meters width for mapping (example)
        const areaH = 3.0 // meters depth
        const pad = 40
        const mapX = (xm:number) => pad + (xm / areaW) * (canvas.width - pad*2)
        const mapY = (ym:number) => pad + (ym / areaH) * (canvas.height - pad*2 - 80)

        for(let i=0;i<barrels.length;i++){
          const b = barrels[i]
          const pos = simulator.barrels[i]?.pos || { x_m:0, y_m:0 }
          const cx = mapX(pos.x_m)
          const cy = mapY(pos.y_m)
          const r = 20

          ctx.fillStyle = '#c8e6ff'
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill()
          // label
          ctx.fillStyle = '#033047'
          ctx.fillText(`B${i}`, cx-6, cy+4)
          if(i===selectedIdx.current){
            ctx.strokeStyle = '#ffea00'
            ctx.lineWidth = 2
            ctx.beginPath(); ctx.arc(cx, cy, r+4, 0, Math.PI*2); ctx.stroke()
          }
        }
      }

      ctx.fillStyle = '#fff'
      ctx.font = '12px sans-serif'
      ctx.fillText(`Barrel levels: ${ (simulator.barrels || []).map((b:any)=>b.level_m.toFixed(2)).join(', ') } m`, 10,20)

      raf = requestAnimationFrame(draw)
    }
    draw()
    return ()=> cancelAnimationFrame(raf)
  },[simulator])

  // pointer events for plan-mode dragging
  useEffect(()=>{
    const canvas = ref.current!
    if(!canvas) return
    const rect = ()=>canvas.getBoundingClientRect()
    function toLocal(e:PointerEvent){
      const r = rect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    function findBarrelAt(x:number,y:number){
      // only for top perspective
      if((perspective) !== 'top') return -1
      const areaW = 6.0; const areaH = 3.0; const pad = 40
      const invX = (xx:number)=> ((xx - pad)/(canvas.width - pad*2)) * areaW
      const invY = (yy:number)=> ((yy - pad)/(canvas.height - pad*2 - 80)) * areaH
      const barrels = simulator.config.barrels
      for(let i=0;i<barrels.length;i++){
        const pos = simulator.barrels[i]?.pos || { x_m:0, y_m:0 }
        const cx = pad + (pos.x_m / areaW) * (canvas.width - pad*2)
        const cy = pad + (pos.y_m / areaH) * (canvas.height - pad*2 - 80)
        const r = 20
        if(Math.hypot(cx-x, cy-y) <= r) return i
      }
      return -1
    }

    function onPointerDown(ev:PointerEvent){
      if(mode !== 'plan') return
      const p = toLocal(ev)
      const idx = findBarrelAt(p.x,p.y)
      if(idx>=0){
        const pos = simulator.barrels[idx].pos
        const areaW = 6.0, areaH = 3.0, pad = 40
        const cx = pad + (pos.x_m / areaW) * (canvas.width - pad*2)
        const cy = pad + (pos.y_m / areaH) * (canvas.height - pad*2 - 80)
        dragging.current = { idx, offsetX: p.x - cx, offsetY: p.y - cy }
        (canvas as HTMLCanvasElement).setPointerCapture(ev.pointerId)
      }
    }
    function onPointerMove(ev:PointerEvent){
      if(!dragging.current) return
      const p = toLocal(ev)
      const d = dragging.current
      const nx = p.x - d.offsetX
      const ny = p.y - d.offsetY
      // map back to meters
      const areaW = 6.0; const areaH = 3.0; const pad = 40
      const xm = ((nx - pad)/(canvas.width - pad*2)) * areaW
      const ym = ((ny - pad)/(canvas.height - pad*2 - 80)) * areaH
      const cm = { x_m: Math.max(0, xm), y_m: Math.max(0, ym) }
      simulator.config.barrels[d.idx].pos = cm
      simulator.barrels[d.idx].pos = cm
    }
    function onPointerUp(ev:PointerEvent){
      if(dragging.current){
        (canvas as HTMLCanvasElement).releasePointerCapture(ev.pointerId)
        dragging.current = null
      }
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return ()=>{
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  },[simulator, perspective, mode])

  return (
    <div className="canvas" style={{flex:1}}>
      <canvas
        ref={ref}
        width={800}
        height={400}
        style={{width:'100%'}}
        onClick={(e)=>{
          const len = simulator.config.barrels.length
          selectedIdx.current = (selectedIdx.current + 1) % Math.max(1,len)
          onSelect(`barrel:${selectedIdx.current}`)
        }}
      />
    </div>
  )
}
