import { NotionAssistant } from './core/NotionAssistant.js';
import { CLIInterface } from './interfaces/CLIInterface.js';
import { WebInterface } from './interfaces/WebInterface.js';
import { config } from './config/config.js';
import chalk from 'chalk';

async function main() {
  console.log(chalk.blue.bold('🤖 Notion AI Assistant - Alfred Digital'));
  console.log(chalk.gray('Iniciando sistema...\n'));

  try {
    // Inicializar assistente principal
    const assistant = new NotionAssistant(config);
    await assistant.initialize();

    // Verificar modo de execução
    const mode = process.argv[2] || 'cli';

    switch (mode) {
      case 'web':
        const webInterface = new WebInterface(assistant);
        await webInterface.start();
        break;
      case 'cli':
      default:
        const cliInterface = new CLIInterface(assistant);
        await cliInterface.start();
        break;
    }
  } catch (error) {
    console.error(chalk.red('❌ Erro ao inicializar:'), error.message);
    process.exit(1);
  }
}

main();