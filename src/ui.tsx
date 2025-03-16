import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const App: React.FC = () => {
  console.log('Initializing React App component');
  const [parentTags, setParentTags] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered');
    try {
      if (!event?.target) {
        throw new Error('Invalid event object');
      }

      const fileInput = event.target;
      if (!fileInput?.files) {
        throw new Error('File input is not available');
      }

      const file = fileInput.files[0];
      if (!file) {
        throw new Error('Please select a valid file');
      }

      if (file.type !== 'text/plain') {
        throw new Error('Please upload a text file (.txt)');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          console.log('File read completed');
          const result = e.target?.result;
          if (!result || typeof result !== 'string') {
            throw new Error('Failed to read file content');
          }
          setFileContent(result);
          setStatus('File uploaded successfully');
          setError('');
        } catch (err) {
          console.error('Error in file reader onload:', err);
          setError('Error reading file: ' + (err instanceof Error ? err.message : 'Unknown error'));
          setFileContent('');
        }
      };

      reader.onerror = () => {
        console.error('FileReader error occurred');
        setError('Error reading file');
        setFileContent('');
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('Error in handleFileUpload:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during file upload');
      setFileContent('');
    }
  }, []);

  const handleProcess = useCallback(() => {
    console.log('Process button clicked');
    try {
      if (!parentTags?.trim()) {
        throw new Error('Please enter parent tags');
      }
      if (!fileContent?.trim()) {
        throw new Error('Please upload a copy document');
      }

      setIsProcessing(true);
      setError('');
      setStatus('Processing...');

      const tags = parentTags.split(',')
        .map(tag => tag?.trim())
        .filter(tag => tag && tag.length > 0);

      if (tags.length === 0) {
        throw new Error('Please enter valid parent tags');
      }

      console.log('Sending message to plugin code');
      parent.postMessage({
        pluginMessage: {
          type: 'parse-content',
          content: fileContent,
          parentTags: tags
        }
      }, '*');
    } catch (err) {
      console.error('Error in handleProcess:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during processing');
      setIsProcessing(false);
    }
  }, [parentTags, fileContent]);

  useEffect(() => {
    console.log('Setting up message listener');
    try {
      const handleMessage = (event: MessageEvent) => {
        console.log('Received message from plugin:', event.data?.pluginMessage);
        if (!event?.data?.pluginMessage) {
          return;
        }

        const message = event.data.pluginMessage;
        setIsProcessing(false);

        if (message.type === 'process-complete') {
          setStatus('Content population complete!');
          setError('');
        } else if (message.type === 'error' && message.error) {
          setError(message.error);
          setStatus('');
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    } catch (err) {
      console.error('Error in message listener setup:', err);
      setError('Failed to set up message handling');
    }
  }, []);

  return (
    <div className="container">
      <h2 className="title">Content Population Plugin</h2>
      
      <div className="info-box">
        <p>This plugin requires that all fonts used in your text layers are available in Figma.</p>
        <p>Format your text file with tags like:</p>
        <pre>
          {`{{ParentName}}
  {{ChildTag}}Your content here{{/ChildTag}}
{{/ParentName}}`}
        </pre>
      </div>
      
      <div className="section">
        <label htmlFor="parentTags">
          Parent Tags (comma-separated):
          <input
            id="parentTags"
            type="text"
            value={parentTags}
            onChange={(e) => setParentTags(e?.target?.value ?? '')}
            placeholder="e.g., Asset 01, Asset 02"
            className="input"
            disabled={isProcessing}
          />
        </label>
      </div>

      <div className="section">
        <label htmlFor="fileUpload">
          Upload Copy Document:
          <input
            id="fileUpload"
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="file-input"
            disabled={isProcessing}
          />
        </label>
      </div>

      <button 
        onClick={handleProcess} 
        className="button"
        disabled={isProcessing || !fileContent || !parentTags?.trim()}
      >
        {isProcessing ? 'Processing...' : 'Process Content'}
      </button>

      {status && <div className="status success">{status}</div>}
      {error && <div className="status error">{error}</div>}
    </div>
  );
};

const mount = () => {
  console.log('Mounting React app');
  try {
    const container = document.getElementById('react-page');
    if (!container) {
      throw new Error('Failed to find root element');
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('React app mounted successfully');
  } catch (error) {
    console.error('Failed to mount React app:', error);
  }
};

// Ensure the DOM is fully loaded before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}