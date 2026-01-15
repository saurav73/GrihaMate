const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'SEEKER' | 'LANDLORD' | 'ADMIN';
  active: boolean;
  emailVerified: boolean;
  citizenshipNumber?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  subscriptionStatus?: 'FREE' | 'PREMIUM';
  createdAt: string;
}

export interface PropertyDto {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  district: string;
  province: string;
  latitude?: number;
  longitude?: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: 'ROOM' | 'FLAT' | 'APARTMENT' | 'HOUSE';
  status: 'AVAILABLE' | 'RENTED' | 'UNAVAILABLE';
  imageUrls: string[];
  virtualTourUrl?: string;
  verified: boolean;
  landlordId: number;
  landlordName: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  userType: 'SEEKER' | 'LANDLORD';
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  profileImageUrl?: string;
  citizenshipNumber?: string;
  citizenshipFrontUrl?: string;
  citizenshipBackUrl?: string;
  kycDocumentType?: 'CITIZENSHIP' | 'PASSPORT' | 'DRIVING_LICENSE';
  kycDocumentUrl?: string;
  propertyAddress?: string;
  propertyDocumentUrl?: string;
}

// Get auth token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
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
    let errorMessage = 'An error occurred';
    try {
      const error = await response.json();
      // Handle different error response formats
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.error) {
        errorMessage = error.error;
      }
    } catch (e) {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || `Request failed with status ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<UserDto> => {
    return apiRequest<UserDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async (): Promise<UserDto> => {
    return apiRequest<UserDto>('/auth/profile');
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/auth/verify-email?token=${token}`);
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  sendOtp: async (email: string, userName?: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, userName }),
    });
  },

  verifyOtp: async (email: string, otp: string): Promise<{ message: string; verified: boolean }> => {
    return apiRequest<{ message: string; verified: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },
};

// Properties API
export const propertiesAPI = {
  getAll: async (): Promise<PropertyDto[]> => {
    return apiRequest<PropertyDto[]>('/properties');
  },

  getById: async (id: number): Promise<PropertyDto> => {
    return apiRequest<PropertyDto>(`/properties/${id}`);
  },

  getByCity: async (city: string): Promise<PropertyDto[]> => {
    return apiRequest<PropertyDto[]>(`/properties/city/${city}`);
  },

  create: async (data: Partial<PropertyDto>): Promise<PropertyDto> => {
    return apiRequest<PropertyDto>('/properties/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyProperties: async (): Promise<PropertyDto[]> => {
    return apiRequest<PropertyDto[]>('/properties/my-properties');
  },

  search: async (params: any): Promise<PropertyDto[]> => {
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.propertyType) queryParams.append('type', params.propertyType); // Note parameter name 'type'
    if (params.minBedrooms) queryParams.append('minBedrooms', params.minBedrooms.toString());

    return apiRequest<PropertyDto[]>(`/properties/search?${queryParams.toString()}`);
  },

  requestProperty: async (propertyId: number, message: string): Promise<PropertyRequestDto> => {
    return propertyRequestAPI.create(propertyId, message);
  },
};

