import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User } from '../types';
import { ArrowLeft, LogOut, Check } from 'lucide-react';

interface LogoutScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

export function LogoutScreen({ user, onBack, onLogout }: LogoutScreenProps) {
  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 戻るボタン */}
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>

        {/* ログアウト確認カード */}
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-2 text-blue-600">
              <LogOut className="w-6 h-6" />
              <CardTitle>ログアウトの確認</CardTitle>
            </div>
            <CardDescription>
              ログアウトすると、再度ログインが必要になります
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 現在のユーザー情報 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-3">現在ログイン中のアカウント</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ユーザー名</span>
                  <span>{user.role === 'business' ? user.name : '匿名'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">メールアドレス</span>
                  <span>{user.email}</span>
                </div>
                {user.role === 'business' && user.businessName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">事業者名</span>
                    <span>{user.businessName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ログアウト時の注意事項 */}
            <div className="space-y-3">
              <p className="text-sm">ログアウトしても以下のデータは保持されます：</p>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">すべての投稿とピン情報</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">リアクション履歴</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">アカウント設定</span>
                </div>
                {user.role === 'business' && (
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">事業者情報とアイコン</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">
                💡 ヒント: 次回ログイン時には、Google アカウントで再度ログインしてください。
              </p>
            </div>

            {/* アク���ョンボタン */}
            <div className="flex space-x-4 pt-4 border-t">
              <Button
                variant="default"
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウトする
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1">
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 追加情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">セキュリティのヒント</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>共用端末を使用している場合は、使用後必ずログアウトしてください</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>長期間ログインしない場合は、セキュリティ上ログアウトすることをお勧めします</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
