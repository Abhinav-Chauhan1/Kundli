'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MahaDasha } from '@/lib/kundli/dasha';

interface DashaTimelineProps {
  dashas: MahaDasha[];
}

const DASHA_COLORS: Record<string, string> = {
  Ketu: '#9A7C30', Venus: '#E8722A', Sun: '#F0935A',
  Moon: '#C9A84C', Mars: '#BF5518', Rahu: '#1A3160',
  Jupiter: '#0F1F3D', Saturn: '#9A7C30', Mercury: '#E2C06A',
};

export function DashaTimeline({ dashas }: DashaTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || dashas.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = 680, H = 80;
    const MARGIN = { left: 50, right: 10, top: 20, bottom: 20 };
    const innerW = W - MARGIN.left - MARGIN.right;
    const innerH = H - MARGIN.top - MARGIN.bottom;

    const allDates = dashas.flatMap((d) => [new Date(d.startDate), new Date(d.endDate)]);
    const minDate = d3.min(allDates)!;
    const maxDate = d3.max(allDates)!;
    const today = new Date();

    const x = d3.scaleTime().domain([minDate, maxDate]).range([0, innerW]);

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Bars
    dashas.forEach((dasha) => {
      const x0 = x(new Date(dasha.startDate));
      const x1 = x(new Date(dasha.endDate));
      const w  = Math.max(x1 - x0 - 1, 0);
      const isCurrent = new Date(dasha.startDate) <= today && new Date(dasha.endDate) > today;

      g.append('rect')
        .attr('x', x0).attr('y', 0)
        .attr('width', w).attr('height', innerH)
        .attr('fill', DASHA_COLORS[dasha.lord] ?? '#C9A84C')
        .attr('opacity', isCurrent ? 1 : 0.55)
        .attr('rx', 3);

      if (w > 28) {
        g.append('text')
          .attr('x', x0 + w / 2).attr('y', innerH / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', Math.min(w / 4, 10))
          .attr('fill', '#FAF6EE')
          .attr('font-weight', '600')
          .text(dasha.lord.slice(0, 3));
      }
    });

    // Today line
    if (today >= minDate && today <= maxDate) {
      const tx = x(today);
      g.append('line')
        .attr('x1', tx).attr('y1', -5)
        .attr('x2', tx).attr('y2', innerH + 5)
        .attr('stroke', '#E8722A').attr('stroke-width', 2);
    }

    // X-axis
    const axis = d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%Y') as unknown as (d: Date | d3.NumberValue) => string);
    g.append('g').attr('transform', `translate(0,${innerH})`).call(axis)
      .selectAll('text').attr('font-size', 9).attr('fill', '#0F1F3D');

  }, [dashas]);

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <svg
        ref={svgRef}
        viewBox="0 0 680 80"
        className="w-full min-w-[340px] h-auto"
        aria-label="Vimshottari Dasha timeline"
        role="img"
      />
    </div>
  );
}
