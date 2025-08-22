import { OpenAI } from 'openai';
import { config } from '../config/config';
import { Task, Note, Project, AICommand } from '../types';

/**
 * Interface para resultado de processamento NLP
 */
export interface NLPResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  command?: AICommand;
  parameters?: Record<string, any>;
  response?: string;
}

/**
 * Interface para contexto de conversa
 */
export interface ConversationContext {
  userId?: string;
  sessionId: string;
  history: Array<{
    input: string;
    output: string;
    timestamp: Date;
  }>;
  currentTask?: Task;
  currentProject?: Project;
}

/**
 * Classe principal para processamento de linguagem natural
 */
export class NLPProcessor {
  private openai: OpenAI;
  private context: Map<string, ConversationContext> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Processa entrada de texto em linguagem natural
   */
  async processInput(input: string, sessionId: string = 'default'): Promise<NLPResult> {
    try {
      // Obter ou criar contexto da conversa
      const context = this.getOrCreateContext(sessionId);
      
      // Analisar intenção e entidades
      const analysis = await this.analyzeIntent(input, context);
      
      // Extrair comando e parâmetros
      const command = await this.extractCommand(input, analysis);
      
      // Atualizar contexto
      this.updateContext(sessionId, input, analysis.response || '');
      
      return {
        intent: analysis.intent,
        entities: analysis.entities,
        confidence: analysis.confidence,
        command: command.command,
        parameters: command.parameters,
        response: analysis.response
      };
    } catch (error) {
      console.error('Erro no processamento NLP:', error);
      return {
        intent: 'error',
        entities: {},
        confidence: 0,
        response: 'Desculpe, não consegui entender sua solicitação. Pode reformular?'
      };
    }
  }

