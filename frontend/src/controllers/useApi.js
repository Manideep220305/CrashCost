import { useState } from 'react';
import API from '../services/api';

// Custom hook for making API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (method) {
        case 'GET':
          response = await API.get(endpoint);
          break;
        case 'POST':
          response = await API.post(endpoint, data);
          break;
        case 'PUT':
          response = await API.put(endpoint, data);
          break;
        case 'DELETE':
          response = await API.delete(endpoint);
          break;
        default:
          throw new Error('Invalid method');
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, request };
};

export default useApi;
