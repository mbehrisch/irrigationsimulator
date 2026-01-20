// Centralized types for simulator and UI
export interface Barrel {
  height_m: number;
  volume_L: number;
  radius_m: number;
  floatEnabled?: boolean;
  floatSetpoint?: number;
  pos: { x_m: number; y_m: number };
}

export interface BarrelRuntime {
  level_m: number;
  pos: { x_m: number; y_m: number };
  frozen?: boolean;
}

export interface Config {
  greenhouseHeight_m: number;
  barrels: Barrel[];
  pipe_diameter_m: number;
  panels: Array<{ w_m: number; h_m: number; countNorth: number; countSouth: number }>;
  seasonal_rain_mmph: { [season: string]: number };
  seasons?: Seasons;
  meta?: Record<string, any>;
}

export interface Seasons {
  rain_mm_per_hr: number;
}

export interface Template {
  id: string;
  name: string;
}

export interface Simulator {
  config: Config;
  barrels: BarrelRuntime[];
  startTime: number;
  currentTime: number;
  timeScale: number;
  running: boolean;
  onUpdate?: (s: Simulator) => void;
  onConfigChanged?: () => void;
  setTimeScale: (v: number) => void;
}
