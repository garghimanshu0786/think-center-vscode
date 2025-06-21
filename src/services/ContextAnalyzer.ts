import * as vscode from 'vscode';

export interface CodeContext {
    activeFile?: string;
    selectedText?: string;
    language?: string;
    lineNumber?: number;
    workspaceRoot?: string;
    gitRepository?: string;
    projectType?: string;
    dependencies?: string[];
    recentChanges?: string[];
}

export interface AnalysisResult {
    context: CodeContext;
    relevantPerspectives: string[];
    suggestedPrompts: string[];
    complexity: 'low' | 'medium' | 'high';
}

export class ContextAnalyzer {
    private static instance: ContextAnalyzer;

    public static getInstance(): ContextAnalyzer {
        if (!ContextAnalyzer.instance) {
            ContextAnalyzer.instance = new ContextAnalyzer();
        }
        return ContextAnalyzer.instance;
    }

    /**
     * Analyzes the current VS Code context to understand what the user is working on
     */
    public async analyzeCurrentContext(): Promise<AnalysisResult> {
        const context = await this.gatherCodeContext();
        const relevantPerspectives = this.determineRelevantPerspectives(context);
        const suggestedPrompts = this.generateSuggestedPrompts(context, relevantPerspectives);
        const complexity = this.assessComplexity(context);

        return {
            context,
            relevantPerspectives,
            suggestedPrompts,
            complexity
        };
    }

    /**
     * Gathers comprehensive context from the current VS Code workspace
     */
    private async gatherCodeContext(): Promise<CodeContext> {
        const activeEditor = vscode.window.activeTextEditor;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        const context: CodeContext = {};

        // Active file information
        if (activeEditor) {
            context.activeFile = activeEditor.document.fileName;
            context.language = activeEditor.document.languageId;
            context.lineNumber = activeEditor.selection.start.line + 1;
            
            // Selected text
            const selection = activeEditor.selection;
            if (!selection.isEmpty) {
                context.selectedText = activeEditor.document.getText(selection);
            }
        }

        // Workspace information
        if (workspaceFolders && workspaceFolders.length > 0) {
            context.workspaceRoot = workspaceFolders[0].uri.fsPath;
            context.projectType = await this.detectProjectType(workspaceFolders[0].uri);
            context.dependencies = await this.getDependencies(workspaceFolders[0].uri);
        }

        // Git information
        context.gitRepository = await this.getGitRepository();
        context.recentChanges = await this.getRecentChanges();

        return context;
    }

    /**
     * Determines which Think Center perspectives are most relevant for the current context
     */
    private determineRelevantPerspectives(context: CodeContext): string[] {
        const perspectives: string[] = [];

        // Weaver - Architecture and design
        if (this.isArchitecturalContext(context)) {
            perspectives.push('Weaver');
        }

        // Maker - Implementation and coding
        if (this.isImplementationContext(context)) {
            perspectives.push('Maker');
        }

        // Checker - Quality and testing
        if (this.isQualityContext(context)) {
            perspectives.push('Checker');
        }

        // Observer/Guardian - User experience and requirements
        if (this.isUserExperienceContext(context)) {
            perspectives.push('Observer/Guardian');
        }

        // Explorer/Exploiter - Optimization and performance
        if (this.isOptimizationContext(context)) {
            perspectives.push('Explorer/Exploiter');
        }

        // Default to all perspectives if none specifically identified
        if (perspectives.length === 0) {
            perspectives.push('Weaver', 'Maker', 'Checker', 'Observer/Guardian', 'Explorer/Exploiter');
        }

        return perspectives;
    }

    /**
     * Generates suggested prompts based on context and relevant perspectives
     */
    private generateSuggestedPrompts(context: CodeContext, perspectives: string[]): string[] {
        const prompts: string[] = [];

        if (perspectives.includes('Weaver')) {
            prompts.push('Analyze the architecture and design patterns in this code');
            prompts.push('Review the overall structure and suggest improvements');
        }

        if (perspectives.includes('Maker')) {
            prompts.push('Help implement this feature step by step');
            prompts.push('Refactor this code for better maintainability');
        }

        if (perspectives.includes('Checker')) {
            prompts.push('Review this code for potential bugs and issues');
            prompts.push('Suggest comprehensive test cases for this functionality');
        }

        if (perspectives.includes('Observer/Guardian')) {
            prompts.push('Evaluate the user experience of this feature');
            prompts.push('Analyze requirements and edge cases');
        }

        if (perspectives.includes('Explorer/Exploiter')) {
            prompts.push('Identify performance optimization opportunities');
            prompts.push('Explore alternative approaches and trade-offs');
        }

        return prompts;
    }

