import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Flag, Trash2, Eye } from 'lucide-react';
import { Pin, User } from '../types';
import { genreLabels, genreColors } from '../lib/mockData';
import { useEffect, useRef, useState } from 'react';
import { UserTriggerReaction } from './UserTriggerReaction';
import { ReportScreen } from './ReportScreen';
import { SelectBlock } from './SelectBlock';
import { SelectPostDeletion } from './SelectPostDeletion';

interface PinDetailModalProps {
  pin: Pin;
  currentUser: User;
  isReacted: boolean;
  onClose: () => void;
  onReaction: (pinId: string) => void;
  onDelete: (pinId: string) => void;
  onBlockUser?: (userId: string) => void;
  // pins at the same/similar location to allow scrolling through nearby posts
  pinsAtLocation?: Pin[];
  // open create modal prefilled with given coordinates
  onOpenCreateAtLocation?: (lat: number, lng: number) => void;
  // 追加：別のピンを選択するための関数
  onSelectPin?: (pin: Pin) => void;
}

export function PinDetailModal({ pin, currentUser, isReacted, onClose, onReaction, onDelete, onBlockUser, pinsAtLocation, onOpenCreateAtLocation, onSelectPin }: PinDetailModalProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pin.id]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwnPost = pin.userId === currentUser.id;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
              <div className="flex items-start justify-between">
              <div className="flex-1">
              <DialogTitle>{pin.title}</DialogTitle>
              <DialogDescription className="sr-only">
                投稿の詳細情報を表示します
              </DialogDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge style={{ backgroundColor: genreColors[pin.genre] }}>
                  {genreLabels[pin.genre]}
                </Badge>
                {pin.userRole === 'business' && (
                  <Badge variant="outline">事業者</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* 投稿者情報 */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="text-sm">
                {pin.userRole === 'business' ? pin.businessName : '匿名'}
              </p>
              <p className="text-xs text-gray-500">{formatDate(pin.createdAt)}</p>
            </div>
            {pin.viewCount !== undefined && (
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {pin.viewCount} 閲覧
              </div>
            )}
          </div>

          {/* 説明文 */}
          <div>
            <p className="text-gray-700 whitespace-pre-wrap">{pin.description}</p>
          </div>

          {/* 画像表示エリア */}
          {pin.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {pin.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`投稿画像 ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* 位置情報 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              📍 位置: {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
            </p>
          </div>

          {/* リアクション数 と 投稿を追加ボタン */}
          <div className="flex items-center space-x-3 text-gray-700">
          <div className="flex items-center space-x-2">
              <Heart className={`w-5 h-5 ${isReacted ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{pin.reactions} リアクション</span>
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenCreateAtLocation && onOpenCreateAtLocation(pin.latitude, pin.longitude)}
              >
                投稿を追加
              </Button>
            </div>
          </div>

          {/* アクションエリア */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            {isReporting ? (
              <ReportScreen isReporting={isReporting} setIsReporting={setIsReporting} onReportComplete={onClose} />
            ) : (
              <>
                {/* 1. リアクションボタン */}
                <UserTriggerReaction
                  pinId={pin.id}
                  isReacted={isReacted}
                  userRole={currentUser.role}
                  isDisabled={false}
                  onReaction={onReaction}
                />

                {isOwnPost ? (
                  /* 2. 削除ボタン */
                  <SelectPostDeletion 
                    pinId={pin.id} 
                    onDelete={onDelete} 
                    onClose={onClose} 
                  />
                ) : (
                  /* 3. 通報 & ブロック */
                  <>
                    <ReportScreen isReporting={isReporting} setIsReporting={setIsReporting} onReportComplete={onClose} />
                    {typeof onBlockUser === 'function' && (
                      <SelectBlock 
                        userId={pin.userId} 
                        onBlockUser={onBlockUser} 
                        onClose={onClose} 
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* 同一場所の投稿リスト（スクロール可能） */}
          {pinsAtLocation && pinsAtLocation.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-bold mb-3">この場所の他の投稿</h3>
              <div className="space-y-2">
                {pinsAtLocation.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (p.id !== pin.id && onSelectPin) onSelectPin(p);
                    }}
                    className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                      p.id === pin.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{p.title}</span>
                      <span className="text-xs text-gray-500">{p.reactions} ❤️</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}