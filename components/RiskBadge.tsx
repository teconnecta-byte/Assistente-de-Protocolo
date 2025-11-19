
import React from 'react';
import { RiskLevel } from '../types';
import { RISK_LEVEL_STYLES } from '../constants';

interface RiskBadgeProps {
  level: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const styles = RISK_LEVEL_STYLES[level];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text} border ${styles.border}`}>
      {level}
    </span>
  );
};

export default RiskBadge;
