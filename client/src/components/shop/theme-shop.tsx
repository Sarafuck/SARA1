import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Palette, 
  Star, 
  Sparkles, 
  Frame, 
  MessageSquare, 
  Crown,
  ShoppingCart,
  Check,
  Lock
} from "lucide-react";
import type { ThemeItem, UserItemWithTheme, UserWithStats } from "@shared/schema";

interface ThemeShopProps {
  userStats: UserWithStats;
}

export default function ThemeShop({ userStats }: ThemeShopProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // ดึงไอเทมในร้านค้า
  const { data: shopItems = [], isLoading } = useQuery<ThemeItem[]>({
    queryKey: ['/api/shop/items', selectedCategory],
  });

  // ดึงไอเทมที่ผู้ใช้มี
  const { data: userItems = [] } = useQuery<UserItemWithTheme[]>({
    queryKey: ['/api/user/items'],
  });

  // ซื้อไอเทม
  const purchaseItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest('POST', '/api/shop/purchase', { itemId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "ซื้อสำเร็จ! 🎉",
        description: `คุณได้รับ ${data.item.name} แล้ว!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถซื้อไอเทมได้",
        variant: "destructive",
      });
    },
  });

  // ใช้งานไอเทม
  const equipItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest('POST', '/api/user/items/equip', { itemId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "ตกแต่งสำเร็จ! ✨",
        description: `${data.item.name} ถูกใช้งานแล้ว`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/items'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถใช้งานไอเทมได้",
        variant: "destructive",
      });
    },
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-3 h-3" />;
      case 'rare': return <Sparkles className="w-3 h-3" />;
      case 'epic': return <Crown className="w-3 h-3" />;
      case 'legendary': return <Crown className="w-3 h-3 text-yellow-500" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'background': return <Palette className="w-4 h-4" />;
      case 'avatar_frame': return <Frame className="w-4 h-4" />;
      case 'chat_bubble': return <MessageSquare className="w-4 h-4" />;
      case 'badge': return <Star className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const isItemOwned = (itemId: number) => {
    return userItems.some(userItem => userItem.itemId === itemId);
  };

  const isItemEquipped = (itemId: number) => {
    return userItems.some(userItem => userItem.itemId === itemId && userItem.isEquipped);
  };

  const canPurchaseItem = (item: ThemeItem) => {
    return userStats.xp >= item.price && userStats.level >= item.levelRequired;
  };

  const categories = [
    { id: 'all', name: 'ทั้งหมด', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'background', name: 'พื้นหลัง', icon: <Palette className="w-4 h-4" /> },
    { id: 'avatar_frame', name: 'กรอบโปรไฟล์', icon: <Frame className="w-4 h-4" /> },
    { id: 'chat_bubble', name: 'บอลลูนแชท', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'badge', name: 'ตราสัญลักษณ์', icon: <Star className="w-4 h-4" /> },
    { id: 'sticker', name: 'สติกเกอร์', icon: <Sparkles className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดร้านค้า...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* หัวข้อและข้อมูลผู้ใช้ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            ร้านค้าตกแต่ง
          </h2>
          <p className="text-gray-600">ซื้อไอเทมตกแต่งด้วย XP เพื่อปรับแต่งรูปลักษณ์ของคุณ</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">XP ที่มี</div>
          <div className="text-2xl font-bold text-primary">{userStats.xp.toLocaleString()}</div>
          <Badge variant="secondary">Level {userStats.level}</Badge>
        </div>
      </div>

      {/* แท็บหมวดหมู่ */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-6 w-full">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopItems
                .filter(item => category.id === 'all' || item.category === category.id)
                .map((item) => (
                <Card key={item.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* แสดงรูปแบบไอเทม */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getCategoryIcon(item.category)}
                      </div>
                    )}
                    
                    {/* Badge ความหายาก */}
                    <Badge 
                      className={`absolute top-2 left-2 ${getRarityColor(item.rarity)}`}
                    >
                      {getRarityIcon(item.rarity)}
                      <span className="ml-1 capitalize">{item.rarity}</span>
                    </Badge>

                    {/* แสดงว่าใช้งานอยู่ */}
                    {isItemEquipped(item.id) && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <Check className="w-3 h-3" />
                        ใช้งานอยู่
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <Star className="w-4 h-4" />
                        {item.price.toLocaleString()}
                      </div>
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* ข้อกำหนด */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">ระดับต้องการ:</span>
                      <Badge variant={userStats.level >= item.levelRequired ? "default" : "destructive"}>
                        Level {item.levelRequired}
                      </Badge>
                    </div>

                    {/* ปุ่มดำเนินการ */}
                    <div className="space-y-2">
                      {isItemOwned(item.id) ? (
                        <div className="space-y-2">
                          <Badge variant="secondary" className="w-full justify-center">
                            <Check className="w-4 h-4 mr-1" />
                            เป็นเจ้าของแล้ว
                          </Badge>
                          {!isItemEquipped(item.id) && (
                            <Button
                              onClick={() => equipItemMutation.mutate(item.id)}
                              disabled={equipItemMutation.isPending}
                              className="w-full"
                              variant="outline"
                            >
                              {equipItemMutation.isPending ? "กำลังใช้งาน..." : "ใช้งาน"}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          onClick={() => purchaseItemMutation.mutate(item.id)}
                          disabled={!canPurchaseItem(item) || purchaseItemMutation.isPending}
                          className="w-full"
                          variant={canPurchaseItem(item) ? "default" : "destructive"}
                        >
                          {!canPurchaseItem(item) ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              {userStats.level < item.levelRequired ? 
                                `ต้อง Level ${item.levelRequired}` : 
                                'XP ไม่เพียงพอ'
                              }
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {purchaseItemMutation.isPending ? "กำลังซื้อ..." : "ซื้อเลย"}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* แสดงไอเทมที่เป็นเจ้าของ */}
      {userItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ไอเทมของคุณ</CardTitle>
            <CardDescription>
              ไอเทมทั้งหมดที่คุณเป็นเจ้าของ ({userItems.length} ชิ้น)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {userItems.map((userItem) => (
                <Card 
                  key={userItem.id} 
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    userItem.isEquipped ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => !userItem.isEquipped && equipItemMutation.mutate(userItem.itemId)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      {getCategoryIcon(userItem.item.category)}
                    </div>
                    <div className="text-sm font-medium">{userItem.item.name}</div>
                    {userItem.isEquipped && (
                      <Badge size="sm" className="mt-1">
                        ใช้งานอยู่
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}