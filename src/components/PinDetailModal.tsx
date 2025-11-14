import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Flag, Trash2, Eye } from 'lucide-react';
import { Pin, User } from '../types';
import { genreLabels, genreColors } from '../lib/mockData';
import { toast } from 'sonner';
import { useState } from 'react';
import { Textarea } from './ui/textarea';

interface PinDetailModalProps {
  pin: Pin;
  currentUser: User;
  isReacted: boolean;
  onClose: () => void;
  onReaction: (pinId: string) => void;
  onDelete: (pinId: string) => void;
  onBlockUser?: (userId: string) => void;
}

export function PinDetailModal({ pin, currentUser, isReacted, onClose, onReaction, onDelete, onBlockUser }: PinDetailModalProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast.error('通報理由を入力してください');
      return;
    }
    toast.success('通報を受け付けました。運営が確認いたします。');
    setShowReportForm(false);
    setReportReason('');
    onClose();
  };

  const handleDelete = () => {
    if (confirm('この投稿を削除してもよろしいですか？')) {
      onDelete(pin.id);
      toast.success('投稿を削除しました');
    }
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

          {/* リアクション数 */}
          <div className="flex items-center space-x-2 text-gray-700">
            <Heart className={`w-5 h-5 ${isReacted ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{pin.reactions} リアクション</span>
          </div>

          {/* 通報フォーム */}
          {showReportForm && !isOwnPost && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <p className="text-sm">通報理由を入力してください：</p>
              <Textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="不適切な内容、規約違反の理由などを具体的に記入してください"
                rows={4}
              />
              <div className="flex space-x-2">
                <Button onClick={handleReport} variant="destructive" size="sm">
                  通報する
                </Button>
                <Button onClick={() => setShowReportForm(false)} variant="outline" size="sm">
                  キャンセル
                </Button>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              onClick={() => {
                // ボタンが無効な場合は何もしない
                if (showReportForm || currentUser.role === 'business') return;
                onReaction(pin.id);
              }}
              variant={isReacted ? 'default' : 'outline'}
              className="flex-1"
              disabled={showReportForm || currentUser.role === 'business'}
            >
              <Heart className={`w-4 h-4 mr-2 ${isReacted ? 'fill-white' : ''}`} />
              {currentUser.role === 'business' ? '事業者はリアクション不可' : (isReacted ? 'リアクション済み' : 'リアクション')}
            </Button>

            {isOwnPost ? (
              <Button
                onClick={handleDelete}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowReportForm(!showReportForm)}
                  variant="outline"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  通報
                </Button>

                {/* ブロック機能を追加 */}
                {typeof onBlockUser === 'function' && (
                  <Button
                    onClick={() => {
                      if (confirm('このユーザーをブロックしますか？ ブロックすると相手の投稿が表示されなくなります。')) {
                        onBlockUser(pin.userId);
                        toast.success('ユーザーをブロックしました');
                        onClose();
                      }
                    }}
                    variant="destructive"
                  >
                    ブロック
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
