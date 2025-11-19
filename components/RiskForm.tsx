import React, { useState, useCallback } from 'react';
import { generateRiskProtocol } from '../services/geminiService';
import { SparklesIcon, SpinnerIcon } from './icons';
import { Risk } from '../types';

interface IncidentInputProps {
  onProtocolGenerated: (protocol: Omit<Risk, 'id'>) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

const IncidentInput: React.FC<IncidentInputProps> = ({ onProtocolGenerated, isGenerating, setIsGenerating }) => {
  const [report, setReport] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim()) {
      setError('Por favor, descreva a ocorrência.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const protocolData = await generateRiskProtocol(report);
      onProtocolGenerated({ ...protocolData, informalReport: report });
      setReport('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsGenerating(false);
    }
  }, [report, onProtocolGenerated, setIsGenerating]);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="report" className="block text-sm font-medium text-gray-700 mb-1.5">
            Relato da Ocorrência
          </label>
          <textarea
            id="report"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            rows={3}
            className="block w-full bg-gray-50 border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:text-gray-500"
            placeholder="Descreva o incidente de forma breve e informal. Ex: um paciente agressivo na recepção, cheiro de fumaça perto do almoxarifado..."
          />
        </div>
        
        {error && <div className="bg-red-100 border border-red-200 text-red-700 text-sm rounded-lg p-3" role="alert">{error}</div>}

        <div>
          <button
            type="submit"
            // FIX: Per API guidelines, assume API_KEY is always available and do not check for it.
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <SpinnerIcon />
                <span className="ml-2">Analisando Risco...</span>
              </>
            ) : (
              <>
                <SparklesIcon />
                <span className="ml-2">Gerar Protocolo com IA</span>
              </>
            )}
          </button>
          {/* FIX: Per API guidelines, do not show messages about missing API_KEY. */}
        </div>
      </form>
    </div>
  );
};

export default IncidentInput;