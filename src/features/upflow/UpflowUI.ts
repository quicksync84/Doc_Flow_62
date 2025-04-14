export class UpflowUI {
  private fileContent: string = '';
  private currentFileName: string = '';
  private selectedComponents: string[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.initializeUI();
  }

  private initializeUI() {
    window.onload = () => {
      this.setupEventListeners();
      this.setupMessageHandling();
    };
  }

  private setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const processButton = document.getElementById('processButton');

    if (uploadArea && fileInput) {
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!this.isProcessing) {
          const file = e.dataTransfer?.files[0];
          if (file) {
            this.handleFile(file);
          }
        }
      });

      fileInput.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          this.handleFile(file);
        }
      });
    }

    if (processButton) {
      processButton.addEventListener('click', () => {
        if (!this.fileContent || this.selectedComponents.length === 0) return;

        this.isProcessing = true;
        this.updateButton();

        parent.postMessage({
          pluginMessage: {
            type: 'process-content',
            content: this.fileContent,
            selectedComponents: this.selectedComponents
          }
        }, '*');
      });
    }
  }

  private setupMessageHandling() {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      if (!message) return;

      if (message.type === 'analysis-complete') {
        this.updateComponentList(message.components);
        this.isProcessing = false;
        this.updateButton();
      } else if (message.type === 'process-complete') {
        this.showStatus('Content processed successfully!', 'success');
        this.isProcessing = false;
        this.updateButton();
      } else if (message.type === 'error') {
        this.showStatus(message.error || 'An error occurred', 'error');
        this.isProcessing = false;
        this.updateButton();
      }
    };
  }

  private async handleFile(file: File) {
    try {
      if (this.isProcessing) return;

      this.isProcessing = true;
      this.updateButton();
      this.showStatus('Reading file...', 'info');

      const content = await this.readFile(file);
      
      this.fileContent = content;
      this.currentFileName = file.name;
      this.updateUploadArea();

      parent.postMessage({
        pluginMessage: {
          type: 'analyze-content',
          content: this.fileContent
        }
      }, '*');

    } catch (error) {
      this.showStatus(error instanceof Error ? error.message : 'Error processing file', 'error');
      this.fileContent = '';
      this.currentFileName = '';
      this.updateUploadArea();
    } finally {
      this.isProcessing = false;
      this.updateButton();
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private updateButton() {
    const button = document.getElementById('processButton') as HTMLButtonElement;
    if (button) {
      button.disabled = !this.fileContent || this.selectedComponents.length === 0 || this.isProcessing;
    }
  }

  private updateUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadContent = document.getElementById('uploadContent');
    
    if (!uploadArea || !uploadContent) return;

    if (this.currentFileName) {
      uploadArea.classList.add('has-file');
      uploadContent.innerHTML = `
        <div class="upload-text">${this.currentFileName}</div>
        <div class="upload-subtext">Click to change file</div>
      `;
    } else {
      uploadArea.classList.remove('has-file');
      uploadContent.innerHTML = `
        <div class="upload-text">Drop your file here or click to browse</div>
        <div class="upload-subtext">Accepts .txt and .docx files</div>
      `;
    }
  }

  private updateComponentList(components: any[]) {
    const componentList = document.getElementById('componentList');
    if (!componentList) return;

    // Implementation of component list update logic
    componentList.innerHTML = components.map(component => `
      <div class="component-item">
        <div class="component-header">
          <span class="component-name">${component.name}</span>
        </div>
        <div class="component-tags">
          Tags: ${component.tags.join(', ')}
        </div>
      </div>
    `).join('');
  }

  private showStatus(message: string, type: 'info' | 'success' | 'error') {
    const status = document.getElementById('status');
    if (!status) return;
    
    status.textContent = message;
    status.className = `status status-${type}`;
  }
}