import { useState } from 'react';
import { Pin } from '../types';
import { genreColors } from '../lib/mockData';
import { MapPin as MapPinIcon, Building2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapViewProps {
  pins: Pin[];
  onPinClick: (pin: Pin) => void;
}

export function MapView({ pins, onPinClick }: MapViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  // 緯度経度を画面座標に変換（簡易版）
  const getPinPosition = (pin: Pin) => {
    const minLat = 35.65;
    const maxLat = 35.70;
    const minLng = 139.63;
    const maxLng = 139.67;

    const x = ((pin.longitude - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - pin.latitude) / (maxLat - minLat)) * 100;

    return { x: `${x}%`, y: `${y}%` };
  };

  // 同じ位置のピンをグループ化
  const groupedPins = pins.reduce((acc, pin) => {
    const key = `${pin.latitude.toFixed(4)}_${pin.longitude.toFixed(4)}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(pin);
    return acc;
  }, {} as Record<string, Pin[]>);

  const getPinSize = (count: number) => {
    if (count === 1) return 'w-10 h-10';
    if (count <= 3) return 'w-12 h-12';
    if (count <= 5) return 'w-14 h-14';
    return 'w-16 h-16';
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 overflow-hidden">
      {/* トポグラフィー風の背景 */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* 等高線パターン */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-radial-gradient(circle at 30% 40%, transparent 0, transparent 50px, rgba(59, 130, 246, 0.3) 51px, rgba(59, 130, 246, 0.3) 52px),
            repeating-radial-gradient(circle at 70% 60%, transparent 0, transparent 70px, rgba(16, 185, 129, 0.3) 71px, rgba(16, 185, 129, 0.3) 72px)
          `,
        }}
      />

      {/* ズームコントロール */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <button
            onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
            className="block w-12 h-12 hover:bg-blue-50 transition-colors flex items-center justify-center border-b border-slate-200"
            title="ズームイン"
          >
            <ZoomIn className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
            className="block w-12 h-12 hover:bg-blue-50 transition-colors flex items-center justify-center border-b border-slate-200"
            title="ズームアウト"
          >
            <ZoomOut className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="block w-12 h-12 hover:bg-blue-50 transition-colors flex items-center justify-center"
            title="リセット"
          >
            <Maximize2 className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* ピン表示エリア */}
      <div 
        className="absolute inset-0 transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {Object.entries(groupedPins).map(([key, groupPins]) => {
          const representativePin = groupPins[0];
          const position = getPinPosition(representativePin);
          const count = groupPins.length;
          const size = getPinSize(count);
          const isHovered = hoveredPin === key;

          return (
            <button
              key={key}
              onClick={() => onPinClick(representativePin)}
              onMouseEnter={() => setHoveredPin(key)}
              onMouseLeave={() => setHoveredPin(null)}
              className="absolute transform -translate-x-1/2 -translate-y-full group"
              style={{ left: position.x, top: position.y }}
            >
              {/* ピンの影 */}
              <div 
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full bg-black/20 blur-sm transition-all ${
                  isHovered ? 'w-8 h-3' : 'w-6 h-2'
                }`}
              />

              {/* ピン本体 */}
              <div className={`relative transition-all duration-300 ${isHovered ? 'scale-110 -translate-y-1' : ''}`}>
                {representativePin.userRole === 'business' ? (
                  // 事業者ピン（ダイヤモンド形状）
                  <div className="relative">
                    <div 
                      className={`${size} transform rotate-45 shadow-2xl overflow-hidden border-4 border-white transition-all`}
                      style={{ 
                        backgroundColor: genreColors[representativePin.genre],
                        boxShadow: `0 10px 25px -5px ${genreColors[representativePin.genre]}50`
                      }}
                    >
                      <div className="transform -rotate-45 w-full h-full flex items-center justify-center">
                        {representativePin.businessIcon ? (
                          <img 
                            src={representativePin.businessIcon} 
                            alt={representativePin.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    {/* パルスエフェクト */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0 transform rotate-45 animate-ping"
                        style={{ 
                          backgroundColor: genreColors[representativePin.genre],
                          opacity: 0.3
                        }}
                      />
                    )}
                  </div>
                ) : (
                  // 一般ユーザーピン（円形＋グロー）
                  <div className="relative">
                    <div 
                      className={`${size} rounded-full shadow-2xl flex items-center justify-center transition-all border-4 border-white relative`}
                      style={{ 
                        backgroundColor: genreColors[representativePin.genre],
                        boxShadow: `0 10px 25px -5px ${genreColors[representativePin.genre]}50`
                      }}
                    >
                      <MapPinIcon className="w-5 h-5 text-white" />
                      
                      {/* インナーグロー */}
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)`
                        }}
                      />
                    </div>
                    {/* パルスエフェクト */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ 
                          backgroundColor: genreColors[representativePin.genre],
                          opacity: 0.3
                        }}
                      />
                    )}
                  </div>
                )}
                
                {/* カウントバッジ */}
                {count > 1 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-xs">{count}</span>
                  </div>
                )}
              </div>

              {/* ホバー時のツールチップ */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 pointer-events-none whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-2 rounded-xl shadow-2xl border border-slate-700">
                    <div className="text-sm mb-1">{representativePin.title}</div>
                    <div className="text-xs text-slate-300 flex items-center space-x-2">
                      <span>👍 {representativePin.reactions}</span>
                      <span>•</span>
                      <span>
                        {representativePin.userRole === 'business' 
                          ? representativePin.businessName 
                          : '匿名'}
                      </span>
                    </div>
                  </div>
                  {/* 三角形の矢印 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="border-8 border-transparent border-t-slate-900" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/50">
          <div className="text-xs text-slate-700 mb-3">凡例</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-slate-700">グルメ</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-slate-700">イベント</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: '#10B981' }} />
              <span className="text-slate-700">景色</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: '#3B82F6' }} />
              <span className="text-slate-700">お店</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: '#8B5CF6' }} />
              <span className="text-slate-700">緊急情報</span>
            </div>
            <div className="border-t border-slate-300 my-2" />
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full shadow-md bg-blue-500 border-2 border-white flex items-center justify-center">
                <MapPinIcon className="w-3 h-3 text-white" />
              </div>
              <span className="text-slate-700">一般投稿</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 transform rotate-45 shadow-md bg-blue-500 border-2 border-white" />
              <span className="text-slate-700">事業者投稿</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
