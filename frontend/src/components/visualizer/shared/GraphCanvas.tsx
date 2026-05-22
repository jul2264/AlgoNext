import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface GraphNode {
  id: string;
  label: string;
  state: 'idle' | 'visiting' | 'visited' | 'path';
}

export interface GraphEdge {
  source: string;
  target: string;
  state: 'idle' | 'traversing' | 'path';
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
}

export function GraphCanvas({ nodes, edges, width = 800, height = 600 }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Map states to colors
    const getNodeColor = (state: GraphNode['state']) => {
      switch (state) {
        case 'visiting': return '#f59e0b'; // warning/yellow
        case 'visited': return '#22c55e';  // success/green
        case 'path': return '#ef4444';     // error/red
        case 'idle':
        default: return '#1e293b';         // bg-tertiary
      }
    };

    const getEdgeColor = (state: GraphEdge['state']) => {
      switch (state) {
        case 'traversing': return '#f59e0b';
        case 'path': return '#ef4444';
        case 'idle':
        default: return 'rgba(255,255,255,0.2)'; // border-default
      }
    };

    // Deep copy nodes and edges for d3 simulation mutation
    const simNodes = nodes.map(d => ({ ...d }));
    const simEdges = edges.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(simNodes as any)
      .force('link', d3.forceLink(simEdges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40));

    // Draw edges
    const link = svg.append('g')
      .selectAll('line')
      .data(simEdges)
      .join('line')
      .attr('stroke', (d: any) => getEdgeColor(d.state))
      .attr('stroke-width', (d: any) => d.state !== 'idle' ? 3 : 1.5)
      .attr('class', 'transition-all duration-300');

    // Draw nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(simNodes)
      .join('circle')
      .attr('r', 24)
      .attr('fill', (d: any) => getNodeColor(d.state))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-300 shadow-xl cursor-pointer');

    // Add labels
    const label = svg.append('g')
      .selectAll('text')
      .data(simNodes)
      .join('text')
      .text((d: any) => d.label)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, width, height]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="bg-bg-secondary rounded-lg"
    />
  );
}
