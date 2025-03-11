interface EditorInstance {
  getContent(): string;
  setContent(content: string): void;
  destroy(): void;
}

interface EditorConstructor {
  new (container: string | HTMLElement, options: {
    initialContent?: string;
    onChange?: (content: string) => void;
  }): EditorInstance;
}

declare global {
  interface Window {
    Editor: EditorConstructor;
  }
} 