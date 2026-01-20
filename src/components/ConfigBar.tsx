import React from 'react'
import { Template, Seasons } from '../types'

export type ConfigBarProps = {
  timeScale: number
  setTimeScale: (v: number) => void
  perspective: 'side' | 'top'
  setPerspective: (v: 'side' | 'top') => void
  stage: 'plan' | 'simulate' | 'analyze'
  setStage: (s: 'plan' | 'simulate' | 'analyze') => void
  isRunning: boolean
  setIsRunning: (b: boolean) => void
  templates: Template[]
  selectedTemplate: string
  setSelectedTemplate: (s: string) => void
  loadTemplate: (id: string) => void
  newTemplate: () => void
  showSeasons: boolean
  setShowSeasons: (b: boolean) => void
  seasons: Seasons
  setSeasons: (s: Seasons) => void
  applySeasons: () => void
  exportScene: () => void
  importScene: (f?: File) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}


const ConfigBar: React.FC<ConfigBarProps> = (props) => {
  return (
    <div className="controls flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <span>Time scale:</span>
        <input type="number" min={1} step={1} value={props.timeScale} onChange={e=>props.setTimeScale(Number(e.target.value) || 1)} className="input w-20" />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <span>Perspective:</span>
        <select value={props.perspective} onChange={e=>props.setPerspective(e.target.value as any)} className="input">
          <option value="side">Side</option>
          <option value="top">Top</option>
        </select>
      </label>

      <div className="flex items-center gap-2">
        <div className="rounded-full bg-slate-800/40 p-1 flex">
          <button onClick={()=>props.setStage('plan')} className={`px-3 py-1 rounded-full ${props.stage==='plan' ? 'bg-slate-700 text-white' : 'text-slate-300'}`}>Plan</button>
          <button onClick={()=>props.setStage('simulate')} className={`px-3 py-1 rounded-full ${props.stage==='simulate' ? 'bg-slate-700 text-white' : 'text-slate-300'}`}>Simulate</button>
          <button onClick={()=>props.setStage('analyze')} className={`px-3 py-1 rounded-full ${props.stage==='analyze' ? 'bg-slate-700 text-white' : 'text-slate-300'}`}>Analyze</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-700">Template</label>
        <select value={props.selectedTemplate} onChange={e=>props.setSelectedTemplate(e.target.value)} className="input">
          {props.templates.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className="btn bg-slate-600" onClick={()=>props.loadTemplate(props.selectedTemplate)}>Load</button>
        <button className="btn" onClick={props.newTemplate}>New</button>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn bg-slate-600" onClick={()=>props.setShowSeasons(s=>!s)}>{props.showSeasons ? 'Seasons ▴' : 'Seasons ▾'}</button>
        {props.showSeasons && (
          <div className="p-2 bg-white/60 rounded-md flex items-center gap-2 border border-gray-200">
            <label className="text-sm text-slate-700">Rain (mm/hr)</label>
            <input type="number" value={props.seasons.rain_mm_per_hr} onChange={e=>props.setSeasons({...props.seasons, rain_mm_per_hr: Number(e.target.value) || 0})} className="input w-20" />
            <button className="btn" onClick={props.applySeasons}>Apply</button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={()=>props.setStage(s=> s === 'plan' ? 'simulate' : 'plan')} className="btn bg-slate-600">{props.stage === 'plan' ? 'Switch to Simulate' : 'Switch to Plan'}</button>
        <button onClick={()=>props.setIsRunning(r=>!r)} className="btn">{props.isRunning ? 'Pause' : 'Play'}</button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={props.exportScene} className="btn">Export</button>
        <input ref={props.fileInputRef} type="file" accept="application/json" style={{display:'none'}} onChange={async (e)=>{ const f = e.target.files?.[0]; if(f) await props.importScene(f); (e.target as HTMLInputElement).value = '' }} />
        <button onClick={()=>props.fileInputRef.current?.click()} className="btn bg-slate-600">Import</button>
      </div>
    </div>
  )
}

export default ConfigBar;
