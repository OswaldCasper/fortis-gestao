/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * DataService: Camada de Acesso aos Dados (Repositório Desacoplado)
 * Fase 1: Migrado para Supabase (Organizações, Pessoas, Membros e Auditoria)
 * Os restantes módulos operacionais mantêm-se em dados locais determinísticos
 */

import {
  Curso,
  Pessoa,
  MembroOrganizacao,
  FormacaoCatalogo,
  CursoFormador,
  Sessao,
  Inscricao,
  Presenca,
  Avaliacao,
  Certificado,
  Ocorrencia,
  TarefaChecklist,
  RegistroFinanceiro,
  Documento,
  Mensagem,
  Notificacao,
  HistoricoAuditoria,
  FiltrosDashboard,
  IndicadoresDashboard,
  Organizacao,
  PapelAcesso,
} from '../types';

import {
  DEMO_ORG_ID,
  INITIAL_ORGANIZACAO,
  INITIAL_PESSOAS,
  INITIAL_MEMBROS,
  INITIAL_FORMACOES,
  INITIAL_CURSOS,
  INITIAL_CURSO_FORMADORES,
  INITIAL_SESSOES,
  INITIAL_INSCRICOES,
  INITIAL_PRESENCAS,
  INITIAL_AVALIACOES,
  INITIAL_CERTIFICADOS,
  INITIAL_OCORRENCIAS,
  INITIAL_TAREFAS,
  INITIAL_FINANCEIRO,
  INITIAL_DOCUMENTOS,
  INITIAL_MENSAGENS,
  INITIAL_NOTIFICACOES,
  INITIAL_AUDITORIA,
} from './dataStore';

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  mapDbToOrganizacao,
  mapOrganizacaoToDbUpdate,
  mapDbToPessoa,
  mapPessoaToDbUpdate,
  mapDbToMembro,
  DbAuditLogRow,
} from './mappers';

const STORAGE_KEY = 'fortis_db_v2';
const ACTIVE_ORG_KEY = 'fortis_active_org_id';

// Limpeza das chaves obsoletas da versão anterior
try {
  localStorage.removeItem('fortis_db_v1');
  localStorage.removeItem('fortis_auth_token');
  localStorage.removeItem('fortis_active_user_id');
} catch {
  // Ignora se localStorage não estiver disponível
}

interface LocalModulesState {
  formacoes: FormacaoCatalogo[];
  cursos: Curso[];
  cursoFormadores: CursoFormador[];
  sessoes: Sessao[];
  inscricoes: Inscricao[];
  presencas: Presenca[];
  avaliacoes: Avaliacao[];
  certificados: Certificado[];
  ocorrencias: Ocorrencia[];
  tarefas: TarefaChecklist[];
  financeiro: RegistroFinanceiro[];
  documentos: Documento[];
  mensagens: Mensagem[];
  notificacoes: Notificacao[];
  auditoria: HistoricoAuditoria[];
}

interface DBState extends LocalModulesState {
  organizacoes: Organizacao[];
  pessoas: Pessoa[];
  membros: MembroOrganizacao[];
}

const FALLBACK_PESSOA: Pessoa = {
  id: 'desconhecido',
  nomeCompleto: 'Utilizador',
  email: '',
  telefone: '',
  genero: 'outro',
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString(),
};

function safeFindPessoa(pessoas: Pessoa[], id: string): Pessoa {
  const found = pessoas.find(p => p.id === id);
  return found || { ...FALLBACK_PESSOA, id };
}

class DataService {
  private db: DBState;
  private activeOrgId: string = DEMO_ORG_ID;
  private listeners: Set<() => void> = new Set();
  private supabaseAuditLogs: HistoricoAuditoria[] = [];

  constructor() {
    this.activeOrgId = this.loadActiveOrgId();
    this.db = this.loadInitialState();
  }

  private loadActiveOrgId(): string {
    try {
      const saved = localStorage.getItem(ACTIVE_ORG_KEY);
      if (saved && saved.trim().length > 0) return saved;
    } catch {}
    return DEMO_ORG_ID;
  }

  public getActiveOrgId(): string {
    return this.activeOrgId || DEMO_ORG_ID;
  }

  public setActiveOrg(orgId: string) {
    this.activeOrgId = orgId;
    try {
      localStorage.setItem(ACTIVE_ORG_KEY, orgId);
    } catch {}
    this.notify();
  }

  private loadInitialState(): DBState {
    const localModules = this.loadLocalModulesFromStorage();
    return {
      organizacoes: [INITIAL_ORGANIZACAO],
      pessoas: INITIAL_PESSOAS,
      membros: INITIAL_MEMBROS,
      ...localModules,
    };
  }

