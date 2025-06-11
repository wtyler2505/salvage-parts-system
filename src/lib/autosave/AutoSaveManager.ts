export interface SaveData {
  id: string;
  timestamp: Date;
  data: any;
  version: string;
  checksum: string;
}

export interface AutoSaveConfig {
  interval: number; // milliseconds
  maxSaves: number;
  enableConflictDetection: boolean;
  enableCompression: boolean;
  storageKey: string;
}

export class AutoSaveManager {
  private config: AutoSaveConfig;
  private saveInterval: number | null = null;
  private lastSaveTime = 0;
  private lastChecksum = '';
  private isEnabled = true;
  private listeners: Array<(event: { type: string; data?: any }) => void> = [];

  constructor(config: AutoSaveConfig) {
    this.config = config;
    this.startAutoSave();
    this.setupVisibilityHandling();
  }

  private startAutoSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }

    this.saveInterval = window.setInterval(() => {
      if (this.isEnabled) {
        this.performAutoSave();
      }
    }, this.config.interval);
  }

  private setupVisibilityHandling(): void {
    // Save when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isEnabled) {
        this.performAutoSave();
      }
    });

    // Save before page unload
    window.addEventListener('beforeunload', () => {
      if (this.isEnabled) {
        this.performAutoSave();
      }
    });
  }

  public async save(data: any, manual = false): Promise<SaveData> {
    const saveData: SaveData = {
      id: `save_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      data: this.config.enableCompression ? await this.compressData(data) : data,
      version: '1.0.0',
      checksum: await this.calculateChecksum(data)
    };

    // Check for conflicts if enabled
    if (this.config.enableConflictDetection && !manual) {
      const hasConflict = await this.detectConflict(saveData);
      if (hasConflict) {
        this.notifyListeners({ type: 'conflict', data: saveData });
        return saveData;
      }
    }

    // Save to localStorage
    await this.saveToStorage(saveData);

    // Clean up old saves
    await this.cleanupOldSaves();

    this.lastSaveTime = Date.now();
    this.lastChecksum = saveData.checksum;

    this.notifyListeners({ 
      type: manual ? 'manual_save' : 'auto_save', 
      data: saveData 
    });

    return saveData;
  }

  private async performAutoSave(): Promise<void> {
    try {
      // Get current application state
      const currentData = await this.getCurrentState();
      
      if (!currentData) return;

      // Check if data has changed
      const currentChecksum = await this.calculateChecksum(currentData);
      if (currentChecksum === this.lastChecksum) {
        return; // No changes to save
      }

      await this.save(currentData, false);
    } catch (error) {
      console.error('Auto-save failed:', error);
      this.notifyListeners({ type: 'error', data: error });
    }
  }

  private async getCurrentState(): Promise<any> {
    // This should be implemented to get the current application state
    // For now, return a placeholder
    return {
      timestamp: new Date(),
      // Add your application state here
    };
  }

  private async saveToStorage(saveData: SaveData): Promise<void> {
    try {
      const saves = await this.getAllSaves();
      saves.push(saveData);

      localStorage.setItem(this.config.storageKey, JSON.stringify(saves));
    } catch (error) {
      // Handle storage quota exceeded
      if (error.name === 'QuotaExceededError') {
        await this.cleanupOldSaves(true);
        // Try again with fewer saves
        const saves = await this.getAllSaves();
        saves.push(saveData);
        localStorage.setItem(this.config.storageKey, JSON.stringify(saves));
      } else {
        throw error;
      }
    }
  }

  private async getAllSaves(): Promise<SaveData[]> {
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load saves:', error);
      return [];
    }
  }

  private async cleanupOldSaves(aggressive = false): Promise<void> {
    const saves = await this.getAllSaves();
    const maxSaves = aggressive ? Math.floor(this.config.maxSaves / 2) : this.config.maxSaves;

    if (saves.length > maxSaves) {
      // Sort by timestamp and keep only the most recent
      saves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const trimmedSaves = saves.slice(0, maxSaves);
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(trimmedSaves));
    }
  }

  private async detectConflict(saveData: SaveData): Promise<boolean> {
    const saves = await this.getAllSaves();
    
    if (saves.length === 0) return false;

    // Get the most recent save
    const lastSave = saves[saves.length - 1];
    
    // Check if there's been a save since our last known save
    return new Date(lastSave.timestamp).getTime() > this.lastSaveTime;
  }

  private async compressData(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    
    // Use CompressionStream if available
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(jsonString));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return btoa(String.fromCharCode(...compressed));
    }
    
    // Fallback to simple compression
    return this.simpleCompress(jsonString);
  }

  private simpleCompress(str: string): string {
    // Simple run-length encoding
    let compressed = '';
    let count = 1;
    let current = str[0];
    
    for (let i = 1; i < str.length; i++) {
      if (str[i] === current && count < 255) {
        count++;
      } else {
        compressed += count > 1 ? `${count}${current}` : current;
        current = str[i];
        count = 1;
      }
    }
    
    compressed += count > 1 ? `${count}${current}` : current;
    return compressed;
  }

  private async calculateChecksum(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    
    if ('crypto' in window && 'subtle' in crypto) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(jsonString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback to simple hash
    return this.simpleHash(jsonString);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  public async loadSave(id: string): Promise<SaveData | null> {
    const saves = await this.getAllSaves();
    return saves.find(save => save.id === id) || null;
  }

  public async getLatestSave(): Promise<SaveData | null> {
    const saves = await this.getAllSaves();
    if (saves.length === 0) return null;
    
    saves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return saves[0];
  }

  public async getAllSavesList(): Promise<Array<{ id: string; timestamp: Date; size: number }>> {
    const saves = await this.getAllSaves();
    return saves.map(save => ({
      id: save.id,
      timestamp: save.timestamp,
      size: JSON.stringify(save).length
    }));
  }

  public async deleteSave(id: string): Promise<boolean> {
    const saves = await this.getAllSaves();
    const filteredSaves = saves.filter(save => save.id !== id);
    
    if (filteredSaves.length !== saves.length) {
      localStorage.setItem(this.config.storageKey, JSON.stringify(filteredSaves));
      return true;
    }
    
    return false;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.startAutoSave();
    } else if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  public updateConfig(config: Partial<AutoSaveConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.interval && this.isEnabled) {
      this.startAutoSave();
    }
  }

  public addListener(listener: (event: { type: string; data?: any }) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (event: { type: string; data?: any }) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(event: { type: string; data?: any }): void {
    this.listeners.forEach(listener => listener(event));
  }

  public dispose(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    this.listeners = [];
  }
}