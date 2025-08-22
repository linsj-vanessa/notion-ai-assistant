/**
 * Módulo de integração com Notion
 * 
 * Este módulo fornece uma interface completa para interagir com o Notion,
 * incluindo operações CRUD para tarefas, notas, projetos e outras entidades.
 */

export { NotionClient, notionClient } from './client';
export { NotionServices, notionServices } from './services';

// Re-exportar tipos relacionados ao Notion
export type {
  NotionPage,
  NotionDatabase,
  Task,
  Note,
  Project,
  Habit,
  CalendarEvent
} from '../types';

/**
 * Utilitários e helpers para trabalhar com Notion
 */
export class NotionUtils {
  /**
   * Formata uma data para o formato aceito pelo Notion
   */
  static formatDateForNotion(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Converte uma string de data do Notion para Date
   */
  static parseDateFromNotion(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Valida se um ID do Notion é válido
   */
  static isValidNotionId(id: string): boolean {
    // IDs do Notion têm 32 caracteres hexadecimais com hífens
    const notionIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return notionIdRegex.test(id.replace(/-/g, '').length === 32 ? id : id.replace(/-/g, '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5'));
  }

  /**
   * Limpa e formata texto para uso no Notion
   */
  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Máximo 2 quebras de linha consecutivas
      .replace(/\s{2,}/g, ' '); // Máximo 1 espaço consecutivo
  }

  /**
   * Extrai tags de um texto usando hashtags
   */
  static extractHashtags(text: string): string[] {
    const hashtagRegex = /#([a-zA-Z0-9_\u00C0-\u017F]+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  /**
   * Converte prioridade de texto para número
   */
  static priorityToNumber(priority: string): number {
    switch (priority.toLowerCase()) {
      case 'alta':
      case 'high':
        return 3;
      case 'média':
      case 'medium':
        return 2;
      case 'baixa':
      case 'low':
        return 1;
      default:
        return 2;
    }
  }

  /**
   * Converte número para prioridade de texto
   */
  static numberToPriority(priority: number): string {
    switch (priority) {
      case 3:
        return 'Alta';
      case 2:
        return 'Média';
      case 1:
        return 'Baixa';
      default:
        return 'Média';
    }
  }

  /**
   * Calcula dias até o vencimento
   */
  static daysUntilDue(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica se uma tarefa está vencida
   */
  static isOverdue(dueDate: Date, status: string): boolean {
    if (status === 'Concluído') return false;
    return this.daysUntilDue(dueDate) < 0;
  }

  /**
   * Verifica se uma tarefa vence hoje
   */
  static isDueToday(dueDate: Date): boolean {
    return this.daysUntilDue(dueDate) === 0;
  }

  /**
   * Gera um resumo de status de tarefas
   */
  static generateTaskStatusSummary(tasks: any[]): string {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Concluído').length;
    const inProgress = tasks.filter(t => t.status === 'Em Andamento').length;
    const pending = tasks.filter(t => t.status === 'A Fazer').length;
    const overdue = tasks.filter(t => t.dueDate && this.isOverdue(t.dueDate, t.status)).length;
    
    return `📊 Resumo de Tarefas:\n` +
           `• Total: ${total}\n` +
           `• Concluídas: ${completed}\n` +
           `• Em Andamento: ${inProgress}\n` +
           `• Pendentes: ${pending}\n` +
           `• Vencidas: ${overdue}`;
  }

  /**
   * Formata uma tarefa para exibição
   */
  static formatTaskForDisplay(task: any): string {
    const priority = task.priority === 'Alta' ? '🔴' : task.priority === 'Média' ? '🟡' : '🟢';
    const status = task.status === 'Concluído' ? '✅' : task.status === 'Em Andamento' ? '🔄' : '⏳';
    const dueInfo = task.dueDate ? 
      (this.isOverdue(task.dueDate, task.status) ? ' ⚠️ VENCIDA' : 
       this.isDueToday(task.dueDate) ? ' 📅 HOJE' : 
       ` 📅 ${this.daysUntilDue(task.dueDate)} dias`) : '';
    
    return `${status} ${priority} ${task.title}${dueInfo}`;
  }

  /**
   * Valida dados de entrada para criação de tarefa
   */
  static validateTaskData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Título é obrigatório');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('Título deve ter no máximo 200 caracteres');
    }
    
    if (data.priority && !['Alta', 'Média', 'Baixa'].includes(data.priority)) {
      errors.push('Prioridade deve ser: Alta, Média ou Baixa');
    }
    
    if (data.dueDate && !(data.dueDate instanceof Date) && isNaN(Date.parse(data.dueDate))) {
      errors.push('Data de vencimento deve ser uma data válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de entrada para criação de nota
   */
  static validateNoteData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Título é obrigatório');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('Título deve ter no máximo 200 caracteres');
    }
    
    if (data.tags && !Array.isArray(data.tags)) {
      errors.push('Tags devem ser um array');
    }
    
    if (data.tags && data.tags.some((tag: any) => typeof tag !== 'string')) {
      errors.push('Todas as tags devem ser strings');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de entrada para criação de projeto
   */
  static validateProjectData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (data.name && data.name.length > 200) {
      errors.push('Nome deve ter no máximo 200 caracteres');
    }
    
    if (data.startDate && !(data.startDate instanceof Date) && isNaN(Date.parse(data.startDate))) {
      errors.push('Data de início deve ser uma data válida');
    }
    
    if (data.endDate && !(data.endDate instanceof Date) && isNaN(Date.parse(data.endDate))) {
      errors.push('Data de fim deve ser uma data válida');
    }
    
    if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
      errors.push('Data de início deve ser anterior à data de fim');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Constantes úteis para trabalhar com Notion
 */
export const NOTION_CONSTANTS = {
  TASK_STATUSES: ['A Fazer', 'Em Andamento', 'Concluído'] as const,
  TASK_PRIORITIES: ['Alta', 'Média', 'Baixa'] as const,
  PROJECT_STATUSES: ['Planejamento', 'Em Andamento', 'Concluído', 'Pausado'] as const,
  
  // Emojis para diferentes tipos de conteúdo
  EMOJIS: {
    TASK: '📋',
    NOTE: '📝',
    PROJECT: '📁',
    HABIT: '🎯',
    CALENDAR: '📅',
    HIGH_PRIORITY: '🔴',
    MEDIUM_PRIORITY: '🟡',
    LOW_PRIORITY: '🟢',
    COMPLETED: '✅',
    IN_PROGRESS: '🔄',
    PENDING: '⏳',
    OVERDUE: '⚠️'
  },
  
  // Limites de caracteres
  LIMITS: {
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000,
    TAG_MAX_LENGTH: 50,
    MAX_TAGS_PER_ITEM: 10
  }
};

/**
 * Função de inicialização do módulo Notion
 */
export async function initializeNotion(): Promise<{
  success: boolean;
  message: string;
  validation?: any;
}> {
  try {
    console.log('🔄 Inicializando conexão com Notion...');
    
    // Validar configuração
    const validation = await notionServices.validateDatabases();
    
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Erro na configuração do Notion: ' + validation.errors.join(', '),
        validation
      };
    }
    
    console.log('✅ Conexão com Notion estabelecida com sucesso!');
    console.log('📊 Databases encontradas:', validation.databases.length);
    
    return {
      success: true,
      message: 'Notion inicializado com sucesso',
      validation
    };
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Notion:', error);
    return {
      success: false,
      message: 'Erro ao conectar com Notion: ' + (error as Error).message
    };
  }
}