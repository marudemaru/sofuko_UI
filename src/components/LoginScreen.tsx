import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';
import { MapPin } from 'lucide-react';

type UserRole = 'general' | 'business' | 'admin';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleGoogleLogin = () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }
    // デモ用：一般ユーザーとしてログイン
    onLogin('general');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>こじゃんとやまっぷ</CardTitle>
          <CardDescription>地域特化SNS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="text-blue-600 hover:underline"
              >
                利用規約
              </button>
              に同意する
            </label>
          </div>

          {showTerms && (
            <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto text-sm">
              <p>【利用規約】</p>
              <p className="mt-2">本サービスを利用する際は、以下の規約に同意いただく必要があります。</p>
              <p className="mt-2">1. 不適切な投稿の禁止</p>
              <p>2. 個人情報の保護</p>
              <p>3. 著作権の尊重</p>
              <p>4. 商用利用のルール</p>
              <p className="mt-2">詳細は運営にお問い合わせください。</p>
            </div>
          )}

          <Button 
            onClick={handleGoogleLogin} 
            className="w-full"
            disabled={!agreedToTerms}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </Button>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">デモ用ログイン：</p>
            <div className="space-y-2">
              <Button 
                onClick={() => onLogin('general')} 
                variant="outline" 
                className="w-full"
              >
                一般ユーザーとしてログイン
              </Button>
              <Button 
                onClick={() => onLogin('business')} 
                variant="outline" 
                className="w-full"
              >
                事業者としてログイン
              </Button>
              <Button 
                onClick={() => onLogin('admin')} 
                variant="outline" 
                className="w-full"
              >
                管理者としてログイン
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
