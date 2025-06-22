import * as vscode from 'vscode';
import { AnalysisResult } from './ContextAnalyzer';
import { WorkspaceConfigManager, WorkspaceConfig } from './WorkspaceConfigManager';

export interface ProjectContext {
    projectType: string;
    language: string;
    framework?: string;
    currentFile?: string;
    selectedCode?: string;
    relatedFiles?: string[];
    gitBranch?: string;
    errors?: vscode.Diagnostic[];
}

export class CopilotChatIntegration {
    private static readonly DEFAULT_SYSTEM_PROMPT = `You are GitHub Copilot enhanced with Think Center perspectives:

🧵 **Weaver** - Architecture & Patterns (system design, abstractions, long-term thinking)
🔨 **Maker** - Implementation & Execution (concrete code, pragmatic solutions, getting things done)  
✓ **Checker** - Quality & Validation (testing, edge cases, security, performance issues)
🔍 **O/G** - Developer Experience (workflow, maintainability, team impact, usability)
⚖️ **E/E** - Technical Tradeoffs (performance, technology choices, resource optimization)

**Interaction Protocol**: Users invoke perspectives by name: "Weaver, how should we structure this?" or "Maker and Checker, debate this approach"

**Key Principles**: 
- Conscious perspective selection IS the thinking process
- Productive tension between viewpoints creates insights  
- Each perspective contributes unique expertise
- Trust is granted immediately, respect is earned through quality

Ready for multi-perspective development thinking!`;

