export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'pink'
  | 'purple'
  | 'gray';

export type InkColor = 'auto' | 'black';

export const INK_COLORS: InkColor[] = ['auto', 'black'];

export interface Note {
  id: string;
  userId: string;
  title?: string;
  body: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: NoteColor;
  inkColor?: InkColor;
  zIndex: number;
  createdAt: number;
  updatedAt: number;
}

export const NOTE_COLORS: NoteColor[] = [
  'yellow',
  'blue',
  'green',
  'pink',
  'purple',
  'gray',
];

interface ColorSpec {
  light: string;
  dark: string;
  ink: string;
  inkDark: string;
}

export const COLOR_SPEC: Record<NoteColor, ColorSpec> = {
  yellow: { light: '#FFE9A3', dark: '#C9A646', ink: '#3a2a05', inkDark: '#f6e9c5' },
  blue:   { light: '#BFE3F7', dark: '#5C9DC8', ink: '#0c2a3c', inkDark: '#e3f1fa' },
  green:  { light: '#C9E8C2', dark: '#6FA068', ink: '#143018', inkDark: '#e7f3e4' },
  pink:   { light: '#FFC9D8', dark: '#C97D93', ink: '#3a0b1d', inkDark: '#fbe2ea' },
  purple: { light: '#DCCBFA', dark: '#9377C9', ink: '#1f0e3d', inkDark: '#ece2fb' },
  gray:   { light: '#E4E3DE', dark: '#7C7B76', ink: '#1e1d1a', inkDark: '#ebeae6' },
};

export const DEFAULT_WIDTH = 220;
export const DEFAULT_HEIGHT = 220;
export const MIN_WIDTH = 140;
export const MIN_HEIGHT = 120;
