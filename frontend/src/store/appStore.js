import { create } from 'zustand'

export const useAppStore = create((set) => ({
  selectedBranchId: 'all', // 'all' = consolidated view
  setBranch: (id) => set({ selectedBranchId: id }),

  dateRange: '7d', // '7d' | '30d' | '90d' | 'ytd'
  setDateRange: (range) => set({ dateRange: range }),

  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}))