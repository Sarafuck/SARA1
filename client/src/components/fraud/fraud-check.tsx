import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Phone,
  CreditCard,
  User
} from "lucide-react";
import type { Fraud } from "@shared/schema";

export default function FraudCheck() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'name' | 'phone' | 'account'>('phone');
  const [hasSearched, setHasSearched] = useState(false);

  const { data: searchResults = [], isLoading, refetch } = useQuery<Fraud[]>({
    queryKey: ['/api/fraud/search', searchTerm],
    enabled: false, // Don't auto-fetch
  });

  const { data: recentFraud = [] } = useQuery<Fraud[]>({
    queryKey: ['/api/fraud'],
  });

  const handleSearch = () => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      return;
    }
    setHasSearched(true);
    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">ความเสี่ยงสูง</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">ความเสี่ยงปานกลาง</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-600">ความเสี่ยงต่ำ</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case 'name':
        return <User className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'account':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'name':
        return "ชื่อ-นามสกุล";
      case 'phone':
        return "เบอร์โทรศัพท์";
      case 'account':
        return "เลขบัญชี";
      default:
        return "ค้นหา...";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Shield className="w-5 h-5 mr-2 text-yellow-600" />
            ตรวจสอบข้อมูลความปลอดภัย
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              ตรวจสอบข้อมูลก่อนทำธุรกรรมเพื่อความปลอดภัยของคุณ
            </AlertDescription>
          </Alert>

          {/* Search Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={searchType === 'phone' ? 'default' : 'outline'}
              onClick={() => setSearchType('phone')}
              size="sm"
              className="justify-start"
            >
              <Phone className="w-4 h-4 mr-2" />
              เบอร์โทร
            </Button>
            <Button
              variant={searchType === 'name' ? 'default' : 'outline'}
              onClick={() => setSearchType('name')}
              size="sm"
              className="justify-start"
            >
              <User className="w-4 h-4 mr-2" />
              ชื่อ
            </Button>
            <Button
              variant={searchType === 'account' ? 'default' : 'outline'}
              onClick={() => setSearchType('account')}
              size="sm"
              className="justify-start"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              บัญชี
            </Button>
          </div>

          <div className="space-y-3">
            <Label htmlFor="searchInput">
              ค้นหาข้อมูล{searchType === 'name' ? 'ชื่อ' : searchType === 'phone' ? 'เบอร์โทร' : 'บัญชี'}
            </Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {getSearchIcon()}
                </div>
                <Input
                  id="searchInput"
                  type="text"
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchTerm.trim() || searchTerm.length < 3 || isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isLoading ? (
                  "กำลังค้นหา..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    ตรวจสอบ
                  </>
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              ต้องใส่อย่างน้อย 3 ตัวอักษรเพื่อค้นหา
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Search className="w-5 h-5 mr-2" />
              ผลการค้นหา "{searchTerm}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((fraud) => (
                  <Alert key={fraud.id} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-red-800">
                            พบข้อมูลเสี่ยง!
                          </span>
                          {getSeverityBadge(fraud.severity)}
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>ชื่อ:</strong> {fraud.name}</div>
                          {fraud.phoneNumber && (
                            <div><strong>เบอร์โทร:</strong> {fraud.phoneNumber}</div>
                          )}
                          {fraud.accountNumber && (
                            <div><strong>เลขบัญชี:</strong> {fraud.accountNumber}</div>
                          )}
                          <div><strong>เหตุผล:</strong> {fraud.reason}</div>
                          <div className="text-xs text-gray-600">
                            รายงานเมื่อ: {new Date(fraud.createdAt).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="text-green-800">
                    <span className="font-semibold">ไม่พบข้อมูลเสี่ยง</span>
                    <div className="text-sm mt-1">
                      ข้อมูลที่ค้นหาไม่อยู่ในรายชื่อผู้มีประวัติเสี่ยง
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Fraud Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            รายงานล่าสุด ({recentFraud.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentFraud.length > 0 ? (
            <div className="space-y-3">
              {recentFraud.slice(0, 10).map((fraud) => (
                <div key={fraud.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{fraud.name}</span>
                      {getSeverityBadge(fraud.severity)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {fraud.phoneNumber && `โทร: ${fraud.phoneNumber} • `}
                      {fraud.reason}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(fraud.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
              ))}
              {recentFraud.length > 10 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  และอีก {recentFraud.length - 10} รายการ
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีรายงานในขณะนี้</h3>
              <p className="text-gray-600">
                ระบบจะแสดงรายงานการโกงที่อัปเดตล่าสุดที่นี่
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            เคล็ดลับความปลอดภัย
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>ตรวจสอบข้อมูลทุกครั้งก่อนทำธุรกรรม</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>ใช้บัญชีที่มีชื่อตรงกับผู้กู้เท่านั้น</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>หากพบข้อสงสัย ให้รายงานทันที</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>เก็บหลักฐานการทำธุรกรรมไว้เป็นหลักฐาน</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
