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

  // Helper function to parse YAML-like content
  const parseYAMLContent = (content) => {
    const result = {
      tone_scale: [],
      personality_traits: [],
      messaging_themes: [],
      communication_guidelines: []
    };

    const lines = content.split('\n');
    let currentSection = null;
    let currentItem = '';

    for (let line of lines) {
      line = line.trim();
      
      if (line.includes('tone_scale:')) {
        currentSection = 'tone_scale';
        continue;
      } else if (line.includes('personality_traits:')) {
        currentSection = 'personality_traits';
        continue;
      } else if (line.includes('messaging_themes:')) {
        currentSection = 'messaging_themes';
        continue;
      } else if (line.includes('communication_guidelines:')) {
        currentSection = 'communication_guidelines';
        continue;
      }

      if (currentSection && line.startsWith('-')) {
        const item = line.substring(1).trim();
        if (currentSection === 'messaging_themes' || currentSection === 'communication_guidelines') {
          // For multi-line items, start collecting
          currentItem = item;
          if (!item.endsWith(':')) {
            result[currentSection].push(item);
            currentItem = '';
          }
        } else {
          result[currentSection].push(item);
        }
      } else if (currentItem && line && !line.includes(':')) {
        // Continue multi-line item
        currentItem += ' ' + line;
        if (!line.endsWith(',')) {
          result[currentSection].push(currentItem);
          currentItem = '';
        }
      }
    }

    return result;
  };

  // Helper function to parse JSON content
  const parseJSONContent = (content) => {
    try {
      const parsed = JSON.parse(content);
      return {
        industry_type: parsed.industry_type || 'Unknown',
        justification: parsed.justification || 'No justification provided'
      };
    } catch (e) {
      // Fallback parsing for non-JSON format
      const industryMatch = content.match(/"industry_type":\s*"([^"]+)"/);
      const justificationMatch = content.match(/"justification":\s*"([^"]+)"/);
      
      return {
        industry_type: industryMatch ? industryMatch[1] : 'Unknown',
        justification: justificationMatch ? justificationMatch[1] : 'No justification provided'
      };
    }
  };

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
      
      // Extract and parse the raw output
      const brandVoiceRaw = data.tasks_output[0].raw;
      const industryRaw = data.tasks_output[1].raw;
      
      // Parse the content
      const brandVoiceData = parseYAMLContent(brandVoiceRaw);
      const industryData = parseJSONContent(industryRaw);

      setAnalysis({
        brand_voice: brandVoiceData,
        industry_data: industryData,
        brand_voice_raw: brandVoiceRaw,
        industry_type_raw: industryRaw,
        tone_values: brandVoiceData.tone_scale || []
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
          tone_values: analysis?.tone_values || []
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
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
                  <div className="brand-voice-grid">
                    <div className="voice-section">
                      <h4 className="section-title">Tone Scale</h4>
                      <div className="content-section">
                        {analysis.brand_voice.tone_scale.length > 0 ? (
                          <ul className="content-list">
                            {analysis.brand_voice.tone_scale.map((item, index) => (
                              <li key={index} className="list-item">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="content-text">No tone scale data available</p>
                        )}
                      </div>
                    </div>

                    <div className="voice-section">
                      <h4 className="section-title">Personality Traits</h4>
                      <div className="content-section">
                        {analysis.brand_voice.personality_traits.length > 0 ? (
                          <ul className="content-list">
                            {analysis.brand_voice.personality_traits.map((item, index) => (
                              <li key={index} className="list-item">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="content-text">No personality traits data available</p>
                        )}
                      </div>
                    </div>

                    <div className="voice-section">
                      <h4 className="section-title">Messaging Themes</h4>
                      <div className="content-section">
                        {analysis.brand_voice.messaging_themes.length > 0 ? (
                          <ul className="content-list">
                            {analysis.brand_voice.messaging_themes.map((item, index) => (
                              <li key={index} className="list-item">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="content-text">No messaging themes data available</p>
                        )}
                      </div>
                    </div>

                    <div className="voice-section">
                      <h4 className="section-title">Communication Guidelines</h4>
                      <div className="content-section">
                        {analysis.brand_voice.communication_guidelines.length > 0 ? (
                          <ul className="content-list">
                            {analysis.brand_voice.communication_guidelines.map((item, index) => (
                              <li key={index} className="list-item">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="content-text">No communication guidelines data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="result-card">
                <div className="card-header">
                  <h3 className="card-title">Industry Classification</h3>
                  <div className="card-icon">🏢</div>
                </div>
                <div className="card-content">
                  <div className="industry-content">
                    <div className="industry-type-section">
                      <h4 className="section-title">Industry Type</h4>
                      <div className="industry-badge">
                        {analysis.industry_data.industry_type}
                      </div>
                    </div>
                    
                    <div className="justification-section">
                      <h4 className="section-title">Justification</h4>
                      <p className="content-text">
                        {analysis.industry_data.justification}
                      </p>
                    </div>
                  </div>
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