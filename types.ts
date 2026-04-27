
export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  FINANCE = 'Finance',
  EDUCATION = 'Education',
  OTHER = 'Other'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  createdAt: number;
}

/**
 * Interface representing a task categorized and prioritized by the AI.
 */
export interface AnalyzedTask {
  id: string;
  category: string;
  duration: string;
  priority: number;
}

/**
 * Interface representing the complete structured analysis result from Gemini.
 */
export interface AIAnalysisResult {
  tasks: AnalyzedTask[];
  suggestedOrder: string[];
  reasoning: string;
}
