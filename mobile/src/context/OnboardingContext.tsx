import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OnboardingState, ServiceType, PainPoint, BusinessAnalysis } from '../types';

interface OnboardingContextType {
  state: OnboardingState;
  setServiceType: (type: ServiceType) => void;
  togglePainPoint: (point: PainPoint) => void;
  setLocations: (locations: string[]) => void;
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  setBusinessAnalysis: (analysis: BusinessAnalysis) => void;
  setAccountInfo: (info: { phone?: string; name?: string; email?: string }) => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  serviceType: null,
  painPoints: [],
  locations: [],
  businessAnalysis: null,
  phone: '',
  name: '',
  email: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setServiceType = (type: ServiceType) => {
    setState((prev) => ({ ...prev, serviceType: type }));
  };

  const togglePainPoint = (point: PainPoint) => {
    setState((prev) => ({
      ...prev,
      painPoints: prev.painPoints.includes(point)
        ? prev.painPoints.filter((p) => p !== point)
        : [...prev.painPoints, point],
    }));
  };

  const setLocations = (locations: string[]) => {
    setState((prev) => ({ ...prev, locations }));
  };

  const addLocation = (location: string) => {
    if (!state.locations.includes(location)) {
      setState((prev) => ({ ...prev, locations: [...prev.locations, location] }));
    }
  };

  const removeLocation = (location: string) => {
    setState((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l !== location),
    }));
  };

  const setBusinessAnalysis = (analysis: BusinessAnalysis) => {
    setState((prev) => ({ ...prev, businessAnalysis: analysis }));
  };

  const setAccountInfo = (info: { phone?: string; name?: string; email?: string }) => {
    setState((prev) => ({
      ...prev,
      phone: info.phone ?? prev.phone,
      name: info.name ?? prev.name,
      email: info.email ?? prev.email,
    }));
  };

  const reset = () => {
    setState(initialState);
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setServiceType,
        togglePainPoint,
        setLocations,
        addLocation,
        removeLocation,
        setBusinessAnalysis,
        setAccountInfo,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
