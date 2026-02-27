import { useState } from 'react';
import useApi from '../controllers/useApi';
import './TestApi.css';

export default function TestApi() {
  const { loading, error, request } = useApi();
  const [response, setResponse] = useState(null);

  const testConnection = async () => {
    try {
      const result = await request('GET', '/test');
      setResponse(result);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  return (
    <div className="test-api">
      <h2>API Connection Test</h2>
      <button onClick={testConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>

      {error && <div className="error">{error}</div>}
      {response && <div className="success">{response.message}</div>}
    </div>
  );
}
