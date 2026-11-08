/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * CertificatesView: Emissão, impressão em PDF, revogação, reemissão de 2ª via e validador público de autenticidade
 */

import React, { useState } from 'react';
import {
  Award,
  Search,
  Printer,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  QrCode,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Certificado, Pessoa, Curso } from '../../types';

export const CertificatesView: React.FC = () => {
  const { currentUser, currentOrg, hasRole } = useAuth();
  const [certificates, setCertificates] = useState(() => dataService.getCertificates(currentOrg.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCert, setSelectedCert] = useState<(Certificado & { formando: Pessoa; curso: Curso }) | null>(null);
  const [validationInput, setValidationInput] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [revokeModalCert, setRevokeModalCert] = useState<Certificado | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  React.useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setCertificates(dataService.getCertificates(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const filteredCerts = certificates.filter(c => 
    c.codigoValidacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.formando.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.curso.nomeCurso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = validationInput.trim().toUpperCase();
    const found = certificates.find(c => c.codigoValidacao.toUpperCase() === clean);
    if (found) {
      setValidationResult({
        valid: found.estado === 'emitido',
        cert: found,
        message: found.estado === 'emitido' 
          ? 'Certificado autêntico e válido na base de dados FORTIS.' 
          : `Atenção: Este certificado encontra-se ${found.estado.toUpperCase()}. Motivo: ${found.motivoRevogacao || 'Anulado administrativamente'}.`,
      });
    } else {
      setValidationResult({
        valid: false,
        cert: null,
        message: 'Código de validação não encontrado ou inexistente.',
      });
    }
  };

  const handleRevokeConfirm = () => {
    if (!revokeModalCert || !revokeReason) return;
    dataService.revokeCertificate(revokeModalCert.id, revokeReason, currentUser.id);
    setRevokeModalCert(null);
    setRevokeReason('');
  };

  const handleReissue = (certId: string) => {
    const novo = dataService.reissueCertificate(certId, currentUser.id);
    if (novo) {
      alert(`Segunda via gerada com sucesso! Novo código: ${novo.codigoValidacao}`);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Certificados & Acreditação Pedagógica</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Emissão oficial, código único hash, geração de 2ª via e rastreabilidade contra fraude
          </p>
        </div>
      </div>

      {/* Validador Público de Autenticidade */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-amber-600 dark:text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Validador de Autenticidade de Certificados
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Insira o código alfanumérico único impresso no rodapé ou no QR Code do certificado para verificar a sua legitimidade:
        </p>

        <form onSubmit={handleValidateCode} className="flex gap-2 max-w-lg">
          <input
            type="text"
            required
            value={validationInput}
            onChange={e => setValidationInput(e.target.value)}
            placeholder="Ex: FORTIS-2026-ISO-9941A"
            className="flex-1 py-1.5 px-3 text-xs uppercase font-mono tracking-wider rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
          >
            Verificar Código
          </button>
        </form>

        {validationResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            validationResult.valid 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
          }`}>
            {validationResult.valid ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
            <div>
              <p className="font-bold">{validationResult.message}</p>
              {validationResult.cert && (
                <p className="text-[11px] mt-0.5">
                  Titular: {validationResult.cert.formando.nomeCompleto} · Ação: {validationResult.cert.curso.nomeCurso} · Carga: {validationResult.cert.cargaHoraria}h
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Certificados Emitidos */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Procurar por código, formando ou curso..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCerts.map(cert => (
          <div
            key={cert.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-amber-400 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {cert.codigoValidacao}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {cert.numeroVia === 1 ? 'Via Original' : `${cert.numeroVia}ª Via`}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                cert.estado === 'emitido' ? 'bg-emerald-100 text-emerald-800' :
                cert.estado === 'revogado' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {cert.estado}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{cert.formando.nomeCompleto}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{cert.curso.nomeCurso}</p>
              <p className="text-[10px] text-slate-400 mt-1">Carga Horária: {cert.cargaHoraria} horas · Data: {cert.dataEmissao}</p>
            </div>

            {cert.motivoRevogacao && (
              <p className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded border border-rose-100 dark:border-rose-900/40">
                Motivo: {cert.motivoRevogacao}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedCert(cert)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1"
              >
                <Printer size={13} />
                <span>Visualizar / PDF</span>
              </button>

              {hasRole(['superadmin_org', 'admin']) && (
                <div className="flex items-center gap-1">
                  {cert.estado === 'emitido' && (
                    <button
                      onClick={() => setRevokeModalCert(cert)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded text-xs"
                      title="Revogar Certificado"
                    >
                      Revogar
                    </button>
                  )}
                  {cert.estado === 'revogado' && (
                    <button
                      onClick={() => handleReissue(cert.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded text-xs"
                      title="Emitir 2ª Via"
                    >
                      Reemitir
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Visualização do Certificado Oficial Imprimível */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Modelo Oficial de Certificação</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-amber-600 flex items-center gap-1"
                >
                  <Printer size={13} />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button onClick={() => setSelectedCert(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
            </div>

            {/* Certificado Visual (Aparência Nobre) */}
            <div className="p-8 border-8 border-double border-amber-300 dark:border-amber-700/60 rounded-xl bg-gradient-to-b from-amber-50/20 via-white to-amber-50/30 dark:from-slate-900 dark:to-slate-850 text-center space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400">
                  {currentOrg.designacao}
                </span>
                <h2 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mt-1">
                  Certificado de Formação
                </h2>
                <p className="text-[11px] text-slate-400 tracking-wider uppercase mt-1">
                  Licença Operacional Nº {currentOrg.numeroLicenca} · NIF {currentOrg.nif}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500">Certifica-se que</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 underline decoration-amber-400 underline-offset-4">
                  {selectedCert.formando.nomeCompleto}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed pt-2">
                  concluiu com aproveitamento e assiduidade a ação de formação profissional de <strong>{selectedCert.curso.nomeCurso}</strong>, realizada no período de <strong>{selectedCert.curso.dataInicio} a {selectedCert.curso.dataFim}</strong>, perfazendo um total de <strong>{selectedCert.cargaHoraria} horas</strong> letivas.
                </p>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-8 text-xs border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="w-32 mx-auto border-b border-slate-400 dark:border-slate-600 pb-1 font-serif italic">
                    {currentOrg.diretor}
                  </div>
                  <span className="text-[10px] text-slate-400">Direção Executiva</span>
                </div>
                <div className="space-y-1">
                  <div className="w-32 mx-auto border-b border-slate-400 dark:border-slate-600 pb-1 font-serif italic">
                    Coordenação Pedagógica
                  </div>
                  <span className="text-[10px] text-slate-400">Formador Responsável</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Hash de Validação: {selectedCert.codigoValidacao}</span>
                <span>Data: {selectedCert.dataEmissao}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Revogação */}
      {revokeModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Revogar Certificado {revokeModalCert.codigoValidacao}</h3>
            <p className="text-xs text-slate-500">Indique o motivo formal para o registo no histórico de auditoria:</p>
            <textarea
              required
              rows={3}
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              placeholder="Ex: Erro no nome do formando / Cancelamento administrativo..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRevokeModalCert(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirmar Revogação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
