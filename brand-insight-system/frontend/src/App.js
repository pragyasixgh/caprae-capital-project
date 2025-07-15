import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    
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
    <div className="App">
      <h2>Brand Voice & Industry Analyzer</h2>
      
      {error && (
        <div style={{ color: 'red', background: '#ffebee', padding: '1rem', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}
      
      <input
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '300px', marginRight: '10px' }}
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {analysis && (
        <>
          <h3>Analysis Result</h3>

          <h4>Brand Voice Output</h4>
          <pre style={{ background: '#f4f4f4', padding: '1rem' }}>
            {analysis.brand_voice_raw}
          </pre>

          <h4>Industry Type Output</h4>
          <pre style={{ background: '#f4f4f4', padding: '1rem' }}>
            {analysis.industry_type_raw}
          </pre>

          <h3>Generate Message</h3>
          <input
            placeholder="Enter context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            style={{ width: '300px', marginRight: '10px' }}
          />
          <button onClick={handleMessageGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </>
      )}

      {message && (
        <>
          <h3>Generated Message</h3>
          <p style={{ background: '#eef', padding: '1rem' }}>{message}</p>
        </>
      )}
    </div>
  );
}

export default App;