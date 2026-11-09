/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * App: Orquestrador principal da aplicação com navegação modular, provedores de tema e autorização RBAC
 */

import React, { useState, useCallback } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, ActiveModule } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/auth/LoginView';

// Módulos da Aplicação
import { DashboardView } from './components/dashboard/DashboardView';
import { CoursesView, CourseActionModal } from './components/courses/CoursesView';
import { TasksView } from './components/tasks/TasksView';
import { CatalogView } from './components/catalog/CatalogView';
import { TrainersView } from './components/trainers/TrainersView';
import { PeopleView } from './components/people/PeopleView';
import { CertificatesView } from './components/certificates/CertificatesView';
import { QualityView } from './components/quality/QualityView';
import { FinanceView } from './components/finance/FinanceView';
import { DocumentsView } from './components/documents/DocumentsView';
import { MessagesView } from './components/messages/MessagesView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditView } from './components/audit/AuditView';
import { CompanyDataView } from './components/settings/CompanyDataView';
import { AppearanceSettings } from './components/settings/AppearanceSettings';
import { ProfileView } from './components/profile/ProfileView';

// Módulos já migrados para persistência oficial no Supabase (Fase 1)
const MODULOS_MIGRADOS: ActiveModule[] = [
  'empresa',
  'formandos',
  'formadores',
  'auditoria',
  'aparencia',
  'perfil',
];

