import { NotionServices } from '../notion/services';
import { AICommand } from '../types';
import { NLPResult } from './processor';

/**
 * Interface para resultado de execução de comando
 */
export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Classe para execução de comandos extraídos do NLP
 */
export class CommandExecutor {
  private notionServices: NotionServices;

  constructor(notionServices: NotionServices) {
    this.notionServices = notionServices;
  }

  /**
   * Executa comando baseado no resultado do NLP
   */
  async executeCommand(nlpResult: NLPResult): Promise<CommandResult> {
    try {
      if (!nlpResult.command) {
        return {
          success: true,
          message: nlpResult.response || 'Como posso ajudar você?'
        };
      }

      const { command, parameters } = nlpResult;
      
      switch (command.action) {
        case 'create_task':
          return await this.createTask(parameters);
        
        case 'update_task':
          return await this.updateTask(parameters);
        
        case 'complete_task':
          return await this.completeTask(parameters);
        
        case 'list_tasks':
          return await this.listTasks(parameters);
        
        case 'create_note':
          return await this.createNote(parameters);
        
        case 'search_notes':
          return await this.searchNotes(parameters);
        
        case 'create_project':
          return await this.createProject(parameters);
        
        case 'get_summary':
          return await this.getDashboard();
        
        case 'get_stats':
          return await this.getAnalytics(parameters);
        
        default:
          return {
            success: false,
            message: 'Comando não reconhecido.',
            error: `Ação '${command.action}' não implementada`
          };
      }
    } catch (error) {
      console.error('Erro na execução do comando:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao executar o comando.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria nova tarefa
   */
  private async createTask(params: any): Promise<CommandResult> {
    try {
      const taskData = {
        title: params.title || 'Nova tarefa',
        description: params.description,
        priority: params.priority || 'Média',
        status: 'A fazer',
        dueDate: params.dueDate,
        tags: params.tags || []
      };

      const task = await this.notionServices.createTask(taskData);
      
      return {
        success: true,
        message: `✅ Tarefa "${task.title}" criada com sucesso!`,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível criar a tarefa.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza tarefa existente
   */
  private async updateTask(params: any): Promise<CommandResult> {
    try {
      if (!params.taskId && !params.title) {
        return {
          success: false,
          message: 'É necessário especificar qual tarefa atualizar.',
          error: 'ID ou título da tarefa não fornecido'
        };
      }

      // Se não temos ID, tentar encontrar por título
      let taskId = params.taskId;
      if (!taskId && params.title) {
        const tasks = await this.notionServices.searchTasks({ title: params.title });
        if (tasks.length === 0) {
          return {
            success: false,
            message: `Tarefa "${params.title}" não encontrada.`,
            error: 'Tarefa não encontrada'
          };
        }
        taskId = tasks[0].id;
      }

      const updatedTask = await this.notionServices.updateTask(taskId, params.updates);
      
      return {
        success: true,
        message: `✅ Tarefa "${updatedTask.title}" atualizada com sucesso!`,
        data: updatedTask
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível atualizar a tarefa.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Marca tarefa como concluída
   */
  private async completeTask(params: any): Promise<CommandResult> {
    try {
      if (!params.taskId && !params.title) {
        return {
          success: false,
          message: 'É necessário especificar qual tarefa completar.',
          error: 'ID ou título da tarefa não fornecido'
        };
      }

      // Se não temos ID, tentar encontrar por título
      let taskId = params.taskId;
      if (!taskId && params.title) {
        const tasks = await this.notionServices.searchTasks({ title: params.title });
        if (tasks.length === 0) {
          return {
            success: false,
            message: `Tarefa "${params.title}" não encontrada.`,
            error: 'Tarefa não encontrada'
          };
        }
        taskId = tasks[0].id;
      }

      const completedTask = await this.notionServices.completeTask(taskId);
      
      return {
        success: true,
        message: `🎉 Tarefa "${completedTask.title}" marcada como concluída!`,
        data: completedTask
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível completar a tarefa.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista tarefas com filtros
   */
  private async listTasks(params: any): Promise<CommandResult> {
    try {
      const filters = {
        status: params.status,
        priority: params.priority,
        project: params.project
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });

      const tasks = await this.notionServices.searchTasks(filters);
      
      if (tasks.length === 0) {
        return {
          success: true,
          message: 'Nenhuma tarefa encontrada com os filtros especificados.',
          data: []
        };
      }

      // Limitar número de resultados
      const limitedTasks = tasks.slice(0, params.limit || 10);
      
      const taskList = limitedTasks.map((task, index) => 
        `${index + 1}. ${task.title} (${task.status}) - ${task.priority}`
      ).join('\n');

      return {
        success: true,
        message: `📋 Encontrei ${tasks.length} tarefa(s):\n\n${taskList}`,
        data: limitedTasks
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível listar as tarefas.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria nova nota
   */
  private async createNote(params: any): Promise<CommandResult> {
    try {
      const noteData = {
        title: params.title || 'Nova nota',
        content: params.content || '',
        tags: params.tags || []
      };

      const note = await this.notionServices.createNote(noteData);
      
      return {
        success: true,
        message: `📝 Nota "${note.title}" criada com sucesso!`,
        data: note
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível criar a nota.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca notas
   */
  private async searchNotes(params: any): Promise<CommandResult> {
    try {
      const filters = {
        query: params.query,
        tags: params.tags
      };

      const notes = await this.notionServices.searchNotes(filters);
      
      if (notes.length === 0) {
        return {
          success: true,
          message: 'Nenhuma nota encontrada com os critérios especificados.',
          data: []
        };
      }

      const noteList = notes.slice(0, 10).map((note, index) => 
        `${index + 1}. ${note.title}${note.tags.length > 0 ? ` [${note.tags.join(', ')}]` : ''}`
      ).join('\n');

      return {
        success: true,
        message: `📚 Encontrei ${notes.length} nota(s):\n\n${noteList}`,
        data: notes
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível buscar as notas.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria novo projeto
   */
  private async createProject(params: any): Promise<CommandResult> {
    try {
      const projectData = {
        name: params.name || 'Novo projeto',
        description: params.description,
        status: params.status || 'Ativo'
      };

      const project = await this.notionServices.createProject(projectData);
      
      return {
        success: true,
        message: `🚀 Projeto "${project.name}" criado com sucesso!`,
        data: project
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível criar o projeto.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém dashboard/resumo
   */
  private async getDashboard(): Promise<CommandResult> {
    try {
      const summary = await this.notionServices.getDashboardSummary();
      
      const message = `📊 **Dashboard - Resumo**\n\n` +
        `📋 **Tarefas:**\n` +
        `• A fazer: ${summary.tasks.todo}\n` +
        `• Em progresso: ${summary.tasks.inProgress}\n` +
        `• Concluídas: ${summary.tasks.completed}\n\n` +
        `📝 **Notas:** ${summary.notes.total}\n` +
        `🚀 **Projetos ativos:** ${summary.projects.active}\n\n` +
        `⚡ **Produtividade hoje:** ${summary.productivity.tasksCompletedToday} tarefas concluídas`;

      return {
        success: true,
        message,
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível obter o dashboard.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém estatísticas/analytics
   */
  private async getAnalytics(params: any): Promise<CommandResult> {
    try {
      const period = params.period || 'week';
      const stats = await this.notionServices.getProductivityStats(period);
      
      const message = `📈 **Estatísticas (${period})**\n\n` +
        `✅ **Tarefas concluídas:** ${stats.tasksCompleted}\n` +
        `📝 **Notas criadas:** ${stats.notesCreated}\n` +
        `⏱️ **Tempo médio por tarefa:** ${stats.averageCompletionTime}\n` +
        `🎯 **Taxa de conclusão:** ${stats.completionRate}%\n` +
        `🔥 **Sequência atual:** ${stats.currentStreak} dias`;

      return {
        success: true,
        message,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: 'Não foi possível obter as estatísticas.',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

/**
 * Classe para gerenciar templates de resposta
 */
export class ResponseTemplates {
  /**
   * Gera resposta de ajuda
   */
  static getHelpMessage(): string {
    return `🤖 **Alfred - Assistente de Produtividade**\n\n` +
      `Aqui estão algumas coisas que posso fazer por você:\n\n` +
      `📋 **Tarefas:**\n` +
      `• "Criar tarefa: Revisar relatório"\n` +
      `• "Marcar como concluída: Reunião com cliente"\n` +
      `• "Listar tarefas pendentes"\n` +
      `• "Tarefas de alta prioridade"\n\n` +
      `📝 **Notas:**\n` +
      `• "Criar nota sobre reunião"\n` +
      `• "Buscar notas sobre projeto X"\n\n` +
      `🚀 **Projetos:**\n` +
      `• "Criar projeto: Website da empresa"\n` +
      `• "Projetos ativos"\n\n` +
      `📊 **Análises:**\n` +
      `• "Mostrar dashboard"\n` +
      `• "Estatísticas da semana"\n\n` +
      `Digite sua solicitação em linguagem natural e eu cuidarei do resto! 😊`;
  }

  /**
   * Gera resposta de boas-vindas
   */
  static getWelcomeMessage(): string {
    return `👋 Olá! Eu sou o Alfred, seu assistente de produtividade.\n\n` +
      `Estou aqui para ajudar você a gerenciar suas tarefas, notas e projetos no Notion.\n` +
      `Digite "ajuda" para ver o que posso fazer ou comece fazendo uma solicitação!`;
  }

  /**
   * Gera resposta de erro amigável
   */
  static getErrorMessage(error?: string): string {
    const baseMessage = `😅 Ops! Algo deu errado.\n\n`;
    
    if (error) {
      return baseMessage + `Detalhes: ${error}\n\nTente novamente ou digite "ajuda" para ver o que posso fazer.`;
    }
    
    return baseMessage + `Tente reformular sua solicitação ou digite "ajuda" para ver exemplos.`;
  }
}