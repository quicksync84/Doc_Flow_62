import React, { useState } from 'react';

function App() {
  let fileContent: string = "";
  const [enableFuzzyMatch, setEnableFuzzyMatch] = useState(false);

  const handleFuzzyMatchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setEnableFuzzyMatch(enabled);
    
    // Send updated setting to plugin code
    parent.postMessage({
      pluginMessage: {
        type: 'analyze-content',
        content: fileContent,
        enableFuzzyMatch: enabled
      }
    }, '*');
  };

  return (
    <div className="app">
      <h1>Doc Flow</h1>
      <div className="toggle-group">
        <label className="switch">
          <input
            type="checkbox"
            checked={enableFuzzyMatch}
            onChange={handleFuzzyMatchChange}
          />
          <span className="slider"></span>
        </label>
        <span className="toggle-label">Enable Fuzzy Matching</span>
      </div>
    </div>
  );
}

export default App;