const MainLayout: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    hasNoOrgAccess,
    currentUser,
    simulatedRole,
    simulateRole,
    logout,
  } = useAuth();

  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (currentUser?.id) {
      const saved = localStorage.getItem(`fortis_sidebar_collapsed_${currentUser.id}`);
      if (saved !== null) return saved === 'true';
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Estado para navegação contextual direta nos Cursos (ex: de Tarefas, Dashboard ou Presenças)
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
  const [courseInitialModal, setCourseInitialModal] = useState<CourseActionModal>(null);

  // Contador para forçar refresh dos componentes ao clicar no botão de atualização
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Sincronizar estado de recolhimento da sidebar por utilizador
  React.useEffect(() => {
    if (currentUser?.id) {
      const saved = localStorage.getItem(`fortis_sidebar_collapsed_${currentUser.id}`);
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    }
  }, [currentUser?.id]);

  const handleToggleCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (currentUser?.id) {
        localStorage.setItem(`fortis_sidebar_collapsed_${currentUser.id}`, String(next));
      }
      return next;
    });
  }, [currentUser?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleNavigate = useCallback((module: ActiveModule) => {
    setIsMobileSidebarOpen(false);
    if (module === 'presencas') {
      setCourseInitialModal('pauta');
      setActiveModule('cursos');
      return;
    }
    if (module === 'avaliacoes') {
      setCourseInitialModal('avaliacoes');
      setActiveModule('cursos');
      return;
    }
    setCourseInitialModal(null);
    setActiveModule(module);
  }, []);

  const handleSelectCourseFromDashboard = useCallback((cursoId: string) => {
    setIsMobileSidebarOpen(false);
    setSelectedCourseId(cursoId);
    setCourseInitialModal(null);
    setActiveModule('cursos');
  }, []);

  // Ecrã de carregamento inicial
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F6F9] dark:bg-[#0B111B]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-2xl text-white shadow-md animate-pulse"
            style={{ backgroundColor: 'var(--fortis-primary)' }}
          >
            F
          </div>
          <p className="text-xs text-[#5B6B7C] dark:text-[#94A3B8] font-medium">
            A inicializar o FORTIS ELM…
          </p>
        </div>
      </div>
    );
  }

  // Se o utilizador não estiver autenticado, exibe ecrã de início de sessão
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Se o utilizador não possuir associação activa a nenhuma organização
  if (hasNoOrgAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] dark:bg-[#0B111B] p-4">
        <div className="bg-white dark:bg-[#152232] rounded-3xl border border-[#E3E8EF] dark:border-[#223347] shadow-xl max-w-md w-full p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#D99B24] flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-[#1B2A3A] dark:text-[#F1F5F9]">
              Sem acesso a organizações
            </h2>
            <p className="text-xs text-[#5B6B7C] dark:text-[#94A3B8] leading-relaxed">
              A sua conta não tem nenhuma associação activa a uma organização no FORTIS. Contacte o administrador da sua entidade para obter acesso.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1B2A3A] dark:text-[#F1F5F9] transition-colors"
            >
              <LogOut size={14} /> Terminar sessão
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentModuleMigrated = MODULOS_MIGRADOS.includes(activeModule);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] dark:bg-[#0B111B] text-[#1B2A3A] dark:text-[#F1F5F9] font-sans">
      {/* Barra Lateral de Navegação Modular */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra Superior Executiva (56px) */}
        <Header
          activeModule={activeModule}
          onNavigate={handleNavigate}
          onRefreshData={handleRefresh}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
          onSelectCourse={handleSelectCourseFromDashboard}
        />

        {/* Banner Persistente de Simulação de Perfil (se activo) */}
        {simulatedRole && (
          <aside
            aria-label="Aviso de simulação de perfil"
            className="px-4 py-2 bg-[#FEF7EB] dark:bg-[#382808]/40 border-b border-[#F9E2B6] dark:border-[#523B0C] flex items-center justify-between text-xs text-[#966308] dark:text-[#E8AA35] shrink-0"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>
                <strong>Simulação activa ({simulatedRole}):</strong> só altera a interface; as permissões reais do backend não mudam.
              </span>
            </div>
            <button
              onClick={() => simulateRole(null)}
              className="text-[11px] font-bold underline hover:no-underline ml-4"
            >
              Repor Perfil Real
            </button>
          </aside>
        )}

        {/* Banner Discreto para Módulos Locais ainda não migrados na Fase 1 */}
        {!isCurrentModuleMigrated && (
          <aside
            aria-label="Aviso de dados de demonstração local"
            className="px-4 py-1.5 bg-[#F8FAFC] dark:bg-[#101B2A] border-b border-[#E3E8EF] dark:border-[#223347] flex items-center justify-between text-[11px] text-[#5B6B7C] dark:text-[#94A3B8] shrink-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8896A6]" />
              <span>Dados locais de demonstração (ainda não ligados à base de dados)</span>
            </div>
            <span className="text-[10px] font-mono text-[#8896A6]">Fase 2</span>
          </aside>
        )}

        {/* Ecrã Ativo com Scroll Suave */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8" key={refreshKey}>
          {activeModule === 'dashboard' && (
            <DashboardView
              onNavigateModule={handleNavigate}
              onSelectCourse={handleSelectCourseFromDashboard}
            />
          )}

          {activeModule === 'cursos' && (
            <CoursesView
              initialCourseId={selectedCourseId}
              initialActionModal={courseInitialModal}
              onOpenCertificates={() => handleNavigate('certificados')}
              onOpenTasks={() => handleNavigate('tarefas')}
            />
          )}

          {activeModule === 'tarefas' && <TasksView />}

          {activeModule === 'formacoes' && <CatalogView />}

          {activeModule === 'formadores' && <TrainersView />}

          {activeModule === 'formandos' && <PeopleView />}

          {activeModule === 'certificados' && <CertificatesView />}

          {activeModule === 'qualidade' && <QualityView />}

          {activeModule === 'financeiro' && <FinanceView />}

          {activeModule === 'documentos' && <DocumentsView />}

          {activeModule === 'mensagens' && <MessagesView />}

          {activeModule === 'relatorios' && <ReportsView />}

          {activeModule === 'auditoria' && <AuditView />}

          {activeModule === 'empresa' && <CompanyDataView />}

          {activeModule === 'aparencia' && <AppearanceSettings />}

          {activeModule === 'perfil' && <ProfileView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
