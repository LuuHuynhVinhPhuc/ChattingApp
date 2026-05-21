import axios from 'axios';

const API_BASE_URL = 'https://localhost:44342';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header on every request if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Decodes JWT token helper
export const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Authentication API calls
export const authService = {
  login: async (username, password) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('client_id', 'MessageApp_App');
    params.append('scope', 'openid profile email roles MessageApp offline_access');

    const response = await axios.post(`${API_BASE_URL}/connect/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data; // contains access_token, expires_in, refresh_token, etc.
  },

  register: async (username, email, password) => {
    const response = await api.post('/api/account/register', {
      userName: username,
      emailAddress: email,
      password: password,
      appName: 'MessageApp',
    });
    return response.data;
  },
};

// Chat API calls
export const chatService = {
  getChannels: async () => {
    const response = await api.get('/api/app/chat/channels');
    return response.data;
  },

  createChannel: async (name, description) => {
    const response = await api.post('/api/app/chat/channel', {
      name,
      description,
    });
    return response.data;
  },

  getChannelMessages: async (channelId) => {
    const response = await api.get(`/api/app/chat/channel-messages?channelId=${channelId}`);
    return response.data;
  },

  getPrivateMessages: async (receiverId) => {
    const response = await api.get(`/api/app/chat/private-messages?receiverId=${receiverId}`);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/api/app/chat/users');
    return response.data;
  },

  sendMessage: async (messageText, receiverId = null, channelId = null) => {
    const response = await api.post('/api/app/chat/send-message', {
      message: messageText,
      receiverId,
      channelId,
    });
    return response.data;
  },

  getChannelMembers: async (channelId) => {
    const response = await api.get(`/api/app/chat/channels/${channelId}/members`);
    return response.data;
  },

  getNonMembers: async (channelId) => {
    const response = await api.get(`/api/app/chat/channels/${channelId}/non-members`);
    return response.data;
  },

  addMember: async (channelId, userId) => {
    const response = await api.post(`/api/app/chat/channels/${channelId}/members/${userId}`);
    return response.data;
  },

  kickMember: async (channelId, userId) => {
    const response = await api.delete(`/api/app/chat/channels/${channelId}/members/${userId}`);
    return response.data;
  },
};

export default api;
