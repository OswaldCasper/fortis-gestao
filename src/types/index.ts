/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * Tipagens do Modelo de Dados Normalizado e Multi-Tenant
 */

export type PapelAcesso = 
  | 'superadmin_plataforma' 
  | 'superadmin_org' 
  | 'admin' 
  | 'gestor' 
  | 'formador' 
  | 'formando';

export type EstadoCurso = 'agendado' | 'em_andamento' | 'realizado' | 'cancelado';
export type PeriodoTurno = 'manha' | 'tarde' | 'noite' | 'sabado';
export type EstadoInscricao = 'pendente' | 'confirmada' | 'cancelada' | 'desistente';
export type EstadoPresenca = 'presente' | 'ausente' | 'atraso' | 'justificada';
export type TipoAvaliacao = 'conhecimentos_formando' | 'desempenho_formador' | 'satisfacao_formacao';
export type EscalaAvaliacao = 'escala_0_20' | 'escala_1_5' | 'sim_nao';
export type ResultadoAvaliacao = 'aprovado' | 'reprovado' | 'nao_aplicavel';
export type EstadoCertificado = 'emitido' | 'revogado' | 'reemitido';
export type TipoOcorrencia = 'nao_conformidade' | 'desvio_operacional' | 'reclamacao' | 'oportunidade_melhoria';
export type OrigemOcorrencia = 'formando' | 'formador' | 'auditoria' | 'coordenacao';
export type EstadoOcorrencia = 'aberta' | 'em_analise' | 'em_tratamento' | 'em_verificacao' | 'encerrada';
export type PrioridadeTarefa = 'alta' | 'media' | 'baixa';
export type EstadoTarefa = 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
export type TipoFinanceiro = 'receita' | 'custo_direto' | 'custo_indireto';
export type CategoriaFinanceiro = 
  | 'honorarios_formador' 
  | 'aluguer_sala' 
  | 'manuais_recursos' 
  | 'coffee_break' 
  | 'taxa_inscricao' 
  | 'despesa_administrativa_geral';

export interface TemaConfig {
  corPrimaria: string;
  corSecundaria: string;
  corTerciaria: string;
  modoPadrao: 'claro' | 'escuro' | 'auto';
  logoUrl?: string;
}

export interface Organizacao {
  id: string;
  designacao: string;
  descricaoInstitucional?: string;
  nif: string;
  numeroLicenca: string;
  diretor: string;
  localizacao: string;
  iban: string;
  expressConta: string;
  telefone: string;
  email: string;
  pacote: 'standard' | 'enterprise';
  dataAdesao: string;
  dataTermino: string;
  temaConfig: TemaConfig;
}

