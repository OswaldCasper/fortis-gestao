/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * DataService: Camada de Acesso aos Dados (Repositório Desacoplado)
 * Isola a interface React do backend e implementa todas as validações de integridade e auditoria
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

const STORAGE_KEY = 'fortis_db_v1';

interface DBState {
  organizacoes: Organizacao[];
  pessoas: Pessoa[];
  membros: MembroOrganizacao[];
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

class DataService {
  private db: DBState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.db = this.loadFromStorage();
  }

  private loadFromStorage(): DBState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Falha ao restaurar base de dados local:', e);
      }
    }
    return {
      organizacoes: [INITIAL_ORGANIZACAO],
      pessoas: INITIAL_PESSOAS,
      membros: INITIAL_MEMBROS,
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

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.db = this.loadFromStorage();
    this.notify();
  }

  // Registo de Auditoria Imutável (Apenas executado no backend/serviço)
  private logAudit(
    empresaId: string,
    entidade: HistoricoAuditoria['entidade'],
    entidadeId: string,
    operacao: HistoricoAuditoria['operacao'],
    resumo: string,
    autorId: string,
    anterior?: any,
    novo?: any
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
      dadosAnteriores: anterior,
      dadosNovos: novo,
    };
    this.db.auditoria.unshift(log);
  }

  // --- Organizações e Membros ---
  public getOrganization(orgId = DEMO_ORG_ID): Organizacao {
    const org = this.db.organizacoes.find(o => o.id === orgId);
    return org || INITIAL_ORGANIZACAO;
  }

  public updateOrganization(orgId: string, updates: Partial<Organizacao>, autorId: string): Organizacao {
    const idx = this.db.organizacoes.findIndex(o => o.id === orgId);
    if (idx >= 0) {
      const anterior = this.db.organizacoes[idx];
      this.db.organizacoes[idx] = { ...anterior, ...updates };
      this.logAudit(orgId, 'MEMBROS', orgId, 'UPDATE', 'Atualização dos dados cadastrais da organização', autorId, anterior, this.db.organizacoes[idx]);
      this.persist();
      return this.db.organizacoes[idx];
    }
    return INITIAL_ORGANIZACAO;
  }

  public getMembers(empresaId = DEMO_ORG_ID): MembroOrganizacao[] {
    return this.db.membros.filter(m => m.empresaId === empresaId);
  }

  public getPeople(empresaId = DEMO_ORG_ID): (Pessoa & { membro?: MembroOrganizacao })[] {
    const membros = this.getMembers(empresaId);
    return this.db.pessoas.map(p => {
      const membro = membros.find(m => m.pessoaId === p.id);
      return { ...p, membro };
    });
  }

  public getTrainers(empresaId = DEMO_ORG_ID): (Pessoa & { membro: MembroOrganizacao; cursosMinistrados: number })[] {
    const membros = this.getMembers(empresaId).filter(m => m.papelAcesso === 'formador' || m.funcoesProfissionais.some(f => f.toLowerCase().includes('formador')));
    return membros.map(m => {
      const pessoa = this.db.pessoas.find(p => p.id === m.pessoaId)!;
      const cursosCount = this.db.cursoFormadores.filter(cf => cf.formadorId === pessoa.id && cf.empresaId === empresaId).length;
      return {
        ...pessoa,
        membro: m,
        cursosMinistrados: cursosCount,
      };
    });
  }

  public getTrainees(empresaId = DEMO_ORG_ID): (Pessoa & { membro?: MembroOrganizacao; totalInscricoes: number })[] {
    const trainees = this.db.pessoas.filter(p => {
      const membro = this.db.membros.find(m => m.pessoaId === p.id && m.empresaId === empresaId);
      const temInscricoes = this.db.inscricoes.some(i => i.formandoId === p.id && i.empresaId === empresaId);
      return (membro && membro.papelAcesso === 'formando') || temInscricoes;
    });

    return trainees.map(p => {
      const membro = this.db.membros.find(m => m.pessoaId === p.id && m.empresaId === empresaId);
      const totalInscricoes = this.db.inscricoes.filter(i => i.formandoId === p.id && i.empresaId === empresaId).length;
      return { ...p, membro, totalInscricoes };
    });
  }

  // --- Cursos & Ações de Formação ---
  public getCourses(empresaId = DEMO_ORG_ID, filters?: Partial<FiltrosDashboard>): Curso[] {
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
    this.logAudit(newCourse.empresaId, 'CURSOS', id, 'CREATE', `Criação da ação "${newCourse.nomeCurso}"`, autorId, null, newCourse);
    this.persist();
    return newCourse;
  }

  public updateCourse(cursoId: string, updates: Partial<Curso>, autorId: string): Curso | undefined {
    const idx = this.db.cursos.findIndex(c => c.id === cursoId);
    if (idx >= 0) {
      const anterior = this.db.cursos[idx];
      this.db.cursos[idx] = { ...anterior, ...updates };
      this.logAudit(anterior.empresaId, 'CURSOS', cursoId, 'UPDATE', `Atualização da ação "${this.db.cursos[idx].nomeCurso}"`, autorId, anterior, this.db.cursos[idx]);
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
      this.logAudit(anterior.empresaId, 'CURSOS', cursoId, 'STATUS_CHANGE', `Alteração de estado de ${anterior.estadoCurso} para ${novoEstado}`, autorId, anterior, this.db.cursos[idx]);
      this.persist();
      return this.db.cursos[idx];
    }
    return undefined;
  }

  // Encerramento Administrativo Independente
  public toggleCourseClosure(cursoId: string, autorId: string): { success: boolean; message: string; course?: Curso } {
    const idx = this.db.cursos.findIndex(c => c.id === cursoId);
    if (idx < 0) return { success: false, message: 'Curso não encontrado' };
    const curso = this.db.cursos[idx];

    if (!curso.encerrado) {
      // Verificar se existem tarefas obrigatórias pendentes
      const tarefasObrigatoriasPendentes = this.db.tarefas.filter(t => t.cursoId === cursoId && t.obrigatoriaParaEncerramento && t.estado !== 'concluida');
      if (tarefasObrigatoriasPendentes.length > 0) {
        return {
          success: false,
          message: `Não é possível encerrar: Existem ${tarefasObrigatoriasPendentes.length} tarefa(s) obrigatória(s) pendente(s) no checklist pedagógico.`,
        };
      }

      this.db.cursos[idx] = {
        ...curso,
        encerrado: true,
        dataEncerramento: new Date().toISOString(),
        encerradoPor: autorId,
        conformidadePercent: 100,
      };
      this.logAudit(curso.empresaId, 'CURSOS', cursoId, 'CLOSE', `Encerramento formal administrativo do curso "${curso.nomeCurso}"`, autorId);
      this.persist();
      return { success: true, message: 'Curso encerrado formalmente com sucesso.', course: this.db.cursos[idx] };
    } else {
      // Reabrir administrativamente
      this.db.cursos[idx] = {
        ...curso,
        encerrado: false,
        dataEncerramento: undefined,
        encerradoPor: undefined,
      };
      this.logAudit(curso.empresaId, 'CURSOS', cursoId, 'STATUS_CHANGE', `Reabertura administrativa do curso "${curso.nomeCurso}"`, autorId);
      this.persist();
      return { success: true, message: 'Curso reaberto administrativamente.', course: this.db.cursos[idx] };
    }
  }

  // --- Formadores Associados ao Curso ---
  public getCourseTrainers(cursoId: string): (CursoFormador & { pessoa: Pessoa })[] {
    const allocations = this.db.cursoFormadores.filter(cf => cf.cursoId === cursoId);
    return allocations.map(cf => {
      const pessoa = this.db.pessoas.find(p => p.id === cf.formadorId)!;
      return { ...cf, pessoa };
    });
  }

  public assignTrainerToCourse(data: Omit<CursoFormador, 'id'>, autorId: string): CursoFormador {
    const id = `cf-${Date.now()}`;
    const newAssoc: CursoFormador = { ...data, id };
    this.db.cursoFormadores.push(newAssoc);
    this.logAudit(data.empresaId, 'CURSOS', data.cursoId, 'UPDATE', `Alocação do formador ${data.formadorId} à ação`, autorId);
    this.persist();
    return newAssoc;
  }

  // --- Sessões e Presenças ---
  public getCourseSessions(cursoId: string): Sessao[] {
    return this.db.sessoes.filter(s => s.cursoId === cursoId).sort((a, b) => a.numeroSessao - b.numeroSessao);
  }

  public createSession(data: Omit<Sessao, 'id'>, autorId: string): { success: boolean; message?: string; session?: Sessao } {
    // Validação de Integridade: Verificar se o formador responsável está alocado ao curso
    const formadoresCurso = this.db.cursoFormadores.filter(cf => cf.cursoId === data.cursoId);
    const formadorValido = formadoresCurso.some(cf => cf.formadorId === data.formadorPrincipalId);
    if (!formadorValido && formadoresCurso.length > 0) {
      return { success: false, message: 'O formador responsável selecionado não pertence à lista de formadores alocados a este curso.' };
    }

    const id = `ses-${Date.now()}`;
    const newSession: Sessao = { ...data, id };
    this.db.sessoes.push(newSession);
    this.logAudit(data.empresaId, 'CURSOS', data.cursoId, 'UPDATE', `Agendamento da Sessão ${data.numeroSessao} para ${data.data}`, autorId);
    this.persist();
    return { success: true, session: newSession };
  }

  public getSessionAttendance(sessaoId: string): (Presenca & { formando: Pessoa })[] {
    const presencas = this.db.presencas.filter(p => p.sessaoId === sessaoId);
    return presencas.map(p => {
      const formando = this.db.pessoas.find(pes => pes.id === p.formandoId)!;
      return { ...p, formando };
    });
  }

  public saveAttendanceBatch(presencas: Omit<Presenca, 'id' | 'registadoPor' | 'registadoEm'>[], autorId: string) {
    if (presencas.length === 0) return;
    const sessaoId = presencas[0].sessaoId;
    const cursoId = presencas[0].cursoId;
    const empresaId = presencas[0].empresaId;

    // Remover anteriores da mesma sessão e substituir
    this.db.presencas = this.db.presencas.filter(p => p.sessaoId !== sessaoId);

    const novos: Presenca[] = presencas.map((p, idx) => ({
      ...p,
      id: `pre-${Date.now()}-${idx}`,
      registadoPor: autorId,
      registadoEm: new Date().toISOString(),
    }));

    this.db.presencas.push(...novos);
    this.logAudit(empresaId, 'PRESENCAS', sessaoId, 'UPDATE', `Registo de presenças para a sessão ${sessaoId} (${novos.length} formandos)`, autorId);
    this.persist();
  }

  // --- Inscrições ---
  public getCourseEnrollments(cursoId: string): (Inscricao & { formando: Pessoa })[] {
    const list = this.db.inscricoes.filter(i => i.cursoId === cursoId);
    return list.map(i => {
      const formando = this.db.pessoas.find(p => p.id === i.formandoId)!;
      return { ...i, formando };
    });
  }

  public enrollStudent(cursoId: string, formandoId: string, valorPago: number, autorId: string, empresaId = DEMO_ORG_ID): { success: boolean; message: string; inscricao?: Inscricao } {
    const existente = this.db.inscricoes.find(i => i.cursoId === cursoId && i.formandoId === formandoId);
    if (existente) {
      return { success: false, message: 'Este formando já está inscrito neste curso.' };
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

    // Registar automaticamente receita financeira se valor > 0
    if (valorPago > 0) {
      const formando = this.db.pessoas.find(p => p.id === formandoId);
      this.db.financeiro.push({
        id: `fin-rec-${Date.now()}`,
        empresaId,
        cursoId,
        tipo: 'receita',
        categoria: 'taxa_inscricao',
        descricao: `Taxa de Inscrição: ${formando?.nomeCompleto || 'Formando'} - ${curso.nomeCurso}`,
        valor: valorPago,
        data: new Date().toISOString().split('T')[0],
      });
    }

    this.logAudit(empresaId, 'CURSOS', cursoId, 'UPDATE', `Inscrição confirmada para o formando ${formandoId}`, autorId);
    this.persist();
    return { success: true, message: 'Formando inscrito com sucesso.', inscricao: nova };
  }

  // --- Avaliações ---
  public getCourseEvaluations(cursoId: string): (Avaliacao & { avaliador: Pessoa; avaliadoNome: string })[] {
    const evals = this.db.avaliacoes.filter(a => a.cursoId === cursoId);
    return evals.map(a => {
      const avaliador = this.db.pessoas.find(p => p.id === a.avaliadorId) || { nomeCompleto: 'Sistema' } as Pessoa;
      let avaliadoNome = '';
      if (a.tipoAvaliacao === 'conhecimentos_formando') {
        const f = this.db.pessoas.find(p => p.id === a.avaliadoId);
        avaliadoNome = f ? f.nomeCompleto : 'Formando';
      } else if (a.tipoAvaliacao === 'desempenho_formador') {
        const formador = this.db.pessoas.find(p => p.id === a.avaliadoId);
        avaliadoNome = formador ? formador.nomeCompleto : 'Formador';
      } else {
        avaliadoNome = 'Ação de Formação Global';
      }
      return { ...a, avaliador, avaliadoNome };
    });
  }

  public saveEvaluation(data: Omit<Avaliacao, 'id'>, autorId: string): Avaliacao {
    // Se for eAvaliacaoFinal, desmarcar anteriores do mesmo formando neste curso
    if (data.eAvaliacaoFinal) {
      this.db.avaliacoes.forEach(a => {
        if (a.cursoId === data.cursoId && a.avaliadoId === data.avaliadoId && a.tipoAvaliacao === 'conhecimentos_formando') {
          a.eAvaliacaoFinal = false;
        }
      });
    }

    const id = `ava-${Date.now()}`;
    const nova: Avaliacao = { ...data, id };
    this.db.avaliacoes.push(nova);
    this.logAudit(data.empresaId, 'AVALIACOES', id, 'CREATE', `Lançamento de avaliação (${data.tipoAvaliacao}: nota ${data.notaNumerica})`, autorId);
    this.persist();
    return nova;
  }

  // --- Certificados ---
  public getCertificates(empresaId = DEMO_ORG_ID, cursoId?: string): (Certificado & { formando: Pessoa; curso: Curso })[] {
    let list = this.db.certificados.filter(c => c.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(c => c.cursoId === cursoId);
    }
    return list.map(c => {
      const formando = this.db.pessoas.find(p => p.id === c.formandoId)!;
      const curso = this.db.cursos.find(cur => cur.id === c.cursoId)!;
      return { ...c, formando, curso };
    });
  }

  public issueCertificate(cursoId: string, formandoId: string, autorId: string, empresaId = DEMO_ORG_ID): { success: boolean; message: string; certificate?: Certificado } {
    const curso = this.getCourseById(cursoId);
    if (!curso) return { success: false, message: 'Curso não encontrado.' };

    // Verificar se formando foi aprovado na avaliação final
    const avaliacaoFinal = this.db.avaliacoes.find(a => a.cursoId === cursoId && a.avaliadoId === formandoId && a.eAvaliacaoFinal);
    if (!avaliacaoFinal || avaliacaoFinal.resultado !== 'aprovado') {
      return { success: false, message: 'O certificado só pode ser emitido para formandos com aprovação comprovada na avaliação final.' };
    }

    // Verificar se já possui certificado emitido ativo
    const ativo = this.db.certificados.find(c => c.cursoId === cursoId && c.formandoId === formandoId && c.estado === 'emitido');
    if (ativo) {
      return { success: false, message: `Já existe um certificado válido emitido para este formando (${ativo.codigoValidacao}). Para nova emissão, utilize a opção de 2ª via.` };
    }

    const hash = `FORTIS-${curso.ano}-${curso.id.substring(4, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const cert: Certificado = {
      id: `cert-${Date.now()}`,
      empresaId,
      cursoId,
      formandoId,
      codigoValidacao: hash,
      numeroVia: 1,
      cargaHoraria: 40,
      dataEmissao: new Date().toISOString().split('T')[0],
      emitidoPor: autorId,
      estado: 'emitido',
      qrCodePayload: `https://fortis.academy/validar/${hash}`,
    };

    this.db.certificados.unshift(cert);
    this.logAudit(empresaId, 'CERTIFICADOS', cert.id, 'CREATE', `Emissão de Certificado ${hash} para formando ${formandoId}`, autorId);
    this.persist();
    return { success: true, message: 'Certificado emitido com sucesso.', certificate: cert };
  }

  public revokeCertificate(certId: string, motivo: string, autorId: string): boolean {
    const cert = this.db.certificados.find(c => c.id === certId);
    if (cert) {
      cert.estado = 'revogado';
      cert.motivoRevogacao = motivo;
      this.logAudit(cert.empresaId, 'CERTIFICADOS', certId, 'REVOKE', `Revogação de certificado (${cert.codigoValidacao}): ${motivo}`, autorId);
      this.persist();
      return true;
    }
    return false;
  }

  public reissueCertificate(certId: string, autorId: string): Certificado | null {
    const cert = this.db.certificados.find(c => c.id === certId);
    if (!cert) return null;

    cert.estado = 'reemitido';
    const novoHash = `FORTIS-2VIA-${Date.now().toString(36).toUpperCase()}`;
    const novo: Certificado = {
      ...cert,
      id: `cert-${Date.now()}`,
      codigoValidacao: novoHash,
      numeroVia: cert.numeroVia + 1,
      dataEmissao: new Date().toISOString().split('T')[0],
      estado: 'emitido',
      codigoSubstituido: cert.codigoValidacao,
      qrCodePayload: `https://fortis.academy/validar/${novoHash}`,
    };

    this.db.certificados.unshift(novo);
    this.logAudit(cert.empresaId, 'CERTIFICADOS', novo.id, 'CREATE', `Reemissão (2ª Via) do certificado ${cert.codigoValidacao} -> ${novoHash}`, autorId);
    this.persist();
    return novo;
  }

  // --- Qualidade e Ocorrências ISO 9001 ---
  public getOccurrences(empresaId = DEMO_ORG_ID, cursoId?: string): (Ocorrencia & { responsavel: Pessoa; curso?: Curso })[] {
    let list = this.db.ocorrencias.filter(o => o.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(o => o.cursoId === cursoId);
    }
    return list.map(o => {
      const responsavel = this.db.pessoas.find(p => p.id === o.responsavelId) || { nomeCompleto: 'Não atribuído' } as Pessoa;
      const curso = o.cursoId ? this.db.cursos.find(c => c.id === o.cursoId) : undefined;
      return { ...o, responsavel, curso };
    });
  }

  public saveOccurrence(data: Omit<Ocorrencia, 'id' | 'codigo' | 'dataRegisto'>, autorId: string): Ocorrencia {
    const ano = new Date().getFullYear();
    const count = this.db.ocorrencias.length + 1;
    const codigo = `NC-${ano}-${String(count).padStart(3, '0')}`;

    const nova: Ocorrencia = {
      ...data,
      id: `oco-${Date.now()}`,
      codigo,
      dataRegisto: new Date().toISOString(),
    };
    this.db.ocorrencias.unshift(nova);
    this.logAudit(data.empresaId, 'OCORRENCIAS', nova.id, 'CREATE', `Registo de Ocorrência ${codigo}: ${data.descricaoProblema}`, autorId);
    this.persist();
    return nova;
  }

  public updateOccurrence(ocId: string, updates: Partial<Ocorrencia>, autorId: string): Ocorrencia | undefined {
    const idx = this.db.ocorrencias.findIndex(o => o.id === ocId);
    if (idx >= 0) {
      const anterior = this.db.ocorrencias[idx];
      this.db.ocorrencias[idx] = { ...anterior, ...updates };
      this.logAudit(anterior.empresaId, 'OCORRENCIAS', ocId, 'UPDATE', `Atualização da Ocorrência ${anterior.codigo}`, autorId);
      this.persist();
      return this.db.ocorrencias[idx];
    }
    return undefined;
  }

  // --- Tarefas / Checklist Pedagógico ---
  public getTasks(empresaId = DEMO_ORG_ID, cursoId?: string): (TarefaChecklist & { responsavel: Pessoa; diasRestantes: number; grupoTemporal: string })[] {
    let list = this.db.tarefas.filter(t => t.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(t => t.cursoId === cursoId);
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return list.map(t => {
      const responsavel = this.db.pessoas.find(p => p.id === t.responsavelId) || { nomeCompleto: 'Responsável' } as Pessoa;
      const dataLimiteDate = new Date(t.dataLimite);
      dataLimiteDate.setHours(0, 0, 0, 0);

      const diffTime = dataLimiteDate.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Cálculo Dinâmico do Agrupamento Temporal
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
      this.logAudit(tarefa.empresaId, 'CURSOS', tarefa.cursoId, 'UPDATE', `Tarefa "${tarefa.titulo}" marcada como ${novaConclusao ? 'concluída' : 'pendente'}`, autorId);
      this.persist();
      return this.db.tarefas[idx];
    }
    return undefined;
  }

  // --- Módulo Financeiro ---
  public getFinancialRecords(empresaId = DEMO_ORG_ID, cursoId?: string): (RegistroFinanceiro & { cursoNome?: string })[] {
    let list = this.db.financeiro.filter(f => f.empresaId === empresaId);
    if (cursoId && cursoId !== 'Todos') {
      list = list.filter(f => f.cursoId === cursoId);
    }
    return list.map(f => {
      const c = f.cursoId ? this.db.cursos.find(cur => cur.id === f.cursoId) : undefined;
      return { ...f, cursoNome: c?.nomeCurso };
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  public addFinancialRecord(data: Omit<RegistroFinanceiro, 'id'>, autorId: string): RegistroFinanceiro {
    const id = `fin-${Date.now()}`;
    const novo: RegistroFinanceiro = { ...data, id };
    this.db.financeiro.unshift(novo);
    this.logAudit(data.empresaId, 'FINANCEIRO', id, 'CREATE', `Registo financeiro (${data.tipo}): ${data.descricao} - ${data.valor} Kz`, autorId);
    this.persist();
    return novo;
  }

  // --- Auditoria ---
  public getAuditHistory(empresaId = DEMO_ORG_ID): (HistoricoAuditoria & { autorNome: string })[] {
    return this.db.auditoria
      .filter(a => a.empresaId === empresaId)
      .map(a => {
        const pessoa = this.db.pessoas.find(p => p.id === a.executadoPor);
        return {
          ...a,
          autorNome: pessoa ? pessoa.nomeCompleto : 'Sistema Automático',
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // --- Dashboard: Fórmulas Matemáticas Rigorosas dos 8 Indicadores ---
  public calculateDashboardKPIs(empresaId = DEMO_ORG_ID, filters?: Partial<FiltrosDashboard>): IndicadoresDashboard {
    const cursosFiltrados = this.getCourses(empresaId, filters);
    const cursosIds = cursosFiltrados.map(c => c.id);

    // 1. Total de Ações
    const totalAcoes = cursosFiltrados.length;

    // 2. Formandos Avaliados Únicos & Taxa de Aprovação (com desduplicação por eAvaliacaoFinal)
    const avaliacoesFinais = this.db.avaliacoes.filter(
      a => a.empresaId === empresaId && cursosIds.includes(a.cursoId) && a.tipoAvaliacao === 'conhecimentos_formando' && a.eAvaliacaoFinal
    );

    const formandosAvaliadosSet = new Set(avaliacoesFinais.map(a => a.avaliadoId));
    const formandosAvaliados = formandosAvaliadosSet.size;

    const aprovadosCount = avaliacoesFinais.filter(a => a.resultado === 'aprovado').length;
    const taxaAprovacao = formandosAvaliados > 0 ? Math.round((aprovadosCount / formandosAvaliados) * 100) : 0;

    // 3. Satisfação Média (Escala 1 a 5)
    const avaliacoesSatisfacao = this.db.avaliacoes.filter(
      a => a.empresaId === empresaId && cursosIds.includes(a.cursoId) && a.tipoAvaliacao === 'satisfacao_formacao' && a.notaNumerica > 0
    );
    const satisfacaoMedia = avaliacoesSatisfacao.length > 0
      ? Number((avaliacoesSatisfacao.reduce((acc, curr) => acc + curr.notaNumerica, 0) / avaliacoesSatisfacao.length).toFixed(1))
      : 0;

    // 4. Avaliação de Formadores (Escala 1 a 5)
    const avaliacoesDocentes = this.db.avaliacoes.filter(
      a => a.empresaId === empresaId && cursosIds.includes(a.cursoId) && a.tipoAvaliacao === 'desempenho_formador' && a.notaNumerica > 0
    );
    const avaliacaoFormadores = avaliacoesDocentes.length > 0
      ? Number((avaliacoesDocentes.reduce((acc, curr) => acc + curr.notaNumerica, 0) / avaliacoesDocentes.length).toFixed(1))
      : 0;

    // 5. Certificados Emitidos
    const certificadosEmitidos = this.db.certificados.filter(
      c => c.empresaId === empresaId && cursosIds.includes(c.cursoId) && c.estado === 'emitido'
    ).length;

    // 6. Ocorrências (Cursos filtrados + gerais da org se filtro for 'Todos')
    const ocorrencias = this.db.ocorrencias.filter(o => {
      if (o.empresaId !== empresaId) return false;
      if (o.cursoId) {
        return cursosIds.includes(o.cursoId);
      }
      return (!filters?.cursoId || filters.cursoId === 'Todos');
    }).length;

    // 7. Taxa de Recomendação (% de formandos que responderam Sim)
    const respostasRecomendacao = avaliacoesSatisfacao.filter(a => a.recomendaria !== undefined);
    const taxaRecomendacao = respostasRecomendacao.length > 0
      ? Math.round((respostasRecomendacao.filter(a => a.recomendaria === true).length / respostasRecomendacao.length) * 100)
      : 0;

    return {
      totalAcoes,
      taxaAprovacao,
      satisfacaoMedia,
      avaliacaoFormadores,
      formandosAvaliados,
      certificadosEmitidos,
      ocorrenciasTotal: ocorrencias,
      taxaRecomendacao,
    };
  }

  // Dados para Gráficos
  public getMonthlyEvolution(empresaId = DEMO_ORG_ID, filters?: Partial<FiltrosDashboard>) {
    const cursos = this.getCourses(empresaId, filters);
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const contagens = new Array(12).fill(0);

    cursos.forEach(c => {
      const mesIdx = c.mes >= 1 && c.mes <= 12 ? c.mes - 1 : 0;
      contagens[mesIdx]++;
    });

    return meses.map((mes, idx) => ({
      mes,
      acoes: contagens[idx],
    }));
  }

  public getStatusDistribution(empresaId = DEMO_ORG_ID, filters?: Partial<FiltrosDashboard>) {
    const cursos = this.getCourses(empresaId, filters);
    const counts = {
      agendado: 0,
      em_andamento: 0,
      realizado: 0,
      cancelado: 0,
    };

    cursos.forEach(c => {
      if (counts[c.estadoCurso] !== undefined) {
        counts[c.estadoCurso]++;
      }
    });

    return [
      { nome: 'Agendado', valor: counts.agendado, cor: '#F59E0B' },
      { nome: 'Em Andamento', valor: counts.em_andamento, cor: '#3B82F6' },
      { nome: 'Realizado', valor: counts.realizado, cor: '#10B981' },
      { nome: 'Cancelado', valor: counts.cancelado, cor: '#EF4444' },
    ];
  }
}

export const dataService = new DataService();
