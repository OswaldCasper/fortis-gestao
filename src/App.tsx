/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FORTIS — Sistema Integrado de Gestão da Formação
 * App: Orquestrador principal da aplicação com navegação modular, provedores de tema e autorização RBAC
 */

import React, { useState, useCallback } from 'react';
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

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  
  // Estado para navegação contextual direta nos Cursos (ex: de Tarefas, Dashboard ou Presenças)
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
  const [courseInitialModal, setCourseInitialModal] = useState<CourseActionModal>(null);
  
  // Contador para forçar refresh dos componentes ao clicar no botão de atualização
  const [refreshKey, setRefreshKey] = useState<number>(0);

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

  // Se o utilizador não estiver autenticado, exibe ecrã de início de sessão (image 1)
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Barra Lateral de Navegação Modular */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra Superior Executiva */}
        <Header
          activeModule={activeModule}
          onNavigate={handleNavigate}
          onRefreshData={handleRefresh}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
        />

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
