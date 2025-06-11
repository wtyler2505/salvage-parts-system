export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Array<{
    id: string;
    type: string;
    data: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private activeJobs = new Map<Worker, string>();

  constructor(workerScript: string, poolSize: number = 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = this.handleWorkerMessage.bind(this);
      worker.onerror = this.handleWorkerError.bind(this);
      
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const worker = event.target as Worker;
    const { type, data, id, error } = event.data;

    const taskId = this.activeJobs.get(worker);
    if (!taskId) return;

    const task = this.taskQueue.find(t => t.id === taskId);
    if (!task) return;

    // Remove task from queue and active jobs
    const taskIndex = this.taskQueue.indexOf(task);
    if (taskIndex >= 0) {
      this.taskQueue.splice(taskIndex, 1);
    }
    this.activeJobs.delete(worker);

    // Return worker to available pool
    this.availableWorkers.push(worker);

    // Resolve or reject the task
    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(data);
    }

    // Process next task if available
    this.processNextTask();
  }

  private handleWorkerError(event: ErrorEvent): void {
    const worker = event.target as Worker;
    const taskId = this.activeJobs.get(worker);
    
    if (taskId) {
      const task = this.taskQueue.find(t => t.id === taskId);
      if (task) {
        task.reject(new Error(event.message));
        const taskIndex = this.taskQueue.indexOf(task);
        if (taskIndex >= 0) {
          this.taskQueue.splice(taskIndex, 1);
        }
      }
      
      this.activeJobs.delete(worker);
      this.availableWorkers.push(worker);
    }

    console.error('Worker error:', event.message);
    this.processNextTask();
  }

  private processNextTask(): void {
    if (this.availableWorkers.length === 0 || this.taskQueue.length === 0) {
      return;
    }

    const worker = this.availableWorkers.pop()!;
    const task = this.taskQueue.find(t => !this.activeJobs.has(worker));
    
    if (task) {
      this.activeJobs.set(worker, task.id);
      worker.postMessage({
        type: task.type,
        data: task.data,
        id: task.id
      });
    }
  }

  public execute<T>(type: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `task_${Date.now()}_${Math.random()}`;
      const task = { id, type, data, resolve, reject };
      
      this.taskQueue.push(task);
      this.processNextTask();
    });
  }

  public getStats(): { totalWorkers: number; availableWorkers: number; queuedTasks: number; activeTasks: number } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeJobs.size
    };
  }

  public dispose(): void {
    this.workers.forEach(worker => {
      worker.terminate();
    });
    
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.activeJobs.clear();
  }
}