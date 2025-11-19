import React from 'react';
import { Risk, RiskLevel } from '../types';
import { RISK_LEVELS, RISK_LEVEL_STYLES } from '../constants';

interface PieChartProps {
  data: { label: RiskLevel; value: number; color: string }[];
  total: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, total }) => {
  if (total === 0) return null;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
      <circle
        className="text-gray-200"
        strokeWidth="20"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="60"
        cy="60"
      />
      {data.map(({ value, color }, index) => {
        const percentage = (value / total);
        const strokeDasharray = `${percentage * circumference} ${circumference}`;
        const offset = accumulatedOffset;
        accumulatedOffset += percentage * circumference;
        return (
          <circle
            key={index}
            strokeWidth="20"
            stroke={color}
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            style={{
              strokeDasharray,
              strokeDashoffset: -offset,
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        );
      })}
    </svg>
  );
};


interface DashboardProps {
  protocols: Risk[];
}

const Dashboard: React.FC<DashboardProps> = ({ protocols }) => {
  const counts = RISK_LEVELS.reduce((acc, level) => {
    acc[level] = protocols.filter(p => p.level === level).length;
    return acc;
  }, {} as Record<RiskLevel, number>);

  const total = protocols.length;

  const chartData = RISK_LEVELS.map(level => ({
    label: level,
    value: counts[level],
    color: RISK_LEVEL_STYLES[level].color,
  })).filter(item => item.value > 0);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Painel de Controle de Riscos</h2>
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6">
        <div className="relative">
          <PieChart data={chartData} total={total} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{total}</span>
              <span className="block text-xs text-gray-500">Total</span>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-auto sm:flex-grow space-y-3">
          {RISK_LEVELS.map(level => {
            const count = counts[level];
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={level} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: RISK_LEVEL_STYLES[level].color }}></span>
                  <span className="text-gray-700 font-medium">{level}</span>
                </div>
                <div className="text-right">
                   <span className="font-semibold text-gray-800">{count}</span>
                   <span className="text-gray-500 ml-2">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;