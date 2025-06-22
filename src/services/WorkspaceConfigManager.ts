import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface WorkspaceConfig {
    instructions?: string;
    customPrompts?: {
        systemPrompt?: string;
        weaverPrompt?: string;
        makerPrompt?: string;
        checkerPrompt?: string;
        ogPrompt?: string;
        eePrompt?: string;
        councilPrompt?: string;
    };
    projectContext?: string;
}

export class WorkspaceConfigManager {
    private static readonly CONFIG_FILES = [
        '.github/instructions/.instructions.md'
    ];

    private static readonly PROMPT_FILES = [
        '.vscode/think-center-prompts.md',
        '.vscode/prompts.md',
        'think-center-prompts.md',
        'prompts.md'
    ];

    private workspaceRoot: string;
    private cachedConfig: WorkspaceConfig | null = null;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
    }

    async getWorkspaceConfig(): Promise<WorkspaceConfig> {
        if (this.cachedConfig) {
            return this.cachedConfig;
        }

        const config: WorkspaceConfig = {};

        // Load instructions
        config.instructions = await this.loadInstructions();
        
        // Load custom prompts
        config.customPrompts = await this.loadCustomPrompts();
        
        // Load project context
        config.projectContext = await this.loadProjectContext();

        this.cachedConfig = config;
        return config;
    }

    async createTemplateFiles(): Promise<void> {
        const instructionsPath = path.join(this.workspaceRoot, '.github', 'instructions', '.instructions.md');
        const promptsPath = path.join(this.workspaceRoot, '.vscode', 'think-center-prompts.md');

        // Create .github/instructions directory if it doesn't exist
        const instructionsDir = path.join(this.workspaceRoot, '.github', 'instructions');
        if (!fs.existsSync(instructionsDir)) {
            fs.mkdirSync(instructionsDir, { recursive: true });
        }

        // Create .vscode directory if it doesn't exist
        const vscodeDir = path.join(this.workspaceRoot, '.vscode');
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(vscodeDir, { recursive: true });
        }

        // Create instructions.md template
        if (!fs.existsSync(instructionsPath)) {
            const instructionsTemplate = this.getInstructionsTemplate();
            fs.writeFileSync(instructionsPath, instructionsTemplate);
        }

        // Create think-center-prompts.md template
        if (!fs.existsSync(promptsPath)) {
            const promptsTemplate = this.getPromptsTemplate();
            fs.writeFileSync(promptsPath, promptsTemplate);
        }

        // Invalidate cache
        this.cachedConfig = null;
    }

    async enhanceExistingInstructions(): Promise<{ enhanced: boolean; filePath?: string; message: string }> {
        // Look for existing instructions files
        for (const configFile of WorkspaceConfigManager.CONFIG_FILES) {
            const filePath = path.join(this.workspaceRoot, configFile);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    // Check if it already has Think Center sections
                    if (this.hasThinkCenterSections(content)) {
                        return {
                            enhanced: false,
                            filePath,
                            message: `${configFile} already contains Think Center sections`
                        };
                    }

                    // Enhance the existing file
                    const enhancedContent = this.addThinkCenterSections(content);
                    fs.writeFileSync(filePath, enhancedContent);
                    
                    // Invalidate cache
                    this.cachedConfig = null;
                    
                    return {
                        enhanced: true,
                        filePath,
                        message: `Enhanced ${configFile} with Think Center sections`
                    };
                } catch (error) {
                    console.error(`Failed to enhance ${configFile}:`, error);
                }
            }
        }

        // No existing instructions found, suggest creating new
        return {
            enhanced: false,
            message: 'No existing instructions file found. Create new configuration files instead.'
        };
    }

    private async loadInstructions(): Promise<string | undefined> {
        for (const configFile of WorkspaceConfigManager.CONFIG_FILES) {
            const filePath = path.join(this.workspaceRoot, configFile);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    return this.extractThinkCenterInstructions(content);
                } catch (error) {
                    console.log(`Failed to read ${configFile}:`, error);
                }
            }
        }
        return undefined;
    }

    private async loadCustomPrompts(): Promise<WorkspaceConfig['customPrompts'] | undefined> {
        for (const promptFile of WorkspaceConfigManager.PROMPT_FILES) {
            const filePath = path.join(this.workspaceRoot, promptFile);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    return this.parseCustomPrompts(content);
                } catch (error) {
                    console.log(`Failed to read ${promptFile}:`, error);
                }
            }
        }
        return undefined;
    }

    private async loadProjectContext(): Promise<string | undefined> {
        // Look for README, project description, etc.
        const contextFiles = ['README.md', 'docs/README.md', 'PROJECT.md'];
        
        for (const contextFile of contextFiles) {
            const filePath = path.join(this.workspaceRoot, contextFile);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    // Extract first few paragraphs as project context
                    const lines = content.split('\n');
                    const description = lines.slice(0, 10).join('\n').substring(0, 500);
                    return description;
                } catch (error) {
                    console.log(`Failed to read ${contextFile}:`, error);
                }
            }
        }
        return undefined;
    }

    private extractThinkCenterInstructions(content: string): string | undefined {
        // Look for Think Center specific instructions
        const thinkCenterSections = [
            /# Think Center.*?\n(.*?)(?=\n#|$)/is,
            /## Think Center.*?\n(.*?)(?=\n##|$)/is,
            /<!-- Think Center.*?-->\n(.*?)(?=\n<!--|$)/is
        ];

        for (const regex of thinkCenterSections) {
            const match = content.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
        }

        // If no specific section found, return the whole content if it's short
        if (content.length < 1000) {
            return content.trim();
        }

        return undefined;
    }

    private parseCustomPrompts(content: string): WorkspaceConfig['customPrompts'] {
        const prompts: WorkspaceConfig['customPrompts'] = {};

        // Parse sections like ## System Prompt, ## Weaver, etc.
        const sections = content.split(/^##\s+/m);
        
        for (const section of sections) {
            const lines = section.split('\n');
            const title = lines[0]?.toLowerCase().trim();
            const content = lines.slice(1).join('\n').trim();

            if (!title || !content) continue;

            if (title.includes('system') || title.includes('main')) {
                prompts.systemPrompt = content;
            } else if (title.includes('weaver')) {
                prompts.weaverPrompt = content;
            } else if (title.includes('maker')) {
                prompts.makerPrompt = content;
            } else if (title.includes('checker')) {
                prompts.checkerPrompt = content;
            } else if (title.includes('observer') || title.includes('guardian') || title.includes('o/g')) {
                prompts.ogPrompt = content;
            } else if (title.includes('explorer') || title.includes('exploiter') || title.includes('e/e')) {
                prompts.eePrompt = content;
            } else if (title.includes('council')) {
                prompts.councilPrompt = content;
            }
        }

        return Object.keys(prompts).length > 0 ? prompts : undefined;
    }

    private getInstructionsTemplate(): string {
        return `# Think Center Instructions

This file contains project-specific instructions for Think Center perspectives.

## Project Context

<!-- Describe your project, domain, and any specific considerations -->
This is a [describe your project type] project focused on [main purpose].

## Perspective Guidelines

### Weaver (Architecture)
- Focus on [specific architectural concerns for this project]
- Consider [domain-specific patterns]
- Pay attention to [scalability/maintainability concerns]

### Maker (Implementation)
- Prioritize [performance/readability/other concerns]
- Use [preferred libraries/frameworks]
- Follow [coding standards/conventions]

### Checker (Quality)
- Test for [specific edge cases in this domain]
- Validate [business rules/constraints]
- Check [security/performance requirements]

### Observer/Guardian (Experience)
- Consider [target users/developers]
- Optimize for [workflow/maintainability]
- Document [important patterns/decisions]

### Explorer/Exploiter (Optimization)
- Look for [performance bottlenecks]
- Consider [alternative technologies]
- Balance [competing trade-offs]

## Custom Context

<!-- Any additional context that should be included in all Think Center interactions -->

## Code Style Preferences

<!-- Preferred patterns, anti-patterns, naming conventions, etc. -->
`;
    }

    private getPromptsTemplate(): string {
        return `# Think Center Custom Prompts

Customize the prompts used by Think Center perspectives for this workspace.

## System Prompt

You are GitHub Copilot enhanced with Think Center perspectives for [YOUR PROJECT TYPE]:

🧵 **Weaver** - Architecture & Patterns
🔨 **Maker** - Implementation & Execution  
✓ **Checker** - Quality & Validation
🔍 **O/G** - Developer Experience
⚖️ **E/E** - Technical Tradeoffs

**Project Context**: [Add your project-specific context here]

**Coding Standards**: [Add your standards here]

Ready for multi-perspective development thinking!

## Weaver

Focus on [project-specific architectural concerns]. Consider:
- [Pattern 1]
- [Pattern 2]
- [Scalability concern]

## Maker

For implementation, prioritize:
- [Performance/readability priority]
- [Preferred approach]
- [Framework preferences]

## Checker

Test and validate:
- [Domain-specific edge cases]
- [Business rules]
- [Security requirements]

## Observer/Guardian

Consider the developer experience:
- [Team workflow]
- [Documentation needs]
- [Maintainability]

## Explorer/Exploiter

Optimize for:
- [Performance metrics]
- [Resource constraints]
- [Technical trade-offs]

## Council

For multi-perspective analysis, ensure all perspectives consider:
- [Cross-cutting concern 1]
- [Cross-cutting concern 2]
- [Project-specific trade-offs]
`;
    }

    clearCache(): void {
        this.cachedConfig = null;
    }

    private hasThinkCenterSections(content: string): boolean {
        const thinkCenterIndicators = [
            /# Think Center/i,
            /## Think Center/i,
            /### Weaver/i,
            /### Maker/i,
            /### Checker/i,
            /### Observer\/Guardian/i,
            /### Explorer\/Exploiter/i,
            /## Perspective Guidelines/i
        ];

        return thinkCenterIndicators.some(indicator => indicator.test(content));
    }

    private addThinkCenterSections(existingContent: string): string {
        const thinkCenterSection = `

---

# Think Center Integration

This project now includes Think Center multi-perspective thinking framework.

## Perspective Guidelines

### Weaver (Architecture)
- Focus on [specific architectural concerns for this project]
- Consider [domain-specific patterns]
- Pay attention to [scalability/maintainability concerns]

### Maker (Implementation)
- Prioritize [performance/readability/other concerns]
- Use [preferred libraries/frameworks]
- Follow [coding standards/conventions]

### Checker (Quality)
- Test for [specific edge cases in this domain]
- Validate [business rules/constraints]
- Check [security/performance requirements]

### Observer/Guardian (Experience)
- Consider [target users/developers]
- Optimize for [workflow/maintainability]
- Document [important patterns/decisions]

### Explorer/Exploiter (Optimization)
- Look for [performance bottlenecks]
- Consider [alternative technologies]
- Balance [competing trade-offs]

## Think Center Usage

Use these perspectives when working with AI:
- "Weaver, how should I structure this feature?"
- "Checker, what could go wrong here?"
- "Council meeting: evaluate this architecture decision"

## Custom Context

<!-- Add any additional project-specific context for Think Center -->

---
`;

        return existingContent + thinkCenterSection;
    }
}
