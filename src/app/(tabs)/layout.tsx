'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { MainLayout, type TabId } from '@/components/common/MainLayout';
import { NfcSimulatorFab } from '@/components/common/NfcSimulatorFab';
import CheckInSuccessModal from '@/components/collection/CheckInSuccessModal';
import ARModelViewer from '@/components/photo/ARModelViewer';
import { LOCATIONS, getLocationData } from '@/constants/locations';
import { getUnlockedCount, unlockCollectible } from '@/lib/storage';

function tabFromPathname(pathname: string): TabId {
  if (pathname === '/' || pathname.startsWith('/explore') || pathname.startsWith('/map')) return 'explore';
  if (pathname.startsWith('/collection')) return 'collection';
  if (pathname.startsWith('/wall')) return 'wall';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'explore';
}

export default function TabsLayout({ children }: { children: ReactNode }) {
  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<number | null>(null);
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const activeTab = tabFromPathname(pathname);
  const [checkInData, setCheckInData] = useState({
    id: '',
    locationName: '',
    mascotName: '',
  });
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [isARViewerOpen, setIsARViewerOpen] = useState(false);
  const [isNfcSimulatorVisible, setIsNfcSimulatorVisible] = useState(false);

  useEffect(() => {
    setUnlockedCount(getUnlockedCount());
  }, []);

  useEffect(() => {
    return () => {
      if (logoTapTimerRef.current) {
        window.clearTimeout(logoTapTimerRef.current);
      }
    };
  }, []);

  const clearCheckinParam = () => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.delete('checkin');
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({ path: next }, '', next);
  };

  const processCheckin = (checkinId: string) => {
    const locationInfo = getLocationData(checkinId);
    if (!locationInfo) {
      clearCheckinParam();
      return;
    }

    unlockCollectible(locationInfo.id);
    setUnlockedCount(getUnlockedCount());
    setCheckInData({
      id: locationInfo.id,
      locationName: locationInfo.locationName,
      mascotName: locationInfo.mascotName,
    });
    setIsCheckInModalOpen(true);
    clearCheckinParam();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const checkinId = params.get('checkin');
    if (!checkinId) return;

    // Clear immediately so the user never sees the param in the address bar.
    clearCheckinParam();
    processCheckin(checkinId);
  }, [pathname]);

  const handleSimulateCheckIn = (id: string) => {
    processCheckin(id);
  };

  const handleLogoClick = () => {
    if (logoTapTimerRef.current) {
      window.clearTimeout(logoTapTimerRef.current);
    }

    logoTapCountRef.current += 1;

    if (logoTapCountRef.current >= 5) {
      logoTapCountRef.current = 0;
      setIsNfcSimulatorVisible(true);
      return;
    }

    logoTapTimerRef.current = window.setTimeout(() => {
      logoTapCountRef.current = 0;
      logoTapTimerRef.current = null;
    }, 1500);
  };

  return (
    <MainLayout activeTab={activeTab} onLogoClick={handleLogoClick}>
      {children}

      {isNfcSimulatorVisible ? (
        <NfcSimulatorFab
          onCheckIn={handleSimulateCheckIn}
          onClose={() => setIsNfcSimulatorVisible(false)}
        />
      ) : null}

      <ARModelViewer
        open={isARViewerOpen}
        onClose={() => setIsARViewerOpen(false)}
        checkinId={checkInData.id || undefined}
        mascotName={checkInData.mascotName}
      />

      <CheckInSuccessModal
        open={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onViewCollection={() => {
          router.push('/collection');
          setIsCheckInModalOpen(false);
        }}
        onEnterAR={() => {
          setIsCheckInModalOpen(false);
          setIsARViewerOpen(true);
        }}
        checkinId={checkInData.id}
        locationName={checkInData.locationName}
        mascotName={checkInData.mascotName}
        current={unlockedCount}
        total={LOCATIONS.length}
      />
    </MainLayout>
  );
}