  /**
   * Analisa a intenção do usuário usando OpenAI
   */
  private async analyzeIntent(input: string, context: ConversationContext): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    response?: string;
  }> {
    const systemPrompt = `
Você é Alfred, um assistente de produtividade integrado ao Notion. Analise a entrada do usuário e identifique:

1. INTENÇÃO (intent): Uma das seguintes categorias:
   - create_task: Criar nova tarefa
   - update_task: Atualizar tarefa existente
   - complete_task: Marcar tarefa como concluída
   - list_tasks: Listar tarefas
   - create_note: Criar nova nota
   - search_notes: Buscar notas
   - create_project: Criar novo projeto
   - update_project: Atualizar projeto
   - dashboard: Mostrar resumo/dashboard
   - analytics: Mostrar estatísticas
   - help: Solicitar ajuda
   - conversation: Conversa geral

2. ENTIDADES (entities): Extrair informações relevantes como:
   - title: Título da tarefa/nota/projeto
   - description: Descrição
   - priority: Prioridade (alta, média, baixa)
   - due_date: Data de vencimento
   - tags: Tags ou categorias
   - status: Status atual
   - project_name: Nome do projeto
   - search_query: Termo de busca

3. CONFIANÇA (confidence): Nível de confiança na análise (0-1)

4. RESPOSTA (response): Resposta natural e amigável para o usuário

Contexto da conversa: ${JSON.stringify(context.history.slice(-3))}

Responda APENAS com um JSON válido no formato:
{
  "intent": "categoria_da_intenção",
  "entities": { "chave": "valor" },
  "confidence": 0.95,
  "response": "Resposta amigável para o usuário"
}
`;

    const completion = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      max_tokens: config.openai.maxTokens,
      temperature: 0.3
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Resposta vazia da OpenAI');
    }

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Erro ao parsear resposta JSON:', response);
      return {
        intent: 'conversation',
        entities: {},
        confidence: 0.5,
        response: 'Entendi sua mensagem, mas preciso de mais clareza para ajudar melhor.'
      };
    }
  }

  /**
   * Extrai comando estruturado da análise
   */
  private async extractCommand(input: string, analysis: any): Promise<{
    command?: AICommand;
    parameters?: Record<string, any>;
  }> {
    const { intent, entities } = analysis;

    switch (intent) {
      case 'create_task':
        return {
          command: {
            type: 'create',
            target: 'task',
            action: 'create_task'
          },
          parameters: {
            title: entities.title || this.extractTitleFromInput(input),
            description: entities.description,
            priority: this.normalizePriority(entities.priority),
            dueDate: this.parseDate(entities.due_date),
            tags: entities.tags || []
          }
        };

      case 'update_task':
        return {
          command: {
            type: 'update',
            target: 'task',
            action: 'update_task'
          },
          parameters: {
            taskId: entities.task_id,
            updates: {
              title: entities.title,
              description: entities.description,
              priority: this.normalizePriority(entities.priority),
              status: entities.status,
              dueDate: this.parseDate(entities.due_date)
            }
          }
        };

      case 'complete_task':
        return {
          command: {
            type: 'update',
            target: 'task',
            action: 'complete_task'
          },
          parameters: {
            taskId: entities.task_id,
            title: entities.title
          }
        };

      case 'list_tasks':
        return {
          command: {
            type: 'read',
            target: 'task',
            action: 'list_tasks'
          },
          parameters: {
            status: entities.status,
            priority: this.normalizePriority(entities.priority),
            project: entities.project_name,
            limit: entities.limit || 10
          }
        };

      case 'create_note':
        return {
          command: {
            type: 'create',
            target: 'note',
            action: 'create_note'
          },
          parameters: {
            title: entities.title || this.extractTitleFromInput(input),
            content: entities.description || input,
            tags: entities.tags || []
          }
        };

      case 'search_notes':
        return {
          command: {
            type: 'read',
            target: 'note',
            action: 'search_notes'
          },
          parameters: {
            query: entities.search_query || input,
            tags: entities.tags
          }
        };

      case 'create_project':
        return {
          command: {
            type: 'create',
            target: 'project',
            action: 'create_project'
          },
          parameters: {
            name: entities.title || entities.project_name,
            description: entities.description,
            status: 'Ativo'
          }
        };

      case 'dashboard':
        return {
          command: {
            type: 'read',
            target: 'dashboard',
            action: 'get_summary'
          },
          parameters: {}
        };

      case 'analytics':
        return {
          command: {
            type: 'read',
            target: 'analytics',
            action: 'get_stats'
          },
          parameters: {
            period: entities.period || 'week'
          }
        };

      default:
        return {};
    }
  }

  /**
   * Obtém ou cria contexto de conversa
   */
  private getOrCreateContext(sessionId: string): ConversationContext {
    if (!this.context.has(sessionId)) {
      this.context.set(sessionId, {
        sessionId,
        history: []
      });
    }
    return this.context.get(sessionId)!;
  }

  /**
   * Atualiza contexto da conversa
   */
  private updateContext(sessionId: string, input: string, output: string): void {
    const context = this.getOrCreateContext(sessionId);
    context.history.push({
      input,
      output,
      timestamp: new Date()
    });

    // Manter apenas os últimos 10 itens do histórico
    if (context.history.length > 10) {
      context.history = context.history.slice(-10);
    }
  }

  /**
   * Extrai título de uma entrada de texto
   */
  private extractTitleFromInput(input: string): string {
    // Remove palavras de comando comuns
    const cleanInput = input
      .replace(/^(criar|adicionar|nova?|novo)\s+/i, '')
      .replace(/\s+(tarefa|nota|projeto)\s*$/i, '')
      .trim();
    
    return cleanInput || 'Nova tarefa';
  }

  /**
   * Normaliza prioridade para formato padrão
   */
  private normalizePriority(priority?: string): 'Alta' | 'Média' | 'Baixa' | undefined {
    if (!priority) return undefined;
    
    const p = priority.toLowerCase();
    if (p.includes('alta') || p.includes('high') || p.includes('urgente')) return 'Alta';
    if (p.includes('baixa') || p.includes('low')) return 'Baixa';
    return 'Média';
  }

  /**
   * Converte texto de data para objeto Date
   */
  private parseDate(dateText?: string): Date | undefined {
    if (!dateText) return undefined;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const text = dateText.toLowerCase();
    
    if (text.includes('hoje')) return today;
    if (text.includes('amanhã')) return tomorrow;
    if (text.includes('semana')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    // Tentar parsear data diretamente
    const parsed = new Date(dateText);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  /**
   * Limpa contexto de uma sessão
   */
  clearContext(sessionId: string): void {
    this.context.delete(sessionId);
  }

  /**
   * Obtém estatísticas do processador
   */
  getStats(): {
    activeSessions: number;
    totalInteractions: number;
  } {
    let totalInteractions = 0;
    for (const context of this.context.values()) {
      totalInteractions += context.history.length;
    }
    
    return {
      activeSessions: this.context.size,
      totalInteractions
    };
  }
}

// Instância singleton
export const nlpProcessor = new NLPProcessor();