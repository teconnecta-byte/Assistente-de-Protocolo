import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Risk } from '../types';
import RiskBadge from './RiskBadge';
import { TrashIcon, ClipboardIcon, CheckIcon, SpinnerIcon, WhatsAppIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon, ActionIcon, UsersIcon, CommunicationIcon, AlertTriangleIcon } from './icons';

interface ProtocolCardProps {
  risk: Risk;
  deleteProtocol: (id: string) => void;
  copyProtocol: (risk: Risk) => void;
  shareOnWhatsApp: (risk: Risk) => void;
  isNewest: boolean;
}

// Renders simple markdown for bold text, ensuring basic HTML escaping.
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const ProtocolSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-500 border-b border-gray-200 pb-1 mb-2">{title}</h4>
    <div className="text-gray-800 text-sm space-y-1">{children}</div>
  </div>
);

const SummaryItem: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode; bgColorClass?: string; iconColorClass?: string }> = ({ icon, label, children, bgColorClass = 'bg-white', iconColorClass = 'text-blue-600' }) => (
    <div className={`flex items-start p-3 rounded-lg border border-gray-200 ${bgColorClass}`}>
        <div className={`flex-shrink-0 pt-0.5 ${iconColorClass}`}>{icon}</div>
        <div className="ml-3 w-full">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</h5>
            <div className="mt-1 text-sm text-gray-800">{children}</div>
        </div>
    </div>
);

const RiskSummary: React.FC<{ risk: Risk }> = ({ risk }) => {
  // Truncate the description for a quick view
  const summaryDescription = risk.technicalDescription.length > 150
    ? `${risk.technicalDescription.substring(0, 150)}...`
    : risk.technicalDescription;

  return (
    <div className="bg-gray-50 px-4 py-4 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Plano de Ação Rápido</h4>
        <div className="space-y-3">
            <SummaryItem 
              icon={<AlertTriangleIcon />} 
              label="O que Aconteceu?"
              bgColorClass="bg-amber-50"
              iconColorClass="text-amber-600"
            >
                <p><SimpleMarkdown text={summaryDescription} /></p>
            </SummaryItem>
            
            <div className="pt-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 pl-1">O que Fazer Imediatamente:</h5>
                <div className="space-y-3">
                    <SummaryItem icon={<ActionIcon />} label="Ação Crítica">
                        {risk.immediateActions[0] ? <SimpleMarkdown text={risk.immediateActions[0]} /> : 'Nenhuma ação imediata especificada.'}
                    </SummaryItem>
                    <SummaryItem icon={<UsersIcon />} label="Equipe Responsável">
                        <p>{risk.responsibleSector}</p>
                    </SummaryItem>
                    <SummaryItem icon={<CommunicationIcon />} label="Comunicação Urgente">
                         <p>{risk.communicationPlan}</p>
                    </SummaryItem>
                </div>
            </div>
        </div>
    </div>
  );
};

