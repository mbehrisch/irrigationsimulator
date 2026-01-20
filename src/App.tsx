import React, { useState, useEffect, useRef } from 'react';
import Canvas2D from './components/Canvas2D';
import PixiStage from './components/PixiStage';
import EditorPanel from './components/EditorPanel';
import ConfigBar, { ConfigBarProps } from './components/ConfigBar';
import { createSimulator, DEFAULTS } from './sim/simulator';
import { Simulator, Template, Seasons } from './types';

export default function App() {
  const [sim] = useState<Simulator>(() => createSimulator(DEFAULTS));
  const [selected, setSelected] = useState<string | null>(null);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [perspective, setPerspective] = useState<'side' | 'top'>('side');
  const [stage, setStage] = useState<'plan' | 'simulate' | 'analyze'>('simulate');
  const mode: 'plan' | 'simulate' = stage === 'plan' ? 'plan' : 'simulate';
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [templates] = useState<Template[]>([
    { id: 'default', name: 'Default' },
    { id: 'example', name: 'Example' },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [showSeasons, setShowSeasons] = useState<boolean>(false);
  const [seasons, setSeasons] = useState<Seasons>({ rain_mm_per_hr: 2 });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handlers
  const loadTemplate = async (tplId: string) => {
      if (tplId === 'example') {
        try {
          const res = await fetch('/scenarios/example.json');
          const obj = await res.json();
          if (obj.config) {
            sim.config = obj.config;
            sim.barrels = sim.config.barrels.map((b: any, i: number) => ({
              level_m: obj.runtime?.barrels?.[i]?.level_m || 0,
              pos: b.pos || { x_m: 0, y_m: 0 },
            }));
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        sim.config = JSON.parse(JSON.stringify(DEFAULTS));
        sim.barrels = sim.config.barrels.map((b: any, i: number) => ({
          level_m: 0,
          pos: b.pos || { x_m: 0, y_m: 0 },
        }));
      }
    };

    const newTemplate = () => {
      const tpl = JSON.parse(JSON.stringify(DEFAULTS));
      tpl.meta = tpl.meta || {};
      tpl.meta.created = new Date().toISOString();
      sim.config = tpl;
      sim.barrels = tpl.barrels.map((b: any) => ({
        level_m: 0,
        pos: b.pos || { x_m: 0, y_m: 0 },
      }));
    };

    const applySeasons = () => {
      sim.config.seasons = seasons;
    };

    const exportScene = () => {
      const scene = {
        meta: { generated: new Date().toISOString() },
        config: sim.config,
        runtime: {
          barrels: (sim.barrels || []).map((b: any) => ({
            level_m: b.level_m,
            pos: b.pos,
          })),
        },
      };
      const blob = new Blob([JSON.stringify(scene, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene.json';
      a.click();
      URL.revokeObjectURL(url);
    };

    const importScene = async (file?: File) => {
      if (!file) return;
      const txt = await file.text();
      try {
        const obj = JSON.parse(txt);
        if (obj.config && obj.config.barrels) {
          sim.config = obj.config;
          sim.barrels = sim.config.barrels.map((b: any, i: number) => ({
            level_m: obj.runtime?.barrels?.[i]?.level_m || 0,
            pos: b.pos || { x_m: 0, y_m: 0 },
          }));
        }
      } catch (err) {
        console.error('Failed to import scene', err);
      }
    };

    useEffect(() => {
      sim.setTimeScale(timeScale);
    }, [timeScale, sim]);

    useEffect(() => {
      if (stage === 'analyze') {
        setIsRunning(false);
        sim.running = false;
      } else if (stage === 'simulate') {
        setIsRunning(true);
        sim.running = isRunning;
      } else {
        sim.running = isRunning;
      }
    }, [isRunning, stage, sim]);

    return (
      <div className="app min-h-screen">
        <header className="flex items-center justify-between gap-6" style={{ background: '#fff', padding: 16, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Greenhouse Gravity Irrigation Simulator</h1>
              <span className="text-sm text-slate-600">Interactive gravity-fed irrigation simulator</span>
            </div>
            <div className={`text-sm font-medium px-3 py-1 rounded-full ml-4 ${stage === 'simulate' ? 'bg-emerald-600 text-white' : stage === 'plan' ? 'bg-yellow-600 text-white' : 'bg-sky-600 text-white'}`}>{stage.toUpperCase()}</div>
          </div>
          <ConfigBar
            {...{
              timeScale,
              setTimeScale,
              perspective,
              setPerspective,
              stage,
              setStage,
              isRunning,
              setIsRunning,
              templates,
              selectedTemplate,
              setSelectedTemplate,
              loadTemplate,
              newTemplate,
              showSeasons,
              setShowSeasons,
              seasons,
              setSeasons,
              applySeasons,
              exportScene,
              importScene,
              fileInputRef,
            } as import('./components/ConfigBar').ConfigBarProps}
          />
        </header>
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="canvas bg-gradient-to-b from-slate-800/80 to-slate-900/60 rounded-2xl p-4 card-shadow" style={{ minHeight: 560 }}>
              <PixiStage simulator={sim} onSelect={setSelected} perspective={perspective} mode={mode} />
            </div>
          </div>
          <div>
            <EditorPanel simulator={sim} selected={selected} onClose={() => setSelected(null)} mode={mode} />
          </div>
        </main>
      </div>
    );
  }

