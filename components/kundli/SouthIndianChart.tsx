'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ChartPlanet } from './NorthIndianChart';

interface SouthIndianChartProps {
  planets:   ChartPlanet[];
  ascendant: number;
  language?: 'en' | 'hi';
}

// South Indian: 4×4 grid. Signs are fixed.
// Top-left = Pisces (11), going right then down.
// Houses are relative to ascendant.
const SIGN_GRID: number[] = [11, 0, 1, 2, 10, -1, -1, 3, 9, -1, -1, 4, 8, 7, 6, 5];
// -1 = center cells (not used)

const RASHI_NAMES_EN = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
const RASHI_NAMES_HI = ['मे','वृ','मि','क','सि','क','तु','वृ','ध','म','कु','मी'];

const PLANET_SHORT_EN: Record<string, string> = {
  Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me',
  Jupiter:'Ju', Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke',
};
const PLANET_SHORT_HI: Record<string, string> = {
  Sun:'सू', Moon:'चं', Mars:'मं', Mercury:'बु',
  Jupiter:'गु', Venus:'शु', Saturn:'श', Rahu:'रा', Ketu:'के',
};

export function SouthIndianChart({ planets, ascendant, language = 'en' }: SouthIndianChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const SIZE = 300;
    const CELL = SIZE / 4;
    const lagnaRashi = Math.floor(((ascendant % 360) + 360) % 360 / 30);
    const rashiLabels = language === 'hi' ? RASHI_NAMES_HI : RASHI_NAMES_EN;
    const pShort = language === 'hi' ? PLANET_SHORT_HI : PLANET_SHORT_EN;

    svg.append('rect').attr('width', SIZE).attr('height', SIZE).attr('fill', '#FAF6EE');
    const g = svg.append('g');

    // Draw 4×4 grid
    for (let i = 0; i <= 4; i++) {
      g.append('line')
        .attr('x1', i * CELL).attr('y1', 0).attr('x2', i * CELL).attr('y2', SIZE)
        .attr('stroke', '#0F1F3D').attr('stroke-width', 0.8).attr('opacity', 0.4);
      g.append('line')
        .attr('x1', 0).attr('y1', i * CELL).attr('x2', SIZE).attr('y2', i * CELL)
        .attr('stroke', '#0F1F3D').attr('stroke-width', 0.8).attr('opacity', 0.4);
    }

    // Group planets by rashi
    const byRashi: Record<number, ChartPlanet[]> = {};
    for (const p of planets) {
      if (!byRashi[p.rashi]) byRashi[p.rashi] = [];
      byRashi[p.rashi].push(p);
    }

    // Render each cell
    SIGN_GRID.forEach((rashi, cellIdx) => {
      if (rashi === -1) return;
      const col = cellIdx % 4;
      const row = Math.floor(cellIdx / 4);
      const x = col * CELL;
      const y = row * CELL;
      const cx = x + CELL / 2;

      const isLagna = rashi === lagnaRashi;
      if (isLagna) {
        g.append('rect')
          .attr('x', x + 1).attr('y', y + 1)
          .attr('width', CELL - 2).attr('height', CELL - 2)
          .attr('fill', '#E8722A').attr('opacity', 0.08);
        g.append('line')
          .attr('x1', x + 4).attr('y1', y + 4)
          .attr('x2', x + CELL - 4).attr('y2', y + 4)
          .attr('stroke', '#E8722A').attr('stroke-width', 1.5);
      }

      // Rashi label
      g.append('text')
        .attr('x', cx).attr('y', y + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', 7.5).attr('fill', '#9A7C30').attr('opacity', 0.8)
        .text(rashiLabels[rashi]);

      // House number (relative to lagna)
      const house = ((rashi - lagnaRashi + 12) % 12) + 1;
      g.append('text')
        .attr('x', x + 4).attr('y', y + 12)
        .attr('font-size', 6).attr('fill', '#0F1F3D').attr('opacity', 0.4)
        .text(house);

      // Planets
      const cellPlanets = byRashi[rashi] ?? [];
      cellPlanets.forEach((planet, idx) => {
        const abbr = pShort[planet.name] ?? planet.name.slice(0, 2);
        const label = planet.isRetrograde ? `${abbr}ᴿ` : abbr;
        g.append('text')
          .attr('x', cx)
          .attr('y', y + 24 + idx * 11)
          .attr('text-anchor', 'middle')
          .attr('font-size', 9)
          .attr('font-weight', '600')
          .attr('fill', planet.name === 'Rahu' || planet.name === 'Ketu' ? '#9A7C30' : '#0F1F3D')
          .text(label);
      });
    });

  }, [planets, ascendant, language]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      className="w-full h-auto max-w-[300px] mx-auto"
      aria-label="South Indian birth chart"
      role="img"
    />
  );
}
