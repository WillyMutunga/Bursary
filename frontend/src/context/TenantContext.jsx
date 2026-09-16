import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

// Baseline fallback if backend is momentarily unreachable
export const DEFAULT_CONSTITUENCY = {
  id: 1,
  name: 'Kibwezi West',
  slug: 'kibwezi-west',
  code: 'KBW-015',
  county: 'Makueni County',
  mp_name: 'Hon. Dr. Mwengi Mutuse, MP',
  mp_title: 'Member of National Assembly',
  mp_photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  mp_message: 'Committed to transparent, merit-based and equitable bursary distribution to empower every deserving student in Kibwezi West.',
  fund_account_manager: 'Constituency Fund Account Manager',
  office_postal_address: 'P.O. Box 128 - 90137, Kibwezi, Kenya',
  office_location: 'NG-CDF Office Building, Makindu / Kibwezi Town',
  office_email: 'kibweziwest@ngcdf.go.ke',
  office_phone: '+254 700 000 000',
  primary_color: '#0B6B3A',
  is_active: true,
  wards: [
    { id: 1, name: 'Emali / Mulala Ward', code: 'KBW-01', population: 45000, budget_allocation: 5500000.00, representative_name: 'Hon. Francis Musyoka' },
    { id: 2, name: 'Nguu / Masumba Ward', code: 'KBW-02', population: 38000, budget_allocation: 5000000.00, representative_name: 'Hon. Daniel Kimanzi' },
    { id: 3, name: 'Nguumo Ward', code: 'KBW-03', population: 42000, budget_allocation: 5200000.00, representative_name: 'Hon. Geoffrey Musyoki' },
    { id: 4, name: 'Makindu Ward', code: 'KBW-04', population: 52000, budget_allocation: 6000000.00, representative_name: 'Hon. Jackson Muthama' },
    { id: 5, name: 'Kikumbulyu North Ward', code: 'KBW-05', population: 36000, budget_allocation: 4800000.00, representative_name: 'Hon. Onesmus Mutinda' },
    { id: 6, name: 'Kikumbulyu South Ward', code: 'KBW-06', population: 39000, budget_allocation: 5000000.00, representative_name: 'Hon. Peter Mwololo' },
  ],
  stats: {
    total_wards: 6,
    total_applications: 3200,
    approved_applications: 2450,
    total_disbursed: 18700000.00,
  }
};

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [currentConstituency, setCurrentConstituency] = useState(() => {
    try {
      const saved = localStorage.getItem('ngcdf_active_constituency');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CONSTITUENCY;
  });

  const [availableConstituencies, setAvailableConstituencies] = useState([DEFAULT_CONSTITUENCY]);
  const [isLoadingTenant, setIsLoadingTenant] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Fetch all constituencies from backend
  const fetchConstituencies = async () => {
    try {
      const res = await api.get('/constituencies');
      if (res && res.data && Array.isArray(res.data)) {
        setAvailableConstituencies(res.data);
        
        // If current constituency exists in list, sync details
        const match = res.data.find(c => c.id === currentConstituency?.id || c.slug === currentConstituency?.slug);
        if (match) {
          fetchSingleConstituency(match.id || match.slug);
        }
      }
    } catch (err) {
      console.warn('Unable to load constituencies list, using cache/defaults:', err);
    }
  };

  const fetchSingleConstituency = async (idOrSlug) => {
    setIsLoadingTenant(true);
    try {
      const res = await api.get(`/constituencies/${idOrSlug}`);
      if (res && res.data) {
        const fullData = {
          ...res.data,
          stats: res.stats || currentConstituency?.stats || DEFAULT_CONSTITUENCY.stats,
          wards: res.data.wards || currentConstituency?.wards || [],
        };
        setCurrentConstituency(fullData);
        localStorage.setItem('ngcdf_active_constituency', JSON.stringify(fullData));
      }
    } catch (err) {
      console.warn(`Unable to fetch details for constituency ${idOrSlug}:`, err);
    } finally {
      setIsLoadingTenant(false);
    }
  };

  const selectConstituency = (constituencyOrSlug) => {
    if (typeof constituencyOrSlug === 'object') {
      setCurrentConstituency(constituencyOrSlug);
      localStorage.setItem('ngcdf_active_constituency', JSON.stringify(constituencyOrSlug));
      if (constituencyOrSlug.id) {
        fetchSingleConstituency(constituencyOrSlug.id);
      }
    } else {
      fetchSingleConstituency(constituencyOrSlug);
    }
    setIsSwitcherOpen(false);
  };

  useEffect(() => {
    fetchConstituencies();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        currentConstituency: currentConstituency || DEFAULT_CONSTITUENCY,
        availableConstituencies,
        isLoadingTenant,
        isSwitcherOpen,
        setIsSwitcherOpen,
        selectConstituency,
        refreshConstituency: () => fetchSingleConstituency(currentConstituency?.id || 1),
        reloadAllConstituencies: fetchConstituencies,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      currentConstituency: DEFAULT_CONSTITUENCY,
      availableConstituencies: [DEFAULT_CONSTITUENCY],
      isLoadingTenant: false,
      isSwitcherOpen: false,
      setIsSwitcherOpen: () => {},
      selectConstituency: () => {},
      refreshConstituency: () => {},
      reloadAllConstituencies: () => {},
    };
  }
  return context;
}