    /**
     * Assesses the complexity of the current context
     */
    private assessComplexity(context: CodeContext): 'low' | 'medium' | 'high' {
        let complexityScore = 0;

        // File size and selection complexity
        if (context.selectedText && context.selectedText.length > 1000) {
            complexityScore += 2;
        } else if (context.selectedText && context.selectedText.length > 100) {
            complexityScore += 1;
        }

        // Language complexity
        const complexLanguages = ['typescript', 'javascript', 'python', 'java', 'csharp', 'cpp', 'rust'];
        if (context.language && complexLanguages.includes(context.language)) {
            complexityScore += 1;
        }

        // Project type complexity
        if (context.projectType && ['react', 'angular', 'vue', 'nodejs', 'django'].includes(context.projectType)) {
            complexityScore += 1;
        }

        // Dependencies complexity
        if (context.dependencies && context.dependencies.length > 20) {
            complexityScore += 2;
        } else if (context.dependencies && context.dependencies.length > 10) {
            complexityScore += 1;
        }

        if (complexityScore >= 4) {
            return 'high';
        } else if (complexityScore >= 2) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    // Helper methods for context detection
    private isArchitecturalContext(context: CodeContext): boolean {
        const architecturalFiles = ['.md', '.txt', 'config', 'package.json', 'tsconfig.json'];
        const fileName = context.activeFile?.toLowerCase() || '';
        return architecturalFiles.some(ext => fileName.includes(ext)) ||
               Boolean(context.selectedText?.includes('class ')) ||
               Boolean(context.selectedText?.includes('interface ')) ||
               Boolean(context.selectedText?.includes('architecture')) ||
               Boolean(context.selectedText?.includes('design'));
    }

    private isImplementationContext(context: CodeContext): boolean {
        const codeLanguages = ['typescript', 'javascript', 'python', 'java', 'csharp', 'cpp', 'rust', 'go'];
        return codeLanguages.includes(context.language || '') ||
               Boolean(context.selectedText?.includes('function ')) ||
               Boolean(context.selectedText?.includes('const ')) ||
               Boolean(context.selectedText?.includes('def '));
    }

    private isQualityContext(context: CodeContext): boolean {
        const testFiles = ['test', 'spec', '.test.', '.spec.'];
        const fileName = context.activeFile?.toLowerCase() || '';
        return testFiles.some(pattern => fileName.includes(pattern)) ||
               Boolean(context.selectedText?.includes('test')) ||
               Boolean(context.selectedText?.includes('expect')) ||
               Boolean(context.selectedText?.includes('assert'));
    }

    private isUserExperienceContext(context: CodeContext): boolean {
        const uxFiles = ['component', 'view', 'page', 'ui', 'ux'];
        const fileName = context.activeFile?.toLowerCase() || '';
        return uxFiles.some(pattern => fileName.includes(pattern)) ||
               Boolean(context.selectedText?.includes('user')) ||
               Boolean(context.selectedText?.includes('UI')) ||
               Boolean(context.selectedText?.includes('interface'));
    }

    private isOptimizationContext(context: CodeContext): boolean {
        return Boolean(context.selectedText?.includes('performance')) ||
               Boolean(context.selectedText?.includes('optimize')) ||
               Boolean(context.selectedText?.includes('efficient')) ||
               Boolean(context.selectedText?.includes('cache')) ||
               Boolean(context.selectedText?.includes('memory'));
    }

    // Utility methods for gathering additional context
    private async detectProjectType(workspaceUri: vscode.Uri): Promise<string | undefined> {
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceUri, 'package.json');
            const packageJson = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageData = JSON.parse(packageJson.toString());
            
            // Detect framework based on dependencies
            const dependencies = { ...packageData.dependencies, ...packageData.devDependencies };
            
            if (dependencies.react) return 'react';
            if (dependencies.angular || dependencies['@angular/core']) return 'angular';
            if (dependencies.vue) return 'vue';
            if (dependencies.express) return 'nodejs';
            if (dependencies.next) return 'nextjs';
            
            return 'javascript';
        } catch {
            return undefined;
        }
    }

    private async getDependencies(workspaceUri: vscode.Uri): Promise<string[]> {
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceUri, 'package.json');
            const packageJson = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageData = JSON.parse(packageJson.toString());
            
            const dependencies = { ...packageData.dependencies, ...packageData.devDependencies };
            return Object.keys(dependencies);
        } catch {
            return [];
        }
    }

    private async getGitRepository(): Promise<string | undefined> {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
            if (gitExtension) {
                const api = gitExtension.getAPI(1);
                if (api.repositories.length > 0) {
                    return api.repositories[0].rootUri.fsPath;
                }
            }
        } catch {
            // Git extension not available or no repository
        }
        return undefined;
    }

    private async getRecentChanges(): Promise<string[]> {
        // Placeholder for git changes analysis
        // Could be enhanced to actually read git log or diff
        return [];
    }
}
