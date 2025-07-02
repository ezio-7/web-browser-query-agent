import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchApi = {
  search: async (query) => {
    const response = await api.post('/search', { query });
    return response.data;
  },

  getHistory: async (limit = null) => {
    const url = limit ? `/search/history?limit=${limit}` : '/search/history';
    const response = await api.get(url);
    return response.data;
  },

  getQueryDetails: async (queryId) => {
    const response = await api.get(`/search/${queryId}`);
    return response.data;
  },

  getSuggestions: async (query) => {
    const response = await api.get('/search/history');
    const queries = response.data.queries || [];
    return queries
      .filter(q => q.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(q => q.query);
  },
};