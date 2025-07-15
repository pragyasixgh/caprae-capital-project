import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setAnalysisComplete(false);
    setAnalysis(null);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:8000/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      // Extract and format the raw output
      const brandVoiceRaw = data.tasks_output[0].raw;
      const industryRaw = data.tasks_output[1].raw;
      
      // Try to parse the raw output as YAML/JSON if possible
      let brandVoiceData = {};
      let industryData = {};
      try {
        // Try to parse the raw output as YAML/JSON
        brandVoiceData = JSON.parse(brandVoiceRaw);
        industryData = JSON.parse(industryRaw);
      } catch (e) {
        // If parsing fails, just use the raw text
        console.log('Could not parse output as JSON:', e);
      }

      setAnalysis({
        brand_voice: brandVoiceData,
        industry_type: industryData,
        brand_voice_raw: brandVoiceRaw,
        industry_type_raw: industryRaw,
        tone_values: brandVoiceData?.tone_scale || {}
      });
      
      setAnalysisComplete(true);
    } catch (error) {
      setError('Failed to analyze URL: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageGenerate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:8000/generate-message/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          tone_values: Object.values(analysis?.tone_values || {})
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      // Access the message from the response
      setMessage(data.message || data);
    } catch (error) {
      setError('Failed to generate message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="header">
          <h1 className="main-title">Brand Voice & Industry Analyzer</h1>
          
          <div className="url-input-section">
            <div className="input-group">
              <input
                type="url"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="url-input"
                disabled={loading}
              />
              <button 
                onClick={handleAnalyze} 
                disabled={loading || !url.trim()}
                className="analyze-btn"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {loading && !analysisComplete && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Analyzing brand voice and industry type...</p>
          </div>
        )}

        {analysis && (
          <div className="results-container">
            <div className="cards-grid">
              <div className="result-card">
                <div className="card-header">
                  <h3 className="card-title">Brand Voice Analysis</h3>
                  <div className="card-icon">🎯</div>
                </div>
                <div className="card-content">
                  <pre className="output-text">{analysis.brand_voice_raw}</pre>
                </div>
              </div>

              <div className="result-card">
                <div className="card-header">
                  <h3 className="card-title">Industry Classification</h3>
                  <div className="card-icon">🏢</div>
                </div>
                <div className="card-content">
                  <pre className="output-text">{analysis.industry_type_raw}</pre>
                </div>
              </div>
            </div>

            <div className="message-generator-section">
              <div className="section-header">
                <h3 className="section-title">Generate Brand Message</h3>
                <p className="section-subtitle">Create a message aligned with your brand voice</p>
              </div>
              
              <div className="message-input-group">
                <textarea
                  placeholder="Enter context for your message (e.g., product launch, customer support, marketing campaign)"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="context-input"
                  rows="3"
                  disabled={loading}
                />
                <button 
                  onClick={handleMessageGenerate} 
                  disabled={loading || !context.trim()}
                  className="generate-btn"
                >
                  {loading ? 'Generating...' : 'Generate Message'}
                </button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="message-result">
            <div className="message-card">
              <div className="card-header">
                <h3 className="card-title">Generated Message</h3>
                <div className="card-icon">💬</div>
              </div>
              <div className="card-content">
                <p className="generated-message">{message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;