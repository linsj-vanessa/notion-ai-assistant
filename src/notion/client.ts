import { Client } from '@notionhq/client';
import { config } from '../config/config';
import {
  Task,
  Note,
  Project,
  Habit,
  CalendarEvent,
  NotionPage,
  NotionDatabase
} from '../types';

export class NotionClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      auth: config.notion.token,
    });
  }

  // ==================== DATABASES ====================

  /**
   * Lista todas as databases acessíveis
   */
  async listDatabases(): Promise<NotionDatabase[]> {
    try {
      const response = await this.client.search({
        filter: {
          property: 'object',
          value: 'database'
        }
      });

      return response.results.map(db => ({
        id: db.id,
        title: this.extractTitle(db),
        properties: this.extractProperties(db)
      }));
    } catch (error) {
      console.error('Erro ao listar databases:', error);
      throw new Error('Falha ao conectar com o Notion');
    }
  }

  /**
   * Busca páginas em uma database específica
   */
  async queryDatabase(databaseId: string, filter?: any): Promise<NotionPage[]> {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
        filter: filter
      });

      return response.results.map(page => this.formatPage(page));
    } catch (error) {
      console.error('Erro ao consultar database:', error);
      throw new Error(`Falha ao consultar database ${databaseId}`);
    }
  }

  // ==================== TASKS ====================

  /**
   * Cria uma nova tarefa
   */
  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      const response = await this.client.pages.create({
        parent: {
          database_id: config.notion.databases.tasks
        },
        properties: {
          'Nome': {
            title: [{
              text: {
                content: task.title
              }
            }]
          },
          'Status': {
            select: {
              name: task.status
            }
          },
          'Prioridade': {
            select: {
              name: task.priority
            }
          },
          'Data de Vencimento': task.dueDate ? {
            date: {
              start: task.dueDate.toISOString().split('T')[0]
            }
          } : undefined,
          'Projeto': task.projectId ? {
            relation: [{
              id: task.projectId
            }]
          } : undefined
        }
      });

      return {
        id: response.id,
        ...task
      };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw new Error('Falha ao criar tarefa no Notion');
    }
  }

  /**
   * Lista todas as tarefas
   */
  async getTasks(filter?: { status?: string; priority?: string }): Promise<Task[]> {
    try {
      const notionFilter: any = {};
      
      if (filter?.status || filter?.priority) {
        const conditions = [];
        
        if (filter.status) {
          conditions.push({
            property: 'Status',
            select: {
              equals: filter.status
            }
          });
        }
        
        if (filter.priority) {
          conditions.push({
            property: 'Prioridade',
            select: {
              equals: filter.priority
            }
          });
        }
        
        notionFilter.and = conditions;
      }

      const pages = await this.queryDatabase(config.notion.databases.tasks, Object.keys(notionFilter).length > 0 ? notionFilter : undefined);
      return pages.map(page => this.pageToTask(page));
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw new Error('Falha ao buscar tarefas');
    }
  }

  /**
   * Atualiza uma tarefa existente
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const properties: any = {};

      if (updates.title) {
        properties['Nome'] = {
          title: [{
            text: {
              content: updates.title
            }
          }]
        };
      }

      if (updates.status) {
        properties['Status'] = {
          select: {
            name: updates.status
          }
        };
      }

      if (updates.priority) {
        properties['Prioridade'] = {
          select: {
            name: updates.priority
          }
        };
      }

      if (updates.dueDate) {
        properties['Data de Vencimento'] = {
          date: {
            start: updates.dueDate.toISOString().split('T')[0]
          }
        };
      }

      const response = await this.client.pages.update({
        page_id: taskId,
        properties
      });

      // Buscar a tarefa atualizada
      const updatedPage = await this.client.pages.retrieve({ page_id: taskId });
      return this.pageToTask(this.formatPage(updatedPage));
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw new Error('Falha ao atualizar tarefa');
    }
  }

  /**
   * Deleta uma tarefa
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.client.pages.update({
        page_id: taskId,
        archived: true
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw new Error('Falha ao deletar tarefa');
    }
  }

  // ==================== NOTES ====================

  /**
   * Cria uma nova nota
   */
  async createNote(note: Omit<Note, 'id'>): Promise<Note> {
    try {
      const response = await this.client.pages.create({
        parent: {
          database_id: config.notion.databases.notes
        },
        properties: {
          'Título': {
            title: [{
              text: {
                content: note.title
              }
            }]
          },
          'Tags': note.tags ? {
            multi_select: note.tags.map(tag => ({ name: tag }))
          } : undefined
        },
        children: note.content ? [{
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: {
                content: note.content
              }
            }]
          }
        }] : undefined
      });

      return {
        id: response.id,
        ...note
      };
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      throw new Error('Falha ao criar nota no Notion');
    }
  }

  /**
   * Lista todas as notas
   */
  async getNotes(filter?: { tags?: string[] }): Promise<Note[]> {
    try {
      let notionFilter: any = undefined;
      
      if (filter?.tags && filter.tags.length > 0) {
        notionFilter = {
          and: filter.tags.map(tag => ({
            property: 'Tags',
            multi_select: {
              contains: tag
            }
          }))
        };
      }

      const pages = await this.queryDatabase(config.notion.databases.notes, notionFilter);
      return Promise.all(pages.map(page => this.pageToNote(page)));
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      throw new Error('Falha ao buscar notas');
    }
  }

  // ==================== PROJECTS ====================

  /**
   * Cria um novo projeto
   */
  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    try {
      const response = await this.client.pages.create({
        parent: {
          database_id: config.notion.databases.projects
        },
        properties: {
          'Nome': {
            title: [{
              text: {
                content: project.name
              }
            }]
          },
          'Status': {
            select: {
              name: project.status
            }
          },
          'Data de Início': project.startDate ? {
            date: {
              start: project.startDate.toISOString().split('T')[0]
            }
          } : undefined,
          'Data de Fim': project.endDate ? {
            date: {
              start: project.endDate.toISOString().split('T')[0]
            }
          } : undefined
        }
      });

      return {
        id: response.id,
        ...project
      };
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw new Error('Falha ao criar projeto no Notion');
    }
  }

  /**
   * Lista todos os projetos
   */
  async getProjects(): Promise<Project[]> {
    try {
      const pages = await this.queryDatabase(config.notion.databases.projects);
      return pages.map(page => this.pageToProject(page));
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw new Error('Falha ao buscar projetos');
    }
  }

  // ==================== UTILITY METHODS ====================

  private extractTitle(db: any): string {
    if (db.title && db.title.length > 0) {
      return db.title[0].plain_text;
    }
    return 'Sem título';
  }

  private extractProperties(db: any): Record<string, any> {
    return db.properties || {};
  }

  private formatPage(page: any): NotionPage {
    return {
      id: page.id,
      properties: page.properties,
      createdTime: new Date(page.created_time),
      lastEditedTime: new Date(page.last_edited_time)
    };
  }

  private pageToTask(page: NotionPage): Task {
    const props = page.properties;
    
    return {
      id: page.id,
      title: this.getPropertyValue(props, 'Nome', 'title'),
      description: this.getPropertyValue(props, 'Descrição', 'rich_text'),
      status: this.getPropertyValue(props, 'Status', 'select'),
      priority: this.getPropertyValue(props, 'Prioridade', 'select'),
      dueDate: this.getPropertyValue(props, 'Data de Vencimento', 'date') ? new Date(this.getPropertyValue(props, 'Data de Vencimento', 'date')) : undefined,
      projectId: this.getPropertyValue(props, 'Projeto', 'relation'),
      createdAt: page.createdTime,
      updatedAt: page.lastEditedTime
    };
  }

  private async pageToNote(page: NotionPage): Promise<Note> {
    const props = page.properties;
    
    // Buscar o conteúdo da página
    let content = '';
    try {
      const blocks = await this.client.blocks.children.list({
        block_id: page.id
      });
      
      content = blocks.results
        .filter((block: any) => block.type === 'paragraph')
        .map((block: any) => 
          block.paragraph.rich_text
            .map((text: any) => text.plain_text)
            .join('')
        )
        .join('\n');
    } catch (error) {
      console.warn('Erro ao buscar conteúdo da nota:', error);
    }
    
    return {
      id: page.id,
      title: this.getPropertyValue(props, 'Título', 'title'),
      content,
      tags: this.getPropertyValue(props, 'Tags', 'multi_select') || [],
      createdAt: page.createdTime,
      updatedAt: page.lastEditedTime
    };
  }

  private pageToProject(page: NotionPage): Project {
    const props = page.properties;
    
    return {
      id: page.id,
      name: this.getPropertyValue(props, 'Nome', 'title'),
      description: this.getPropertyValue(props, 'Descrição', 'rich_text'),
      status: this.getPropertyValue(props, 'Status', 'select'),
      startDate: this.getPropertyValue(props, 'Data de Início', 'date') ? new Date(this.getPropertyValue(props, 'Data de Início', 'date')) : undefined,
      endDate: this.getPropertyValue(props, 'Data de Fim', 'date') ? new Date(this.getPropertyValue(props, 'Data de Fim', 'date')) : undefined,
      createdAt: page.createdTime,
      updatedAt: page.lastEditedTime
    };
  }

  private getPropertyValue(properties: any, propertyName: string, type: string): any {
    const property = properties[propertyName];
    if (!property) return null;

    switch (type) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'rich_text':
        return property.rich_text?.map((text: any) => text.plain_text).join('') || '';
      case 'select':
        return property.select?.name || null;
      case 'multi_select':
        return property.multi_select?.map((item: any) => item.name) || [];
      case 'date':
        return property.date?.start || null;
      case 'relation':
        return property.relation?.[0]?.id || null;
      case 'number':
        return property.number || null;
      case 'checkbox':
        return property.checkbox || false;
      default:
        return null;
    }
  }
}

// Instância singleton
export const notionClient = new NotionClient();