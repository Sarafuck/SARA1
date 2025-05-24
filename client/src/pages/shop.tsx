import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ShoppingBag,
  Star,
  Coins,
  Package,
  Crown,
  Check,
  Palette,
  Shirt,
  Award
} from "lucide-react";

export default function ShopPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // ดึงสินค้าในร้าน
  const { data: shopItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/shop/items', selectedCategory !== "all" ? selectedCategory : undefined],
  });

  // ดึงไอเทมที่ผู้ใช้มี
  const { data: userItems = [], isLoading: userItemsLoading } = useQuery({
    queryKey: ['/api/shop/my-items'],
  });

  // การซื้อสินค้า
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest('POST', '/api/shop/purchase', { itemId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ซื้อสำเร็จ!",
        description: "ซื้อไอเทมเรียบร้อยแล้ว",
      });
      // บังคับรีเฟรชข้อมูลทั้งหมด
      queryClient.removeQueries({ queryKey: ['/api/shop/my-items'] });
      queryClient.removeQueries({ queryKey: ['/api/shop/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/my-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถซื้อได้",
        variant: "destructive",
      });
    },
  });

  // การติดตั้งไอเทม
  const equipMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest('POST', '/api/shop/equip', { itemId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ติดตั้งแล้ว!",
        description: "เปลี่ยนธีมเรียบร้อยแล้ว",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/my-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถติดตั้งได้",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theme': return Palette;
      case 'avatar': return Shirt;
      case 'badge': return Award;
      default: return Package;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'theme': return 'ธีม';
      case 'avatar': return 'อวตาร';
      case 'badge': return 'ตรา';
      default: return 'ทั้งหมด';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'ธรรมดา';
      case 'rare': return 'หายาก';
      case 'epic': return 'เอพิก';
      case 'legendary': return 'เลเจนดารี';
      default: return rarity;
    }
  };

  const categories = ['all', 'theme', 'avatar', 'badge'];

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter((item: any) => item.category === selectedCategory);

  const isItemOwned = (itemId: number) => {
    return userItems.some((userItem: any) => userItem.itemId === itemId);
  };

  const isItemEquipped = (itemId: number) => {
    return userItems.some((userItem: any) => 
      userItem.itemId === itemId && userItem.isEquipped
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ร้านค้า</h1>
          <p className="text-gray-600 mt-1">ซื้อธีม ไอเทม และของสะสม</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-600">
              {user?.xp?.toLocaleString() || '0'} XP
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shop" className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>ร้านค้า</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>ของฉัน ({userItems.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-6">
          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category);
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{getCategoryName(category)}</span>
                </Button>
              );
            })}
          </div>

          {/* Shop Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ไม่มีสินค้าในหมวดนี้</p>
              </div>
            ) : (
              filteredItems.map((item: any) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Item Preview */}
                    <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-4xl">
                        {item.category === 'theme' && <Palette />}
                        {item.category === 'avatar' && <Shirt />}
                        {item.category === 'badge' && <Award />}
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                            <Star className="w-3 h-3 mr-1" />
                            {getRarityName(item.rarity)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span className="font-bold text-yellow-600">
                            {item.price.toLocaleString()} XP
                          </span>
                        </div>

                        {isItemOwned(item.id) ? (
                          isItemEquipped(item.id) ? (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>ใช้งานอยู่</span>
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => equipMutation.mutate(item.id)}
                              disabled={equipMutation.isPending}
                            >
                              ติดตั้ง
                            </Button>
                          )
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => purchaseMutation.mutate(item.id)}
                            disabled={
                              purchaseMutation.isPending || 
                              (user?.xp || 0) < item.price
                            }
                          >
                            {(user?.xp || 0) < item.price ? "XP ไม่พอ" : "ซื้อ"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ไอเทมของฉัน</CardTitle>
            </CardHeader>
            <CardContent>
              {userItemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : userItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ยังไม่มีไอเทม</p>
                  <p className="text-sm text-gray-400">ไปซื้อของในร้านค้ากันเถอะ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userItems.map((userItem: any) => (
                    <div
                      key={userItem.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {userItem.item.name}
                        </h3>
                        <Badge className={`${getRarityColor(userItem.item.rarity)} text-white text-xs`}>
                          <Star className="w-3 h-3 mr-1" />
                          {getRarityName(userItem.item.rarity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {userItem.item.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          ซื้อเมื่อ {new Date(userItem.purchasedAt).toLocaleDateString('th-TH')}
                        </span>
                        
                        {userItem.isEquipped ? (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>ใช้งานอยู่</span>
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => equipMutation.mutate(userItem.item.id)}
                            disabled={equipMutation.isPending}
                          >
                            ติดตั้ง
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}