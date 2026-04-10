const API_BASE_URL = 'http://localhost:3000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('supplier_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const supplierApi = {
  login: (credentials: any) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (data: any) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  verifyOtp: (userId: string, code: string) => apiFetch('/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ userId, code })
  }),
  getTenders: () => apiFetch('/tenders'),
  getPendingTenders: () => apiFetch('/tenders/admin/pending'),
  createTender: (data: any) => apiFetch('/tenders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  bidOnTender: (tenderId: string, userId: string, bidPrice: number) => 
    apiFetch(`/tenders/${tenderId}/bid`, {
      method: 'POST',
      body: JSON.stringify({ userId, bidPrice }),
    }),
  getProfile: () => apiFetch('/auth/me'),
  updateProfile: (data: any) => apiFetch('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};
