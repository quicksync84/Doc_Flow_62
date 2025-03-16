console.log('UI script starting...');

window.onload = () => {
  console.log('Window loaded');
  
  const parentTagsInput = document.getElementById('parentTags');
  const fileUpload = document.getElementById('fileUpload');
  const processButton = document.getElementById('processButton');
  const statusDiv = document.getElementById('status');
  
  let fileContent = '';

  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status-${type}`;
  }

  // Enable/disable process button based on inputs
  function updateButtonState() {
    const hasParentTags = parentTagsInput.value.trim().length > 0;
    const hasFile = fileContent.length > 0;
    processButton.disabled = !hasParentTags || !hasFile;
  }

  // Handle file upload
  fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      showStatus('No file selected', 'error');
      fileContent = '';
      updateButtonState();
      return;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.txt')) {
      showStatus('Please upload a text file (.txt)', 'error');
      fileContent = '';
      updateButtonState();
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        fileContent = e.target.result;
        if (fileContent.trim().length === 0) {
          showStatus('The file is empty', 'error');
          fileContent = '';
        } else {
          showStatus('File uploaded successfully', 'success');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        showStatus('Error processing file content', 'error');
        fileContent = '';
      }
      updateButtonState();
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      showStatus('Error reading file', 'error');
      fileContent = '';
      updateButtonState();
    };

    try {
      reader.readAsText(file);
      showStatus('Reading file...', 'info');
    } catch (error) {
      console.error('Error starting file read:', error);
      showStatus('Error reading file', 'error');
      fileContent = '';
      updateButtonState();
    }
  });

  // Handle parent tags input
  parentTagsInput.addEventListener('input', () => {
    updateButtonState();
    if (parentTagsInput.value.trim()) {
      statusDiv.textContent = '';
    }
  });

  // Handle process button click
  processButton.addEventListener('click', () => {
    const tags = parentTagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tags.length === 0) {
      showStatus('Please enter valid parent tags', 'error');
      return;
    }

    try {
      // Send message to plugin code
      parent.postMessage({
        pluginMessage: {
          type: 'parse-content',
          content: fileContent,
          parentTags: tags
        }
      }, '*');

      showStatus('Processing...', 'info');
      processButton.disabled = true;
    } catch (error) {
      console.error('Error sending message:', error);
      showStatus('Error sending data to plugin', 'error');
      processButton.disabled = false;
    }
  });

  // Handle messages from plugin code
  window.onmessage = (event) => {
    const message = event.data.pluginMessage;
    if (!message) return;

    if (message.type === 'process-complete') {
      showStatus('Content population complete!', 'success');
      processButton.disabled = false;
    } else if (message.type === 'error') {
      showStatus(message.error || 'An error occurred', 'error');
      processButton.disabled = false;
    }
  };

  // Send initial message to plugin
  try {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'log', 
        message: 'UI loaded successfully.' 
      } 
    }, '*');
    console.log('Initial message sent to plugin');
  } catch (error) {
    console.error('Error sending initial message:', error);
    showStatus('Error initializing plugin', 'error');
  }
};

// Handle global errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('UI Error:', {
    message,
    source,
    lineno,
    colno,
    error
  });
};