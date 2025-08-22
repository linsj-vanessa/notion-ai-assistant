import { config } from './config/config';
import { initializeNotion, NotionServices } from './notion';
import { initializeNLP, NLPSystem } from './nlp';

/**
 * Classe principal do Alfred - Assistente Digital de Produtividade
 */
class AlfredAssistant {
  private notionServices: NotionServices | null = null;
  private nlpSystem: NLPSystem | null = null;
  private isInitialized = false;

  /**
   * Inicializa todos os sistemas do Alfred
   */
  async initialize(): Promise<void> {
    console.log('🤖 Iniciando Alfred - Assistente Digital de Produtividade...');
    
    try {
      // Validar configurações
      this.validateConfiguration();
      
      // Inicializar integração com Notion
      console.log('🔗 Conectando ao Notion...');
      this.notionServices = await initializeNotion();
      
      // Inicializar sistema NLP
      console.log('🧠 Inicializando sistema de processamento de linguagem natural...');
      this.nlpSystem = await initializeNLP(this.notionServices);
      
      this.isInitialized = true;
      console.log('✅ Alfred inicializado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Alfred:', error);
      throw error;
    }
  }

  /**
   * Valida configurações necessárias
   */
  private validateConfiguration(): void {
    if (!config.notion.token) {
      throw new Error('Token do Notion não configurado. Verifique o arquivo .env');
    }
    
    if (!config.openai.apiKey) {
      throw new Error('Chave da API OpenAI não configurada. Verifique o arquivo .env');
    }
  }

  /**
   * Processa comando em linguagem natural
   */
  async processCommand(input: string, sessionId?: string): Promise<string> {
    if (!this.isInitialized || !this.nlpSystem) {
      throw new Error('Alfred não foi inicializado. Chame initialize() primeiro.');
    }

    try {
      const result = await this.nlpSystem.processAndExecute(input, sessionId);
      return result.commandResult.message || 'Comando processado com sucesso.';
    } catch (error) {
      console.error('Erro ao processar comando:', error);
      return 'Desculpe, ocorreu um erro ao processar seu comando. Tente novamente.';
    }
  }

  /**
   * Inicia interface CLI
   */
  async startCLI(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('💻 Iniciando interface CLI...');
    console.log('Digite "ajuda" para ver comandos disponíveis ou "sair" para terminar.\n');
    
    // Simulação de comandos CLI para demonstração
    const demoCommands = [
      'ajuda',
      'criar tarefa: Implementar interface CLI',
      'listar tarefas pendentes',
      'mostrar dashboard'
    ];

    for (const command of demoCommands) {
      console.log(`> ${command}`);
      const response = await this.processCommand(command);
      console.log(`🤖 ${response}\n`);
      
      // Pequena pausa para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('💡 Esta é uma demonstração. A interface CLI interativa será implementada em breve.');
  }

  /**
   * Inicia interface web
   */
  async startWeb(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('🌐 Iniciando interface web...');
    console.log('⚠️ Interface web ainda não implementada. Use --cli para interface de linha de comando.');
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats(): any {
    if (!this.isInitialized || !this.nlpSystem) {
      return null;
    }

    return {
      notion: this.notionServices ? 'Conectado' : 'Desconectado',
      nlp: this.nlpSystem.getSystemStats(),
      initialized: this.isInitialized
    };
  }
}

/**
 * Função principal do Alfred
 */
async function main() {
  try {
    const alfred = new AlfredAssistant();
    
    // Determinar interface (CLI ou Web)
    const useWebInterface = process.argv.includes('--web') || config.features.webInterface;
    const useCLI = process.argv.includes('--cli') || !useWebInterface;
    
    if (useWebInterface) {
      await alfred.startWeb();
    } else if (useCLI) {
      await alfred.startCLI();
    } else {
      // Inicializar apenas o sistema
      await alfred.initialize();
      console.log('🎯 Alfred inicializado. Use --cli ou --web para escolher a interface.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar Alfred:', error);
    process.exit(1);
  }
}

// Exportar classe para uso em outros módulos
export { AlfredAssistant };

// Executar aplicação
if (require.main === module) {
  main().catch(console.error);
}