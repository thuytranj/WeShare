import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SettingsHub } from './SettingsHub';
import { ProfileSettings } from './ProfileSettings';

export interface SettingsViewProps {
  initialTab?: 'overview' | 'profile';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isProfileRoute =
    location.pathname.startsWith('/settings/profile') || location.pathname === '/profile';

  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>(() => {
    if (initialTab) return initialTab;
    return isProfileRoute ? 'profile' : 'overview';
  });

  // Synchronize internal state when the URL path changes
  useEffect(() => {
    if (isProfileRoute) {
      setActiveTab('profile');
    } else if (location.pathname === '/settings') {
      setActiveTab('overview');
    }
  }, [location.pathname, isProfileRoute]);

  const handleBackToSettings = () => {
    setActiveTab('overview');
    navigate('/settings');
  };

  const handleNavigateToProfile = () => {
    setActiveTab('profile');
    navigate('/settings/profile');
  };

  const isProfileActive = isProfileRoute || activeTab === 'profile';

  return (
    <div className="w-full transition-all duration-300 ease-in-out">
      {isProfileActive ? (
        <ProfileSettings onBack={handleBackToSettings} />
      ) : (
        <SettingsHub onNavigateToProfile={handleNavigateToProfile} />
      )}
    </div>
  );
};

export default SettingsView;
