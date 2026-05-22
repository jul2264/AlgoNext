// AlgoNext — Visualizer Types

export type AlgorithmCategory = 'sorting' | 'trees' | 'graphs' | 'dp';

export interface VisualizerStep {
  id: number;
  description: string;
  data: unknown;
  highlights: number[];
  comparisons?: [number, number];
  swaps?: [number, number];
}

export interface SortingState {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  currentStep: number;
  totalSteps: number;
}

export interface TreeNode {
  id: string;
  value: number;
  left?: TreeNode;
  right?: TreeNode;
  x?: number;
  y?: number;
  highlighted?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  visited?: boolean;
  distance?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
  highlighted?: boolean;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

export interface DPCell {
  row: number;
  col: number;
  value: number | string;
  highlighted?: boolean;
  isOptimal?: boolean;
}

export interface DPState {
  table: DPCell[][];
  currentCell?: [number, number];
  description: string;
}

export interface VisualizerConfig {
  speed: number; // ms per step
  autoPlay: boolean;
  showCode: boolean;
  category: AlgorithmCategory;
  algorithm: string;
}
