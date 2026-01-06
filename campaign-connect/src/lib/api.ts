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

    const responseClone = response.clone(); // Clone response for potential text reading if JSON fails
    const data = await response.json().catch(async () => {
      const text = await responseClone.text();
      return { _rawText: text };
    });

    if (!response.ok) {
      // For logging in browser console, log the cloned response or text if JSON failed
      const logData = data?._rawText ? { error: data._rawText } : data;
      console.error(`API Error ${response.status}:`, logData);

      return {
        error: data.message || data.error || data._rawText || `Request failed with status ${response.status}`,
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
    const result = await apiFetch<{ user: any; access_token?: string; message: string }>(
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
    first_name?: string;
    last_name?: string;
    name?: string; // For backward compatibility if needed temporarily
    phone?: string;
    accountType: 'donor' | 'charity';
    orgName?: string;
    registrationNumber?: string;
    description?: string;
  }) => {
    console.log('authApi.register called with:', { ...data, password: '***' });

    let first_name = data.first_name || '';
    let last_name = data.last_name || '';

    if (!first_name && data.name) {
      const names = data.name.split(' ');
      first_name = names[0];
      last_name = names.slice(1).join(' ') || ' ';
    }

    if (!first_name && data.orgName) {
      const names = data.orgName.split(' ');
      first_name = names[0];
      last_name = names.slice(1).join(' ') || ' ';
    }

    // Transform accountType to userType for backend
    const backendData = {
      email: data.email,
      password: data.password,
      userType: data.accountType,
      first_name,
      last_name,
      description: data.description,
    };

    const result = await apiFetch<{ user: any; access_token?: string; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(backendData),
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

  getCurrentUser: async (email: string) => {
    return apiFetch<{ role: string; profile: any }>(`/api/auth/me?email=${email}`, {
      method: 'GET',
    });
  },

  forgotPassword: async (email: string) => {
    return apiFetch<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email: string, password: string) => {
    return apiFetch<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  changePassword: async (data: { email: string; oldPassword: string; newPassword: string }) => {
    return apiFetch<{ message: string }>('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
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

    return apiFetch<{ data: any[]; pagination?: any }>(endpoint);
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

  reapplyCampaign: async (id: string) => {
    return apiFetch<{ message: string }>(`/api/campaigns/${id}/reapply`, {
      method: 'PUT'
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

    return apiFetch<{ data: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiFetch<{ donation: any }>(`/api/donations/${id}`);
  },

  getStats: async (filters?: { campaign_id?: string; charity_id?: string; donor_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.campaign_id) params.append('campaign_id', filters.campaign_id);
    if (filters?.charity_id) params.append('charity_id', filters.charity_id);
    if (filters?.donor_id) params.append('donor_id', filters.donor_id);

    const queryString = params.toString();
    const endpoint = queryString ? `/api/donations/stats?${queryString}` : '/api/donations/stats';

    return apiFetch<{
      total_donations: number;
      total_amount: number;
      average_donation: number;
      campaign_count: number;
      rank: string;
    }>(endpoint);
  },

  getPlatformStats: async () => {
    return apiFetch<{
      total_raised: number;
      total_donors: number;
      total_campaigns: number;
      total_charities: number;
      countries_count: number;
    }>('/api/donations/platform-stats');
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
  getProfile: async (email: string) => {
    return apiFetch<{ role: string; profile: any }>(`/api/auth/me?email=${email}`, {
      method: 'GET',
    });
  },

  updateProfile: async (userData: any, email: string) => {
    // Handle name splitting if provided
    if (userData.name && !userData.first_name) {
      const names = userData.name.split(' ');
      userData.first_name = names[0];
      userData.last_name = names.slice(1).join(' ') || ' ';
    }
    return apiFetch<{ data: any; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ email, ...userData }),
    });
  },
};

// Charity API functions
export const charityApi = {
  getAll: async (filters?: { verified?: boolean; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.verified !== undefined) params.append('is_verified', filters.verified.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/users/charities?${queryString}` : '/api/users/charities';

    return apiFetch<{ data: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiFetch<{ data: any }>(`/api/users/charities/${id}`);
  },

  getStats: async (id: string) => {
    return apiFetch<{
      total_raised: number;
      total_donors: number;
      active_campaigns: number;
      donation_trends: { month: string; amount: number }[];
      campaign_performance: { title: string; raised: number; target: number }[];
    }>(`/api/charity/${id}/stats`);
  },

  getReport: async (id: string) => {
    return apiFetch<{
      month: string;
      year: number;
      total_donations: number;
      total_amount: number;
      unique_donors: number;
    }>(`/api/charity/${id}/report`);
  },

  getCustomReport: async (id: string, start: string, end: string) => {
    return apiFetch<any>(`/api/charity/${id}/custom-report?start=${start}&end=${end}`);
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

  approve: async (id: string) => {
    return apiFetch<any>(`/api/users/charities/${id}/approve`, {
      method: 'POST'
    });
  },

  reject: async (id: string, reason: string) => {
    return apiFetch<{ message: string }>(`/api/users/charities/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },
  reapply: async (id: string) => {
    return apiFetch<{ message: string }>(`/api/users/charities/${id}/reapply`, {
      method: 'PUT'
    });
  },
};

// Admin API functions
export const adminApi = {
  getStats: async () => {
    return apiFetch<any>('/api/admin/stats');
  },
  getActivity: async () => {
    return apiFetch<any[]>('/api/admin/activity');
  },
  getFlaggedCampaigns: async () => {
    return apiFetch<any[]>('/api/admin/flagged-campaigns');
  },
  getPendingCampaigns: async () => {
    return apiFetch<any[]>('/api/admin/pending-campaigns');
  },
  approveCampaign: async (id: string) => {
    return apiFetch<any>(`/api/admin/campaigns/${id}/approve`, {
      method: 'POST'
    });
  },
  rejectCampaign: async (id: string, reason: string) => {
    return apiFetch<any>(`/api/admin/campaigns/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },
  reapplyCampaign: async (id: string) => {
    return apiFetch<any>(`/api/admin/campaigns/${id}/reapply`, {
      method: 'PUT'
    });
  },
};

export default {
  authApi,
  campaignsApi,
  donationsApi,
  usersApi,
  charityApi,
  adminApi,
};

// Helper wrapper functions for specific dashboard needs
export const fetchDonorStats = async (donorId: string) => {
  const result = await donationsApi.getStats({ donor_id: donorId });
  // Backend standard response: { data: Stats, message: ..., status: ... }
  // apiFetch returns: { data: ResponseBody }
  // So we need result.data?.data. Casting to any to avoid TS error due to type mismatch.
  return (result.data as any)?.data;
};

export const fetchDonationHistory = async (donorId: string) => {
  const result = await donationsApi.getAll({
    donor_id: donorId,
    limit: 5 // Default limit for dashboard view
  });

  // Backend response for getAll: { data: [Donations], pagination: ... }
  // apiFetch returns: { data: ResponseBody }
  // So we access result.data?.data for the array
  const donations = (result.data as any)?.data || [];

  if (Array.isArray(donations)) {
    return donations.map((d: any) => ({
      id: d.donation_id,
      amount: d.amount,
      status: d.transaction_status,
      created_at: d.donation_date,
      campaign_title: (d.campaign || d.Campaign)?.title,
      campaign_id: d.campaign_id
    }));
  }

  return [];
};
