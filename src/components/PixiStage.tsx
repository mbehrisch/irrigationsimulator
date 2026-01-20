type Props = { simulator:any; onSelect:(id:string)=>void; perspective?: 'side'|'top'; mode?: 'plan'|'simulate' }
import React, { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { Simulator } from '../types'

type Props = {
  simulator: Simulator;
  onSelect: (id: string) => void;
  perspective?: 'side' | 'top';
  mode?: 'plan' | 'simulate';
}

export default function PixiStage({ simulator, onSelect, perspective = 'side', mode = 'simulate' }:Props){
  const containerRef = useRef<HTMLDivElement|null>(null)
  const appRef = useRef<PIXI.Application|null>(null)
  const barrelsGraphics = useRef<PIXI.Graphics[]>([])

  useEffect(()=>{
    const container = containerRef.current!
    if(!container) return
    // create an explicit canvas element and initialize a PIXI Renderer + Ticker
    const canvasEl = document.createElement('canvas')
    canvasEl.style.width = '100%'
    canvasEl.style.height = '100%'
    canvasEl.style.display = 'block'
    // set reasonable default pixel size; we'll resize below
    canvasEl.width = Math.max(300, container.clientWidth || 800)
    canvasEl.height = Math.max(200, container.clientHeight || 600)
    container.appendChild(canvasEl)

    // Use Renderer + Container + Ticker instead of Application to avoid deprecated API
    const renderer = new (PIXI as any).Renderer({ view: canvasEl, width: canvasEl.width, height: canvasEl.height, antialias: true, backgroundAlpha: 0 })
    const stage = new PIXI.Container()
    stage.sortableChildren = true
    // ticker to drive render loop
    const ticker = new PIXI.Ticker()
    // store references for potential external access
    (appRef as any).current = { renderer, stage, ticker }

    function resizeRenderer(){
      const w = Math.max(100, Math.floor(container.clientWidth))
      const h = Math.max(100, Math.floor(container.clientHeight))
      try{ renderer.resize(w, h) }catch(e){}
      canvasEl.width = w
      canvasEl.height = h
    }
    resizeRenderer()
    const ro = new ResizeObserver(resizeRenderer)
    ro.observe(container)

    // create graphics for barrels based on config
    function initBarrels(){
      try{
        // clean existing
        barrelsGraphics.current.forEach(g=>{ try{ g.destroy({ children: true }) }catch(e){} })
        barrelsGraphics.current = []
        const cfgBarrels = Array.isArray(simulator?.config?.barrels) ? simulator.config.barrels : []
        for(let i=0;i<cfgBarrels.length;i++){
          const g = new PIXI.Graphics()
          g.zIndex = 10
          stage.addChild(g)
          barrelsGraphics.current.push(g)
        }
      }catch(err){
        console.error('initBarrels error', err, simulator)
      }
    }

    initBarrels()

    function draw(){
      const w = (renderer as any).width || canvasEl.width
      const h = (renderer as any).height || canvasEl.height
      const barrels = Array.isArray(simulator?.config?.barrels) ? simulator.config.barrels : []
      const baseY = h - 80
      const barrelW = 80
      const barrelMaxH = 200
      const gap = 20

      for(let i=0;i<barrels.length;i++){
        const b = barrels[i]
        const g = barrelsGraphics.current[i]
        if(!g) continue
        g.clear()
        if(perspective === 'side'){
          const level = simulator?.barrels?.[i]?.level_m || 0
          const levelRatio = Math.min(1, level / Math.max(1e-6, b.height_m || 1))
          const levelH = barrelMaxH * levelRatio
          const x = 40 + i * (barrelW + gap)
          // barrel outline
          g.beginFill(0xc8e6ff)
          g.drawRect(x, baseY - barrelMaxH, barrelW, barrelMaxH)
          g.endFill()
          // water
          g.beginFill(0x1e90ff)
          g.drawRect(x, baseY - levelH, barrelW, levelH)
          g.endFill()
        } else {
          // top view: map positions
          const areaW = 6.0, areaH = 3.0, pad = 40
          const pxW = Math.max(100, w)
          const pxH = Math.max(100, h)
          const mapX = (xm:number) => pad + (xm / areaW) * (pxW - pad*2)
          const mapY = (ym:number) => pad + (ym / areaH) * (pxH - pad*2 - 80)
          const pos = simulator?.barrels?.[i]?.pos || { x_m:0, y_m:0 }
          const cx = mapX(pos.x_m)
          const cy = mapY(pos.y_m)
          const r = 20
          g.beginFill(0xc8e6ff)
          g.drawCircle(cx, cy, r)
          g.endFill()
        }
      }
    }

    // start ticker-driven loop
    ticker.add(()=>{ try{ draw(); renderer.render(stage) }catch(e){} })
    ticker.start()

    // respond to config changes (e.g., loading templates)
    simulator.onConfigChanged = ()=> initBarrels()

    return ()=>{
      try{ ticker.stop(); ticker.destroy() }catch(e){}
      try{ ro.disconnect() }catch(e){}
      try{ renderer.destroy(); }catch(e){}
      try{ if(container && canvasEl && canvasEl.parentNode) canvasEl.parentNode.removeChild(canvasEl) }catch(e){}
      (appRef as any).current = null
    }
  }, [simulator, perspective])

  // wire updates from simulator for immediate redraws
  useEffect(()=>{
    simulator.onUpdate = (s:any)=>{
      // keep minimal — draw loop reads simulator state
    }
    return ()=>{ simulator.onUpdate = undefined }
  },[simulator])

  return (
    <div ref={containerRef} style={{width:'100%',height:'100%',position:'relative'}} />
  )
}
