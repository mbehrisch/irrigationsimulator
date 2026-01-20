import React, {useRef, useEffect, useState} from 'react'

export default function Canvas2D({simulator, onSelect}){
  const ref = useRef()
  const [metrics, setMetrics] = useState({})

  useEffect(()=>{
    simulator.onUpdate = (s)=>{
      setMetrics({level:s.barrelLevel_m})
    }
  },[simulator])

  useEffect(()=>{
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height)
      // draw ground
      ctx.fillStyle = '#dfeff6'
      ctx.fillRect(0, canvas.height-80, canvas.width, 80)

      // draw barrel (side view)
      const barrelX = 120
      const barrelW = 80
      const barrelMaxH = 200
      const levelRatio = Math.min(1, simulator.barrelLevel_m / simulator.config.barrel.height_m)
      const levelH = barrelMaxH * levelRatio

      ctx.fillStyle = '#c8e6ff'
      ctx.fillRect(barrelX, canvas.height-80-barrelMaxH, barrelW, barrelMaxH)
      // water
      ctx.fillStyle = '#1e90ff'
      ctx.fillRect(barrelX, canvas.height-80-levelH, barrelW, levelH)

      // draw pipe
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(barrelX+barrelW, canvas.height-80-20)
      ctx.lineTo(canvas.width-40, canvas.height-80-20)
      ctx.stroke()

      // metrics
      ctx.fillStyle = '#fff'
      ctx.font = '12px sans-serif'
      ctx.fillText(`Barrel level: ${simulator.barrelLevel_m.toFixed(2)} m`, 10,20)

      raf = requestAnimationFrame(draw)
    }
    draw()
    return ()=> cancelAnimationFrame(raf)
  },[simulator])

  return (
    <div className="canvas" style={{flex:1}}>
      <canvas ref={ref} width={800} height={400} style={{width:'100%'}} onClick={(e)=>onSelect('barrel')}></canvas>
    </div>
  )
}
