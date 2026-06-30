'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ChartPlanet } from './NorthIndianChart';

interface EastIndianChartProps {
  planets:   ChartPlanet[];
  ascendant: number;
  language?: 'en' | 'hi';
}

// East Indian (Bengali style): similar to North but uses Bengali numerals
const BENGALI_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯','১০','১১','১২'];

const PLANET_SHORT_EN: Record<string, string> = {
  Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me',
  Jupiter:'Ju', Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke',
};

function toBengaliNum(n: number): string {
  return BENGALI_DIGITS[n] ?? String(n);
}

export function EastIndianChart({ planets, ascendant, language = 'en' }: EastIndianChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const SIZE = 300;
    const GRID = SIZE / 4;

    svg.append('rect').attr('width', SIZE).attr('height', SIZE).attr('fill', '#FAF6EE');
    const g = svg.append('g');

    // Same diamond structure as North Indian but with Bengali numerals
    const outerPaths = [
      `M${GRID*2},0 L${SIZE},${GRID*2} L${GRID*2},${SIZE} L0,${GRID*2} Z`,
      `M${GRID*2},${GRID} L${GRID*3},${GRID*2} L${GRID*2},${GRID*3} L${GRID},${GRID*2} Z`,
    ];
    outerPaths.forEach((d) => {
      g.append('path').attr('d', d).attr('stroke', '#0F1F3D').attr('stroke-width', 0.8).attr('fill', 'none').attr('opacity', 0.4);
    });

    // Cross lines
    [[GRID*2,0,GRID*2,SIZE],[0,GRID*2,SIZE,GRID*2],
     [0,0,GRID*2,GRID*2],[SIZE,0,GRID*2,GRID*2],
     [0,SIZE,GRID*2,GRID*2],[SIZE,SIZE,GRID*2,GRID*2],
    ].forEach(([x1,y1,x2,y2]) => {
      g.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
        .attr('stroke','#0F1F3D').attr('stroke-width',0.8).attr('opacity',0.4);
    });

    const lagnaRashi = Math.floor(((ascendant % 360) + 360) % 360 / 30);

    const houseCenters: [number, number][] = [
      [GRID*2, GRID*0.5],
      [GRID*3.3, GRID*0.5],
      [GRID*3.7, GRID*1.5],
      [GRID*3.7, GRID*2.5],
      [GRID*3.3, GRID*3.5],
      [GRID*2, GRID*3.5],
      [GRID*0.7, GRID*3.5],
      [GRID*0.3, GRID*2.5],
      [GRID*0.3, GRID*1.5],
      [GRID*0.7, GRID*0.5],
      [GRID*1.3, GRID*0.5],
      [GRID*2.7, GRID*0.5],
    ];

    const byHouse: Record<number, ChartPlanet[]> = {};
    for (const p of planets) {
      if (!byHouse[p.house]) byHouse[p.house] = [];
      byHouse[p.house].push(p);
    }

    houseCenters.forEach(([cx, cy], idx) => {
      const house = idx + 1;
      const rashi = (lagnaRashi + idx) % 12;
      // Bengali numeral for rashi
      g.append('text').attr('x', cx).attr('y', cy)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('fill', '#9A7C30').attr('opacity', 0.8)
        .text(toBengaliNum(rashi + 1));

      if (house === 1) {
        g.append('text').attr('x', cx + 14).attr('y', cy)
          .attr('font-size', 6).attr('fill', '#E8722A').attr('font-weight', 'bold').text('Lg');
      }

      const hPlanets = byHouse[house] ?? [];
      hPlanets.forEach((planet, pIdx) => {
        const abbr = (language === 'hi' ? { Sun:'সূ',Moon:'চং',Mars:'মং',Mercury:'বু',Jupiter:'গু',Venus:'শু',Saturn:'শ',Rahu:'রা',Ketu:'কে' } : PLANET_SHORT_EN)[planet.name] ?? planet.name.slice(0,2);
        g.append('text').attr('x', cx).attr('y', cy + 12 + pIdx * 11)
          .attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', '600')
          .attr('fill', '#0F1F3D').text(planet.isRetrograde ? `${abbr}ᴿ` : abbr);
      });
    });

  }, [planets, ascendant, language]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      className="w-full h-auto max-w-[300px] mx-auto"
      aria-label="East Indian birth chart"
      role="img"
    />
  );
}
