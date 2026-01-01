// API helper functions for making requests to backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Generic API fetch function
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Build full URL with Express backend
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;
    
    console.log('Making API request to:', url, options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API error response:', data);
      return {
        error: data.error || data.message || `Request failed with status ${response.status}`,
      };
    }

    return { data };
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// Auth API functions
export const authApi = {
  login: async (email: string, password: string) => {
    console.log('authApi.login called with:', { email, password: '***' });
    const result = await apiFetch<{ user: any; token?: string; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    console.log('authApi.login result:', result);
    return result;
  },

  register: async (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    accountType: 'donor' | 'charity';
    orgName?: string;
    registrationNumber?: string;
  }) => {
    console.log('authApi.register called with:', { ...data, password: '***' });
    const result = await apiFetch<{ user: any; token?: string; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    console.log('authApi.register result:', result);
    return result;
  },

  logout: async () => {
    return apiFetch<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async (token: string) => {
    return apiFetch<{ user: any }>('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Campaigns API functions
export const campaignsApi = {
  getAll: async (filters?: { 
    status?: string; 
    category?: string; 
    charity_id?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.charity_id) params.append('charity_id', filters.charity_id);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/campaigns?${queryString}` : '/api/campaigns';
    
    return apiFetch<{ campaigns: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiFetch<{ campaign: any }>(`/api/campaigns/${id}`);
  },

  create: async (campaignData: any, token?: string) => {
    return apiFetch<{ campaign: any; message: string }>('/api/campaigns', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(campaignData),
    });
  },

  update: async (id: string, campaignData: any, token?: string) => {
    return apiFetch<{ campaign: any; message: string }>(`/api/campaigns/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(campaignData),
    });
  },

  delete: async (id: string, token?: string) => {
    return apiFetch<{ message: string }>(`/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

// Donations API functions
export const donationsApi = {
  create: async (donationData: {
    campaign_id: number;
    donor_id?: number;
    amount: number;
    is_anonymous?: boolean;
    payment_method?: string;
  }) => {
    return apiFetch<{ donation: any; message: string }>('/api/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  },

  getAll: async (filters?: { 
    campaign_id?: string; 
    donor_id?: string;
    status?: string;
    charity_id?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.campaign_id) params.append('campaign_id', filters.campaign_id);
    if (filters?.donor_id) params.append('donor_id', filters.donor_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.charity_id) params.append('charity_id', filters.charity_id);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/donations?${queryString}` : '/api/donations';
    
    return apiFetch<{ donations: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiFetch<{ donation: any }>(`/api/donations/${id}`);
  },

  getStats: async (filters?: { campaign_id?: string; charity_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.campaign_id) params.append('campaign_id', filters.campaign_id);
    if (filters?.charity_id) params.append('charity_id', filters.charity_id);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/donations/stats?${queryString}` : '/api/donations/stats';
    
    return apiFetch<{ 
      total_donations: number; 
      total_amount: number; 
      average_donation: number;
    }>(endpoint);
  },

  refund: async (id: string, token?: string) => {
    return apiFetch<{ message: string }>(`/api/donations/${id}/refund`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  getReceipt: async (id: string) => {
    return apiFetch<{ receipt_url: string }>(`/api/donations/receipt/${id}`);
  },
};

// Users API functions
export const usersApi = {
  getProfile: async (token: string) => {
    return apiFetch<{ user: any }>('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updateProfile: async (userData: any, token: string) => {
    return apiFetch<{ user: any; message: string }>('/api/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },
};

// Charity API functions
export const charityApi = {
  getAll: async (filters?: { verified?: boolean; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/charity?${queryString}` : '/api/charity';
    
    return apiFetch<{ charities: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiFetch<{ charity: any }>(`/api/charity/${id}`);
  },

  create: async (charityData: any, token: string) => {
    return apiFetch<{ charity: any; message: string }>('/api/charity', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(charityData),
    });
  },

  update: async (id: string, charityData: any, token: string) => {
    return apiFetch<{ charity: any; message: string }>(`/api/charity/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(charityData),
    });
  },
};

export default {
  authApi,
  campaignsApi,
  donationsApi,
  usersApi,
  charityApi,
};