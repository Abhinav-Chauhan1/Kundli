'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface ChartPlanet {
  name:  string;
  rashi: number; // 0-11
  house: number; // 1-12
  isRetrograde?: boolean;
}

interface NorthIndianChartProps {
  planets:    ChartPlanet[];
  ascendant:  number; // sidereal longitude
  language?:  'en' | 'hi';
}

// North Indian: diamond layout, signs fixed clockwise from top-middle
// House 1 = top-middle diamond, going clockwise
const HOUSE_COORDS = [
  // [centerX, centerY] for each house 1-12 in a 4×4 grid (0-indexed here)
  // Grid: 12 cells in diamond pattern (each cell = 150/4 units)
  { x: 150, y: 37.5  },  // House  1 — top-middle
  { x: 225, y: 37.5  },  // House  2 — top-right
  { x: 262, y: 112.5 },  // House  3 — right-top
  { x: 262, y: 187.5 },  // House  4 — right-bottom
  { x: 225, y: 262   },  // House  5 — bottom-right
  { x: 150, y: 262   },  // House  6 — bottom-middle
  { x: 75,  y: 262   },  // House  7 — bottom-left
  { x: 37.5,y: 187.5 },  // House  8 — left-bottom
  { x: 37.5,y: 112.5 },  // House  9 — left-top
  { x: 75,  y: 37.5  },  // House 10 — top-left
  { x: 112, y: 37.5  },  // House 11 — top-left-mid
  { x: 112, y: 262   },  // House 12 — bottom-left-mid
];

// Rashi abbreviations
const RASHI_SHORT_EN = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
const RASHI_SHORT_HI = ['मे','वृ','मि','क','सि','क','तु','वृ','ध','म','कु','मी'];

// Planet abbreviations
const PLANET_SHORT_EN: Record<string, string> = {
  Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me',
  Jupiter:'Ju', Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke',
};
const PLANET_SHORT_HI: Record<string, string> = {
  Sun:'सू', Moon:'चं', Mars:'मं', Mercury:'बु',
  Jupiter:'गु', Venus:'शु', Saturn:'श', Rahu:'रा', Ketu:'के',
};