// Contact API
export const contactAPI = {
  contactLandlord: async (propertyId: number, message?: string, phone?: string): Promise<{ message: string; landlordEmail: string; landlordPhone: string }> => {
    return apiRequest<{ message: string; landlordEmail: string; landlordPhone: string }>(`/contact/landlord/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify({ message, phone }),
    });
  },
};

// Payment API
export const paymentAPI = {
  initiateEsewa: async (amount: number, propertyId?: number): Promise<any> => {
    return apiRequest<any>('/payment/esewa', {
      method: 'POST',
      body: JSON.stringify({ total_amount: amount, property_id: propertyId }),
    });
  },
  initiateSprite: async (amount: number, propertyId?: number): Promise<any> => {
    return apiRequest<any>('/payment/sprite/initiate', {
      method: 'POST',
      body: JSON.stringify({ amount, property_id: propertyId }),
    });
  },
  processSprite: async (transactionId: string, cardDetails: any): Promise<any> => {
    return apiRequest<any>('/payment/sprite/process', {
      method: 'POST',
      body: JSON.stringify({ transactionId, ...cardDetails }),
    });
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async (): Promise<UserDto[]> => {
    return apiRequest<UserDto[]>('/admin/users');
  },
  verifyUser: async (userId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/users/${userId}/verify`, {
      method: 'PUT',
    });
  },
  rejectUser: async (userId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/users/${userId}/reject`, {
      method: 'PUT',
    });
  },
  getAllProperties: async (): Promise<PropertyDto[]> => {
    return apiRequest<PropertyDto[]>('/admin/properties');
  },
  verifyProperty: async (propertyId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/properties/${propertyId}/verify`, {
      method: 'PUT',
    });
  },
  rejectProperty: async (propertyId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/properties/${propertyId}/reject`, {
      method: 'PUT',
    });
  },
};

// Room Request API
export interface RoomRequestDto {
  id?: number;
  seekerId?: number;
  seekerName?: string;
  seekerEmail?: string;
  seekerPhone?: string;
  city: string;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  maxPrice?: number;
  minPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  propertyType?: 'ROOM' | 'FLAT' | 'APARTMENT' | 'HOUSE';
  additionalRequirements?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyRequestDto {
  id: number;
  seekerId: number;
  seekerName: string;
  seekerEmail: string;
  propertyId: number;
  propertyTitle: string;
  propertyPrice?: number;
  propertyImage?: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PAID';
  createdAt: string;
}

export const propertyRequestAPI = {
  create: async (propertyId: number, message: string): Promise<PropertyRequestDto> => {
    return apiRequest<PropertyRequestDto>('/property-requests', {
      method: 'POST',
      body: JSON.stringify({ propertyId, message }),
    });
  },

  getMyRequests: async (): Promise<PropertyRequestDto[]> => {
    return apiRequest<PropertyRequestDto[]>('/property-requests/my-requests');
  },

  getLandlordRequests: async (): Promise<PropertyRequestDto[]> => {
    return apiRequest<PropertyRequestDto[]>('/property-requests/landlord-requests');
  },

  updateStatus: async (id: number, status: string): Promise<PropertyRequestDto> => {
    return apiRequest<PropertyRequestDto>(`/property-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

export const roomRequestAPI = {
  create: async (data: RoomRequestDto): Promise<RoomRequestDto> => {
    return apiRequest<RoomRequestDto>('/room-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyRequests: async (): Promise<RoomRequestDto[]> => {
    return apiRequest<RoomRequestDto[]>('/room-requests/my-requests');
  },

  getAll: async (): Promise<RoomRequestDto[]> => {
    return apiRequest<RoomRequestDto[]>('/room-requests/all');
  },

  getByCity: async (city: string): Promise<RoomRequestDto[]> => {
    return apiRequest<RoomRequestDto[]>(`/room-requests/city/${city}`);
  },

  update: async (id: number, data: Partial<RoomRequestDto>): Promise<RoomRequestDto> => {
    return apiRequest<RoomRequestDto>(`/room-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/room-requests/${id}`, {
      method: 'DELETE',
    });
  },
};

// Image Upload API
export const imageAPI = {
  upload: async (file: File): Promise<{ url: string; message: string }> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          if (response.status === 0 || response.status === 404) {
            errorMessage = 'Backend server is not running. Please start the backend server.';
          } else {
            errorMessage = `Upload failed with status ${response.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (!result.url) {
        throw new Error('No URL returned from upload');
      }
      return { url: result.url };
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:8080');
      }
      // Re-throw with more context
      throw new Error(error.message || 'Failed to upload image');
    }
  },

  uploadDocument: async (file: File): Promise<{ url: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/images/upload-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  uploadCitizenship: async (file: File, type: 'front' | 'back'): Promise<{ url: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/images/upload-citizenship`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  uploadKyc: async (file: File): Promise<{ url: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/images/upload-kyc`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },
};


import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const subscriptionAPI = {
  upgrade: async () => {
    const response = await api.post('/subscription/upgrade');
    return response.data;
  }
};
