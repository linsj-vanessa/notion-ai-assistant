import { NLPProcessor, CommandExecutor, NLPSystem, NLPUtils } from './index';
import { NotionServices } from '../notion/services';
import { config } from '../config/config';

/**
 * Classe para testes do sistema NLP
 */
export class NLPTester {
  private nlpSystem: NLPSystem | null = null;
  private testResults: Array<{
    test: string;
    input: string;
    expected: any;
    result: any;
    passed: boolean;
    error?: string;
  }> = [];

  /**
   * Inicializa o sistema para testes
   */
  async initialize(): Promise<void> {
    try {
      console.log('🧪 Inicializando testes do sistema NLP...');
      
      // Criar instância mock do NotionServices para testes
      const mockNotionServices = this.createMockNotionServices();
      
      this.nlpSystem = new NLPSystem(mockNotionServices);
      console.log('✅ Sistema NLP inicializado para testes');
    } catch (error) {
      console.error('❌ Erro ao inicializar testes:', error);
      throw error;
    }
  }

  /**
   * Executa todos os testes
   */
  async runAllTests(): Promise<void> {
    if (!this.nlpSystem) {
      await this.initialize();
    }

    console.log('\n🚀 Iniciando testes do sistema NLP...');
    
    await this.testBasicNLPProcessing();
    await this.testTaskCommands();
    await this.testNoteCommands();
    await this.testProjectCommands();
    await this.testDashboardCommands();
    await this.testUtilityFunctions();
    await this.testErrorHandling();
    
    this.printTestResults();
  }

  /**
   * Testa processamento básico de NLP
   */
  private async testBasicNLPProcessing(): Promise<void> {
    console.log('\n📝 Testando processamento básico de NLP...');
    
    const testCases = [
      {
        input: 'criar tarefa revisar relatório',
        expectedIntent: 'create_task',
        expectedEntities: { title: 'revisar relatório' }
      },
      {
        input: 'listar tarefas pendentes',
        expectedIntent: 'list_tasks',
        expectedEntities: { status: 'pendentes' }
      },
      {
        input: 'mostrar dashboard',
        expectedIntent: 'dashboard',
        expectedEntities: {}
      },
      {
        input: 'ajuda',
        expectedIntent: 'help',
        expectedEntities: {}
      }
    ];

    for (const testCase of testCases) {
      try {
        const result = await this.nlpSystem!.processAndExecute(testCase.input);
        
        const passed = result.nlpResult.intent === testCase.expectedIntent;
        
        this.testResults.push({
          test: 'Processamento NLP Básico',
          input: testCase.input,
          expected: testCase.expectedIntent,
          result: result.nlpResult.intent,
          passed
        });
        
        console.log(`  ${passed ? '✅' : '❌'} "${testCase.input}" -> ${result.nlpResult.intent}`);
      } catch (error) {
        this.testResults.push({
          test: 'Processamento NLP Básico',
          input: testCase.input,
          expected: testCase.expectedIntent,
          result: null,
          passed: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        
        console.log(`  ❌ "${testCase.input}" -> ERRO: ${error}`);
      }
    }
  }

  /**
   * Testa comandos de tarefas
   */
  private async testTaskCommands(): Promise<void> {
    console.log('\n📋 Testando comandos de tarefas...');
    
    const taskCommands = [
      'criar tarefa urgente: finalizar apresentação',
      'marcar como concluída: reunião com cliente',
      'listar tarefas de alta prioridade',
      'atualizar tarefa: adicionar deadline para amanhã'
    ];

    for (const command of taskCommands) {
      try {
        const result = await this.nlpSystem!.processAndExecute(command);
        
        const passed = result.commandResult.success;
        
        this.testResults.push({
          test: 'Comandos de Tarefas',
          input: command,
          expected: 'success',
          result: result.commandResult.success ? 'success' : 'failure',
          passed
        });
        
        console.log(`  ${passed ? '✅' : '❌'} "${command}"`);
        if (result.commandResult.message) {
          console.log(`    Resposta: ${result.commandResult.message}`);
        }
      } catch (error) {
        console.log(`  ❌ "${command}" -> ERRO: ${error}`);
      }
    }
  }

  /**
   * Testa comandos de notas
   */
  private async testNoteCommands(): Promise<void> {
    console.log('\n📝 Testando comandos de notas...');
    
    const noteCommands = [
      'criar nota sobre reunião de planejamento',
      'buscar notas sobre projeto X',
      'nova nota: ideias para o blog'
    ];

    for (const command of noteCommands) {
      try {
        const result = await this.nlpSystem!.processAndExecute(command);
        
        const passed = result.commandResult.success;
        
        this.testResults.push({
          test: 'Comandos de Notas',
          input: command,
          expected: 'success',
          result: result.commandResult.success ? 'success' : 'failure',
          passed
        });
        
        console.log(`  ${passed ? '✅' : '❌'} "${command}"`);
      } catch (error) {
        console.log(`  ❌ "${command}" -> ERRO: ${error}`);
      }
    }
  }

  /**
   * Testa comandos de projetos
   */
  private async testProjectCommands(): Promise<void> {
    console.log('\n🚀 Testando comandos de projetos...');
    
    const projectCommands = [
      'criar projeto: Website da empresa',
      'listar projetos ativos'
    ];

    for (const command of projectCommands) {
      try {
        const result = await this.nlpSystem!.processAndExecute(command);
        
        const passed = result.commandResult.success;
        
        this.testResults.push({
          test: 'Comandos de Projetos',
          input: command,
          expected: 'success',
          result: result.commandResult.success ? 'success' : 'failure',
          passed
        });
        
        console.log(`  ${passed ? '✅' : '❌'} "${command}"`);
      } catch (error) {
        console.log(`  ❌ "${command}" -> ERRO: ${error}`);
      }
    }
  }

  /**
   * Testa comandos de dashboard
   */
  private async testDashboardCommands(): Promise<void> {
    console.log('\n📊 Testando comandos de dashboard...');
    
    const dashboardCommands = [
      'mostrar dashboard',
      'estatísticas da semana',
      'resumo de produtividade'
    ];

    for (const command of dashboardCommands) {
      try {
        const result = await this.nlpSystem!.processAndExecute(command);
        
        const passed = result.commandResult.success;
        
        this.testResults.push({
          test: 'Comandos de Dashboard',
          input: command,
          expected: 'success',
          result: result.commandResult.success ? 'success' : 'failure',
          passed
        });
        
        console.log(`  ${passed ? '✅' : '❌'} "${command}"`);
      } catch (error) {
        console.log(`  ❌ "${command}" -> ERRO: ${error}`);
      }
    }
  }

  /**
   * Testa funções utilitárias
   */
  private async testUtilityFunctions(): Promise<void> {
    console.log('\n🔧 Testando funções utilitárias...');
    
    // Teste de detecção de comandos de ajuda
    const helpTests = [
      { input: 'ajuda', expected: true },
      { input: 'help', expected: true },
      { input: 'o que você faz', expected: true },
      { input: 'criar tarefa', expected: false }
    ];

    for (const test of helpTests) {
      const result = NLPUtils.isHelpCommand(test.input);
      const passed = result === test.expected;
      
      this.testResults.push({
        test: 'Detecção de Ajuda',
        input: test.input,
        expected: test.expected,
        result,
        passed
      });
      
      console.log(`  ${passed ? '✅' : '❌'} isHelpCommand("${test.input}") -> ${result}`);
    }

    // Teste de extração de prioridade
    const priorityTests = [
      { input: 'tarefa urgente', expected: 'alta' },
      { input: 'baixa prioridade', expected: 'baixa' },
      { input: 'tarefa normal', expected: null }
    ];

    for (const test of priorityTests) {
      const result = NLPUtils.extractPriorityMentions(test.input);
      const passed = result === test.expected;
      
      this.testResults.push({
        test: 'Extração de Prioridade',
        input: test.input,
        expected: test.expected,
        result,
        passed
      });
      
      console.log(`  ${passed ? '✅' : '❌'} extractPriorityMentions("${test.input}") -> ${result}`);
    }
  }

  /**
   * Testa tratamento de erros
   */
  private async testErrorHandling(): Promise<void> {
    console.log('\n⚠️ Testando tratamento de erros...');
    
    const errorTests = [
      '', // Entrada vazia
      'a'.repeat(1001), // Entrada muito longa
      'comando inexistente xyz123' // Comando não reconhecido
    ];

    for (const input of errorTests) {
      try {
        const result = await this.nlpSystem!.processAndExecute(input);
        
        // Para testes de erro, esperamos que o sistema lide graciosamente
        const passed = result.commandResult.message !== undefined;
        
        this.testResults.push({
          test: 'Tratamento de Erros',
          input: input.length > 50 ? input.substring(0, 50) + '...' : input,
          expected: 'handled gracefully',
          result: passed ? 'handled' : 'not handled',
          passed
        });
        
        console.log(`  ${passed ? '✅' : '❌'} Erro tratado graciosamente`);
      } catch (error) {
        console.log(`  ❌ Erro não tratado: ${error}`);
      }
    }
  }

  /**
   * Cria mock do NotionServices para testes
   */
  private createMockNotionServices(): any {
    return {
      createTask: async (data: any) => ({ id: 'mock-task-id', ...data }),
      updateTask: async (id: string, data: any) => ({ id, ...data }),
      completeTask: async (id: string) => ({ id, status: 'Concluída', title: 'Mock Task' }),
      searchTasks: async (filters: any) => [
        { id: '1', title: 'Mock Task 1', status: 'A fazer', priority: 'Alta' },
        { id: '2', title: 'Mock Task 2', status: 'Em progresso', priority: 'Média' }
      ],
      createNote: async (data: any) => ({ id: 'mock-note-id', ...data }),
      searchNotes: async (filters: any) => [
        { id: '1', title: 'Mock Note 1', tags: ['test'] },
        { id: '2', title: 'Mock Note 2', tags: ['mock'] }
      ],
      createProject: async (data: any) => ({ id: 'mock-project-id', ...data }),
      getDashboardSummary: async () => ({
        tasks: { todo: 5, inProgress: 3, completed: 10 },
        notes: { total: 15 },
        projects: { active: 2 },
        productivity: { tasksCompletedToday: 3 }
      }),
      getProductivityStats: async (period: string) => ({
        tasksCompleted: 25,
        notesCreated: 8,
        averageCompletionTime: '2.5 horas',
        completionRate: 85,
        currentStreak: 7
      })
    };
  }

  /**
   * Imprime resultados dos testes
   */
  private printTestResults(): void {
    console.log('\n📊 RESULTADOS DOS TESTES');
    console.log('=' .repeat(50));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total de testes: ${totalTests}`);
    console.log(`✅ Passou: ${passedTests}`);
    console.log(`❌ Falhou: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      this.testResults
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`  • ${test.test}: "${test.input}"`);
          if (test.error) {
            console.log(`    Erro: ${test.error}`);
          }
        });
    }
    
    console.log('\n🎉 Testes concluídos!');
  }
}

/**
 * Função para executar testes via CLI
 */
export async function runNLPTests(): Promise<void> {
  const tester = new NLPTester();
  await tester.runAllTests();
}

/**
 * Função para teste interativo
 */
export async function interactiveNLPTest(): Promise<void> {
  console.log('🤖 Modo de teste interativo do NLP');
  console.log('Digite comandos para testar o sistema (digite "sair" para terminar)\n');
  
  const tester = new NLPTester();
  await tester.initialize();
  
  // Simulação de entrada interativa (em um ambiente real, usaria readline)
  const testInputs = [
    'criar tarefa: testar sistema NLP',
    'listar tarefas pendentes',
    'mostrar dashboard',
    'ajuda'
  ];
  
  for (const input of testInputs) {
    console.log(`> ${input}`);
    
    try {
      const result = await tester['nlpSystem']!.processAndExecute(input);
      console.log(`🤖 ${result.commandResult.message}\n`);
    } catch (error) {
      console.log(`❌ Erro: ${error}\n`);
    }
  }
  
  console.log('✅ Teste interativo concluído!');
}