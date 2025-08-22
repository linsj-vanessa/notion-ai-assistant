export { NLPProcessor, nlpProcessor } from './processor';
export { CommandExecutor, ResponseTemplates } from './commands';
export type { NLPResult, ConversationContext } from './processor';
export type { CommandResult } from './commands';

/**
 * Classe principal do sistema NLP
 */
export class NLPSystem {
  private processor: NLPProcessor;
  private executor: CommandExecutor;

  constructor(notionServices: any) {
    this.processor = new NLPProcessor();
    this.executor = new CommandExecutor(notionServices);
  }

  /**
   * Processa entrada do usuário e executa comando
   */
  async processAndExecute(input: string, sessionId?: string): Promise<{
    nlpResult: NLPResult;
    commandResult: CommandResult;
  }> {
    // Processar entrada com NLP
    const nlpResult = await this.processor.processInput(input, sessionId);
    
    // Executar comando extraído
    const commandResult = await this.executor.executeCommand(nlpResult);
    
    return {
      nlpResult,
      commandResult
    };
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats() {
    return this.processor.getStats();
  }

  /**
   * Limpa contexto de sessão
   */
  clearSession(sessionId: string) {
    this.processor.clearContext(sessionId);
  }
}

// Utilitários para comandos comuns
export const NLPUtils = {
  /**
   * Verifica se entrada é um comando de ajuda
   */
  isHelpCommand(input: string): boolean {
    const helpKeywords = ['ajuda', 'help', 'comandos', 'o que você faz', 'como usar'];
    return helpKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );
  },

  /**
   * Verifica se entrada é uma saudação
   */
  isGreeting(input: string): boolean {
    const greetings = ['oi', 'olá', 'hello', 'hi', 'bom dia', 'boa tarde', 'boa noite'];
    return greetings.some(greeting => 
      input.toLowerCase().includes(greeting)
    );
  },

  /**
   * Extrai menções de data da entrada
   */
  extractDateMentions(input: string): string[] {
    const datePatterns = [
      /hoje/gi,
      /amanhã/gi,
      /semana que vem/gi,
      /próxima semana/gi,
      /mês que vem/gi,
      /próximo mês/gi,
      /\d{1,2}\/\d{1,2}/g, // dd/mm
      /\d{1,2}-\d{1,2}/g   // dd-mm
    ];

    const mentions: string[] = [];
    datePatterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        mentions.push(...matches);
      }
    });

    return mentions;
  },

  /**
   * Extrai menções de prioridade
   */
  extractPriorityMentions(input: string): string | null {
    const priorityPatterns = {
      alta: /\b(urgente|importante|alta prioridade|crítico|alta)\b/gi,
      media: /\b(normal|média prioridade|média)\b/gi,
      baixa: /\b(baixa prioridade|baixa|quando possível)\b/gi
    };

    for (const [priority, pattern] of Object.entries(priorityPatterns)) {
      if (pattern.test(input)) {
        return priority;
      }
    }

    return null;
  },

  /**
   * Limpa e normaliza entrada do usuário
   */
  cleanInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Múltiplos espaços para um
      .replace(/[\n\r]+/g, ' ') // Quebras de linha para espaço
      .toLowerCase();
  },

  /**
   * Valida se entrada tem tamanho adequado
   */
  validateInputLength(input: string): { valid: boolean; message?: string } {
    if (input.length === 0) {
      return {
        valid: false,
        message: 'Por favor, digite algo para eu poder ajudar.'
      };
    }

    if (input.length > 1000) {
      return {
        valid: false,
        message: 'Sua mensagem é muito longa. Tente ser mais conciso.'
      };
    }

    return { valid: true };
  }
};

// Constantes do sistema NLP
export const NLP_CONSTANTS = {
  MAX_INPUT_LENGTH: 1000,
  MAX_CONTEXT_HISTORY: 10,
  DEFAULT_CONFIDENCE_THRESHOLD: 0.7,
  SUPPORTED_LANGUAGES: ['pt', 'en'],
  
  INTENTS: {
    CREATE_TASK: 'create_task',
    UPDATE_TASK: 'update_task',
    COMPLETE_TASK: 'complete_task',
    LIST_TASKS: 'list_tasks',
    CREATE_NOTE: 'create_note',
    SEARCH_NOTES: 'search_notes',
    CREATE_PROJECT: 'create_project',
    UPDATE_PROJECT: 'update_project',
    DASHBOARD: 'dashboard',
    ANALYTICS: 'analytics',
    HELP: 'help',
    CONVERSATION: 'conversation'
  },
  
  ENTITIES: {
    TITLE: 'title',
    DESCRIPTION: 'description',
    PRIORITY: 'priority',
    DUE_DATE: 'due_date',
    TAGS: 'tags',
    STATUS: 'status',
    PROJECT_NAME: 'project_name',
    SEARCH_QUERY: 'search_query'
  }
} as const;

/**
 * Função de inicialização do sistema NLP
 */
export async function initializeNLP(notionServices: any): Promise<NLPSystem> {
  try {
    const nlpSystem = new NLPSystem(notionServices);
    
    // Teste básico do sistema
    const testResult = await nlpSystem.processAndExecute('teste de conexão');
    
    console.log('✅ Sistema NLP inicializado com sucesso');
    return nlpSystem;
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema NLP:', error);
    throw error;
  }
}