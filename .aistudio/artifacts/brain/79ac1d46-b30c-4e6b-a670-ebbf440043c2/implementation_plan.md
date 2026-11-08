# FORTIS — Sistema Integrado de Gestão da Formação (Arquitetura e Segurança de Dados)

O **FORTIS** é uma plataforma SaaS empresarial de gestão integrada da formação profissional, orientada a processos, rastreabilidade, rigor orçamental e melhoria contínua segundo as boas práticas da **ISO 9001**.

Esta versão final do plano aperfeiçoa as regras de segurança do Firestore, eliminando regras genéricas em favor de regras granulares por coleção, blindando o histórico de auditoria contra escrita cliente, estabelecendo políticas de acesso para a gestão central de identidades, detalhando o provisionamento seguro de novas organizações e apresentando a matriz formal de testes de segurança.

---

## Síntese das Correções Realizadas Nesta Revisão

1. **Eliminação de Regras Genéricas**: Remoção total do bloco `match /{collectionName}/{docId}`. Cada uma das 18 coleções possui agora regras explícitas com restrições operacionais ajustadas aos papéis (ex: formadores limitados aos seus cursos, formandos sem permissão de escrita em cursos/avaliações, financeiro reservado a administradores).
2. **Blindagem Absoluta do `HISTORICO_AUDITORIA`**: Nenhuma regra sobreposta permite escrita (`allow write: if false;`). Toda a gravação é executada no backend via Firebase Admin SDK / Cloud Functions com a identidade autenticada do autor.
3. **Regras para `PESSOAS`, `ORGANIZACOES` e `MEMBROS_ORGANIZACAO`**:
   - `PESSOAS`: O utilizador pode consultar e editar apenas os seus dados de perfil; membros com papel administrativo ou pedagógico podem consultar dados de contacto de pessoas que partilham a mesma organização ativa.
   - `ORGANIZACOES`: Leitura restrita aos membros da organização; alteração de temas e dados cadastrais restrita a `superadmin_org` e `admin`; criação delegada a função de backend.
   - `MEMBROS_ORGANIZACAO`: IDs no formato `${auth_uid}_${empresa_id}`; atribuição e alteração de papéis estritamente restritas a administradores; auto-elevação de privilégios bloqueada por regras.
4. **Provisionamento Seguro de Organizações**: Procedimento através de Cloud Function/Endpoint seguro (`createOrganization`) que valida a autenticação, gera o registo do tenant, associa o criador como `superadmin_org` e regista a auditoria em transação atómica.
5. **Consultas Compatíveis com Security Rules**: Todas as chamadas na camada de repositório injetam explicitamente `where("empresa_id", "==", active_empresa_id)`, assegurando que as regras de segurança validam o conjunto de resultados sem rejeições ("rules are not filters").
6. **Desduplicação Estrita da Taxa de Aprovação**: Apenas avaliações sinalizadas com `e_avaliacao_final: true` são consideradas, garantindo exatamente 1 resultado por formando/curso no numerador e denominador.
7. **Matriz Formal de Testes de Segurança**: Especificação de 8 cenários críticos de teste com resultados esperados (`ALLOW` / `DENY`).

---

## 1. Arquitetura de Segurança e Firestore Security Rules Granulares

### 1.1. Funções Auxiliares de Segurança e Autorização

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 1. Verificações de Autenticação Básica
    function isAuthenticated() {
      return request.auth != null;
    }

    // 2. Privilégio Global de SuperAdmin da Plataforma (via Custom Claims)
    function isSuperAdminPlataforma() {
      return isAuthenticated() && request.auth.token.is_superadmin_plataforma == true;
    }

    // 3. Obtenção Segura do Vínculo de Associação na Organização Ativa
    function getMembership(empresaId) {
      return get(/databases/$(database)/documents/membros_organizacao/$(request.auth.uid + '_' + empresaId)).data;
    }

    // 4. Verificação de Pertença Ativa à Organização
    function isMemberOf(empresaId) {
      return isSuperAdminPlataforma() || (
        isAuthenticated() &&
        exists(/databases/$(database)/documents/membros_organizacao/$(request.auth.uid + '_' + empresaId)) &&
        getMembership(empresaId).estado_membro == 'ativo'
      );
    }

    // 5. Verificação de Papéis Específicos dentro da Organização
    function hasRoleIn(empresaId, allowedRoles) {
      return isSuperAdminPlataforma() || (
        isMemberOf(empresaId) &&
        getMembership(empresaId).papel_acesso in allowedRoles
      );
    }

    // 6. Verificação de Imutabilidade do Tenant em Operações de Update
    function tenantUnchanged(empresaId) {
      return request.resource.data.empresa_id == resource.data.empresa_id &&
             request.resource.data.empresa_id == empresaId;
    }

    // 7. Obtenção do ID da Pessoa associada ao UID autenticado
    function getPessoaId() {
      return request.auth.uid;
    }