const ProtocolCard: React.FC<ProtocolCardProps> = ({ risk, deleteProtocol, copyProtocol, shareOnWhatsApp, isNewest }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isNewest);

  const createdAtFormatted = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(risk.createdAt);

  const handleCopyClick = () => {
    copyProtocol(risk);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - margin * 2;
        const lineHeight = 7;
        let y = 20;

        const cleanText = (text: string) => text.replace(/\*\*/g, '');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Protocolo de Risco Hospitalar', pageWidth / 2, y, { align: 'center' });
        y += lineHeight * 2;

        const addSection = (title: string, content: string | string[], isList: 'decimal' | 'bullet' | 'none' = 'none') => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title, margin, y);
            y += lineHeight;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            const processContent = (text: string, prefix = '') => {
                const fullText = prefix + cleanText(text);
                const splitText = doc.splitTextToSize(fullText, usableWidth);
                if (y + (splitText.length * (lineHeight - 2)) > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(splitText, margin + (isList !== 'none' ? 4 : 0), y);
                y += splitText.length * (lineHeight - 2);
            };

            if (Array.isArray(content)) {
                content.forEach((item, index) => {
                    const prefix = isList === 'decimal' ? `${index + 1}. ` : (isList === 'bullet' ? '• ' : '');
                    processContent(item, prefix);
                    y += 2; // space between list items
                });
            } else {
                processContent(content);
            }
            y += lineHeight; // Space after section
        };

        addSection('Data de Geração:', createdAtFormatted);
        addSection('Nível de Risco:', risk.level);
        addSection('Categoria:', risk.category);
        addSection('Relato Informal Original:', `"${risk.informalReport}"`);
        addSection('Descrição Técnica da Ocorrência:', risk.technicalDescription);
        addSection('Ações Imediatas:', risk.immediateActions, 'decimal');
        addSection('Setor Responsável:', risk.responsibleSector);
        addSection('Plano de Comunicação:', risk.communicationPlan);
        addSection('Medidas Preventivas Recomendadas:', risk.preventiveMeasures, 'bullet');

        doc.save(`Protocolo_${risk.category.replace(/[^a-zA-Z0-9]/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`);

      } catch (error) {
        console.error("Falha ao exportar PDF:", error);
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };
  
  const baseButtonClass = "flex items-center justify-center w-9 h-9 rounded-lg text-white shadow-md transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const handleHeaderClick = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      id={`protocol-card-${risk.id}`} 
      className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in"
    >
      <header 
        className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-start gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleHeaderClick}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`protocol-content-${risk.id}`}
      >
        <div className="flex-grow">
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge level={risk.level} />
            <span className="text-xs text-gray-500">{createdAtFormatted}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-gray-900">{risk.category}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => shareOnWhatsApp(risk)}
              className={`${baseButtonClass} bg-green-500 hover:bg-green-600 focus:ring-green-500`}
              aria-label="Notificar no WhatsApp"
              title="Notificar no WhatsApp"
            >
              <WhatsAppIcon />
            </button>
            <button
                onClick={handleExportPdf}
                className={`${baseButtonClass} bg-purple-500 hover:bg-purple-600 focus:ring-purple-500`}
                aria-label="Exportar como PDF"
                title="Exportar como PDF"
                disabled={isExporting}
              >
                {isExporting ? <SpinnerIcon /> : <DownloadIcon />}
            </button>
            <button 
              onClick={handleCopyClick} 
              className={`${baseButtonClass} ${isCopied ? 'bg-teal-500 scale-110' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'}`}
              aria-label="Copiar Protocolo"
              title="Copiar Protocolo"
              disabled={isCopied}
            >
              {isCopied ? <CheckIcon /> : <ClipboardIcon />}
            </button>
            <button onClick={() => deleteProtocol(risk.id)} 
              className={`${baseButtonClass} bg-red-600 hover:bg-red-700 focus:ring-red-600`}
              aria-label="Excluir Protocolo"
              title="Excluir Protocolo"
            >
                <TrashIcon />
            </button>
            <span className="text-gray-400 pl-2" aria-hidden="true">
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </span>
        </div>
      </header>
      
      {isExpanded && (
        <div id={`protocol-content-${risk.id}`}>
          <RiskSummary risk={risk} />
          <div className="p-4 space-y-5">
              <ProtocolSection title="Relato Informal Original">
                <p className="italic text-gray-500">"{risk.informalReport}"</p>
              </ProtocolSection>

              <ProtocolSection title="Descrição Técnica da Ocorrência">
                <p><SimpleMarkdown text={risk.technicalDescription} /></p>
              </ProtocolSection>
              
              <ProtocolSection title="Ações Imediatas (Completo)">
                <ol className="list-decimal list-inside space-y-1.5">
                  {risk.immediateActions.map((action, index) => <li key={index}><SimpleMarkdown text={action} /></li>)}
                </ol>
              </ProtocolSection>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <ProtocolSection title="Setor Responsável">
                    <p>{risk.responsibleSector}</p>
                  </ProtocolSection>
                  
                  <ProtocolSection title="Plano de Comunicação">
                    <p>{risk.communicationPlan}</p>
                  </ProtocolSection>
              </div>

              <ProtocolSection title="Medidas Preventivas Recomendadas">
                <ul className="list-disc list-inside space-y-1.5">
                  {risk.preventiveMeasures.map((measure, index) => <li key={index}><SimpleMarkdown text={measure} /></li>)}
                </ul>
              </ProtocolSection>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolCard;