/**
 * Módulo de testes para a integração com Notion
 * 
 * Este arquivo contém funções para testar e validar a conexão
 * e funcionalidades do Notion AI Assistant
 */

import { notionClient, notionServices, initializeNotion } from './index';
import { config } from '../config/config';

/**
 * Classe para executar testes da integração Notion
 */
export class NotionTester {
  
  /**
   * Executa todos os testes de validação
   */
  async runAllTests(): Promise<{
    success: boolean;
    results: any[];
    summary: string;
  }> {
    console.log('🧪 Iniciando testes da integração Notion...');
    
    const results = [];
    let successCount = 0;
    
    // Teste 1: Conexão básica
    console.log('\n1️⃣ Testando conexão básica...');
    const connectionTest = await this.testConnection();
    results.push(connectionTest);
    if (connectionTest.success) successCount++;
    
    // Teste 2: Validação de databases
    console.log('\n2️⃣ Testando validação de databases...');
    const databaseTest = await this.testDatabaseValidation();
    results.push(databaseTest);
    if (databaseTest.success) successCount++;
    
    // Teste 3: Operações CRUD de tarefas
    console.log('\n3️⃣ Testando operações de tarefas...');
    const taskTest = await this.testTaskOperations();
    results.push(taskTest);
    if (taskTest.success) successCount++;
    
    // Teste 4: Operações de notas
    console.log('\n4️⃣ Testando operações de notas...');
    const noteTest = await this.testNoteOperations();
    results.push(noteTest);
    if (noteTest.success) successCount++;
    
    // Teste 5: Operações de projetos
    console.log('\n5️⃣ Testando operações de projetos...');
    const projectTest = await this.testProjectOperations();
    results.push(projectTest);
    if (projectTest.success) successCount++;
    
    // Teste 6: Dashboard e estatísticas
    console.log('\n6️⃣ Testando dashboard e estatísticas...');
    const dashboardTest = await this.testDashboardOperations();
    results.push(dashboardTest);
    if (dashboardTest.success) successCount++;
    
    const totalTests = results.length;
    const success = successCount === totalTests;
    
    const summary = `\n📊 RESUMO DOS TESTES:\n` +
                   `✅ Sucessos: ${successCount}/${totalTests}\n` +
                   `❌ Falhas: ${totalTests - successCount}/${totalTests}\n` +
                   `🎯 Taxa de sucesso: ${Math.round((successCount / totalTests) * 100)}%\n` +
                   `${success ? '🎉 Todos os testes passaram!' : '⚠️ Alguns testes falharam'}`;
    
    console.log(summary);
    
    return {
      success,
      results,
      summary
    };
  }
  
  /**
   * Testa a conexão básica com o Notion
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const initialization = await initializeNotion();
      
      if (initialization.success) {
        console.log('✅ Conexão estabelecida com sucesso');
        return {
          success: true,
          message: 'Conexão com Notion estabelecida',
          details: initialization.validation
        };
      } else {
        console.log('❌ Falha na conexão:', initialization.message);
        return {
          success: false,
          message: initialization.message,
          details: initialization.validation
        };
      }
    } catch (error) {
      console.log('❌ Erro na conexão:', (error as Error).message);
      return {
        success: false,
        message: 'Erro ao conectar: ' + (error as Error).message
      };
    }
  }
  
  /**
   * Testa a validação das databases
   */
  async testDatabaseValidation(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const validation = await notionServices.validateDatabases();
      
      if (validation.isValid) {
        console.log('✅ Todas as databases estão configuradas');
        console.log('📋 Databases encontradas:', validation.databases.map(db => db.title).join(', '));
        return {
          success: true,
          message: 'Databases validadas com sucesso',
          details: validation
        };
      } else {
        console.log('❌ Problemas nas databases:', validation.errors.join(', '));
        return {
          success: false,
          message: 'Erro na validação: ' + validation.errors.join(', '),
          details: validation
        };
      }
    } catch (error) {
      console.log('❌ Erro na validação:', (error as Error).message);
      return {
        success: false,
        message: 'Erro na validação: ' + (error as Error).message
      };
    }
  }
  
  /**
   * Testa operações CRUD de tarefas
   */
  async testTaskOperations(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Criar uma tarefa de teste
      console.log('📝 Criando tarefa de teste...');
      const testTask = await notionServices.createTask({
        title: '🧪 Tarefa de Teste - ' + new Date().toISOString(),
        description: 'Esta é uma tarefa criada automaticamente para testar a integração',
        priority: 'Média',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias no futuro
      });
      
      console.log('✅ Tarefa criada:', testTask.title);
      
      // Listar tarefas
      console.log('📋 Listando tarefas...');
      const tasks = await notionServices.getPendingTasks();
      console.log(`✅ ${tasks.length} tarefas encontradas`);
      
      // Atualizar tarefa
      console.log('🔄 Atualizando tarefa...');
      const updatedTask = await notionServices.startTask(testTask.id);
      console.log('✅ Tarefa atualizada para:', updatedTask.status);
      
      // Completar tarefa
      console.log('✅ Completando tarefa...');
      const completedTask = await notionServices.completeTask(testTask.id);
      console.log('✅ Tarefa completada:', completedTask.status);
      
      // Deletar tarefa de teste
      console.log('🗑️ Removendo tarefa de teste...');
      await notionClient.deleteTask(testTask.id);
      console.log('✅ Tarefa removida');
      
      return {
        success: true,
        message: 'Operações de tarefa executadas com sucesso',
        details: {
          created: testTask,
          updated: updatedTask,
          completed: completedTask
        }
      };
    } catch (error) {
      console.log('❌ Erro nas operações de tarefa:', (error as Error).message);
      return {
        success: false,
        message: 'Erro nas operações de tarefa: ' + (error as Error).message
      };
    }
  }
  
  /**
   * Testa operações de notas
   */
  async testNoteOperations(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Criar uma nota de teste
      console.log('📝 Criando nota de teste...');
      const testNote = await notionServices.createNote({
        title: '🧪 Nota de Teste - ' + new Date().toISOString(),
        content: 'Esta é uma nota criada automaticamente para testar a integração com o Notion AI Assistant.',
        tags: ['teste', 'automação', 'notion']
      });
      
      console.log('✅ Nota criada:', testNote.title);
      
      // Listar notas
      console.log('📋 Listando notas...');
      const notes = await notionServices.getAllNotes();
      console.log(`✅ ${notes.length} notas encontradas`);
      
      // Buscar notas por tag
      console.log('🔍 Buscando notas por tag...');
      const taggedNotes = await notionServices.getNotesByTag('teste');
      console.log(`✅ ${taggedNotes.length} notas com tag 'teste' encontradas`);
      
      return {
        success: true,
        message: 'Operações de nota executadas com sucesso',
        details: {
          created: testNote,
          totalNotes: notes.length,
          taggedNotes: taggedNotes.length
        }
      };
    } catch (error) {
      console.log('❌ Erro nas operações de nota:', (error as Error).message);
      return {
        success: false,
        message: 'Erro nas operações de nota: ' + (error as Error).message
      };
    }
  }
  
  /**
   * Testa operações de projetos
   */
  async testProjectOperations(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Criar um projeto de teste
      console.log('📁 Criando projeto de teste...');
      const testProject = await notionServices.createProject({
        name: '🧪 Projeto de Teste - ' + new Date().toISOString(),
        description: 'Este é um projeto criado automaticamente para testar a integração',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias no futuro
      });
      
      console.log('✅ Projeto criado:', testProject.name);
      
      // Listar projetos
      console.log('📋 Listando projetos...');
      const projects = await notionServices.getActiveProjects();
      console.log(`✅ ${projects.length} projetos ativos encontrados`);
      
      return {
        success: true,
        message: 'Operações de projeto executadas com sucesso',
        details: {
          created: testProject,
          activeProjects: projects.length
        }
      };
    } catch (error) {
      console.log('❌ Erro nas operações de projeto:', (error as Error).message);
      return {
        success: false,
        message: 'Erro nas operações de projeto: ' + (error as Error).message
      };
    }
  }
  
  /**
   * Testa operações do dashboard
   */
  async testDashboardOperations(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Obter resumo do dashboard
      console.log('📊 Obtendo resumo do dashboard...');
      const summary = await notionServices.getDashboardSummary();
      console.log('✅ Resumo obtido:', {
        tarefas: summary.totalTasks,
        projetos: summary.totalProjects,
        notas: summary.totalNotes
      });
      
      // Obter estatísticas de produtividade
      console.log('📈 Obtendo estatísticas de produtividade...');
      const stats = await notionServices.getProductivityStats(7);
      console.log('✅ Estatísticas obtidas:', {
        tarefasConcluídas: stats.tasksCompleted,
        tarefasCriadas: stats.tasksCreated,
        notasCriadas: stats.notesCreated
      });
      
      return {
        success: true,
        message: 'Operações de dashboard executadas com sucesso',
        details: {
          summary,
          stats
        }
      };
    } catch (error) {
      console.log('❌ Erro nas operações de dashboard:', (error as Error).message);
      return {
        success: false,
        message: 'Erro nas operações de dashboard: ' + (error as Error).message
      };
    }
  }
  
  /**
   * Executa um teste rápido de conectividade
   */
  async quickTest(): Promise<boolean> {
    try {
      console.log('⚡ Executando teste rápido...');
      
      const validation = await notionServices.validateDatabases();
      
      if (validation.isValid) {
        console.log('✅ Teste rápido passou - Notion está funcionando!');
        return true;
      } else {
        console.log('❌ Teste rápido falhou:', validation.errors.join(', '));
        return false;
      }
    } catch (error) {
      console.log('❌ Teste rápido falhou:', (error as Error).message);
      return false;
    }
  }
  
  /**
   * Gera um relatório de configuração
   */
  generateConfigReport(): string {
    const report = `
🔧 RELATÓRIO DE CONFIGURAÇÃO\n` +
                  `================================\n` +
                  `Notion Token: ${config.notion.token ? '✅ Configurado' : '❌ Não configurado'}\n` +
                  `OpenAI Key: ${config.openai.apiKey ? '✅ Configurado' : '❌ Não configurado'}\n` +
                  `Tasks DB: ${config.notion.databases.tasks ? '✅ Configurado' : '❌ Não configurado'}\n` +
                  `Notes DB: ${config.notion.databases.notes ? '✅ Configurado' : '❌ Não configurado'}\n` +
                  `Projects DB: ${config.notion.databases.projects ? '✅ Configurado' : '❌ Não configurado'}\n` +
                  `Server Port: ${config.server.port}\n` +
                  `Automation: ${config.automation.enabled ? '✅ Habilitada' : '❌ Desabilitada'}\n` +
                  `================================`;
    
    return report;
  }
}

// Instância singleton
export const notionTester = new NotionTester();

/**
 * Função utilitária para executar testes via CLI
 */
export async function runTests(): Promise<void> {
  console.log('🚀 Iniciando testes do Notion AI Assistant...');
  console.log(notionTester.generateConfigReport());
  
  const results = await notionTester.runAllTests();
  
  if (results.success) {
    console.log('\n🎉 Todos os testes passaram! O sistema está funcionando corretamente.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique a configuração e tente novamente.');
    process.exit(1);
  }
}

/**
 * Função utilitária para teste rápido via CLI
 */
export async function quickTest(): Promise<void> {
  console.log('⚡ Executando teste rápido do Notion AI Assistant...');
  
  const success = await notionTester.quickTest();
  
  if (success) {
    console.log('\n🎉 Teste rápido passou! Sistema funcionando.');
    process.exit(0);
  } else {
    console.log('\n❌ Teste rápido falhou. Verifique a configuração.');
    process.exit(1);
  }
}