import React, { useState, useCallback } from 'react';
import { Risk } from './types';
import IncidentInput from './components/RiskForm';
import ProtocolCard from './components/RiskTable';
import Dashboard from './components/Dashboard';
import { SpinnerIcon } from './components/icons';

function App() {
  const [protocols, setProtocols] = useState<Risk[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addProtocol = (newProtocolData: Omit<Risk, 'id' | 'createdAt'>) => {
    const newProtocol: Risk = {
      ...newProtocolData,
      id: new Date().toISOString(),
      createdAt: new Date(),
    };
    setProtocols(prevProtocols => [newProtocol, ...prevProtocols]);
  };

  const deleteProtocol = (id: string) => {
    setProtocols(prevProtocols => prevProtocols.filter(protocol => protocol.id !== id));
  };

  const handleCopyProtocol = (risk: Risk) => {
    const protocolText = `
*** PROTOCOLO DE RISCO ***

DATA: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(risk.createdAt)}
NÍVEL: ${risk.level}
CATEGORIA: ${risk.category}

RELATO ORIGINAL:
"${risk.informalReport}"

DESCRIÇÃO TÉCNICA:
${risk.technicalDescription}

AÇÕES IMEDIATAS:
${risk.immediateActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

SETOR RESPONSÁVEL:
${risk.responsibleSector}

PLANO DE COMUNICAÇÃO:
${risk.communicationPlan}

MEDIDAS PREVENTIVAS:
${risk.preventiveMeasures.map(measure => `- ${measure}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(protocolText).catch(err => {
      console.error('Falha ao copiar protocolo: ', err);
    });
  };

  const handleShareToWhatsApp = (risk: Risk) => {
    const whatsAppNumber = "5547988802260"; // Número alvo sem '+' ou caracteres especiais
    const message = `
*ALERTA DE SEGURANÇA*

*Data:* ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(risk.createdAt)}
*Nível:* ${risk.level}
*Categoria:* ${risk.category}

*Ocorrência:*
${risk.technicalDescription}

*Ações Imediatas:*
${risk.immediateActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              Assistente de Protocolo de Risco
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Descreva uma ocorrência e a IA gerará um protocolo de ação técnica imediata.
            </p>
        </header>

        <main className="space-y-8">
          <div>
            <IncidentInput 
              onProtocolGenerated={addProtocol} 
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
          
          <div className="space-y-6">
            {isGenerating && protocols.length === 0 && (
                <div className="flex justify-center items-center p-10 text-gray-500">
                    <SpinnerIcon />
                    <span className="ml-3">Gerando primeiro protocolo...</span>
                </div>
            )}
            
            {protocols.length > 0 && (
              <>
                <Dashboard protocols={protocols} />
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-4">
                  Histórico de Protocolos
                </h2>
              </>
            )}

            {protocols.map((protocol, index) => (
              <ProtocolCard 
                key={protocol.id} 
                risk={protocol} 
                deleteProtocol={deleteProtocol} 
                copyProtocol={handleCopyProtocol}
                shareOnWhatsApp={handleShareToWhatsApp}
                isNewest={index === 0}
              />
            ))}
          </div>

        </main>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>Desenvolvido pelo CIIS (Centro Integrado de Informações em Saúde)</p>
          <p>Otimizando a segurança institucional com inteligência artificial.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;