import { useState } from 'react';
import { Header } from './Header';
import { MapView } from './MapView';
import { Sidebar } from './Sidebar';
import { PinDetailModal } from './PinDetailModal';
import { CreatePinModal } from './CreatePinModal';
import { MyPage } from './MyPage';
import { BusinessDashboard } from './BusinessDashboard';
import { ContactModal } from './ContactModal';
import { DeleteAccountScreen } from './DeleteAccountScreen';
import { LogoutScreen } from './LogoutScreen';
import { Pin, User } from '../types';
import { mockPins } from '../lib/mockData';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export function MainApp({ user, onLogout, onUpdateUser }: MainAppProps) {
  const [pins, setPins] = useState<Pin[]>(mockPins);
  const [filteredPins, setFilteredPins] = useState<Pin[]>(mockPins);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialLatitude, setCreateInitialLatitude] = useState<number | undefined>(undefined);
  const [createInitialLongitude, setCreateInitialLongitude] = useState<number | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'map' | 'mypage' | 'dashboard' | 'logout' | 'deleteAccount'>('map');
  const [previousView, setPreviousView] = useState<'map' | 'mypage' | 'dashboard'>('map');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [reactedPins, setReactedPins] = useState<Set<string>>(new Set());

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
  };

  const handleOpenCreateAtLocation = (lat: number, lng: number) => {
    setCreateInitialLatitude(lat);
    setCreateInitialLongitude(lng);
    setIsCreateModalOpen(true);
  };

  const handleReaction = (pinId: string) => {
    if (reactedPins.has(pinId)) {
      // リアクション取り消し
      setPins(pins.map(p => 
        p.id === pinId ? { ...p, reactions: p.reactions - 1 } : p
      ));
      setFilteredPins(filteredPins.map(p => 
        p.id === pinId ? { ...p, reactions: p.reactions - 1 } : p
      ));
      setReactedPins(prev => {
        const next = new Set(prev);
        next.delete(pinId);
        return next;
      });
    } else {
      // リアクション追加
      setPins(pins.map(p => 
        p.id === pinId ? { ...p, reactions: p.reactions + 1 } : p
      ));
      setFilteredPins(filteredPins.map(p => 
        p.id === pinId ? { ...p, reactions: p.reactions + 1 } : p
      ));
      setReactedPins(prev => new Set(prev).add(pinId));
    }
    
    if (selectedPin && selectedPin.id === pinId) {
      setSelectedPin({
        ...selectedPin,
        reactions: reactedPins.has(pinId) ? selectedPin.reactions - 1 : selectedPin.reactions + 1
      });
    }
  };

  const handleCreatePin = (newPin: Omit<Pin, 'id' | 'userId' | 'userName' | 'userRole' | 'reactions' | 'createdAt' | 'viewCount' | 'businessName' | 'businessIcon'>) => {
    const pin: Pin = {
      ...newPin,
      id: `pin_${Date.now()}`,
      userId: user.id,
      userName: user.role === 'business' ? user.name : '匿名',
      userRole: user.role,
      businessName: user.businessName,
      businessIcon: user.businessIcon,
      reactions: 0,
      createdAt: new Date(),
      viewCount: 0,
    };
    setPins([pin, ...pins]);
    setFilteredPins([pin, ...filteredPins]);
    setIsCreateModalOpen(false);
  };

  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter(p => p.id !== pinId));
    setFilteredPins(filteredPins.filter(p => p.id !== pinId));
    setSelectedPin(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    // Appレベルのユーザー情報を更新
    onUpdateUser(updatedUser);

    // 既存のピンも更新（名前／事業者名／アイコン）
    const updatePins = (pinsArray: Pin[]) =>
      pinsArray.map((p) =>
        p.userId === updatedUser.id
          ? {
              ...p,
              businessIcon: updatedUser.businessIcon,
              businessName: updatedUser.businessName,
              userName: updatedUser.name,
            }
          : p
      );

    setPins(updatePins(pins));
    setFilteredPins(updatePins(filteredPins));

    if (selectedPin && selectedPin.userId === updatedUser.id) {
      setSelectedPin({
        ...selectedPin,
        businessIcon: updatedUser.businessIcon,
        businessName: updatedUser.businessName,
        userName: updatedUser.name,
      });
    }
  };

  const handleBlockUser = (blockUserId: string) => {
    const nextBlocked = Array.from(new Set([...(user.blockedUsers || []), blockUserId]));
    const updatedUser: User = { ...user, blockedUsers: nextBlocked };
    onUpdateUser(updatedUser);
  };

  const handleNavigate = (view: 'map' | 'mypage' | 'dashboard' | 'logout') => {
    if (view === 'logout') {
      // ログアウト画面に遷移する前に、現在の画面を保存
      if (currentView === 'map' || currentView === 'mypage' || currentView === 'dashboard') {
        setPreviousView(currentView);
      }
    }
    setCurrentView(view);
  };

  const handleLogoutBack = () => {
    setCurrentView(previousView);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        user={user} 
        onLogout={onLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
        onContact={() => setIsContactModalOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {currentView === 'map' && (
          <>
            <Sidebar 
              user={user}
              pins={pins}
              onFilterChange={setFilteredPins}
              onCreatePin={() => setIsCreateModalOpen(true)}
              onPinClick={handlePinClick}
            />
            <MapView 
              pins={filteredPins}
              onPinClick={handlePinClick}
            />
          </>
        )}

        {currentView === 'mypage' && (
          <MyPage 
            user={user}
            pins={pins.filter(p => p.userId === user.id)}
            reactedPins={Array.from(reactedPins).map(id => pins.find(p => p.id === id)!).filter(Boolean)}
            onPinClick={handlePinClick}
            onDeletePin={handleDeletePin}
            onUpdateUser={handleUpdateUser}
            onNavigateToDeleteAccount={() => setCurrentView('deleteAccount')}
          />
        )}

        {currentView === 'dashboard' && user.role === 'business' && (
          <div className="flex-1 h-full">
            <BusinessDashboard 
              user={user}
              pins={pins.filter(p => p.userId === user.id)}
              onPinClick={handlePinClick}
            />
          </div>
        )}

        {currentView === 'logout' && (
          <LogoutScreen 
            user={user}
            onBack={handleLogoutBack}
            onLogout={onLogout}
          />
        )}

        {currentView === 'deleteAccount' && (
          <DeleteAccountScreen 
            user={user}
            onBack={() => setCurrentView('mypage')}
            onDeleteAccount={onLogout}
          />
        )}
      </div>

      {selectedPin && (
        <PinDetailModal
          pin={selectedPin}
          currentUser={user}
          isReacted={reactedPins.has(selectedPin.id)}
          onClose={() => setSelectedPin(null)}
          onReaction={handleReaction}
          onDelete={handleDeletePin}
            onBlockUser={handleBlockUser}
            pinsAtLocation={pins.filter(p => Math.abs(p.latitude - selectedPin.latitude) < 0.0001 && Math.abs(p.longitude - selectedPin.longitude) < 0.0001)}
            onOpenCreateAtLocation={handleOpenCreateAtLocation}
        />
      )}

      {isCreateModalOpen && (
        <CreatePinModal
          user={user}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateInitialLatitude(undefined);
            setCreateInitialLongitude(undefined);
          }}
          onCreate={handleCreatePin}
          initialLatitude={createInitialLatitude}
          initialLongitude={createInitialLongitude}
        />
      )}

      {isContactModalOpen && (
        <ContactModal
          user={user}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}
