// lib/hotel-api.ts
import { IHotel } from '@/models/Hotel';

export interface HotelFilters {
  city?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface HotelResponse {
  success: boolean;
  data?: {
    hotels: IHotel[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

export interface SingleHotelResponse {
  success: boolean;
  data?: IHotel;
  error?: string;
}

export class HotelAPI {
  private baseURL = '/api/hotels';

  // Get all hotels with filters
  async getHotels(filters: HotelFilters = {}): Promise<HotelResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseURL}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hotels');
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching hotels:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch hotels'
      };
    }
  }

  // Get single hotel by ID
  async getHotel(id: string): Promise<SingleHotelResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hotel');
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch hotel'
      };
    }
  }

  // Create new hotel
  async createHotel(hotelData: Omit<IHotel, '_id' | 'createdAt' | 'updatedAt'>): Promise<SingleHotelResponse> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create hotel');
      }

      return data;
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      return {
        success: false,
        error: error.message || 'Failed to create hotel'
      };
    }
  }

  // Update hotel
  async updateHotel(id: string, hotelData: Partial<IHotel>): Promise<SingleHotelResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update hotel');
      }

      return data;
    } catch (error: any) {
      console.error('Error updating hotel:', error);
      return {
        success: false,
        error: error.message || 'Failed to update hotel'
      };
    }
  }

  // Delete hotel
  async deleteHotel(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete hotel');
      }

      return data;
    } catch (error: any) {
      console.error('Error deleting hotel:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete hotel'
      };
    }
  }

  // Get hotels by city
  async getHotelsByCity(city: string): Promise<HotelResponse> {
    return this.getHotels({ city, isActive: true });
  }

  // Toggle hotel active status
  async toggleHotelStatus(id: string, isActive: boolean): Promise<SingleHotelResponse> {
    return this.updateHotel(id, { isActive });
  }
}

// Create singleton instance
export const hotelAPI = new HotelAPI();

// Hook for React components
export const useHotelAPI = () => {
  return hotelAPI;
};