export function NorthIndianChart({ planets, ascendant, language = 'en' }: NorthIndianChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const SIZE = 300;
    const GRID = SIZE / 4;

    // Draw the north indian diamond grid
    const lines = [
      // outer square
      [[0,0],[SIZE,0],[SIZE,SIZE],[0,SIZE],[0,0]],
      // inner diagonals
      [[0,0],[GRID*2,GRID*2]],
      [[SIZE,0],[GRID*2,GRID*2]],
      [[0,SIZE],[GRID*2,GRID*2]],
      [[SIZE,SIZE],[GRID*2,GRID*2]],
      // top inner square
      [[GRID,0],[GRID*2,GRID],[GRID*3,0]],
      [[GRID,0],[0,GRID]],
      [[GRID*3,0],[SIZE,GRID]],
      // bottom inner square
      [[GRID,SIZE],[GRID*2,GRID*3],[GRID*3,SIZE]],
      [[GRID,SIZE],[0,GRID*3]],
      [[GRID*3,SIZE],[SIZE,GRID*3]],
      // middle vertical/horizontal
      [[0,GRID],[0,GRID*3]],
      [[SIZE,GRID],[SIZE,GRID*3]],
      [[GRID,0],[GRID,SIZE]],
      [[GRID*3,0],[GRID*3,SIZE]],
    ];

    svg.append('rect').attr('width', SIZE).attr('height', SIZE).attr('fill', '#FAF6EE');

    const g = svg.append('g');

    // Draw grid lines
    for (const path of lines) {
      if (path.length === 2) {
        g.append('line')
          .attr('x1', path[0][0]).attr('y1', path[0][1])
          .attr('x2', path[1][0]).attr('y2', path[1][1])
          .attr('stroke', '#0F1F3D').attr('stroke-width', 0.8).attr('opacity', 0.4);
      } else {
        const lineGen = d3.line<[number, number]>().x(d => d[0]).y(d => d[1]);
        g.append('path')
          .attr('d', lineGen(path as [number, number][]))
          .attr('stroke', '#0F1F3D').attr('stroke-width', 0.8).attr('fill', 'none').attr('opacity', 0.4);
      }
    }

    // Determine which rashi is in which house position
    const lagnaRashi = Math.floor(((ascendant % 360) + 360) % 360 / 30);

    // House positions array: position[i] = rashi number at house i+1
    const houseRashis = Array.from({ length: 12 }, (_, i) => (lagnaRashi + i) % 12);

    // House centers for North Indian (fixed positions in the 300×300 grid)
    const houseCenters: [number, number][] = [
      [GRID*2, GRID*0.6],           // H1  top-center
      [GRID*3 + GRID*0.3, GRID*0.5],// H2  top-right corner
      [GRID*3 + GRID*0.5, GRID*1.5],// H3  right-top
      [GRID*3 + GRID*0.5, GRID*2.5],// H4  right-bottom
      [GRID*3 + GRID*0.3, GRID*3.5],// H5  bottom-right corner
      [GRID*2, GRID*3.4],           // H6  bottom-center
      [GRID*0.7, GRID*3.5],         // H7  bottom-left corner
      [GRID*0.5 - GRID*0.05, GRID*2.5],// H8 left-bottom
      [GRID*0.5 - GRID*0.05, GRID*1.5],// H9 left-top
      [GRID*0.7, GRID*0.5],         // H10 top-left corner
      [GRID*1.3, GRID*0.6],         // H11 top-left inner
      [GRID*2.7, GRID*0.6],         // H12 top-right inner
    ];

    const rashiLabels = language === 'hi' ? RASHI_SHORT_HI : RASHI_SHORT_EN;

    // Render rashi numbers in houses
    houseRashis.forEach((rashi, idx) => {
      const [cx, cy] = houseCenters[idx] ?? [0, 0];
      g.append('text')
        .attr('x', cx).attr('y', cy)
        .attr('text-anchor', 'middle')
        .attr('font-size', 8)
        .attr('fill', '#9A7C30')
        .attr('opacity', 0.7)
        .text(`${rashi + 1} ${rashiLabels[rashi]}`);
    });

    // Group planets by house
    const byHouse: Record<number, ChartPlanet[]> = {};
    for (const p of planets) {
      if (!byHouse[p.house]) byHouse[p.house] = [];
      byHouse[p.house].push(p);
    }

    const pShort = language === 'hi' ? PLANET_SHORT_HI : PLANET_SHORT_EN;

    // Render planets
    Object.entries(byHouse).forEach(([houseStr, hPlanets]) => {
      const house = parseInt(houseStr, 10);
      const [cx, cy] = houseCenters[house - 1] ?? [0, 0];

      hPlanets.forEach((planet, idx) => {
        const yOffset = 14 + idx * 11;
        const abbr = pShort[planet.name] ?? planet.name.slice(0, 2);
        const label = planet.isRetrograde ? `${abbr}ᴿ` : abbr;

        g.append('text')
          .attr('x', cx)
          .attr('y', cy + yOffset)
          .attr('text-anchor', 'middle')
          .attr('font-size', 9)
          .attr('font-weight', '600')
          .attr('fill', planet.name === 'Rahu' || planet.name === 'Ketu' ? '#9A7C30' : '#0F1F3D')
          .text(label);
      });
    });

    // Lagna marker
    const [lx, ly] = houseCenters[0];
    g.append('text')
      .attr('x', lx + 10).attr('y', ly + 4)
      .attr('font-size', 7).attr('fill', '#E8722A').attr('font-weight', 'bold')
      .text('Lg');

  }, [planets, ascendant, language]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      className="w-full h-auto max-w-[300px] mx-auto"
      aria-label="North Indian birth chart"
      role="img"
    />
  );
}
