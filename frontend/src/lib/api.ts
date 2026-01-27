/**
 * Client API pour communiquer avec le backend FastAPI.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  data: T | null
  error: string | null
}

async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return { data, error: null }

  } catch (error) {
    console.error('API Error:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Patients
export const patientsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchApi(`/api/patients${query}`)
  },
  
  getById: (id: string) => fetchApi(`/api/patients/${id}`),
  
  getContacts: (id: string, depth = 2) => 
    fetchApi(`/api/patients/${id}/contacts?depth=${depth}`),
  
  getStats: () => fetchApi('/api/patients/stats'),
}

// Infections
export const infectionsApi = {
  getChain: (patientId: string, depth = 3) =>
    fetchApi(`/api/infections/chain/${patientId}?depth=${depth}`),
  
  getSuperSpreaders: (minInfections = 5) =>
    fetchApi(`/api/infections/superspreaders?min_infections=${minInfections}`),
  
  getTimeline: (country?: string) => {
    const query = country ? `?country=${country}` : ''
    return fetchApi(`/api/infections/timeline${query}`)
  },
  
  getByVariant: () => fetchApi('/api/infections/by-variant'),
  
  getByLocation: () => fetchApi('/api/infections/by-location'),
  
  getClusterStats: () => fetchApi('/api/infections/cluster-stats'),
}

// Analytics GDS
export const analyticsApi = {
  getCommunities: (limit = 20) =>
    fetchApi(`/api/analytics/communities?limit=${limit}`),
  
  getPageRank: (limit = 20) =>
    fetchApi(`/api/analytics/pagerank?limit=${limit}`),
  
  getCentrality: (limit = 15) =>
    fetchApi(`/api/analytics/centrality?limit=${limit}`),
  
  getShortestPath: (source: string, target: string) =>
    fetchApi(`/api/analytics/shortest-path?source=${source}&target=${target}`),
  
  getSimilarity: (threshold = 0.5) =>
    fetchApi(`/api/analytics/similarity?threshold=${threshold}`),
  
  getStats: () => fetchApi('/api/analytics/stats'),
}

// Predictions ML
export const predictionsApi = {
  getPatientRisk: (patientId: string) =>
    fetchApi(`/api/predictions/risk/${patientId}`),
  
  getAtRiskPatients: (threshold = 0.7, limit = 50) =>
    fetchApi(`/api/predictions/at-risk?threshold=${threshold}&limit=${limit}`),
  
  getForecast: (days = 14) =>
    fetchApi(`/api/predictions/forecast?days=${days}`),
  
  getModelInfo: () =>
    fetchApi<{ algorithm: string; features: string[]; model_exists: boolean; last_trained: string | null }>('/api/predictions/model-info'),
}

// Hospitals
export const hospitalsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchApi(`/api/hospitals${query}`)
  },
  
  getById: (id: string) => fetchApi(`/api/hospitals/${id}`),
  
  getCapacity: () => fetchApi('/api/hospitals/capacity'),
  
  getSaturation: (threshold = 0.8) =>
    fetchApi(`/api/hospitals/saturation?threshold=${threshold}`),
  
  getTransfers: () => fetchApi('/api/hospitals/transfers'),
}

// Health check
export const healthApi = {
  check: () => fetchApi('/health'),
}
