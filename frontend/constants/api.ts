import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your machine's local IP for Expo to connect to the backend properly
const getBaseUrl = () => {
    return 'http://192.168.1.16:3000';
};

export const API_URL = getBaseUrl();

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ─── Auth functions ───────────────────────────────────────

export async function registerUser(name: string, email: string, password: string, phone?: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
    }

    // Backend now returns { userId, email, message } — no token yet
    const data = await response.json();
    return data;
}

export async function verifyOtp(userId: string, code: string): Promise<{ user: any; token: string }> {
    const response = await fetch(`${API_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Verification failed');
    }

    return response.json();
}

export async function resendOtp(userId: string, channel: string = 'email'): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, channel }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to resend code');
    }

    return response.json();
}

export async function forgotPassword(email: string): Promise<{ message: string; userId: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to request password reset');
    }

    return response.json();
}

export async function forceResetPassword(newPassword: string) {
    return authFetch(`${API_URL}/auth/force-password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
    });
}

export async function loginUser(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid email or password');
    }

    const data = await response.json();

    // Store token + user
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
}

export async function getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<any | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
}

// ─── Auth-protected fetch helper ──────────────────────────

async function authFetch(url: string, options: RequestInit = {}) {
    const token = await getStoredToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${response.status}`);
    }
    return response.json();
}

// ─── Profile functions ────────────────────────────────────

export async function updateProfile(data: { name?: string; email?: string }) {
    const user = await authFetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
    return authFetch(`${API_URL}/auth/password`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export async function deleteAccount() {
    const result = await authFetch(`${API_URL}/auth/account`, { method: 'DELETE' });
    await logout();
    return result;
}

// ─── Address functions ────────────────────────────────────

export async function fetchAddresses() {
    return authFetch(`${API_URL}/addresses`);
}

export async function createAddress(data: {
    label?: string; street: string; city: string;
    state?: string; country?: string; isDefault?: boolean;
}) {
    return authFetch(`${API_URL}/addresses`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateAddress(id: string, data: any) {
    return authFetch(`${API_URL}/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteAddress(id: string) {
    return authFetch(`${API_URL}/addresses/${id}`, { method: 'DELETE' });
}

// ─── Payment Method functions ─────────────────────────────

export async function fetchPaymentMethods() {
    return authFetch(`${API_URL}/payment-methods`);
}

export async function createPaymentMethod(data: {
    label?: string; last4: string; brand?: string;
    expiryMonth: number; expiryYear: number; isDefault?: boolean;
}) {
    return authFetch(`${API_URL}/payment-methods`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deletePaymentMethod(id: string) {
    return authFetch(`${API_URL}/payment-methods/${id}`, { method: 'DELETE' });
}

// ─── Tender functions ─────────────────────────────────────

export interface TenderTierAPI {
    id: string;
    minParticipants: number;
    discountPercent: number;
}

export interface NotificationFromAPI {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    tenderId?: string;
    isRead: boolean;
    createdAt: string;
    tender?: {
        id: string;
        title: string;
        imageUrl: string;
    };
}

export interface SavedTenderFromAPI {
    id: string;
    userId: string;
    tenderId: string;
    tenderTitle?: string;
    createdAt: string;
    tender: TenderFromAPI;
}

export interface TenderFromAPI {
    id: string;
    title: string;
    description: string;
    originalPrice: number;
    currentPrice: number;
    targetParticipants: number;
    currentParticipants: number;
    endDate: string;
    imageUrl: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    category: string;
    createdAt: string;
    updatedAt: string;
    tiers?: TenderTierAPI[];
}

export async function fetchActiveTenders(): Promise<TenderFromAPI[]> {
    const response = await fetch(`${API_URL}/tenders/active`);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}

export async function fetchTenderById(id: string): Promise<TenderFromAPI> {
    const response = await fetch(`${API_URL}/tenders/${id}`);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}

export async function enrollTender(
    id: string,
    userId: string,
    quantity: number = 1,
    addressId?: string,
    paymentMethodId?: string
) {
    return authFetch(`${API_URL}/tenders/${id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ userId, quantity, addressId, paymentMethodId }),
    });
}

export async function cancelEnrollment(id: string, userId: string) {
    return authFetch(`${API_URL}/tenders/${id}/enroll`, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
    });
}

export async function fetchEnrolledTenders(userId: string) {
    return authFetch(`${API_URL}/tenders/enrolled/${userId}`);
}

export async function fetchUserOrders(userId: string) {
    return authFetch(`${API_URL}/orders/user/${userId}`);
}

export async function fetchEnrollmentStatus(id: string, userId: string) {
    return authFetch(`${API_URL}/tenders/${id}/enrollment-status/${userId}`);
}

// ─── Notifications functions ──────────────────────────────

export async function fetchUserNotifications(userId: string): Promise<NotificationFromAPI[]> {
    return authFetch(`${API_URL}/notifications/user/${userId}`);
}

export async function getUnreadNotificationCount(userId: string): Promise<{ count: number }> {
    return authFetch(`${API_URL}/notifications/user/${userId}/unread-count`);
}

export async function markNotificationAsRead(id: string) {
    return authFetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
    });
}

export async function processTenderBid(id: string, userId: string, bidPrice: number) {
    return authFetch(`${API_URL}/tenders/${id}/bid`, {
        method: 'POST',
        body: JSON.stringify({ userId, bidPrice }),
    });
}

// Saved Tenders
export async function toggleSaveTender(tenderId: string, userId: string): Promise<{ saved: boolean }> {
    return authFetch(`${API_URL}/tenders/saved/toggle`, {
        method: 'POST',
        body: JSON.stringify({ tenderId, userId }),
    });
}

export async function fetchSavedTenders(userId: string): Promise<SavedTenderFromAPI[]> {
    return authFetch(`${API_URL}/tenders/saved/user/${userId}`);
}

export async function isTenderSaved(tenderId: string, userId: string): Promise<{ isSaved: boolean }> {
    return authFetch(`${API_URL}/tenders/saved/status/${userId}/${tenderId}`);
}
export const incrementTenderViews = async (id: string) => {
    try {
        const response = await
            fetch(`${API_URL}/tenders/${id}/view`, {
                method: 'POST',
            });
        return await response.json();
    } catch (error) {
        console.error('Failed to increment views:',
            error);
    }
}
