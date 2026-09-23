import axiosInstance from './axiosInstance'

// ── Auth  (no /auth prefix — your backend uses /api/register etc.)
export const authAPI = {
  register : (data) => axiosInstance.post('/auth/register', data),
  login    : (data) => axiosInstance.post('/auth/login', data),
  me       : ()     => axiosInstance.get('/auth/me'),
}

// ── Transactions
export const transactionAPI = {
  getAll   : (params = {}) => axiosInstance.get('/transactions/list',          { params }),
  getById  : (id)          => axiosInstance.get(`/transactions/${id}`),
  getSummary: ()           => axiosInstance.get('/transactions/summary'),
  create   : (data)        => axiosInstance.post('/transactions/create',        data),
  update   : (id, data)    => axiosInstance.put(`/transactions/update/${id}`,  data),
  delete   : (id)          => axiosInstance.delete(`/transactions/delete/${id}`),
}

// ── Categories
export const categoryAPI = {
  getAll  : ()         => axiosInstance.get('/categories/list'),
  getById : (id)       => axiosInstance.get(`/categories/${id}`),
  create  : (data)     => axiosInstance.post('/categories/create', data),
  update  : (id, data) => axiosInstance.put(`/categories/update/${id}`, data),
  delete  : (id)       => axiosInstance.delete(`/categories/delete/${id}`),
}

// ── Stats
export const statsAPI = {
  summary  : ()      => axiosInstance.get('/stats/summary'),
  category : ()      => axiosInstance.get('/stats/category'),
  monthly  : ()      => axiosInstance.get('/stats/monthly'),
}

// ── Referral
export const referralAPI = {
  getCode  : () => axiosInstance.get('/referral/code'),
  getUsers : () => axiosInstance.get('/referral/users'),
  getStats : () => axiosInstance.get('/referral/stats'),
}

// ── Workspace
export const workspaceAPI = {
  getAll        : ()        => axiosInstance.get('/workspace/get'),
  getMembers    : ()        => axiosInstance.get('/workspace/members'),
  create        : (data)    => axiosInstance.post('/workspace/create', data),
  removeMember  : (userId)  => axiosInstance.delete(`/workspace/remove/${userId}`),
  switchTo      : (wsId)    => axiosInstance.post('/workspace/switch', { workspaceId: wsId }),
}
