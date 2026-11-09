/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * Mapeadores bidirecionais linha Supabase <-> modelo frontend
 */

import { Organizacao, Pessoa, MembroOrganizacao, PapelAcesso, deriveHighestRole } from '../types';

/* --- 1. ORGANIZAÇÃO --- */

export interface DbOrganizacaoRow {
  id: string;
  nome: string;
  logo_url: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  cor_terciaria: string | null;
  tema_padrao: string | null;
  estado?: string | null;
  descricao_institucional: string | null;
  nif: string | null;
  numero_licenca: string | null;
  diretor: string | null;
  localizacao: string | null;
  iban: string | null;
  express_conta: string | null;
  telefone: string | null;
  email: string | null;
  pacote: string | null;
  data_adesao: string | null;
  data_termino: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
}

export function mapDbToOrganizacao(row: DbOrganizacaoRow): Organizacao {
  return {
    id: row.id,
    designacao: row.nome || 'Organização Sem Nome',
    descricaoInstitucional: row.descricao_institucional || undefined,
    nif: row.nif || '',
    numeroLicenca: row.numero_licenca || '',
    diretor: row.diretor || '',
    localizacao: row.localizacao || '',
    iban: row.iban || '',
    expressConta: row.express_conta || '',
    telefone: row.telefone || '',
    email: row.email || '',
    pacote: (row.pacote === 'enterprise' ? 'enterprise' : 'standard') as 'standard' | 'enterprise',
    dataAdesao: row.data_adesao || new Date().toISOString(),
    dataTermino: row.data_termino || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    temaConfig: {
      corPrimaria: row.cor_primaria || '#183B5B',
      corSecundaria: row.cor_secundaria || '#D99B24',
      corTerciaria: row.cor_terciaria || '#16866A',
      modoPadrao: (row.tema_padrao === 'escuro' ? 'escuro' : row.tema_padrao === 'auto' ? 'auto' : 'claro') as 'claro' | 'escuro' | 'auto',
      logoUrl: row.logo_url || undefined,
    },
  };
}

export function mapOrganizacaoToDbUpdate(org: Partial<Organizacao>): Record<string, any> {
  const payload: Record<string, any> = {};

  if (org.designacao !== undefined) payload.nome = org.designacao;
  if (org.descricaoInstitucional !== undefined) payload.descricao_institucional = org.descricaoInstitucional;
  if (org.nif !== undefined) payload.nif = org.nif;
  if (org.numeroLicenca !== undefined) payload.numero_licenca = org.numeroLicenca;
  if (org.diretor !== undefined) payload.diretor = org.diretor;
  if (org.localizacao !== undefined) payload.localizacao = org.localizacao;
  if (org.iban !== undefined) payload.iban = org.iban;
  if (org.expressConta !== undefined) payload.express_conta = org.expressConta;
  if (org.telefone !== undefined) payload.telefone = org.telefone;
  if (org.email !== undefined) payload.email = org.email;

  if (org.temaConfig) {
    if (org.temaConfig.corPrimaria !== undefined) payload.cor_primaria = org.temaConfig.corPrimaria;
    if (org.temaConfig.corSecundaria !== undefined) payload.cor_secundaria = org.temaConfig.corSecundaria;
    if (org.temaConfig.corTerciaria !== undefined) payload.cor_terciaria = org.temaConfig.corTerciaria;
    if (org.temaConfig.modoPadrao !== undefined) payload.tema_padrao = org.temaConfig.modoPadrao;
    if (org.temaConfig.logoUrl !== undefined) payload.logo_url = org.temaConfig.logoUrl;
  }

  return payload;
}

/* --- 2. PESSOA --- */

export interface DbPessoaRow {
  id: string;
  auth_user_id: string | null;
  nome_completo: string;
  email: string;
  telefone: string | null;
  genero: string | null;
  foto_url: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
}

export function mapDbToPessoa(row: DbPessoaRow): Pessoa {
  return {
    id: row.id,
    authUid: row.auth_user_id || undefined,
    nomeCompleto: row.nome_completo || 'Utilizador',
    email: row.email || '',
    telefone: row.telefone || '',
    genero: (row.genero === 'feminino' ? 'feminino' : row.genero === 'outro' ? 'outro' : 'masculino') as 'masculino' | 'feminino' | 'outro',
    fotoUrl: row.foto_url || undefined,
    criadoEm: row.criado_em || new Date().toISOString(),
    atualizadoEm: row.atualizado_em || new Date().toISOString(),
  };
}

export function mapPessoaToDbUpdate(pessoa: Partial<Pessoa>): Record<string, any> {
  const payload: Record<string, any> = {};

  if (pessoa.nomeCompleto !== undefined) payload.nome_completo = pessoa.nomeCompleto;
  if (pessoa.telefone !== undefined) payload.telefone = pessoa.telefone;
  if (pessoa.genero !== undefined) payload.genero = pessoa.genero;
  if (pessoa.fotoUrl !== undefined) payload.foto_url = pessoa.fotoUrl;

  return payload;
}

/* --- 3. MEMBRO ORGANIZAÇÃO --- */

export interface DbMembroRow {
  id: string;
  organizacao_id: string;
  pessoa_id: string;
  papeis: PapelAcesso[];
  estado: 'ativo' | 'inativo' | 'suspenso';
  funcoes_profissionais: string[] | null;
  departamento_ou_empresa_origem: string | null;
  cargo: string | null;
  restringir_acesso_horario: boolean | null;
  dias_acesso_permitidos: number[] | null;
  hora_inicio: string | null;
  hora_fim: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
}

// Converte 'HH:MM:SS' para 'HH:MM'
function formatTimeShort(time: string | null | undefined): string | undefined {
  if (!time) return undefined;
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

export function mapDbToMembro(row: DbMembroRow): MembroOrganizacao {
  const papeisList = Array.isArray(row.papeis) && row.papeis.length > 0 ? row.papeis : ['formando' as PapelAcesso];
  const highestRole = deriveHighestRole(papeisList);

  return {
    id: row.id,
    empresaId: row.organizacao_id,
    pessoaId: row.pessoa_id,
    papeis: papeisList,
    papelAcesso: highestRole,
    estadoMembro: row.estado || 'ativo',
    funcoesProfissionais: Array.isArray(row.funcoes_profissionais) ? row.funcoes_profissionais : [],
    departamentoOuEmpresaOrigem: row.departamento_ou_empresa_origem || '',
    cargo: row.cargo || '',
    restringirAcessoHorario: Boolean(row.restringir_acesso_horario),
    diasAcessoPermitidos: Array.isArray(row.dias_acesso_permitidos) ? row.dias_acesso_permitidos : undefined,
    horaInicio: formatTimeShort(row.hora_inicio),
    horaFim: formatTimeShort(row.hora_fim),
    criadoEm: row.criado_em || new Date().toISOString(),
    atualizadoEm: row.atualizado_em || undefined,
  };
}

/* --- 4. AUDIT LOG (Fase 1 - Supabase) --- */

export interface DbAuditLogRow {
  id: string;
  organizacao_id: string;
  autor_auth_id: string | null;
  acao: string;
  tabela: string;
  registo_id: string;
  antes: any;
  depois: any;
  criado_em: string;
}
