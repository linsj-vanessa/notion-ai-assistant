import { notionClient } from './client';
import { Task, Note, Project, Habit, CalendarEvent } from '../types';

/**
 * Serviços de alto nível para interação com o Notion
 * Fornece uma interface simplificada e métodos de conveniência
 */
export class NotionServices {
  
  // ==================== TASK SERVICES ====================
  
  /**
   * Cria uma nova tarefa com validação
   */
  async createTask(taskData: {
    title: string;
    description?: string;
    priority?: 'Alta' | 'Média' | 'Baixa';
    dueDate?: Date;
    projectId?: string;
  }): Promise<Task> {
    if (!taskData.title.trim()) {
      throw new Error('Título da tarefa é obrigatório');
    }

    const task: Omit<Task, 'id'> = {
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      status: 'A Fazer',
      priority: taskData.priority || 'Média',
      dueDate: taskData.dueDate,
      projectId: taskData.projectId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await notionClient.createTask(task);
  }

  /**
   * Marca uma tarefa como concluída
   */
  async completeTask(taskId: string): Promise<Task> {
    return await notionClient.updateTask(taskId, {
      status: 'Concluído',
      updatedAt: new Date()
    });
  }

  /**
   * Busca tarefas pendentes
   */
  async getPendingTasks(): Promise<Task[]> {
    return await notionClient.getTasks({
      status: 'A Fazer'
    });
  }

  /**
   * Busca tarefas em andamento
   */
  async getInProgressTasks(): Promise<Task[]> {
    return await notionClient.getTasks({
      status: 'Em Andamento'
    });
  }

  /**
   * Busca tarefas por prioridade
   */
  async getTasksByPriority(priority: 'Alta' | 'Média' | 'Baixa'): Promise<Task[]> {
    return await notionClient.getTasks({
      priority
    });
  }

  /**
   * Busca tarefas vencidas
   */
  async getOverdueTasks(): Promise<Task[]> {
    const allTasks = await notionClient.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTasks.filter(task => 
      task.dueDate && 
      task.dueDate < today && 
      task.status !== 'Concluído'
    );
  }

  /**
   * Busca tarefas do dia
   */
  async getTodayTasks(): Promise<Task[]> {
    const allTasks = await notionClient.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return allTasks.filter(task => 
      task.dueDate && 
      task.dueDate >= today && 
      task.dueDate < tomorrow
    );
  }

  /**
   * Atualiza prioridade de uma tarefa
   */
  async updateTaskPriority(taskId: string, priority: 'Alta' | 'Média' | 'Baixa'): Promise<Task> {
    return await notionClient.updateTask(taskId, {
      priority,
      updatedAt: new Date()
    });
  }

  /**
   * Move tarefa para "Em Andamento"
   */
  async startTask(taskId: string): Promise<Task> {
    return await notionClient.updateTask(taskId, {
      status: 'Em Andamento',
      updatedAt: new Date()
    });
  }

  // ==================== NOTE SERVICES ====================
  
  /**
   * Cria uma nova nota
   */
  async createNote(noteData: {
    title: string;
    content?: string;
    tags?: string[];
  }): Promise<Note> {
    if (!noteData.title.trim()) {
      throw new Error('Título da nota é obrigatório');
    }

    const note: Omit<Note, 'id'> = {
      title: noteData.title.trim(),
      content: noteData.content?.trim() || '',
      tags: noteData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await notionClient.createNote(note);
  }

  /**
   * Busca notas por tag
   */
  async getNotesByTag(tag: string): Promise<Note[]> {
    return await notionClient.getNotes({
      tags: [tag]
    });
  }

  /**
   * Busca notas por múltiplas tags
   */
  async getNotesByTags(tags: string[]): Promise<Note[]> {
    return await notionClient.getNotes({
      tags
    });
  }

  /**
   * Busca todas as notas
   */
  async getAllNotes(): Promise<Note[]> {
    return await notionClient.getNotes();
  }

  /**
   * Cria uma nota rápida (apenas título)
   */
  async createQuickNote(title: string): Promise<Note> {
    return await this.createNote({ title });
  }

  // ==================== PROJECT SERVICES ====================
  
  /**
   * Cria um novo projeto
   */
  async createProject(projectData: {
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Project> {
    if (!projectData.name.trim()) {
      throw new Error('Nome do projeto é obrigatório');
    }

    const project: Omit<Project, 'id'> = {
      name: projectData.name.trim(),
      description: projectData.description?.trim() || '',
      status: 'Planejamento',
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await notionClient.createProject(project);
  }

  /**
   * Busca projetos ativos
   */
  async getActiveProjects(): Promise<Project[]> {
    const allProjects = await notionClient.getProjects();
    return allProjects.filter(project => 
      project.status === 'Em Andamento' || project.status === 'Planejamento'
    );
  }

  /**
   * Busca projetos concluídos
   */
  async getCompletedProjects(): Promise<Project[]> {
    const allProjects = await notionClient.getProjects();
    return allProjects.filter(project => project.status === 'Concluído');
  }

  /**
   * Busca tarefas de um projeto específico
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
    const allTasks = await notionClient.getTasks();
    return allTasks.filter(task => task.projectId === projectId);
  }

  // ==================== DASHBOARD SERVICES ====================
  
  /**
   * Obtém resumo do dashboard
   */
  async getDashboardSummary(): Promise<{
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
    todayTasks: number;
    totalProjects: number;
    activeProjects: number;
    totalNotes: number;
  }> {
    const [allTasks, allProjects, allNotes] = await Promise.all([
      notionClient.getTasks(),
      notionClient.getProjects(),
      notionClient.getNotes()
    ]);

    const pendingTasks = allTasks.filter(t => t.status === 'A Fazer');
    const inProgressTasks = allTasks.filter(t => t.status === 'Em Andamento');
    const completedTasks = allTasks.filter(t => t.status === 'Concluído');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const overdueTasks = allTasks.filter(task => 
      task.dueDate && 
      task.dueDate < today && 
      task.status !== 'Concluído'
    );
    
    const todayTasks = allTasks.filter(task => 
      task.dueDate && 
      task.dueDate >= today && 
      task.dueDate < tomorrow
    );

    const activeProjects = allProjects.filter(p => 
      p.status === 'Em Andamento' || p.status === 'Planejamento'
    );

    return {
      totalTasks: allTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      todayTasks: todayTasks.length,
      totalProjects: allProjects.length,
      activeProjects: activeProjects.length,
      totalNotes: allNotes.length
    };
  }

  /**
   * Obtém estatísticas de produtividade
   */
  async getProductivityStats(days: number = 7): Promise<{
    tasksCompleted: number;
    tasksCreated: number;
    notesCreated: number;
    projectsCreated: number;
    averageTasksPerDay: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [allTasks, allNotes, allProjects] = await Promise.all([
      notionClient.getTasks(),
      notionClient.getNotes(),
      notionClient.getProjects()
    ]);

    const recentCompletedTasks = allTasks.filter(task => 
      task.status === 'Concluído' && 
      task.updatedAt >= cutoffDate
    );

    const recentCreatedTasks = allTasks.filter(task => 
      task.createdAt >= cutoffDate
    );

    const recentNotes = allNotes.filter(note => 
      note.createdAt >= cutoffDate
    );

    const recentProjects = allProjects.filter(project => 
      project.createdAt >= cutoffDate
    );

    return {
      tasksCompleted: recentCompletedTasks.length,
      tasksCreated: recentCreatedTasks.length,
      notesCreated: recentNotes.length,
      projectsCreated: recentProjects.length,
      averageTasksPerDay: Math.round(recentCompletedTasks.length / days * 10) / 10
    };
  }

  // ==================== SEARCH SERVICES ====================
  
  /**
   * Busca geral por texto
   */
  async searchAll(query: string): Promise<{
    tasks: Task[];
    notes: Note[];
    projects: Project[];
  }> {
    const searchTerm = query.toLowerCase().trim();
    
    const [allTasks, allNotes, allProjects] = await Promise.all([
      notionClient.getTasks(),
      notionClient.getNotes(),
      notionClient.getProjects()
    ]);

    const tasks = allTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm)
    );

    const notes = allNotes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content?.toLowerCase().includes(searchTerm) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    const projects = allProjects.filter(project => 
      project.name.toLowerCase().includes(searchTerm) ||
      project.description?.toLowerCase().includes(searchTerm)
    );

    return { tasks, notes, projects };
  }

  // ==================== VALIDATION SERVICES ====================
  
  /**
   * Valida se as databases estão configuradas corretamente
   */
  async validateDatabases(): Promise<{
    isValid: boolean;
    errors: string[];
    databases: { id: string; title: string; accessible: boolean }[];
  }> {
    const errors: string[] = [];
    const databases: { id: string; title: string; accessible: boolean }[] = [];
    
    try {
      const availableDatabases = await notionClient.listDatabases();
      
      // Verificar se as databases necessárias estão acessíveis
      const requiredDatabases = [
        { key: 'tasks', name: 'Tarefas' },
        { key: 'notes', name: 'Notas' },
        { key: 'projects', name: 'Projetos' }
      ];
      
      for (const required of requiredDatabases) {
        const found = availableDatabases.find(db => 
          db.title.toLowerCase().includes(required.name.toLowerCase())
        );
        
        if (found) {
          databases.push({
            id: found.id,
            title: found.title,
            accessible: true
          });
        } else {
          errors.push(`Database '${required.name}' não encontrada`);
          databases.push({
            id: '',
            title: required.name,
            accessible: false
          });
        }
      }
      
    } catch (error) {
      errors.push('Erro ao conectar com o Notion: ' + (error as Error).message);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      databases
    };
  }
}

// Instância singleton
export const notionServices = new NotionServices();