export const findRequestAPI = {
  async createRequest(data: { product: string; quantity: string; targetCountry: string }) {
    const response = await fetch('/api/find-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async getRequests(params?: { status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/find-requests?${searchParams}`);
    return response.json();
  },

  async updateStatus(id: string, status: 'pending' | 'responded') {
    const response = await fetch(`/api/find-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    return response.json();
  }
};