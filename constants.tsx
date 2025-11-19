import { RiskCategory, RiskLevel } from './types';

export const RISK_CATEGORIES: RiskCategory[] = Object.values(RiskCategory);
export const RISK_LEVELS: RiskLevel[] = Object.values(RiskLevel);

export const RISK_LEVEL_STYLES: { [key in RiskLevel]: { text: string; bg: string; border: string; color: string } } = {
  [RiskLevel.LOW]: {
    text: 'text-blue-800',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    color: '#3B82F6', // blue-500
  },
  [RiskLevel.MEDIUM]: {
    text: 'text-yellow-800',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    color: '#F59E0B', // amber-500
  },
  [RiskLevel.HIGH]: {
    text: 'text-red-800',
    bg: 'bg-red-100',
    border: 'border-red-200',
    color: '#EF4444', // red-500
  },
};