import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { User, Pin } from '../types';
import { genreColors, genreLabels } from '../lib/mockData';
import { Heart, Trash2, UserX, Shield, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface MyPageProps {
  user: User;
  pins: Pin[];
  reactedPins: Pin[];
  onPinClick: (pin: Pin) => void;
  onDeletePin: (pinId: string) => void;
  onUpdateUser: (user: User) => void;
  onNavigateToDeleteAccount: () => void;
}

export function MyPage({ user, pins, reactedPins, onPinClick, onDeletePin, onUpdateUser, onNavigateToDeleteAccount }: MyPageProps) {
  const [showBusinessRegistration, setShowBusinessRegistration] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState(user.name || '');

  const handleBusinessRegistration = () => {
    toast.success('事業者登録申請を送信しました。運営からの承認をお待ちください。');
    setShowBusinessRegistration(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ファイルサイズは5MB以下にしてください');
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedIcon(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveIcon = () => {
    if (!selectedIcon) return;

    setIsUploadingIcon(true);
    
    // アイコンを保存
    const updatedUser = {
      ...user,
      businessIcon: selectedIcon,
    };
    
    onUpdateUser(updatedUser);
    toast.success('アイコンを更新しました');
    setIsUploadingIcon(false);
    setSelectedIcon(null);
  };

  const handleCancelIconUpload = () => {
    setSelectedIcon(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ユーザー情報カード */}
        <Card>
          <CardHeader>
            <CardTitle>マイページ</CardTitle>
            <CardDescription>アカウント情報と投稿履歴</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ユーザー名</p>
                {user.role === 'business' ? (
                  <div className="flex items-center space-x-2">
                    {isEditingName ? (
                      <>
                        <input
                          className="px-2 py-1 border rounded"
                          value={editingNameValue}
                          onChange={(e) => setEditingNameValue(e.target.value)}
                        />
                        <Button size="sm" onClick={() => {
                          const updatedUser = { ...user, name: editingNameValue };
                          onUpdateUser(updatedUser);
                          setIsEditingName(false);
                        }}>
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setIsEditingName(false); setEditingNameValue(user.name); }}>
                          キャンセル
                        </Button>
                      </>
                    ) : (
                      <>
                        <p>{user.name}</p>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingName(true)}>編集</Button>
                      </>
                    )}
                  </div>
                ) : (
                  <p>匿名</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">アカウント種別</p>
                <Badge variant={user.role === 'business' ? 'default' : 'outline'}>
                  {user.role === 'business' ? '事業者' : '一般'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">登録日</p>
                <p>{formatDate(user.createdAt)}</p>
              </div>
            </div>

            {user.role === 'general' && !showBusinessRegistration && (
              <Button onClick={() => setShowBusinessRegistration(true)} variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                事業者登録を申請
              </Button>
            )}

            {showBusinessRegistration && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-sm">事業者登録申請</p>
                <p className="text-xs text-gray-600">
                  事業者として登録すると、店舗名での投稿やダッシュボード機能が利用できます。
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="店舗名"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="電話番号"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="住所"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleBusinessRegistration} size="sm">
                    申請する
                  </Button>
                  <Button onClick={() => setShowBusinessRegistration(false)} variant="outline" size="sm">
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 事業者アイコン設定（事業者会員のみ表示） */}
        {user.role === 'business' && (
          <Card>
            <CardHeader>
              <CardTitle>事業者アイコン設定</CardTitle>
              <CardDescription>地図上のピンに表示されるアイコンを設定できます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-6">
                {/* 現在のアイコンプレビュー */}
                <div className="flex-shrink-0">
                  <p className="text-sm text-gray-600 mb-2">現在のアイコン</p>
                  <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {user.businessIcon ? (
                      <img 
                        src={user.businessIcon} 
                        alt="事業者アイコン" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-xs">未設定</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 新しいアイコンプレビュー */}
                {selectedIcon && (
                  <div className="flex-shrink-0">
                    <p className="text-sm text-gray-600 mb-2">プレビュー</p>
                    <div className="w-32 h-32 rounded-lg border-2 border-blue-500 overflow-hidden">
                      <img 
                        src={selectedIcon} 
                        alt="プレビュー" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* アップロードエリア */}
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-3">アイコン画像をアップロード</p>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <label htmlFor="icon-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-1">
                          クリックして画像を選択
                        </p>
                        <p className="text-xs text-gray-500">
                          推奨: 正方形の画像、最大5MB
                        </p>
                        <input
                          id="icon-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleIconUpload}
                        />
                      </label>
                    </div>

                    {selectedIcon && (
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSaveIcon}
                          disabled={isUploadingIcon}
                          className="flex-1"
                        >
                          {isUploadingIcon ? '保存中...' : 'アイコンを保存'}
                        </Button>
                        <Button 
                          onClick={handleCancelIconUpload}
                          variant="outline"
                          disabled={isUploadingIcon}
                        >
                          キャンセル
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 ヒント: 設定したアイコンは、あなたが投稿したすべてのピンに表示されます。
                  お店のロゴや特徴的な画像を使うと、ユーザーに覚えてもらいやすくなります。
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* タブコンテンツ */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">投稿履歴 ({pins.length})</TabsTrigger>
            <TabsTrigger value="reactions">リアクション履歴 ({reactedPins.length})</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          {/* 投稿履歴 */}
          <TabsContent value="posts" className="space-y-4">
            {pins.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  まだ投稿がありません
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pins.map((pin) => (
                  <Card key={pin.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => onPinClick(pin)}>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3>{pin.title}</h3>
                            <Badge style={{ backgroundColor: genreColors[pin.genre] }}>
                              {genreLabels[pin.genre]}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pin.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {pin.reactions}
                            </span>
                            <span>{formatDate(pin.createdAt)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('この投稿を削除しますか？')) {
                              onDeletePin(pin.id);
                              toast.success('投稿を削除しました');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* リアクション履歴 */}
          <TabsContent value="reactions" className="space-y-4">
            {reactedPins.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  まだリアクションがありません
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reactedPins.map((pin) => (
                  <Card key={pin.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onPinClick(pin)}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3>{pin.title}</h3>
                        <Badge style={{ backgroundColor: genreColors[pin.genre] }}>
                          {genreLabels[pin.genre]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pin.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{pin.userRole === 'business' ? pin.businessName : pin.userName}</span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1 fill-red-500 text-red-500" />
                          {pin.reactions}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 設定 */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ブロックリスト</CardTitle>
                <CardDescription>ブロックしたユーザーの管理</CardDescription>
              </CardHeader>
              <CardContent>
                {(!user.blockedUsers || user.blockedUsers.length === 0) ? (
                  <p className="text-gray-500 text-sm">ブロックしたユーザーはいません</p>
                ) : (
                  <div className="space-y-2">
                    {user.blockedUsers.map((userId) => (
                          <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <UserX className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">ユーザーID: {userId}</span>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => {
                              const next = (user.blockedUsers || []).filter(id => id !== userId);
                              const updatedUser = { ...user, blockedUsers: next };
                              onUpdateUser(updatedUser);
                            }}>
                              ブロック解除
                            </Button>
                          </div>
                        ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">退会</CardTitle>
                <CardDescription>アカウントの削除</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  アカウントを削除すると、すべての投稿とデータが完全に削除されます。この操作は取り消せません。
                </p>
                <Button variant="destructive" onClick={onNavigateToDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  アカウント削除画面へ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