  private loadLocalModulesFromStorage(): LocalModulesState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Falha ao restaurar módulos locais de fortis_db_v2:', e);
    }
    return {
      formacoes: INITIAL_FORMACOES,
      cursos: INITIAL_CURSOS,
      cursoFormadores: INITIAL_CURSO_FORMADORES,
      sessoes: INITIAL_SESSOES,
      inscricoes: INITIAL_INSCRICOES,
      presencas: INITIAL_PRESENCAS,
      avaliacoes: INITIAL_AVALIACOES,
      certificados: INITIAL_CERTIFICADOS,
      ocorrencias: INITIAL_OCORRENCIAS,
      tarefas: INITIAL_TAREFAS,
      financeiro: INITIAL_FINANCEIRO,
      documentos: INITIAL_DOCUMENTOS,
      mensagens: INITIAL_MENSAGENS,
      notificacoes: INITIAL_NOTIFICACOES,
      auditoria: INITIAL_AUDITORIA,
    };
  }

  // Grava em localStorage APENAS os módulos locais (nunca organizacoes, pessoas, membros)
  private persist() {
    try {
      const localOnly: LocalModulesState = {
        formacoes: this.db.formacoes,
        cursos: this.db.cursos,
        cursoFormadores: this.db.cursoFormadores,
        sessoes: this.db.sessoes,
        inscricoes: this.db.inscricoes,
        presencas: this.db.presencas,
        avaliacoes: this.db.avaliacoes,
        certificados: this.db.certificados,
        ocorrencias: this.db.ocorrencias,
        tarefas: this.db.tarefas,
        financeiro: this.db.financeiro,
        documentos: this.db.documentos,
        mensagens: this.db.mensagens,
        notificacoes: this.db.notificacoes,
        auditoria: this.db.auditoria,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localOnly));
    } catch (e) {
      console.error('Falha ao persistir módulos locais:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // Limpa da memória os dados da sessão anterior para evitar fugas entre utilizadores
  public clearSession() {
    this.activeOrgId = DEMO_ORG_ID;
    this.db.organizacoes = [];
    this.db.pessoas = [];
    this.db.membros = [];
    this.supabaseAuditLogs = [];
    this.notify();
  }

  // --- HIDRATAÇÃO SUPABASE (FASE 1) ---
  public async hydrate(orgId: string): Promise<void> {
    this.setActiveOrg(orgId);

    if (!isSupabaseConfigured) {
      return;
    }

    try {
      // 1. Carregar Organização
      const { data: orgData, error: orgErr } = await supabase
        .from('organizacoes')
        .select('*')
        .eq('id', orgId)
        .maybeSingle();

      if (orgErr) {
        console.warn('Supabase: Erro ao carregar organização:', orgErr.message);
      } else if (orgData) {
        const orgMapped = mapDbToOrganizacao(orgData);
        const idx = this.db.organizacoes.findIndex(o => o.id === orgId);
        if (idx >= 0) {
          this.db.organizacoes[idx] = orgMapped;
        } else {
          this.db.organizacoes.unshift(orgMapped);
        }
      }

      // 2. Carregar Membros da Organização
      const { data: membrosData, error: memErr } = await supabase
        .from('membros_organizacao')
        .select('*')
        .eq('organizacao_id', orgId);

      if (memErr) {
        console.warn('Supabase: Erro ao carregar membros:', memErr.message);
      } else if (membrosData) {
        this.db.membros = membrosData.map(mapDbToMembro);
      }

      // 3. Carregar Pessoas visíveis sob RLS
      const { data: pessoasData, error: pesErr } = await supabase
        .from('pessoas')
        .select('*');

      if (pesErr) {
        console.warn('Supabase: Erro ao carregar pessoas:', pesErr.message);
      } else if (pessoasData) {
        this.db.pessoas = pessoasData.map(mapDbToPessoa);
      }

      // 4. Carregar Auditoria do Supabase (Apenas Administradores têm permissão RLS)
      try {
        const { data: auditData } = await supabase
          .from('audit_log')
          .select('*')
          .eq('organizacao_id', orgId)
          .order('criado_em', { ascending: false })
          .limit(50);

        if (auditData && Array.isArray(auditData)) {
          this.supabaseAuditLogs = (auditData as DbAuditLogRow[]).map(row => {
            const autorPessoa = safeFindPessoa(this.db.pessoas, row.autor_auth_id || '');
            return {
              id: `sup-${row.id}`,
              empresaId: row.organizacao_id,
              entidade: (row.tabela?.toUpperCase() || 'MEMBROS') as any,
              entidadeId: row.registo_id || row.id,
              operacao: (row.acao?.toUpperCase() || 'UPDATE') as any,
              resumoAlteracao: `Operação ${row.acao} na tabela ${row.tabela} (Supabase)`,
              executadoPor: row.autor_auth_id || 'Sistema',
              autorNome: autorPessoa.nomeCompleto,
              timestamp: row.criado_em,
              dadosAnteriores: row.antes,
              dadosNovos: row.depois,
            };
          });
        }
      } catch {
        // Se utilizador não for admin, RLS bloqueia audit_log silenciosamente
      }

      this.notify();
    } catch (err) {
      console.error('Falha na hidratação do Supabase:', err);
    }
  }

  // --- Organizações e Membros (Fase 1 com Supabase) ---
  public getOrganization(orgId = this.getActiveOrgId()): Organizacao {
    const org = this.db.organizacoes.find(o => o.id === orgId);
    return org || INITIAL_ORGANIZACAO;
  }

  public async updateOrganization(
    orgId: string,
    updates: Partial<Organizacao>,
    _autorId?: string
  ): Promise<{ success: boolean; message: string; organization?: Organizacao }> {
    const idx = this.db.organizacoes.findIndex(o => o.id === orgId);
    const anterior = idx >= 0 ? { ...this.db.organizacoes[idx] } : INITIAL_ORGANIZACAO;

    // Atualização otimista
    if (idx >= 0) {
      this.db.organizacoes[idx] = { ...anterior, ...updates };
      this.notify();
    }

    if (isSupabaseConfigured) {
      try {
        const dbPayload = mapOrganizacaoToDbUpdate(updates);
        const { error } = await supabase
          .from('organizacoes')
          .update(dbPayload)
          .eq('id', orgId);

        if (error) {
          // Reversão
          if (idx >= 0) {
            this.db.organizacoes[idx] = anterior;
            this.notify();
          }
          return { success: false, message: `Erro ao atualizar organização: ${error.message}` };
        }
      } catch (e: any) {
        if (idx >= 0) {
          this.db.organizacoes[idx] = anterior;
          this.notify();
        }
        return { success: false, message: e?.message || 'Falha na comunicação com a base de dados.' };
      }
    }

    return {
      success: true,
      message: 'Organização atualizada com sucesso.',
      organization: idx >= 0 ? this.db.organizacoes[idx] : undefined,
    };
  }

  public async updatePerson(
    pessoaId: string,
    updates: Partial<Pessoa>
  ): Promise<{ success: boolean; message: string }> {
    const idx = this.db.pessoas.findIndex(p => p.id === pessoaId);
    const anterior = idx >= 0 ? { ...this.db.pessoas[idx] } : undefined;

    if (idx >= 0) {
      this.db.pessoas[idx] = { ...this.db.pessoas[idx], ...updates };
      this.notify();
    }

    if (isSupabaseConfigured) {
      try {
        const dbPayload = mapPessoaToDbUpdate(updates);
        const { error } = await supabase
          .from('pessoas')
          .update(dbPayload)
          .eq('id', pessoaId);

        if (error) {
          if (idx >= 0 && anterior) {
            this.db.pessoas[idx] = anterior;
            this.notify();
          }
          return { success: false, message: `Erro ao atualizar pessoa: ${error.message}` };
        }
      } catch (e: any) {
        if (idx >= 0 && anterior) {
          this.db.pessoas[idx] = anterior;
          this.notify();
        }
        return { success: false, message: e?.message || 'Falha ao atualizar pessoa.' };
      }
    }

    return { success: true, message: 'Dados pessoais atualizados com sucesso.' };
  }

  public async addMember(
    orgId: string,
    email: string,
    nomeCompleto: string,
    papeis: PapelAcesso[],
    extra?: {
      funcoesProfissionais?: string[];
      departamento?: string;
      cargo?: string;
      restringirAcesso?: boolean;
      diasAcesso?: number[];
      horaInicio?: string;
      horaFim?: string;
    }
  ): Promise<{ success: boolean; message: string; membroId?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data: membroId, error } = await supabase.rpc('adicionar_membro', {
          p_org: orgId,
          p_email: email,
          p_nome: nomeCompleto,
          p_papeis: papeis,
        });

        if (error) {
          return { success: false, message: `Erro ao adicionar membro: ${error.message}` };
        }

        if (extra && membroId) {
          await supabase.rpc('atualizar_dados_membro', {
            p_membro: membroId,
            p_funcoes: extra.funcoesProfissionais || [],
            p_departamento: extra.departamento || '',
            p_cargo: extra.cargo || '',
            p_restringir: Boolean(extra.restringirAcesso),
            p_dias: extra.diasAcesso || null,
            p_hora_inicio: extra.horaInicio ? `${extra.horaInicio}:00` : null,
            p_hora_fim: extra.horaFim ? `${extra.horaFim}:00` : null,
          });
        }

        await this.hydrate(orgId);
        return { success: true, message: 'Membro adicionado com sucesso.', membroId };
      } catch (e: any) {
        return { success: false, message: e?.message || 'Falha ao adicionar membro.' };
      }
    }

    // Fallback local se Supabase não configurado
    const id = `pes-${Date.now()}`;
    const novaPessoa: Pessoa = {
      id,
      nomeCompleto,
      email,
      telefone: '',
      genero: 'outro',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    const novoMembro: MembroOrganizacao = {
      id: `mem-${Date.now()}`,
      empresaId: orgId,
      pessoaId: id,
      papelAcesso: papeis[0] || 'formando',
      papeis,
      funcoesProfissionais: extra?.funcoesProfissionais || [],
      departamentoOuEmpresaOrigem: extra?.departamento || '',
      cargo: extra?.cargo || '',
      estadoMembro: 'ativo',
      restringirAcessoHorario: Boolean(extra?.restringirAcesso),
      criadoEm: new Date().toISOString(),
    };
    this.db.pessoas.unshift(novaPessoa);
    this.db.membros.unshift(novoMembro);
    this.notify();
    return { success: true, message: 'Membro registado em modo de demonstração local.', membroId: novoMembro.id };
  }

  public async updateMember(
    membroId: string,
    papeis: PapelAcesso[],
    estado: 'ativo' | 'inativo' | 'suspenso'
  ): Promise<{ success: boolean; message: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.rpc('atualizar_membro', {
          p_membro: membroId,
          p_papeis: papeis,
          p_estado: estado,
        });

        if (error) {
          return { success: false, message: `Erro ao atualizar membro: ${error.message}` };
        }

        await this.hydrate(this.getActiveOrgId());
        return { success: true, message: 'Membro atualizado com sucesso.' };
      } catch (e: any) {
        return { success: false, message: e?.message || 'Falha ao atualizar membro.' };
      }
    }

    const idx = this.db.membros.findIndex(m => m.id === membroId);
    if (idx >= 0) {
      this.db.membros[idx] = {
        ...this.db.membros[idx],
        papeis,
        papelAcesso: papeis[0] || this.db.membros[idx].papelAcesso,
        estadoMembro: estado,
      };
      this.notify();
    }
    return { success: true, message: 'Membro atualizado localmente.' };
  }

  public getMembers(empresaId = this.getActiveOrgId()): MembroOrganizacao[] {
    return this.db.membros.filter(m => m.empresaId === empresaId);
  }

  public getPeople(empresaId = this.getActiveOrgId()): (Pessoa & { membro?: MembroOrganizacao })[] {
    const membros = this.getMembers(empresaId);
    return this.db.pessoas.map(p => {
      const membro = membros.find(m => m.pessoaId === p.id);
      return { ...p, membro };
    });
  }

  public getTrainers(empresaId = this.getActiveOrgId()): (Pessoa & { membro: MembroOrganizacao; cursosMinistrados: number })[] {
    const membros = this.getMembers(empresaId).filter(
      m => m.papelAcesso === 'formador' || m.papeis?.includes('formador') || m.funcoesProfissionais.some(f => f.toLowerCase().includes('formador'))
    );
    return membros.map(m => {
      const pessoa = safeFindPessoa(this.db.pessoas, m.pessoaId);
      const cursosCount = this.db.cursoFormadores.filter(cf => cf.formadorId === pessoa.id && cf.empresaId === empresaId).length;
      return {
        ...pessoa,
        membro: m,
        cursosMinistrados: cursosCount,
      };
    });
  }

  public getTrainees(empresaId = this.getActiveOrgId()): (Pessoa & { membro?: MembroOrganizacao; totalInscricoes: number })[] {
    const trainees = this.db.pessoas.filter(p => {
      const membro = this.db.membros.find(m => m.pessoaId === p.id && m.empresaId === empresaId);
      const temInscricoes = this.db.inscricoes.some(i => i.formandoId === p.id && i.empresaId === empresaId);
      return (membro && (membro.papelAcesso === 'formando' || membro.papeis?.includes('formando'))) || temInscricoes;
    });

    return trainees.map(p => {
      const membro = this.db.membros.find(m => m.pessoaId === p.id && m.empresaId === empresaId);
      const totalInscricoes = this.db.inscricoes.filter(i => i.formandoId === p.id && i.empresaId === empresaId).length;
      return { ...p, membro, totalInscricoes };
    });
  }

  // --- Cursos & Ações de Formação (Módulo Local) ---
  public getCourses(empresaId = this.getActiveOrgId(), filters?: Partial<FiltrosDashboard>): Curso[] {
    let list = this.db.cursos.filter(c => c.empresaId === empresaId);

    if (filters) {
      if (filters.ano && filters.ano !== 'Todos') {
        list = list.filter(c => c.ano.toString() === filters.ano);
      }
      if (filters.meses && filters.meses !== 'Todos') {
        list = list.filter(c => c.mes.toString() === filters.meses);
      }
      if (filters.periodo && filters.periodo !== 'Todos') {
        list = list.filter(c => c.periodo === filters.periodo);
      }
      if (filters.instituicao && filters.instituicao !== 'Todas') {
        list = list.filter(c => c.instituicao.toLowerCase().includes(filters.instituicao!.toLowerCase()));
      }
      if (filters.cursoId && filters.cursoId !== 'Todos') {
        list = list.filter(c => c.id === filters.cursoId);
      }
      if (filters.pesquisaTexto && filters.pesquisaTexto.trim() !== '') {
        const txt = filters.pesquisaTexto.toLowerCase();
        list = list.filter(c => c.nomeCurso.toLowerCase().includes(txt) || c.localSala.toLowerCase().includes(txt));
      }
      if (filters.categoria && filters.categoria !== 'Todas') {
        const catIds = this.db.formacoes.filter(f => f.categoria.toLowerCase() === filters.categoria!.toLowerCase()).map(f => f.id);
        list = list.filter(c => catIds.includes(c.formacaoCatalogoId));
      }
      if (filters.formadorId && filters.formadorId !== 'Todos') {
        const cursosFormador = this.db.cursoFormadores.filter(cf => cf.formadorId === filters.formadorId).map(cf => cf.cursoId);
        list = list.filter(c => cursosFormador.includes(c.id));
      }
      if (filters.estadoCurso && filters.estadoCurso !== 'Todos') {
        list = list.filter(c => c.estadoCurso === filters.estadoCurso);
      }
      if (filters.encerrado && filters.encerrado !== 'Todos') {
        if (filters.encerrado === 'apenas_encerrados') {
          list = list.filter(c => c.encerrado === true);
        } else if (filters.encerrado === 'apenas_abertos') {
          list = list.filter(c => c.encerrado === false);
        }
      }
    }

    return list.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
  }

  public getCourseById(cursoId: string): Curso | undefined {
    return this.db.cursos.find(c => c.id === cursoId);
  }

  public createCourse(data: Omit<Curso, 'id'>, autorId: string): Curso {
    const id = `cur-${Date.now()}`;
    const newCourse: Curso = { ...data, id };
    this.db.cursos.unshift(newCourse);
    this.logAuditLocal(newCourse.empresaId, 'CURSOS', id, 'CREATE', `Criação da ação "${newCourse.nomeCurso}"`, autorId);
    this.persist();
    return newCourse;
  }

  public updateCourse(cursoId: string, updates: Partial<Curso>, autorId: string): Curso | undefined {
    const idx = this.db.cursos.findIndex(c => c.id === cursoId);
    if (idx >= 0) {
      const anterior = this.db.cursos[idx];
      this.db.cursos[idx] = { ...anterior, ...updates };
      this.logAuditLocal(anterior.empresaId, 'CURSOS', cursoId, 'UPDATE', `Atualização da ação "${this.db.cursos[idx].nomeCurso}"`, autorId);
      this.persist();
      return this.db.cursos[idx];
    }
    return undefined;
  }

  public updateCourseStatus(cursoId: string, novoEstado: Curso['estadoCurso'], autorId: string): Curso | undefined {
    const idx = this.db.cursos.findIndex(c => c.id === cursoId);
    if (idx >= 0) {
      const anterior = this.db.cursos[idx];
      const progresso = novoEstado === 'realizado' ? 100 : novoEstado === 'em_andamento' ? 50 : 0;
      this.db.cursos[idx] = {
        ...anterior,
        estadoCurso: novoEstado,
        progressoPercent: progresso,
      };
      this.logAuditLocal(anterior.empresaId, 'CURSOS', cursoId, 'STATUS_CHANGE', `Alteração de estado para ${novoEstado}`, autorId);
      this.persist();
      return this.db.cursos[idx];
    }
    return undefined;
  }

  public toggleCourseClosure(cursoId: string, autorId: string): { success: boolean; message: string; course?: Curso } {
    const idx = this.db.cursos.findIndex(c => c.id === cursoId);
    if (idx < 0) return { success: false, message: 'Curso não encontrado' };
    const curso = this.db.cursos[idx];

    if (!curso.encerrado) {
      const tarefasObrigatoriasPendentes = this.db.tarefas.filter(
        t => t.cursoId === cursoId && t.obrigatoriaParaEncerramento && t.estado !== 'concluida'
      );
      if (tarefasObrigatoriasPendentes.length > 0) {
        return {
          success: false,
          message: `Não é possível encerrar: Existem ${tarefasObrigatoriasPendentes.length} tarefa(s) obrigatória(s) pendente(s) no checklist pedagógico ISO 9001.`,
        };
      }

      this.db.cursos[idx] = {
        ...curso,
        encerrado: true,
        dataEncerramento: new Date().toISOString(),
        encerradoPor: autorId,
        conformidadePercent: 100,
      };
      this.logAuditLocal(curso.empresaId, 'CURSOS', cursoId, 'CLOSE', `Encerramento formal administrativo da ação "${curso.nomeCurso}"`, autorId);
      this.persist();
      return { success: true, message: 'Curso encerrado formalmente com sucesso.', course: this.db.cursos[idx] };
    } else {
      this.db.cursos[idx] = {
        ...curso,
        encerrado: false,
        dataEncerramento: undefined,
        encerradoPor: undefined,
      };
      this.logAuditLocal(curso.empresaId, 'CURSOS', cursoId, 'STATUS_CHANGE', `Reabertura administrativa da ação "${curso.nomeCurso}"`, autorId);
      this.persist();
      return { success: true, message: 'Curso reaberto administrativamente.', course: this.db.cursos[idx] };
    }
  }

  // --- Formadores Associados ao Curso (Módulo Local) ---
  public getCourseTrainers(cursoId: string): (CursoFormador & { pessoa: Pessoa })[] {
    const allocations = this.db.cursoFormadores.filter(cf => cf.cursoId === cursoId);
    return allocations.map(cf => {
      const pessoa = safeFindPessoa(this.db.pessoas, cf.formadorId);
      return { ...cf, pessoa };
    });
  }

  public assignTrainerToCourse(data: Omit<CursoFormador, 'id'>, autorId: string): CursoFormador {
    const id = `cf-${Date.now()}`;
    const newAssoc: CursoFormador = { ...data, id };
    this.db.cursoFormadores.push(newAssoc);
    this.logAuditLocal(data.empresaId, 'CURSOS', data.cursoId, 'UPDATE', `Alocação de formador à ação`, autorId);
    this.persist();
    return newAssoc;
  }

  // --- Sessões e Presenças (Módulo Local) ---
  public getCourseSessions(cursoId: string): Sessao[] {
    return this.db.sessoes.filter(s => s.cursoId === cursoId).sort((a, b) => a.numeroSessao - b.numeroSessao);
  }

  public createSession(data: Omit<Sessao, 'id'>, autorId: string): { success: boolean; message?: string; session?: Sessao } {
    const id = `ses-${Date.now()}`;
    const newSession: Sessao = { ...data, id };
    this.db.sessoes.push(newSession);
    this.logAuditLocal(data.empresaId, 'CURSOS', data.cursoId, 'UPDATE', `Agendamento da Sessão ${data.numeroSessao}`, autorId);
    this.persist();
    return { success: true, session: newSession };
  }

  public getSessionAttendance(sessaoId: string): (Presenca & { formando: Pessoa })[] {
    const presencas = this.db.presencas.filter(p => p.sessaoId === sessaoId);
    return presencas.map(p => {
      const formando = safeFindPessoa(this.db.pessoas, p.formandoId);
      return { ...p, formando };
    });
  }

  public saveAttendanceBatch(presencas: Omit<Presenca, 'id' | 'registadoPor' | 'registadoEm'>[], autorId: string) {
    if (presencas.length === 0) return;
    const sessaoId = presencas[0].sessaoId;
    const empresaId = presencas[0].empresaId;

    this.db.presencas = this.db.presencas.filter(p => p.sessaoId !== sessaoId);

    const novos: Presenca[] = presencas.map((p, idx) => ({
      ...p,
      id: `pre-${Date.now()}-${idx}`,
      registadoPor: autorId,
      registadoEm: new Date().toISOString(),
    }));

    this.db.presencas.push(...novos);
    this.logAuditLocal(empresaId, 'PRESENCAS', sessaoId, 'UPDATE', `Registo de presenças para a sessão (${novos.length} formandos)`, autorId);
    this.persist();
  }

  // --- Inscrições (Módulo Local) ---
  public getCourseEnrollments(cursoId: string): (Inscricao & { formando: Pessoa })[] {
    const list = this.db.inscricoes.filter(i => i.cursoId === cursoId);
    return list.map(i => {
      const formando = safeFindPessoa(this.db.pessoas, i.formandoId);
      return { ...i, formando };
    });
  }

  public enrollStudent(
    cursoId: string,
    formandoId: string,
    valorPago: number,
    autorId: string,
    empresaId = this.getActiveOrgId()
  ): { success: boolean; message: string; inscricao?: Inscricao } {
    const existente = this.db.inscricoes.find(i => i.cursoId === cursoId && i.formandoId === formandoId);
    if (existente) {
      return { success: false, message: 'Este formando já está inscrito nesta ação.' };
    }

    const curso = this.getCourseById(cursoId);
    if (!curso) return { success: false, message: 'Curso não encontrado.' };

    const inscritosAtuais = this.db.inscricoes.filter(i => i.cursoId === cursoId && i.estado === 'confirmada').length;
    if (inscritosAtuais >= curso.vagasMaximas) {
      return { success: false, message: `Vagas esgotadas (Lotação máxima: ${curso.vagasMaximas}).` };
    }

    const id = `${cursoId}_${formandoId}`;
    const nova: Inscricao = {
      id,
      empresaId,
      cursoId,
      formandoId,
      dataInscricao: new Date().toISOString(),
      estado: 'confirmada',
      valorPago,
    };
    this.db.inscricoes.push(nova);
    this.logAuditLocal(empresaId, 'CURSOS', cursoId, 'UPDATE', `Inscrição de formando na ação`, autorId);
    this.persist();
    return { success: true, message: 'Formando inscrito com sucesso.', inscricao: nova };
  }

  // --- Avaliações (Módulo Local) ---
  public getCourseEvaluations(cursoId: string): (Avaliacao & { avaliador: Pessoa; avaliadoNome: string })[] {
    const list = this.db.avaliacoes.filter(a => a.cursoId === cursoId);
    return list.map(a => {
      const avaliador = safeFindPessoa(this.db.pessoas, a.avaliadorId);
      let avaliadoNome = 'Ação de Formação';
      if (a.tipoAvaliacao === 'conhecimentos_formando') {
        avaliadoNome = safeFindPessoa(this.db.pessoas, a.avaliadoId).nomeCompleto;
      } else if (a.tipoAvaliacao === 'desempenho_formador') {
        avaliadoNome = safeFindPessoa(this.db.pessoas, a.avaliadoId).nomeCompleto;
      }
      return { ...a, avaliador, avaliadoNome };
    });
  }

  // --- Certificados (Módulo Local) ---
  public getCertificates(empresaId = this.getActiveOrgId(), cursoId?: string): (Certificado & { formando: Pessoa; curso: Curso })[] {
    let list = this.db.certificados.filter(c => c.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(c => c.cursoId === cursoId);
    }
    return list.map(c => {
      const formando = safeFindPessoa(this.db.pessoas, c.formandoId);
      const curso = this.db.cursos.find(cur => cur.id === c.cursoId) || ({ nomeCurso: 'Curso' } as Curso);
      return { ...c, formando, curso };
    });
  }

  public issueCertificate(
    cursoId: string,
    formandoId: string,
    autorId: string,
    empresaId = this.getActiveOrgId()
  ): { success: boolean; message: string; certificate?: Certificado } {
    const id = `cert-${Date.now()}`;
    const codigoValidacao = `FORTIS-2026-VAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const novo: Certificado = {
      id,
      empresaId,
      cursoId,
      formandoId,
      codigoValidacao,
      numeroVia: 1,
      cargaHoraria: 40,
      dataEmissao: new Date().toISOString().split('T')[0],
      emitidoPor: autorId,
      estado: 'emitido',
      qrCodePayload: `https://fortis.academy/validar/${codigoValidacao}`,
    };
    this.db.certificados.unshift(novo);
    this.logAuditLocal(empresaId, 'CERTIFICADOS', id, 'CREATE', `Emissão de certificado com código ${codigoValidacao}`, autorId);
    this.persist();
    return { success: true, message: 'Certificado emitido com sucesso.', certificate: novo };
  }

  public revokeCertificate(certId: string, motivo: string, autorId: string): void {
    const cert = this.db.certificados.find(c => c.id === certId);
    if (cert) {
      cert.estado = 'revogado';
      cert.motivoRevogacao = motivo;
      this.logAuditLocal(cert.empresaId, 'CERTIFICADOS', certId, 'UPDATE', `Revogação de certificado: ${motivo}`, autorId);
      this.persist();
    }
  }

  public reissueCertificate(certId: string, autorId: string): Certificado | null {
    const original = this.db.certificados.find(c => c.id === certId);
    if (!original) return null;

    const id = `cert-${Date.now()}`;
    const codigoValidacao = `FORTIS-2026-VAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const novaVia: Certificado = {
      ...original,
      id,
      codigoValidacao,
      numeroVia: (original.numeroVia || 1) + 1,
      codigoSubstituido: original.codigoValidacao,
      dataEmissao: new Date().toISOString().split('T')[0],
      emitidoPor: autorId,
      estado: 'emitido',
      motivoRevogacao: undefined,
      qrCodePayload: `https://fortis.academy/validar/${codigoValidacao}`,
    };

    this.db.certificados.unshift(novaVia);
    this.logAuditLocal(original.empresaId, 'CERTIFICADOS', id, 'CREATE', `Emissão de 2ª via (${novaVia.numeroVia}) em substituição de ${original.codigoValidacao}`, autorId);
    this.persist();
    return novaVia;
  }

  // --- Ocorrências e Não Conformidades ISO 9001 (Módulo Local) ---
  public getOccurrences(empresaId = this.getActiveOrgId(), cursoId?: string): (Ocorrencia & { responsavel: Pessoa; curso?: Curso })[] {
    let list = this.db.ocorrencias.filter(o => o.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(o => o.cursoId === cursoId);
    }
    return list.map(o => {
      const responsavel = safeFindPessoa(this.db.pessoas, o.responsavelId);
      const curso = o.cursoId ? this.db.cursos.find(c => c.id === o.cursoId) : undefined;
      return { ...o, responsavel, curso };
    }).sort((a, b) => new Date(b.dataRegisto).getTime() - new Date(a.dataRegisto).getTime());
  }

  public saveOccurrence(
    data: Omit<Ocorrencia, 'id' | 'codigo' | 'dataRegisto'>,
    autorId: string
  ): Ocorrencia {
    const id = `oc-${Date.now()}`;
    const codigo = `NC-2026-${String(this.db.ocorrencias.length + 1).padStart(3, '0')}`;
    const nova: Ocorrencia = {
      ...data,
      id,
      codigo,
      dataRegisto: new Date().toISOString(),
    };
    this.db.ocorrencias.unshift(nova);
    this.logAuditLocal(data.empresaId, 'OCORRENCIAS', id, 'CREATE', `Registo da não conformidade ${codigo}`, autorId);
    this.persist();
    return nova;
  }

  public updateOccurrence(
    id: string,
    updates: Partial<Ocorrencia>,
    autorId: string
  ): void {
    const idx = this.db.ocorrencias.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.db.ocorrencias[idx] = { ...this.db.ocorrencias[idx], ...updates };
      this.logAuditLocal(this.db.ocorrencias[idx].empresaId, 'OCORRENCIAS', id, 'UPDATE', `Atualização da ocorrência ${this.db.ocorrencias[idx].codigo}`, autorId);
      this.persist();
    }
  }

  // --- Checklist e Tarefas Pedagógicas (Módulo Local) ---
  public getTasks(empresaId = this.getActiveOrgId(), cursoId?: string): (TarefaChecklist & { responsavel: Pessoa; diasRestantes: number; grupoTemporal: string })[] {
    let list = this.db.tarefas.filter(t => t.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(t => t.cursoId === cursoId);
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return list.map(t => {
      const responsavel = safeFindPessoa(this.db.pessoas, t.responsavelId);
      const dataLimiteDate = new Date(t.dataLimite);
      dataLimiteDate.setHours(0, 0, 0, 0);

      const diffTime = dataLimiteDate.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let grupoTemporal = 'Outras Datas';
      if (diasRestantes < 0) {
        grupoTemporal = 'Em Atraso';
      } else if (diasRestantes <= 3) {
        grupoTemporal = 'Daqui a 3 Dias';
      } else if (diasRestantes <= 7) {
        grupoTemporal = 'Últimos 7 Dias';
      } else if (diasRestantes <= 15) {
        grupoTemporal = 'Daqui a 15 Dias';
      } else if (diasRestantes <= 30) {
        grupoTemporal = 'Últimos 30 Dias';
      }

      return {
        ...t,
        responsavel,
        diasRestantes,
        grupoTemporal,
      };
    }).sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  public toggleTaskState(taskId: string, autorId: string): TarefaChecklist | undefined {
    const idx = this.db.tarefas.findIndex(t => t.id === taskId);
    if (idx >= 0) {
      const tarefa = this.db.tarefas[idx];
      const novaConclusao = tarefa.estado !== 'concluida';
      this.db.tarefas[idx] = {
        ...tarefa,
        estado: novaConclusao ? 'concluida' : 'pendente',
        concluidaEm: novaConclusao ? new Date().toISOString() : undefined,
        concluidaPor: novaConclusao ? autorId : undefined,
      };
      this.logAuditLocal(tarefa.empresaId, 'CURSOS', tarefa.cursoId, 'UPDATE', `Tarefa "${tarefa.titulo}" marcada como ${novaConclusao ? 'concluída' : 'pendente'}`, autorId);
      this.persist();
      return this.db.tarefas[idx];
    }
    return undefined;
  }

  // --- Módulo Financeiro (Módulo Local) ---
  public getFinancialRecords(empresaId = this.getActiveOrgId(), cursoId?: string): (RegistroFinanceiro & { cursoNome?: string })[] {
    let list = this.db.financeiro.filter(f => f.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(f => f.cursoId === cursoId);
    }
    return list.map(f => {
      const c = f.cursoId ? this.db.cursos.find(cur => cur.id === f.cursoId) : undefined;
      return { ...f, cursoNome: c?.nomeCurso };
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  public addFinancialRecord(
    data: Omit<RegistroFinanceiro, 'id'>,
    autorId: string
  ): RegistroFinanceiro {
    const id = `fin-${Date.now()}`;
    const novo: RegistroFinanceiro = {
      ...data,
      id,
    };
    this.db.financeiro.unshift(novo);
    this.logAuditLocal(data.empresaId, 'FINANCEIRO', id, 'CREATE', `Movimento financeiro: ${data.descricao} (${data.valor} Kz)`, autorId);
    this.persist();
    return novo;
  }

  // --- Auditoria Imutável (Junção de Supabase Audit Log + Módulos Locais) ---
  private logAuditLocal(
    empresaId: string,
    entidade: HistoricoAuditoria['entidade'],
    entidadeId: string,
    operacao: HistoricoAuditoria['operacao'],
    resumo: string,
    autorId: string
  ) {
    const log: HistoricoAuditoria = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      empresaId,
      entidade,
      entidadeId,
      operacao,
      resumoAlteracao: resumo,
      executadoPor: autorId,
      timestamp: new Date().toISOString(),
    };
    this.db.auditoria.unshift(log);
  }

  public getAuditHistory(empresaId = this.getActiveOrgId()): (HistoricoAuditoria & { autorNome: string })[] {
    const localLogs = this.db.auditoria
      .filter(a => a.empresaId === empresaId)
      .map(a => {
        const pessoa = safeFindPessoa(this.db.pessoas, a.executadoPor);
        return {
          ...a,
          autorNome: pessoa.nomeCompleto,
        };
      });

    const supabaseLogs = this.supabaseAuditLogs
      .filter(a => a.empresaId === empresaId)
      .map(a => {
        const pessoa = safeFindPessoa(this.db.pessoas, a.executadoPor);
        return {
          ...a,
          autorNome: pessoa.nomeCompleto,
        };
      });

    return [...supabaseLogs, ...localLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // --- Dashboard: Fórmulas Matemáticas Rigorosas dos 8 Indicadores ---
  public calculateDashboardKPIs(empresaId = this.getActiveOrgId(), filters?: Partial<FiltrosDashboard>): IndicadoresDashboard {
    const cursosFiltrados = this.getCourses(empresaId, filters);
    const cursosIds = cursosFiltrados.map(c => c.id);

    const totalAcoes = cursosFiltrados.length;

    const avaliacoesFinais = this.db.avaliacoes.filter(
      a => a.empresaId === empresaId && cursosIds.includes(a.cursoId) && a.tipoAvaliacao === 'conhecimentos_formando' && a.eAvaliacaoFinal
    );

    const formandosAvaliadosSet = new Set(avaliacoesFinais.map(a => a.avaliadoId));
    const formandosAvaliados = formandosAvaliadosSet.size;

    const aprovadosCount = avaliacoesFinais.filter(a => a.resultado === 'aprovado').length;
    const taxaAprovacao = formandosAvaliados > 0 ? Math.round((aprovadosCount / formandosAvaliados) * 100) : 0;

    const avaliacoesSatisfacao = this.db.avaliacoes.filter(
      a => a.empresaId === empresaId && cursosIds.includes(a.cursoId) && a.tipoAvaliacao === 'satisfacao_formacao' && a.notaNumerica > 0
    );
    const somaNotasSatisfacao = avaliacoesSatisfacao.reduce((acc, a) => acc + a.notaNumerica, 0);
    const satisfacaoMedia = avaliacoesSatisfacao.length > 0 ? Number((somaNotasSatisfacao / avaliacoesSatisfacao.length).toFixed(1)) : 0;

    const avaliacoesDocentes = this.db.avaliacoes.filter(
      a => a.empresaId === empresaId && cursosIds.includes(a.cursoId) && a.tipoAvaliacao === 'desempenho_formador' && a.notaNumerica > 0
    );
    const somaNotasDocentes = avaliacoesDocentes.reduce((acc, a) => acc + a.notaNumerica, 0);
    const avaliacaoFormadores = avaliacoesDocentes.length > 0 ? Number((somaNotasDocentes / avaliacoesDocentes.length).toFixed(1)) : 0;

    const certificadosEmitidos = this.db.certificados.filter(
      c => c.empresaId === empresaId && cursosIds.includes(c.cursoId) && c.estado === 'emitido'
    ).length;

    const ocorrenciasTotal = this.db.ocorrencias.filter(
      o => o.empresaId === empresaId && (o.cursoId ? cursosIds.includes(o.cursoId) : true)
    ).length;

    const avaliacoesComRecomendacao = avaliacoesSatisfacao.filter(a => a.recomendaria !== undefined);
    const recomendacoesSim = avaliacoesComRecomendacao.filter(a => a.recomendaria === true).length;
    const taxaRecomendacao = avaliacoesComRecomendacao.length > 0 ? Math.round((recomendacoesSim / avaliacoesComRecomendacao.length) * 100) : 0;

    return {
      totalAcoes,
      taxaAprovacao,
      satisfacaoMedia,
      avaliacaoFormadores,
      formandosAvaliados,
      certificadosEmitidos,
      ocorrenciasTotal,
      taxaRecomendacao,
    };
  }

  public getMonthlyEvolution(empresaId = this.getActiveOrgId(), filters?: Partial<FiltrosDashboard>) {
    const cursosAno = this.getCourses(empresaId, filters);
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses.map((mesNome, idx) => {
      const mesNum = idx + 1;
      const count = cursosAno.filter(c => c.mes === mesNum).length;
      return { mes: mesNome, acoes: count };
    });
  }

  public getStatusDistribution(empresaId = this.getActiveOrgId(), filters?: Partial<FiltrosDashboard>) {
    const cursos = this.getCourses(empresaId, filters);
    return [
      { nome: 'Agendado', valor: cursos.filter(c => c.estadoCurso === 'agendado').length, cor: '#D99B24' },
      { nome: 'Em Andamento', valor: cursos.filter(c => c.estadoCurso === 'em_andamento').length, cor: '#183B5B' },
      { nome: 'Realizado', valor: cursos.filter(c => c.estadoCurso === 'realizado').length, cor: '#16866A' },
      { nome: 'Cancelado', valor: cursos.filter(c => c.estadoCurso === 'cancelado').length, cor: '#D32F2F' },
    ];
  }
}

export const dataService = new DataService();