    private outputChannel: vscode.OutputChannel;
    private configManager: WorkspaceConfigManager | null = null;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Think Center');
        this.initializeConfigManager();
    }

    private initializeConfigManager(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            this.configManager = new WorkspaceConfigManager(workspaceFolders[0].uri.fsPath);
        }
    }

    async createConfigFiles(): Promise<void> {
        if (!this.configManager) {
            vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
            return;
        }

        try {
            await this.configManager.createTemplateFiles();
            vscode.window.showInformationMessage(
                '📝 Think Center configuration files created!',
                'Open Instructions',
                'Open Prompts'
            ).then(selection => {
                if (selection === 'Open Instructions') {
                    vscode.workspace.openTextDocument(vscode.Uri.file(
                        vscode.workspace.workspaceFolders![0].uri.fsPath + '/.github/copilot-instructions.md'
                    )).then(doc => vscode.window.showTextDocument(doc));
                } else if (selection === 'Open Prompts') {
                    vscode.workspace.openTextDocument(vscode.Uri.file(
                        vscode.workspace.workspaceFolders![0].uri.fsPath + '/.vscode/think-center-prompts.md'
                    )).then(doc => vscode.window.showTextDocument(doc));
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create config files: ${error}`);
        }
    }

    async enhanceExistingInstructions(): Promise<void> {
        if (!this.configManager) {
            vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
            return;
        }

        try {
            const result = await this.configManager.enhanceExistingInstructions();
            
            if (result.enhanced) {
                vscode.window.showInformationMessage(
                    `✨ ${result.message}`,
                    'Open Enhanced File'
                ).then(selection => {
                    if (selection === 'Open Enhanced File' && result.filePath) {
                        vscode.workspace.openTextDocument(vscode.Uri.file(result.filePath))
                            .then(doc => vscode.window.showTextDocument(doc));
                    }
                });
            } else if (result.filePath) {
                vscode.window.showInformationMessage(
                    `ℹ️ ${result.message}`,
                    'Open Existing File'
                ).then(selection => {
                    if (selection === 'Open Existing File') {
                        vscode.workspace.openTextDocument(vscode.Uri.file(result.filePath!))
                            .then(doc => vscode.window.showTextDocument(doc));
                    }
                });
            } else {
                vscode.window.showInformationMessage(
                    `💡 ${result.message}`,
                    'Create New Files'
                ).then(selection => {
                    if (selection === 'Create New Files') {
                        this.createConfigFiles();
                    }
                });
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to enhance instructions: ${error}`);
        }
    }

    private async getSystemPrompt(): Promise<string> {
        if (!this.configManager) {
            return CopilotChatIntegration.DEFAULT_SYSTEM_PROMPT;
        }

        try {
            const config = await this.configManager.getWorkspaceConfig();
            
            let prompt = config.customPrompts?.systemPrompt || CopilotChatIntegration.DEFAULT_SYSTEM_PROMPT;
            
            // Add workspace instructions if available
            if (config.instructions) {
                prompt += `\n\n**Workspace Instructions**:\n${config.instructions}`;
            }
            
            // Add project context if available
            if (config.projectContext) {
                prompt += `\n\n**Project Context**:\n${config.projectContext}`;
            }
            
            return prompt;
        } catch (error) {
            console.error('Failed to load workspace config:', error);
            return CopilotChatIntegration.DEFAULT_SYSTEM_PROMPT;
        }
    }

    async initializeThinkCenter(): Promise<void> {
        try {
            // Get the system prompt (with workspace customizations)
            const systemPrompt = await this.getSystemPrompt();
            
            // Copy the system prompt to clipboard for easy pasting
            await vscode.env.clipboard.writeText(systemPrompt);
            
            // Try to open Copilot Chat
            try {
                await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            } catch (error) {
                // Copilot Chat might not be available, continue anyway
                console.log('Copilot Chat not available, proceeding with fallback');
            }

            const action = await vscode.window.showInformationMessage(
                '🧠 Think Center initialization copied to clipboard!',
                { modal: false },
                'Open Chat & Paste',
                'Show Instructions',
                'Copy Again'
            );

            if (action === 'Open Chat & Paste') {
                try {
                    await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                    // Give a helpful reminder since auto-paste doesn't work
                    setTimeout(() => {
                        vscode.window.showInformationMessage(
                            '📋 Prompt is in clipboard - now paste it in the chat (Cmd+V)',
                            { modal: false }
                        );
                    }, 500);
                } catch (error) {
                    vscode.window.showInformationMessage(
                        '💡 Please open GitHub Copilot Chat manually and paste (Cmd+V) the initialization prompt',
                        { modal: false }
                    );
                }
            } else if (action === 'Show Instructions') {
                await this.showInstructions();
            } else if (action === 'Copy Again') {
                const systemPrompt = await this.getSystemPrompt();
                await vscode.env.clipboard.writeText(systemPrompt);
                vscode.window.showInformationMessage('Think Center prompt copied to clipboard again!');
            }
        } catch (error) {
            console.error('Failed to initialize Think Center in Copilot Chat:', error);
            await this.fallbackInitialization();
        }
    }

    async askPerspectiveInChat(perspective: string, question: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = await this.buildChatPrompt(perspective, question, context);
        
        try {
            // Try to open Copilot Chat
            try {
                await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            } catch (error) {
                // Copilot Chat might not be available
                console.log('Copilot Chat not available');
            }

            await vscode.env.clipboard.writeText(prompt);
            
            vscode.window.showInformationMessage(
                `${this.getPerspectiveEmoji(perspective)} ${this.getPerspectiveName(perspective)} prompt ready! Now paste in Chat (Cmd+V)`,
                'Open Chat',
                'Show Prompt'
            ).then(selection => {
                if (selection === 'Open Chat') {
                    try {
                        vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                        // Remind user to paste
                        setTimeout(() => {
                            vscode.window.showInformationMessage(
                                '📋 Paste the prompt in chat with Cmd+V',
                                { modal: false }
                            );
                        }, 500);
                    } catch (error) {
                        vscode.window.showInformationMessage('Please open GitHub Copilot Chat manually and paste (Cmd+V)');
                    }
                } else if (selection === 'Show Prompt') {
                    this.showPromptInOutput(prompt);
                }
            });
        } catch (error) {
            console.error('Failed to send to Copilot Chat:', error);
            this.showPromptInOutput(prompt);
        }
    }

    async councilMeeting(topic: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = await this.buildCouncilPrompt(topic, context);
        
        try {
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
        } catch (error) {
            console.log('Copilot Chat not available');
        }

        await vscode.env.clipboard.writeText(prompt);
        
        vscode.window.showInformationMessage(
            '🏛️ Council Meeting prompt ready! Now paste in Chat (Cmd+V)',
            'Open Chat',
            'Show Prompt'
        ).then(selection => {
            if (selection === 'Open Chat') {
                try {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                    // Remind user to paste
                    setTimeout(() => {
                        vscode.window.showInformationMessage(
                            '📋 Paste the Council Meeting prompt in chat with Cmd+V',
                            { modal: false }
                        );
                    }, 500);
                } catch (error) {
                    vscode.window.showInformationMessage('Please open GitHub Copilot Chat manually and paste (Cmd+V)');
                }
            } else if (selection === 'Show Prompt') {
                this.showPromptInOutput(prompt);
            }
        });
    }

    async analyzeCode(code: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildAnalysisPrompt(code, context);
        await this.sendPromptToChat(prompt, 'Code Analysis');
    }

    async analyzeFile(fileContent: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildFileAnalysisPrompt(fileContent, context);
        await this.sendPromptToChat(prompt, 'File Analysis');
    }

    async debugWithPerspectives(problem: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildDebugPrompt(problem, context);
        await this.sendPromptToChat(prompt, 'Debug Session');
    }

    private async sendPromptToChat(prompt: string, label: string): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
        } catch (error) {
            console.log('Copilot Chat not available');
        }

        await vscode.env.clipboard.writeText(prompt);
        
        vscode.window.showInformationMessage(
            `🧠 Think Center ${label} prompt ready! Now paste in Chat (Cmd+V)`,
            'Open Chat',
            'Show Prompt'
        ).then(selection => {
            if (selection === 'Open Chat') {
                try {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                    // Remind user to paste
                    setTimeout(() => {
                        vscode.window.showInformationMessage(
                            '📋 Paste the prompt in chat with Cmd+V',
                            { modal: false }
                        );
                    }, 500);
                } catch (error) {
                    vscode.window.showInformationMessage('Please open GitHub Copilot Chat manually and paste (Cmd+V)');
                }
            } else if (selection === 'Show Prompt') {
                this.showPromptInOutput(prompt);
            }
        });
    }

    private async buildChatPrompt(perspective: string, question: string, context: ProjectContext): Promise<string> {
        const emoji = this.getPerspectiveEmoji(perspective);
        const perspectiveName = this.getPerspectiveName(perspective);
        
        // Get workspace-specific prompt for this perspective
        let perspectivePrompt = `Please analyze this from the ${perspectiveName} perspective, focusing on ${this.getPerspectiveFocus(perspective)}.`;
        
        if (this.configManager) {
            try {
                const config = await this.configManager.getWorkspaceConfig();
                const customPrompts = config.customPrompts;
                
                if (customPrompts) {
                    switch (perspective.toLowerCase()) {
                        case 'weaver':
                            if (customPrompts.weaverPrompt) perspectivePrompt = customPrompts.weaverPrompt;
                            break;
                        case 'maker':
                            if (customPrompts.makerPrompt) perspectivePrompt = customPrompts.makerPrompt;
                            break;
                        case 'checker':
                            if (customPrompts.checkerPrompt) perspectivePrompt = customPrompts.checkerPrompt;
                            break;
                        case 'og':
                            if (customPrompts.ogPrompt) perspectivePrompt = customPrompts.ogPrompt;
                            break;
                        case 'ee':
                            if (customPrompts.eePrompt) perspectivePrompt = customPrompts.eePrompt;
                            break;
                    }
                }
                
                // Add workspace instructions if available
                if (config.instructions) {
                    perspectivePrompt += `\n\n**Workspace Guidelines**: ${config.instructions}`;
                }
            } catch (error) {
                console.error('Failed to load workspace config for chat prompt:', error);
            }
        }
        
        return `**${emoji} ${perspectiveName}** analysis requested:

**Context**: ${this.formatContext(context)}
**Question**: ${question}

${perspectivePrompt}`;
    }

    private async buildCouncilPrompt(topic: string, context: ProjectContext): Promise<string> {
        let basePrompt = `**🏛️ Think Center Council Meeting**

**Context**: ${this.formatContext(context)}
**Topic**: ${topic}

**Council Assembly**:
🧵 **Weaver**: Architecture and design patterns
🔨 **Maker**: Implementation quality and pragmatic concerns  
✓ **Checker**: Potential issues, bugs, and improvements
🔍 **O/G**: Developer experience and maintainability
⚖️ **E/E**: Performance and optimization opportunities

Each perspective will analyze this topic and contribute their unique insights.`;

        // Add workspace-specific council guidelines
        if (this.configManager) {
            try {
                const config = await this.configManager.getWorkspaceConfig();
                
                if (config.customPrompts?.councilPrompt) {
                    basePrompt += `\n\n**Workspace Council Guidelines**: ${config.customPrompts.councilPrompt}`;
                }
                
                if (config.instructions) {
                    basePrompt += `\n\n**Workspace Instructions**: ${config.instructions}`;
                }
            } catch (error) {
                console.error('Failed to load workspace config for council prompt:', error);
            }
        }
        
        basePrompt += '\n\nLet the Council begin:';
        return basePrompt;
    }

    private buildAnalysisPrompt(code: string, context: ProjectContext): string {
        return `**🔍 Think Center Code Analysis**

**Context**: ${this.formatContext(context)}

**Code to Analyze**:
\`\`\`${context.language}
${code}
\`\`\`

**Multi-Perspective Analysis**:
- **Weaver**: Architecture and design patterns
- **Maker**: Implementation quality and pragmatic concerns
- **Checker**: Potential issues, bugs, and improvements
- **O/G**: Developer experience and maintainability
- **E/E**: Performance and optimization opportunities

Provide insights from each relevant perspective:`;
    }

    private buildFileAnalysisPrompt(fileContent: string, context: ProjectContext): string {
        const fileName = context.currentFile?.split('/').pop() || 'file';
        
        return `**📁 Think Center File Analysis: ${fileName}**

**Context**: ${this.formatContext(context)}

**File Overview**: Analyzing ${fileName} (${fileContent.split('\n').length} lines)

**Multi-Perspective Analysis**:
Please analyze this file from the perspective of Weaver (architecture), Checker (quality), and O/G (maintainability):

\`\`\`${context.language}
${fileContent.length > 2000 ? fileContent.substring(0, 2000) + '\n... (truncated)' : fileContent}
\`\`\``;
    }

    private buildDebugPrompt(problem: string, context: ProjectContext): string {
        return `**🐛 Think Center Debug Session**

**Context**: ${this.formatContext(context)}
**Problem**: ${problem}

**Debug Strategy**:
- **Checker**: Systematic diagnosis and root cause analysis
- **Maker**: Practical solutions and quick fixes
- **O/G**: Impact on developer workflow and team
- **E/E**: Performance implications and optimization

Let's debug this step-by-step with multiple perspectives:`;
    }

    private getPerspectiveEmoji(perspective: string): string {
        const emojis: { [key: string]: string } = {
            'weaver': '🧵',
            'maker': '🔨',
            'checker': '✓',
            'og': '🔍',
            'ee': '⚖️'
        };
        return emojis[perspective.toLowerCase()] || '🧠';
    }

    private getPerspectiveName(perspective: string): string {
        const names: { [key: string]: string } = {
            'weaver': 'Weaver',
            'maker': 'Maker',
            'checker': 'Checker',
            'og': 'Observer/Guardian',
            'ee': 'Explorer/Exploiter'
        };
        return names[perspective.toLowerCase()] || perspective;
    }

    private getPerspectiveFocus(perspective: string): string {
        const focuses: { [key: string]: string } = {
            'weaver': 'architecture patterns and system design',
            'maker': 'practical implementation and execution',
            'checker': 'quality assurance and validation',
            'og': 'developer experience and team impact',
            'ee': 'technical tradeoffs and optimization'
        };
        return focuses[perspective.toLowerCase()] || 'multi-perspective analysis';
    }

    private formatContext(context: ProjectContext): string {
        const parts: string[] = [];
        
        if (context?.projectType && context.projectType !== 'unknown') {
            parts.push(`${context.projectType} project`);
        }
        
        if (context?.framework) {
            parts.push(context.framework);
        }
        
        if (context?.language) {
            parts.push(context.language);
        }
        
        if (context?.currentFile) {
            parts.push(context.currentFile.split('/').pop() || '');
        }

        if (context?.errors && context.errors.length > 0) {
            parts.push(`${context.errors.length} diagnostic(s)`);
        }

        return parts.filter(Boolean).join(' | ') || 'Development context';
    }

    private async showInstructions(): Promise<void> {
        const systemPrompt = await this.getSystemPrompt();
        const panel = vscode.window.createWebviewPanel(
            'thinkCenterInstructions',
            'Think Center + Copilot Chat',
            vscode.ViewColumn.Beside,
            { enableScripts: false }
        );

        panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    font-family: var(--vscode-font-family); 
                    padding: 20px; 
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .step { margin-bottom: 20px; }
                .code { 
                    background: var(--vscode-textCodeBlock-background); 
                    padding: 15px; 
                    border-radius: 4px; 
                    border-left: 3px solid var(--vscode-textLink-foreground);
                    margin: 10px 0;
                    white-space: pre-wrap;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                }
                h1, h3 { color: var(--vscode-textLink-foreground); }
                ul { padding-left: 20px; }
                li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>🧠 Think Center + Copilot Chat Integration</h1>
            <p><em>Based on the Think Center framework by <a href="https://github.com/achamian/think-center">@achamian</a></em></p>
            
            <div class="step">
                <h3>Step 1: Initialize (One Time)</h3>
                <p>Paste this in Copilot Chat to activate Think Center:</p>
                <div class="code">${systemPrompt}</div>
            </div>
            
            <div class="step">
                <h3>Step 2: Use Perspectives</h3>
                <p>Examples:</p>
                <ul>
                    <li><strong>Weaver</strong>: "Weaver, how should I structure this API?"</li>
                    <li><strong>Maker</strong>: "Maker, what's the implementation approach?"</li>
                    <li><strong>Checker</strong>: "Checker, what could go wrong with this code?"</li>
                    <li><strong>Council</strong>: "Council meeting: Should we use microservices?"</li>
                </ul>
            </div>
            
            <div class="step">
                <h3>Step 3: Advanced Patterns</h3>
                <ul>
                    <li><strong>Paired thinking:</strong> "Weaver and Maker, explore this together"</li>
                    <li><strong>Debate mode:</strong> "Checker and E/E, debate this approach"</li>
                    <li><strong>Council meetings:</strong> "Full council analysis of this architecture"</li>
                    <li><strong>Sequential analysis:</strong> "Weaver → Maker → Checker analysis"</li>
                </ul>
            </div>

            <div class="step">
                <h3>Step 4: Extension Features</h3>
                <ul>
                    <li><strong>Cmd+Shift+T</strong>: Open Think Center panel</li>
                    <li><strong>Cmd+Shift+W</strong>: Ask Weaver directly</li>
                    <li><strong>Cmd+Shift+M</strong>: Ask Maker directly</li>
                    <li><strong>Cmd+Shift+C</strong>: Ask Checker directly</li>
                    <li><strong>Right-click</strong> on selected code → Think Center</li>
                </ul>
            </div>
        </body>
        </html>`;
    }

    private async fallbackInitialization(): Promise<void> {
        const systemPrompt = await this.getSystemPrompt();
        vscode.window.showInformationMessage(
            'Think Center prompt copied to clipboard! Paste in any AI chat to activate.',
            'Show Prompt'
        ).then(selection => {
            if (selection === 'Show Prompt') {
                this.showPromptInOutput(systemPrompt);
            }
        });
    }

    private showPromptInOutput(prompt: string): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('Think Center Prompt:');
        this.outputChannel.appendLine('='.repeat(50));
        this.outputChannel.appendLine(prompt);
        this.outputChannel.appendLine('='.repeat(50));
        this.outputChannel.appendLine('Copy this prompt and paste it in GitHub Copilot Chat');
        this.outputChannel.show();
    }

    /**
     * Converts AnalysisResult from ContextAnalyzer to ProjectContext for compatibility
     */
    private analysisToProjectContext(analysis: AnalysisResult): ProjectContext {
        return {
            projectType: analysis.context.projectType || 'unknown',
            language: analysis.context.language || 'unknown',
            framework: analysis.context.projectType,
            currentFile: analysis.context.activeFile,
            selectedCode: analysis.context.selectedText,
            relatedFiles: analysis.context.dependencies,
            gitBranch: analysis.context.gitRepository
        };
    }
}
