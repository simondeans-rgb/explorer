export type NoteColor =
  | 'yellow'
  | 'pink'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange';

export interface Note {
  id: string;
  text: string;
  color: NoteColor;
  createdAt: number;
  updatedAt: number;
}

export const NOTE_COLORS: NoteColor[] = [
  'yellow',
  'pink',
  'blue',
  'green',
  'purple',
  'orange',
];

export const COLOR_CLASSES: Record<NoteColor, string> = {
  yellow: 'bg-[#FFE680]',
  pink: 'bg-[#FFC2D1]',
  blue: 'bg-[#BEE3F8]',
  green: 'bg-[#CDEAC0]',
  purple: 'bg-[#E0CCFF]',
  orange: 'bg-[#FFD6A8]',
};

export const COLOR_SWATCH: Record<NoteColor, string> = {
  yellow: '#FFE680',
  pink: '#FFC2D1',
  blue: '#BEE3F8',
  green: '#CDEAC0',
  purple: '#E0CCFF',
  orange: '#FFD6A8',
};