export interface Pessoa {
  id: string;
  authUid?: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  genero: 'masculino' | 'feminino' | 'outro';
  fotoUrl?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export const ROLE_HIERARCHY: Record<PapelAcesso, number> = {
  superadmin_plataforma: 100,
  superadmin_org: 50,
  admin: 40,
  gestor: 30,
  formador: 20,
  formando: 10,
};

export function deriveHighestRole(roles: PapelAcesso[]): PapelAcesso {
  if (!roles || roles.length === 0) return 'formando';
  return [...roles].sort((a, b) => (ROLE_HIERARCHY[b] ?? 0) - (ROLE_HIERARCHY[a] ?? 0))[0] || 'formando';
}

export interface MembroOrganizacao {
  id: string; // id do registo na BD
  empresaId: string; // organizacao_id
  pessoaId: string; // pessoa_id
  papelAcesso: PapelAcesso; // Mais alto derivado
  papeis: PapelAcesso[]; // Lista completa de papéis
  funcoesProfissionais: string[];
  departamentoOuEmpresaOrigem: string;
  cargo: string;
  estadoMembro: 'ativo' | 'inativo' | 'suspenso';
  restringirAcessoHorario: boolean;
  diasAcessoPermitidos?: number[];
  horaInicio?: string;
  horaFim?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface FormacaoCatalogo {
  id: string;
  empresaId: string;
  codigo: string;
  titulo: string;
  categoria: string;
  cargaHorariaPadrao: number;
  objetivos: string;
  conteudoProgramatico: string[];
  precoBase: number;
}

export interface Curso {
  id: string;
  empresaId: string;
  formacaoCatalogoId: string;
  nomeCurso: string;
  ano: number;
  mes: number;
  periodo: PeriodoTurno;
  instituicao: string;
  localSala: string;
  dataInicio: string;
  dataFim: string;
  coordenadorId: string;
  vagasMaximas: number;
  precoInscricao: number;
  orcamentoPrevisto: number; // Teto global alocado
  custoPrevisto: number;     // Estimativa de despesas
  estadoCurso: EstadoCurso;
  encerrado: boolean;        // Fecho formal administrativo independente
  dataEncerramento?: string;
  encerradoPor?: string;
  progressoPercent: number;
  conformidadePercent: number;
  observacoes?: string;
}

export interface CursoFormador {
  id: string;
  empresaId: string;
  cursoId: string;
  formadorId: string;
  papelFormacao: 'coordenador_pedagogico' | 'formador_principal' | 'formador_assistente';
  horasAtribuidas: number;
  honorarioAcordado: number;
}

export interface Sessao {
  id: string;
  empresaId: string;
  cursoId: string;
  numeroSessao: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  sumarioTopicos: string;
  formadorPrincipalId: string;
  formadoresAdicionaisIds?: string[];
  salaEspecifica: string;
  estadoSessao: 'agendada' | 'concluida' | 'cancelada' | 'adiada';
}

export interface Inscricao {
  id: string;
  empresaId: string;
  cursoId: string;
  formandoId: string;
  dataInscricao: string;
  estado: EstadoInscricao;
  valorPago: number;
}

export interface Presenca {
  id: string;
  empresaId: string;
  sessaoId: string;
  cursoId: string;
  formandoId: string;
  estado: EstadoPresenca;
  minutosAtraso: number;
  justificacao?: string;
  registadoPor: string;
  registadoEm: string;
}

export interface Avaliacao {
  id: string;
  empresaId: string;
  cursoId: string;
  tipoAvaliacao: TipoAvaliacao;
  modeloCriterio: string;
  escala: EscalaAvaliacao;
  avaliadorId: string;
  avaliadoId: string;
  notaNumerica: number;
  resultado: ResultadoAvaliacao;
  parecerQualitativo?: string;
  recomendaria?: boolean; // Para Taxa de Recomendação
  eAvaliacaoFinal: boolean; // Flag para desduplicação unívoca da taxa de aprovação
  dataAvaliacao: string;
}

export interface Certificado {
  id: string;
  empresaId: string;
  cursoId: string;
  formandoId: string;
  codigoValidacao: string;
  numeroVia: number; // 1 para original, 2+ para segundas vias
  cargaHoraria: number;
  dataEmissao: string;
  emitidoPor: string;
  estado: EstadoCertificado;
  motivoRevogacao?: string;
  codigoSubstituido?: string;
  qrCodePayload: string;
}

export interface Ocorrencia {
  id: string;
  empresaId: string;
  cursoId?: string; // Opcional se for geral da organização
  codigo: string;
  tipo: TipoOcorrencia;
  origem: OrigemOcorrencia;
  descricaoProblema: string;
  causaRaiz?: string;
  acaoCorretiva?: string;
  responsavelId: string;
  prazoResolucao: string;
  estado: EstadoOcorrencia;
  evidenciasResolucao?: string;
  avaliacaoEficacia?: string;
  dataRegisto: string;
  dataEncerramento?: string;
  encerradoPor?: string;
}

export interface TarefaChecklist {
  id: string;
  empresaId: string;
  cursoId: string;
  titulo: string;
  descricao: string;
  responsavelId: string;
  dataLimite: string; // Data concreta de vencimento
  prioridade: PrioridadeTarefa;
  obrigatoriaParaEncerramento: boolean;
  estado: EstadoTarefa;
  concluidaEm?: string;
  concluidaPor?: string;
}

export interface RegistroFinanceiro {
  id: string;
  empresaId: string;
  cursoId?: string; // Opcional para movimentos gerais
  tipo: TipoFinanceiro;
  categoria: CategoriaFinanceiro;
  descricao: string;
  valor: number;
  data: string;
  comprovativoUrl?: string;
}

export interface Documento {
  id: string;
  empresaId: string;
  cursoId?: string;
  pessoaId?: string;
  titulo: string;
  categoria: 'dossier_pedagogico' | 'manual_curso' | 'certificado_externo' | 'contrato' | 'relatorio_auditoria';
  ficheiroUrl: string;
  formato: string;
  tamanhoBytes: number;
  versao: number;
  carregadoPor: string;
  carregadoEm: string;
}

export interface Mensagem {
  id: string;
  empresaId: string;
  cursoId?: string;
  remetenteId: string;
  destinatarioId: string;
  assunto: string;
  conteudo: string;
  dataEnvio: string;
  lida: boolean;
  dataLeitura?: string;
}

export interface Notificacao {
  id: string;
  empresaId: string;
  destinatarioId: string;
  titulo: string;
  mensagem: string;
  tipo: 'prazo_tarefa' | 'curso_proximo' | 'avaliacao_pendente' | 'ocorrencia_aberta' | 'sistema';
  linkRedirecionamento?: string;
  lida: boolean;
  criadaEm: string;
}

export interface HistoricoAuditoria {
  id: string;
  empresaId: string;
  entidade: 'CURSOS' | 'PRESENCAS' | 'AVALIACOES' | 'CERTIFICADOS' | 'OCORRENCIAS' | 'FINANCEIRO' | 'MEMBROS';
  entidadeId: string;
  operacao: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'REVOKE' | 'CLOSE';
  resumoAlteracao: string;
  dadosAnteriores?: any;
  dadosNovos?: any;
  executadoPor: string;
  timestamp: string;
}

// Filtros Globais do Dashboard e Listagens
export interface FiltrosDashboard {
  ano: string; // 'Todos' ou ano concreto (ex: '2026')
  meses: string; // 'Todos' ou 1..12
  periodo: string; // 'Todos' | 'manha' | 'tarde' | 'noite' | 'sabado'
  instituicao: string; // 'Todas' ou designação
  cursoId: string; // 'Todos' ou id
  pesquisaTexto: string;
  categoria: string; // 'Todas' ou nome
  formadorId: string; // 'Todos' ou id
  estadoCurso: string; // 'Todos' | 'agendado' | 'em_andamento' | 'realizado' | 'cancelado'
  encerrado: string; // 'Todos' | 'apenas_abertos' | 'apenas_encerrados'
}

// 8 KPIs Centrais do Dashboard
export interface IndicadoresDashboard {
  totalAcoes: number;
  taxaAprovacao: number; // % de 0 a 100
  satisfacaoMedia: number; // 1 a 5
  avaliacaoFormadores: number; // 1 a 5
  formandosAvaliados: number; // Contagem de formandos únicos
  certificadosEmitidos: number;
  ocorrenciasTotal: number;
  taxaRecomendacao: number; // % de 0 a 100
}
