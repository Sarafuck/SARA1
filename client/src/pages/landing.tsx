import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Star,
  MessageCircle,
  CreditCard,
  UserCheck
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ThaiSocial
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                เครือข่ายสังคมและการเงิน
              </Badge>
            </div>
            <Button onClick={handleLogin} size="lg" className="bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary">
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            เครือข่ายสังคมที่
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ช่วยให้คุณเติบโต
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            แพลตฟอร์มที่รวมโซเชียลมีเดียและระบบการเงินเข้าด้วยกัน 
            พัฒนาระดับ XP ของคุณและเข้าถึงสิทธิประโยชน์ทางการเงินที่ดีขึ้น
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white px-8 py-3 text-lg"
            >
              เริ่มต้นฟรี
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 text-lg"
            >
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ทำไมต้องเลือก ThaiSocial?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ระบบที่ออกแบบมาเพื่อสร้างชุมชนที่แข็งแกร่งและให้โอกาสทางการเงินที่ยุติธรรม
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">ระบบ XP และ Level</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  สะสม XP จากการมีส่วนร่วมในชุมชน เพื่อปลดล็อกสิทธิประโยชน์และวงเงินกู้ที่มากขึ้น
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">กู้เงินอัตราดี</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  อัตราดอกเบี้ยขึ้นอยู่กับระดับของคุณ ยิ่งระดับสูง ดอกเบี้ยยิ่งต่ำ เริ่มต้นที่ 1%
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">ชุมชนที่แข็งแกร่ง</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  แบ่งปันประสบการณ์ ให้กำลังใจซึ่งกันและกัน และสร้างเครือข่ายที่ไว้ใจได้
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">ความปลอดภัย</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  ระบบตรวจสอบความน่าเชื่อถือและป้องกันการโกงเพื่อความปลอดภัยของชุมชน
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ระบบทำงานอย่างไร?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              เข้าใจง่าย ใช้งานง่าย และได้ประโยชน์จริง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">1. สมัครสมาชิก</h4>
              <p className="text-gray-600">
                ลงทะเบียนง่ายๆ ชำระค่าสมัครสมาชิก 100 บาท และยืนยันตัวตนเพื่อความปลอดภัย
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">2. มีส่วนร่วม</h4>
              <p className="text-gray-600">
                โพสต์เนื้อหา แชร์ประสบการณ์ ให้กำลังใจเพื่อน และสะสม XP จากการมีส่วนร่วม
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">3. เข้าถึงสิทธิ์</h4>
              <p className="text-gray-600">
                เมื่อ Level สูงขึ้น จะได้รับวงเงินกู้มากขึ้นและอัตราดอกเบี้ยที่ดีกว่า
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Level Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              สิทธิประโยชน์ตามระดับ
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ยิ่งมีส่วนร่วมในชุมชนมากขึ้น ยิ่งได้สิทธิประโยชน์ที่ดีกว่า
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-gray-200 hover:border-primary transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <CardTitle className="text-lg">Level 1</CardTitle>
                <CardDescription>สมาชิกใหม่</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">วงเงินกู้</span>
                  <span className="font-semibold">฿10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">อัตราดอกเบี้ย</span>
                  <span className="font-semibold text-red-600">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">XP ต้องการ</span>
                  <span className="font-semibold">0 - 499</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-500 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <CardTitle className="text-lg">Level 2</CardTitle>
                <CardDescription>สมาชิกที่มีส่วนร่วม</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">วงเงินกู้</span>
                  <span className="font-semibold">฿20,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">อัตราดอกเบี้ย</span>
                  <span className="font-semibold text-orange-600">3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">XP ต้องการ</span>
                  <span className="font-semibold">500 - 1,499</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 hover:border-emerald-500 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <CardTitle className="text-lg">Level 3</CardTitle>
                <CardDescription>สมาชิกที่ไว้ใจได้</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">วงเงินกู้</span>
                  <span className="font-semibold">฿30,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">อัตราดอกเบี้ย</span>
                  <span className="font-semibold text-green-600">2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">XP ต้องการ</span>
                  <span className="font-semibold">1,500 - 2,999</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 hover:border-yellow-500 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                VIP
              </div>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <CardTitle className="text-lg">Level 4</CardTitle>
                <CardDescription>สมาชิกระดับสูง</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">วงเงินกู้</span>
                  <span className="font-semibold">฿50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">อัตราดอกเบี้ย</span>
                  <span className="font-semibold text-green-600">1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">XP ต้องการ</span>
                  <span className="font-semibold">3,000+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            พร้อมที่จะเริ่มต้นแล้วหรือยัง?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            เข้าร่วมชุมชนที่จะช่วยให้คุณเติบโตทั้งทางสังคมและการเงิน
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            เข้าสู่ระบบเลย
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">ThaiSocial</h4>
              <p className="text-gray-400">
                เครือข่ายสังคมและการเงินที่ออกแบบมาเพื่อสร้างโอกาสและความสำเร็จร่วมกัน
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">บริการ</h5>
              <ul className="space-y-2 text-gray-400">
                <li>โซเชียลมีเดีย</li>
                <li>ระบบกู้เงิน</li>
                <li>ระบบ XP และ Level</li>
                <li>ตรวจสอบความปลอดภัย</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">สนับสนุน</h5>
              <ul className="space-y-2 text-gray-400">
                <li>ช่วยเหลือ</li>
                <li>คำถามที่พบบ่อย</li>
                <li>ติดต่อเรา</li>
                <li>เงื่อนไขการใช้งาน</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">ติดตาม</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Facebook</li>
                <li>Twitter</li>
                <li>Line</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ThaiSocial. สงวนลิขสิทธิ์ทั้งหมด.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
