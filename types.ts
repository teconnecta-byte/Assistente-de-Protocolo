export enum RiskCategory {
  PHYSICAL = 'Físico/Patrimonial',
  BEHAVIORAL = 'Comportamental',
  OPERATIONAL = 'Operacional',
  VIOLENCE = 'Violência/Ameaça Pessoal',
  EMERGENCY = 'Emergência/Evasão',
}

export enum RiskLevel {
  LOW = 'Baixo',
  MEDIUM = 'Médio',
  HIGH = 'Alto',
}

export interface Risk {
  id: string;
  informalReport: string;
  technicalDescription: string;
  category: RiskCategory;
  level: RiskLevel;
  immediateActions: string[];
  responsibleSector: string;
  communicationPlan: string;
  preventiveMeasures: string[];
  createdAt: Date;
}