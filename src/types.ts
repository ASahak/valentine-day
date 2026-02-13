export type HintType = 'text' | 'image' | 'icon' | 'none';

export interface Question {
  id: number;
  text: string;
  options?: string[]; // Optional for the final text-entry question
  answer: string;
  hintType: HintType;
  hintValue?: string;
  type: 'select' | 'input';
}