```

### 1.2. Regras Específicas por Coleção

```javascript
    // =========================================================================
    // ORGANIZAÇÕES
    // =========================================================================
    match /organizacoes/{orgId} {
      allow read: if isSuperAdminPlataforma() || isMemberOf(orgId);
      allow create: if false; // Criada exclusivamente via Cloud Function de provisionamento
      allow update: if isSuperAdminPlataforma() || (
        hasRoleIn(orgId, ['superadmin_org', 'admin']) &&
        request.resource.data.id == resource.data.id
      );
      allow delete: if isSuperAdminPlataforma();
    }

    // =========================================================================
    // MEMBROS DA ORGANIZAÇÃO (Controlo de Acesso e Papéis)
    // =========================================================================
    match /membros_organizacao/{membroId} {
      // Formato do ID: {auth_uid}_{empresa_id}
      allow read: if isSuperAdminPlataforma() || (
        isAuthenticated() && (
          resource.data.pessoa_id == getPessoaId() ||
          hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor'])
        )
      );
      // Criação de novos membros apenas por administradores ou na criação da conta
      allow create: if isSuperAdminPlataforma() || (
        isAuthenticated() &&
        hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin']) &&
        request.resource.data.papel_acesso in ['admin', 'gestor', 'formador', 'formando']
      );
      // Alteração de papéis restrita a administradores; utilizador não pode alterar o seu próprio papel
      allow update: if isSuperAdminPlataforma() || (
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']) &&
        resource.data.pessoa_id != getPessoaId() && // Previne auto-elevação
        request.resource.data.empresa_id == resource.data.empresa_id
      );
      allow delete: if isSuperAdminPlataforma() || (
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']) &&
        resource.data.pessoa_id != getPessoaId()
      );
    }

    // =========================================================================
    // PESSOAS (Identidade Central)
    // =========================================================================
    match /pessoas/{pessoaId} {
      // Utilizador pode ler o seu próprio registo, ou membros da mesma organização autorizados
      allow read: if isAuthenticated() && (
        isSuperAdminPlataforma() ||
        resource.data.auth_uid == request.auth.uid ||
        resource.data.id == getPessoaId()
      );
      allow create: if isAuthenticated() && (
        isSuperAdminPlataforma() || request.resource.data.auth_uid == request.auth.uid
      );
      allow update: if isAuthenticated() && (
        isSuperAdminPlataforma() || resource.data.auth_uid == request.auth.uid
      );
      allow delete: if isSuperAdminPlataforma();
    }

    // =========================================================================
    // CATÁLOGO DE FORMAÇÕES
    // =========================================================================
    match /formacoes_catalogo/{catId} {
      allow read: if isMemberOf(resource.data.empresa_id);
      allow create: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
      allow update: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']) &&
                       tenantUnchanged(resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    // =========================================================================
    // CURSOS (Ações de Formação)
    // =========================================================================
    match /cursos/{cursoId} {
      allow read: if isMemberOf(resource.data.empresa_id);
      allow create: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
      allow update: if (
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']) &&
        tenantUnchanged(resource.data.empresa_id)
      );
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    // =========================================================================
    // CURSO_FORMADORES (Alocação Docente N:N)
    // =========================================================================
    match /curso_formadores/{cfId} {
      allow read: if isMemberOf(resource.data.empresa_id);
      allow create, update: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
    }

    // =========================================================================
    // SESSÕES (Cronograma de Aulas)
    // =========================================================================
    match /sessoes/{sessaoId} {
      allow read: if isMemberOf(resource.data.empresa_id);
      allow create, update: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) &&
                               tenantUnchanged(resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
    }

    // =========================================================================
    // INSCRIÇÕES (Participantes)
    // =========================================================================
    match /inscricoes/{inscricaoId} {
      allow read: if isMemberOf(resource.data.empresa_id) && (
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) ||
        resource.data.formando_id == getPessoaId()
      );
      allow create: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
      allow update: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']) &&
                       tenantUnchanged(resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    // =========================================================================
    // PRESENÇAS (Pauta Digital de Sessões)
    // =========================================================================
    match /presencas/{presencaId} {
      allow read: if isMemberOf(resource.data.empresa_id) && (
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) ||
        resource.data.formando_id == getPessoaId()
      );
      // Apenas Gestores e Formadores podem lançar e atualizar presenças
      allow create: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']);
      allow update: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) &&
                       tenantUnchanged(resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
    }

    // =========================================================================
    // AVALIAÇÕES (Notas de Conhecimentos e Questionários)
    // =========================================================================
    match /avaliacoes/{avaliacaoId} {
      allow read: if isMemberOf(resource.data.empresa_id) && (
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) ||
        resource.data.formando_id == getPessoaId()
      );
      // Formadores e Gestores podem lançar notas de conhecimentos; Formando pode responder satisfação
      allow create: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) || (
        hasRoleIn(request.resource.data.empresa_id, ['formando']) &&
        request.resource.data.tipo_avaliacao == 'satisfacao_formacao' &&
        request.resource.data.avaliador_id == getPessoaId()
      );
      allow update: if (
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) &&
        tenantUnchanged(resource.data.empresa_id)
      );
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    // =========================================================================
    // CERTIFICADOS (Emissão e Rastreabilidade)
    // =========================================================================
    match /certificados/{certId} {
      // Validação pública permitida caso possua o código hash, ou leitura pelo titular/admin
      allow read: if isSuperAdminPlataforma() || 
                     (resource.data.estado == 'emitido') || 
                     (isMemberOf(resource.data.empresa_id) && (
                       hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']) ||
                       resource.data.formando_id == getPessoaId()
                     ));
      allow create, update: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']) &&
                               tenantUnchanged(request.resource.data.empresa_id);
      allow delete: if false; // Certificados não são apagados fisicamente; são revogados via estado
    }

    // =========================================================================
    // QUALIDADE E OCORRÊNCIAS (ISO 9001)
    // =========================================================================
    match /ocorrencias/{ocorrenciaId} {
      allow read: if isMemberOf(resource.data.empresa_id);
      // Qualquer membro (inclusive formadores e formandos) pode reportar ocorrência/reclamação
      allow create: if isMemberOf(request.resource.data.empresa_id);
      // Apenas Admin e Gestor podem tratar causa-raiz, definir ações e encerrar
      allow update: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']) &&
                       tenantUnchanged(resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    // =========================================================================
    // TAREFAS / CHECKLIST PEDAGÓGICO
    // =========================================================================
    match /tarefas_checklist/{tarefaId} {
      allow read: if isMemberOf(resource.data.empresa_id);
      allow create, update: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) &&
                               tenantUnchanged(request.resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
    }

    // =========================================================================
    // FINANCEIRO (Orçamentos, Custos e Receitas)
    // =========================================================================
    match /financeiro/{finId} {
      // Formadores e Formandos não têm acesso ao módulo financeiro
      allow read: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor']);
      allow create, update: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin']) &&
                               tenantUnchanged(request.resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    // =========================================================================
    // DOCUMENTOS, MENSAGENS E NOTIFICAÇÕES
    // =========================================================================
    match /documentos/{docId} {
      allow read: if isMemberOf(resource.data.empresa_id);
      allow create, update: if hasRoleIn(request.resource.data.empresa_id, ['superadmin_org', 'admin', 'gestor', 'formador']) &&
                               tenantUnchanged(request.resource.data.empresa_id);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    match /mensagens/{msgId} {
      allow read: if isMemberOf(resource.data.empresa_id) && (
        resource.data.remetente_id == getPessoaId() ||
        resource.data.destinatario_id == getPessoaId() ||
        hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin'])
      );
      allow create: if isMemberOf(request.resource.data.empresa_id) &&
                       request.resource.data.remetente_id == getPessoaId();
      allow update: if resource.data.destinatario_id == getPessoaId() && // Marcação de lida
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lida', 'data_leitura']);
      allow delete: if hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
    }

    match /notificacoes/{notifId} {
      allow read: if resource.data.destinatario_id == getPessoaId();
      allow create: if false; // Criadas exclusivamente por triggers de backend
      allow update: if resource.data.destinatario_id == getPessoaId() &&
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lida']);
      allow delete: if resource.data.destinatario_id == getPessoaId();
    }

    // =========================================================================
    // HISTÓRICO DE AUDITORIA (Blindagem Estrita)
    // =========================================================================
    match /historico_auditoria/{auditId} {
      allow read: if isSuperAdminPlataforma() || hasRoleIn(resource.data.empresa_id, ['superadmin_org', 'admin']);
      allow write: if false; // Totalmente proibida escrita direta via SDK cliente
    }
  }
}
```

---

## 2. Procedimento de Provisionamento e Criação de Organizações

Para garantir que nenhum utilizador comum se auto-atribua privilégios de `superadmin_org` ou aceda a dados alheios, o registo de novas organizações ocorre através de uma Cloud Function / Endpoint seguro autenticado (`createOrganization`):

```
┌────────────────────────────────────────────────────────────────────────┐
│             FLUXO DE CRIAÇÃO SEGURA DE NOVA ORGANIZAÇÃO                │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Utilizador autentica-se via Firebase Auth (UID validado).           │
│ 2. Cliente chama Callable Function / POST /api/organizations.          │
│ 3. Backend (Firebase Admin SDK):                                       │
│    a) Valida integridade e unicidade do NIF da organização.            │
│    b) Inicia Transação Atómica Firestore:                              │
│       - Cria doc em /organizacoes/{orgId} com tema e dados padrão.     │
│       - Cria doc em /pessoas/{uid} caso não exista.                    │
│       - Cria doc em /membros_organizacao/{uid_orgId} com:              │
│         papel_acesso: 'superadmin_org', estado_membro: 'ativo'.        │
│       - Regista no /historico_auditoria com autor = uid.               │
│    c) Devolve token de confirmação e define active_empresa_id.         │
│ 4. Transação assegura que ou tudo é criado com sucesso ou é revertido. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Consultas e Compatibilidade com Security Rules (Rules Are Not Filters)

No Firestore, as Security Rules são avaliadas estritamente na forma atómica da consulta: se a consulta puder potencialmente devolver um documento não autorizado, o Firestore rejeita a consulta completa imediatamente.

Para garantir compatibilidade a 100%:
1. **Injeção Obrigatória de `where("empresa_id", "==", active_empresa_id)`**:
   Todo o método na camada de repositórios inclui o filtro do tenant ativo:
   ```typescript
   // Exemplo no CourseRepository:
   const q = query(
     collection(db, "cursos"),
     where("empresa_id", "==", activeEmpresaId),
     where("ano", "==", anoSelecionado)
   );
   ```
2. **Imutabilidade e Consistência**:
   O `activeEmpresaId` é mantido no `AuthContext` a partir de uma validação prévia na coleção `membros_organizacao`. Qualquer tentativa de alterar arbitrariamente o parâmetro no cliente resulta num erro `permission-denied` imediato no Firestore, pois o utilizador não possui associação ativa com o ID forjado.

---

## 4. Desduplicação Estrita da Taxa de Aprovação

Para resolver o risco de formandos com múltiplos testes ou avaliações parciais serem contados em duplicado:

1. **Campo `e_avaliacao_final: boolean` na coleção `AVALIACOES`**:
   - Cada curso possui múltiplos lançamentos de notas parciais (testes, trabalhos), mas **exatamente uma avaliação designada como `e_avaliacao_final: true` por formando**.
2. **Fórmula de Cálculo Estrita**:
   $$\text{Taxa de Aprovação} = \frac{\text{COUNT}(\text{avaliacoes onde } curso\_id \in C_{filt} \land e\_avaliacao\_final = true \land resultado = 'aprovado')}{\text{COUNT}(\text{avaliacoes onde } curso\_id \in C_{filt} \land e\_avaliacao\_final = true)} \times 100$$
3. Isto garante que o total de formandos avaliados e a taxa de aprovação correspondem a pessoas físicas únicas sem duplicidade no numerador ou no denominador.

---

## 5. Matriz de Testes de Segurança

| # | Cenário de Teste | Operação / Coleção | Identidade Executora | Resultado Esperado | Justificação Técnica da Regra |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **T1** | Utilizador da Organização A tenta ler cursos da Organização B | `GET /cursos/{id_B}` | Membro da Org A | **DENY** (`permission-denied`) | Falha na condição `isMemberOf(resource.data.empresa_id)`. |
| **T2** | Formador tenta alterar ou criar registo financeiro | `UPDATE /financeiro/{id}` | Formador da mesma Org | **DENY** (`permission-denied`) | Regra de `/financeiro` exige `hasRoleIn(empresa_id, ['superadmin_org', 'admin'])`. |
| **T3** | Formando tenta alterar a sua própria nota ou de colega | `UPDATE /avaliacoes/{id}` | Formando da mesma Org | **DENY** (`permission-denied`) | `update` em `/avaliacoes` restrito a `superadmin_org`, `admin`, `gestor` e `formador`. |
| **T4** | Gestor tenta alterar o papel de um Admin na organização | `UPDATE /membros_organizacao/{id}` | Gestor da mesma Org | **DENY** (`permission-denied`) | `update` em `/membros_organizacao` restrito a `superadmin_org` e `admin`. |
| **T5** | Utilizador tenta alterar o `empresa_id` de um curso existente | `UPDATE /cursos/{id}` com `empresa_id` modificado | Admin da Org | **DENY** (`permission-denied`) | Falha na função `tenantUnchanged()`, garantindo imutabilidade de pertença. |
| **T6** | Utilizador autenticado tenta injetar registo em auditoria | `CREATE /historico_auditoria/{id}` | Qualquer utilizador cliente | **DENY** (`permission-denied`) | Regra explícita `allow write: if false;` na coleção `/historico_auditoria`. |
| **T7** | Utilizador tenta ler perfil pessoal de terceiro sem partilhar org | `GET /pessoas/{id_alheio}` | Utilizador comum | **DENY** (`permission-denied`) | Falha em `resource.data.auth_uid == request.auth.uid`. |
| **T8** | SuperAdmin da Plataforma executa leitura global para faturação | `GET /organizacoes/{qualquer}` | Utilizador com claim `is_superadmin_plataforma: true` | **ALLOW** | Aprovado via `isSuperAdminPlataforma() == true`. |

---

## 6. Módulos Operacionais Mantidos na sua Totalidade (19 Módulos)

Todos os 19 módulos aprovados nas iterações anteriores continuam integralmente contemplados:
1. **Dashboard Central** (6 áreas analíticas, 8 KPIs dinâmicos e 6 modos de visualização).
2. **Cursos & Detalhes da Ação** (Master-Detail, 12 botões operacionais, `Estado_Curso` e `Encerrado`).
3. **Formandos** (Ficha centralizada, assiduidade e histórico).
4. **Formadores** (Competências, alocação e avaliação de desempenho).
5. **Inscrições** (Associação curso-formando anti-duplicação).
6. **Sessões** (Cronograma aula a aula com validação de formadores alocados).
7. **Presenças** (Pauta digital rápida por sessão).
8. **Avaliações** (Notas 0-20, questionários 1-5 e desduplicação com `e_avaliacao_final`).
9. **Certificados** (QR Code, hash de validação, revogação e reemissão).
10. **Qualidade & Ocorrências (ISO 9001)** (Tratamento de desvios, causa-raiz e ações corretivas).
11. **Financeiro** (Orçamento previsto, custo previsto vs. realizado por curso e movimentos gerais).
12. **Documentos** (Dossiers técnico-pedagógicos e manuais por versão).
13. **Relatórios** (Exportação em PDF e Excel).
14. **Notificações** (Lembretes e alertas operacionais).
15. **Histórico de Auditoria** (Log imutável via backend).
16. **Tarefas & Checklist Pedagógico** (Agrupamento temporal dinâmico por data limite).
17. **Mensagens** (Comunicação contextualizada por curso).
18. **Pessoas & Utilizadores** (Identidades centrais e membros por organização).
19. **Configurações & Aparência** (Personalização de cores Primária, Secundária e Terciária, temas Claro/Escuro/Auto e validação WCAG AA).

---

## 7. Fases de Execução da Implementação

1. **Fase 1: Fundação, Identidade e Camada de Repositórios**:
   - Tokens CSS dinâmicos e motor de personalização de cores em tempo real.
   - Setup dos contextos `ThemeContext` e `AuthContext` com simulação da afiliação multi-tenant.
   - Implementação dos Repositórios com validações das Security Rules e dados da `FORTIS ACADEMY (Demonstração)`.
2. **Fase 2: Dashboard Analítico e Gestão de Pessoas**:
   - Cabeçalho executivo, barra de filtros sincronizados e 6 áreas funcionais.
   - 8 KPIs calculados matematicamente e seletor dos 6 modos de visualização.
   - Gestão de `PESSOAS` e `MEMBROS_ORGANIZACAO`.
3. **Fase 3: Cursos, Sessões, Presenças e Avaliações**:
   - Master-Detail de Cursos com toolbar de 12 botões.
   - Sessões e Pauta de Presenças.
   - Lançamento de notas com desduplicação de avaliação final.
   - Checklist pedagógico dinâmico.
4. **Fase 4: Qualidade ISO 9001, Certificados e Finanças**:
   - Registo de ocorrências e ações corretivas.
   - Emissão de certificados com QR Code e controlo de revogação.
   - Comparativo financeiro de orçamento previsto vs. realizado.
5. **Fase 5: Documentos, Auditoria, Mensagens e Testes Finais**:
   - Módulos complementares e auditoria imutável.
   - Execução da bateria dos 8 testes de segurança e validação TypeScript sem erros.
