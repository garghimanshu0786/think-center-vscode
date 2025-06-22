import * as vscode from 'vscode';
import { ThinkCenterPanel } from './panels/ThinkCenterPanel';
import { PerspectiveProvider } from './providers/PerspectiveProvider';
import { CopilotChatIntegration } from './services/CopilotChatIntegration';
import { ContextAnalyzer } from './services/ContextAnalyzer';

export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('🧠 Think Center extension is now active!');

        // Initialize services
        const copilotChatIntegration = new CopilotChatIntegration();
        const contextAnalyzer = ContextAnalyzer.getInstance();
        const perspectiveProvider = new PerspectiveProvider();

        // Register tree data provider
        vscode.window.createTreeView('thinkCenter.perspectives', {
            treeDataProvider: perspectiveProvider,
            showCollapseAll: true
        });

        // Register commands
        registerCommands(context, copilotChatIntegration, contextAnalyzer);

        // Register panel
        context.subscriptions.push(
            vscode.commands.registerCommand('thinkCenter.openPanel', () => {
                ThinkCenterPanel.createOrShow(context.extensionUri);
            })
        );

        // Set context for when extension is enabled
        vscode.commands.executeCommand('setContext', 'thinkCenter.enabled', true);

        // Show welcome message
        vscode.window.showInformationMessage(
            '🧠 Think Center is ready! Press Cmd+Shift+T for panel or Cmd+Shift+I for Copilot Chat.',
            'Open Panel',
            'Initialize Chat'
        ).then(selection => {
            if (selection === 'Open Panel') {
                vscode.commands.executeCommand('thinkCenter.openPanel');
            } else if (selection === 'Initialize Chat') {
                vscode.commands.executeCommand('thinkCenter.initializeCopilotChat');
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Think Center activation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Think Center activation error:', error);
    }
}

function registerCommands(
    context: vscode.ExtensionContext,
    copilotChatIntegration: CopilotChatIntegration,
    contextAnalyzer: ContextAnalyzer
) {
    // Copilot Chat integration command
    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.initializeCopilotChat', () => {
            copilotChatIntegration.initializeThinkCenter();
        })
    );

    // Individual perspective commands
    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.askWeaver', () => {
            askPerspective('weaver', copilotChatIntegration, contextAnalyzer);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.askMaker', () => {
            askPerspective('maker', copilotChatIntegration, contextAnalyzer);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.askChecker', () => {
            askPerspective('checker', copilotChatIntegration, contextAnalyzer);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.askOG', () => {
            askPerspective('og', copilotChatIntegration, contextAnalyzer);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.askEE', () => {
            askPerspective('ee', copilotChatIntegration, contextAnalyzer);
        })
    );

    // Council meeting command
    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.councilMeeting', () => {
            councilMeeting(copilotChatIntegration, contextAnalyzer);
        })
    );

    // Analysis commands
    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.analyzeSelection', () => {
            analyzeSelection(copilotChatIntegration, contextAnalyzer);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.analyzeFile', (uri: vscode.Uri) => {
            analyzeFile(uri, copilotChatIntegration, contextAnalyzer);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.debugWithPerspectives', () => {
            debugWithPerspectives(copilotChatIntegration, contextAnalyzer);
        })
    );

    // Configuration commands
    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.createConfigFiles', () => {
            copilotChatIntegration.createConfigFiles();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('thinkCenter.enhanceInstructions', () => {
            copilotChatIntegration.enhanceExistingInstructions();
        })
    );
}

async function askPerspective(
    perspective: string,
    copilotChatIntegration: CopilotChatIntegration,
    contextAnalyzer: ContextAnalyzer
) {
    try {
        const question = await vscode.window.showInputBox({
            prompt: `Ask ${perspective.charAt(0).toUpperCase() + perspective.slice(1)}`,
            placeHolder: 'What would you like to explore?'
        });

        if (!question) return;

        const context = await contextAnalyzer.analyzeCurrentContext();
        await copilotChatIntegration.askPerspectiveInChat(perspective, question, context);
    } catch (error) {
        vscode.window.showErrorMessage(`Think Center error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Think Center askPerspective error:', error);
    }
}

async function councilMeeting(
    copilotChatIntegration: CopilotChatIntegration,
    contextAnalyzer: ContextAnalyzer
) {
    try {
        const topic = await vscode.window.showInputBox({
            prompt: 'Council Meeting Topic',
            placeHolder: 'What challenge should the council address?'
        });

        if (!topic) return;

        const context = await contextAnalyzer.analyzeCurrentContext();
        await copilotChatIntegration.councilMeeting(topic, context);
    } catch (error) {
        vscode.window.showErrorMessage(`Think Center council meeting error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Think Center councilMeeting error:', error);
    }
}

async function analyzeSelection(
    copilotChatIntegration: CopilotChatIntegration,
    contextAnalyzer: ContextAnalyzer
) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showWarningMessage('Please select some code to analyze');
            return;
        }

        const selectedText = editor.document.getText(editor.selection);
        const context = await contextAnalyzer.analyzeCurrentContext();
        
        await copilotChatIntegration.analyzeCode(selectedText, context);
    } catch (error) {
        vscode.window.showErrorMessage(`Think Center analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Think Center analyzeSelection error:', error);
    }
}

async function analyzeFile(
    uri: vscode.Uri,
    copilotChatIntegration: CopilotChatIntegration,
    contextAnalyzer: ContextAnalyzer
) {
    try {
        const document = await vscode.workspace.openTextDocument(uri);
        const context = await contextAnalyzer.analyzeCurrentContext();
        
        await copilotChatIntegration.analyzeFile(document.getText(), context);
    } catch (error) {
        vscode.window.showErrorMessage(`Think Center file analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Think Center analyzeFile error:', error);
    }
}

async function debugWithPerspectives(
    copilotChatIntegration: CopilotChatIntegration,
    contextAnalyzer: ContextAnalyzer
) {
    try {
        const problem = await vscode.window.showInputBox({
            prompt: 'Describe the bug or issue',
            placeHolder: 'What problem are you trying to solve?'
        });

        if (!problem) return;

        const context = await contextAnalyzer.analyzeCurrentContext();
        await copilotChatIntegration.debugWithPerspectives(problem, context);
    } catch (error) {
        vscode.window.showErrorMessage(`Think Center debug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Think Center debugWithPerspectives error:', error);
    }
}

export function deactivate() {
    console.log('Think Center extension is now deactivated');
}
