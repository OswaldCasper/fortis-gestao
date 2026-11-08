/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * TasksView: Gestão de Tarefas e Checklist Pedagógico com agrupamento temporal dinâmico (image 5)
 */

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { PrioridadeTarefa } from '../../types';

export const TasksView: React.FC = () => {
  const { currentUser, currentOrg } = useAuth();
  const [tasks, setTasks] = useState(() => dataService.getTasks(currentOrg.id));
  const [filterCourse, setFilterCourse] = useState('Todos');
  const [filterGroup, setFilterGroup] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTaskForm, setNewTaskForm] = useState({
    cursoId: '',
    titulo: '',
    descricao: '',
    dataLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    prioridade: 'media' as PrioridadeTarefa,
    obrigatoriaParaEncerramento: true,
  });

  React.useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setTasks(dataService.getTasks(currentOrg.id));
    });
    return unsub;
  }, [currentOrg.id]);

  const courses = useMemo(() => dataService.getCourses(currentOrg.id), [currentOrg.id]);

  // Filtragem
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchCourse = filterCourse === 'Todos' || t.cursoId === filterCourse;
      const matchGroup = filterGroup === 'Todos' || t.grupoTemporal === filterGroup;
      const matchStatus = filterStatus === 'Todos' || (filterStatus === 'concluida' ? t.estado === 'concluida' : t.estado !== 'concluida');
      const matchSearch = t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || t.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCourse && matchGroup && matchStatus && matchSearch;
    });
  }, [tasks, filterCourse, filterGroup, filterStatus, searchTerm]);

  // Agrupamentos calculados dinamicamente
  const groups = ['Todos', 'Daqui a 3 Dias', 'Últimos 7 Dias', 'Daqui a 15 Dias', 'Últimos 30 Dias', 'Em Atraso', 'Outras Datas'];

  const handleToggle = (taskId: string) => {
    dataService.toggleTaskState(taskId, currentUser.id);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.cursoId && courses.length > 0) {
      newTaskForm.cursoId = courses[0].id;
    }

    // Inserir na base de dados
    const id = `tar-${Date.now()}`;
    const task = {
      id,
      empresaId: currentOrg.id,
      cursoId: newTaskForm.cursoId || courses[0]?.id || 'cur-geral',
      titulo: newTaskForm.titulo,
      descricao: newTaskForm.descricao,
      responsavelId: currentUser.id,
      dataLimite: newTaskForm.dataLimite,
      prioridade: newTaskForm.prioridade,
      obrigatoriaParaEncerramento: newTaskForm.obrigatoriaParaEncerramento,
      estado: 'pendente' as const,
    };

    // Acesso ao serviço
    const currentTasks = (dataService as any).db.tarefas;
    currentTasks.unshift(task);
    (dataService as any).persist();

    setShowAddModal(false);
    setNewTaskForm({
      cursoId: '',
      titulo: '',
      descricao: '',
      dataLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prioridade: 'media',
      obrigatoriaParaEncerramento: true,
    });
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare size={20} style={{ color: 'var(--fortis-primary)' }} />
            <span>Tarefas & Checklist Pedagógico</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controlo de prazos e conformidade operacional segundo as boas práticas da ISO 9001
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm hover:opacity-95 flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: 'var(--fortis-primary)' }}
        >
          <Plus size={14} />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Barra de Filtros e Agrupamentos Temporais (Matching image 5) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar tarefas..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Todos">Todos os Cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.nomeCurso}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Todos">Todos os Estados</option>
              <option value="pendente">Não Feito</option>
              <option value="concluida">Concluído</option>
            </select>
          </div>
        </div>

        {/* Agrupamento Temporal Dinâmico em Pílulas / Abas (Matching AppSheet) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {groups.map(grp => (
            <button
              key={grp}
              onClick={() => setFilterGroup(grp)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                filterGroup === grp
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Tarefas Estilo AppSheet Elevado (Image 5) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(t => {
            const isDone = t.estado === 'concluida';
            const course = courses.find(c => c.id === t.cursoId);

            return (
              <div
                key={t.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors flex items-start gap-4"
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => handleToggle(t.id)}
                  className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {t.titulo}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {isDone ? 'Feito' : 'Não Feito'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {course ? course.nomeCurso : 'Organização Geral'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span className="tabular-nums">{t.dataLimite}</span>
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {t.grupoTemporal}
                    </span>
                    <span>·</span>
                    <span>Resp: {t.responsavel.nomeCompleto}</span>
                    {t.obrigatoriaParaEncerramento && (
                      <>
                        <span>·</span>
                        <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                          <AlertCircle size={10} /> Obrigatória ISO 9001
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </div>
        )}
      </div>

      {/* Modal Adicionar Tarefa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Nova Tarefa Pedagógica</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.titulo}
                  onChange={e => setNewTaskForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Preparar recursos didáticos da formação"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Curso Associado</label>
                <select
                  value={newTaskForm.cursoId}
                  onChange={e => setNewTaskForm(f => ({ ...f, cursoId: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCurso}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Limite Concreta</label>
                <input
                  type="date"
                  required
                  value={newTaskForm.dataLimite}
                  onChange={e => setNewTaskForm(f => ({ ...f, dataLimite: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-iso"
                  checked={newTaskForm.obrigatoriaParaEncerramento}
                  onChange={e => setNewTaskForm(f => ({ ...f, obrigatoriaParaEncerramento: e.target.checked }))}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="chk-iso" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Tarefa obrigatória para encerramento formal ISO 9001
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-amber-600 hover:bg-amber-700"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
