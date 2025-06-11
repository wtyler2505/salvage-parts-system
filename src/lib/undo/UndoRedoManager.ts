export interface Command {
  id: string;
  type: string;
  timestamp: Date;
  execute(): void;
  undo(): void;
  redo(): void;
  canMerge?(other: Command): boolean;
  merge?(other: Command): Command;
}

export class UndoRedoManager {
  private history: Command[] = [];
  private currentIndex = -1;
  private maxHistorySize: number;
  private listeners: Array<(state: { canUndo: boolean; canRedo: boolean }) => void> = [];

  constructor(maxHistorySize = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  public execute(command: Command): void {
    // Try to merge with the last command if possible
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      const lastCommand = this.history[this.currentIndex];
      if (lastCommand.canMerge && lastCommand.canMerge(command)) {
        const mergedCommand = lastCommand.merge!(command);
        this.history[this.currentIndex] = mergedCommand;
        mergedCommand.execute();
        this.notifyListeners();
        return;
      }
    }

    // Remove any commands after current index (when undoing and then executing new command)
    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }

    // Execute the command
    command.execute();

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.notifyListeners();
  }

  public undo(): boolean {
    if (!this.canUndo()) return false;

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;

    this.notifyListeners();
    return true;
  }

  public redo(): boolean {
    if (!this.canRedo()) return false;

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.redo();

    this.notifyListeners();
    return true;
  }

  public canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.notifyListeners();
  }

  public getHistory(): Array<{ id: string; type: string; timestamp: Date }> {
    return this.history.map(cmd => ({
      id: cmd.id,
      type: cmd.type,
      timestamp: cmd.timestamp
    }));
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public addListener(listener: (state: { canUndo: boolean; canRedo: boolean }) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (state: { canUndo: boolean; canRedo: boolean }) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    const state = {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };

    this.listeners.forEach(listener => listener(state));
  }
}

// Common command implementations
export class AddObjectCommand implements Command {
  public id: string;
  public type = 'ADD_OBJECT';
  public timestamp: Date;

  constructor(
    private object: any,
    private scene: any,
    private onAdd?: () => void,
    private onRemove?: () => void
  ) {
    this.id = `add_${Date.now()}_${Math.random()}`;
    this.timestamp = new Date();
  }

  execute(): void {
    this.scene.add(this.object);
    this.onAdd?.();
  }

  undo(): void {
    this.scene.remove(this.object);
    this.onRemove?.();
  }

  redo(): void {
    this.execute();
  }
}

export class RemoveObjectCommand implements Command {
  public id: string;
  public type = 'REMOVE_OBJECT';
  public timestamp: Date;

  constructor(
    private object: any,
    private scene: any,
    private onAdd?: () => void,
    private onRemove?: () => void
  ) {
    this.id = `remove_${Date.now()}_${Math.random()}`;
    this.timestamp = new Date();
  }

  execute(): void {
    this.scene.remove(this.object);
    this.onRemove?.();
  }

  undo(): void {
    this.scene.add(this.object);
    this.onAdd?.();
  }

  redo(): void {
    this.execute();
  }
}

export class TransformCommand implements Command {
  public id: string;
  public type = 'TRANSFORM';
  public timestamp: Date;

  constructor(
    private object: any,
    private oldTransform: { position: any; rotation: any; scale: any },
    private newTransform: { position: any; rotation: any; scale: any },
    private onChange?: () => void
  ) {
    this.id = `transform_${Date.now()}_${Math.random()}`;
    this.timestamp = new Date();
  }

  execute(): void {
    this.applyTransform(this.newTransform);
  }

  undo(): void {
    this.applyTransform(this.oldTransform);
  }

  redo(): void {
    this.execute();
  }

  canMerge(other: Command): boolean {
    return other instanceof TransformCommand && 
           other.object === this.object &&
           Date.now() - this.timestamp.getTime() < 1000; // Merge within 1 second
  }

  merge(other: Command): Command {
    const otherTransform = other as TransformCommand;
    return new TransformCommand(
      this.object,
      this.oldTransform,
      otherTransform.newTransform,
      this.onChange
    );
  }

  private applyTransform(transform: { position: any; rotation: any; scale: any }): void {
    this.object.position.copy(transform.position);
    this.object.rotation.copy(transform.rotation);
    this.object.scale.copy(transform.scale);
    this.onChange?.();
  }
}

export class PropertyChangeCommand implements Command {
  public id: string;
  public type = 'PROPERTY_CHANGE';
  public timestamp: Date;

  constructor(
    private object: any,
    private property: string,
    private oldValue: any,
    private newValue: any,
    private onChange?: () => void
  ) {
    this.id = `property_${Date.now()}_${Math.random()}`;
    this.timestamp = new Date();
  }

  execute(): void {
    this.object[this.property] = this.newValue;
    this.onChange?.();
  }

  undo(): void {
    this.object[this.property] = this.oldValue;
    this.onChange?.();
  }

  redo(): void {
    this.execute();
  }

  canMerge(other: Command): boolean {
    return other instanceof PropertyChangeCommand &&
           other.object === this.object &&
           other.property === this.property &&
           Date.now() - this.timestamp.getTime() < 500; // Merge within 0.5 seconds
  }

  merge(other: Command): Command {
    const otherProperty = other as PropertyChangeCommand;
    return new PropertyChangeCommand(
      this.object,
      this.property,
      this.oldValue,
      otherProperty.newValue,
      this.onChange
    );
  }
}