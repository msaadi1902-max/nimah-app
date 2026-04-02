"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type MealItem = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  quantity: number | null;
  category: string | null;
  created_at: string;
  user_id: string | null;
};

const CATEGORY_MAP: Record<string, string> = {
  bakery: "Bakery",
  restaurants: "Restaurants",
  mobile: "Mobile",
  clothes: "Clothes",
};

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const [items, setItems] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryId = params?.id ?? "";
  const normalizedCategoryId = String(categoryId).toLowerCase();
  const targetCategory = useMemo(
    () => CATEGORY_MAP[normalizedCategoryId] ?? categoryId,
    [categoryId, normalizedCategoryId]
  );

  useEffect(() => {
    async function loadCategoryItems() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      const threeDaysAgoIso = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error: mealsError } = await supabase
        .from("meals")
        .select("*")
        .eq("category", targetCategory)
        .gte("created_at", threeDaysAgoIso)
        .order("created_at", { ascending: false });

      if (mealsError) {
        setError(mealsError.message);
        setItems([]);
      } else {
        setItems((data as MealItem[]) ?? []);
      }

      setLoading(false);
    }

    loadCategoryItems();
  }, [targetCategory]);

  const handleDelete = async (itemId: string) => {
    if (!currentUserId) return;

    const { error: deleteError } = await supabase
      .from("meals")
      .delete()
      .eq("id", itemId)
      .eq("user_id", currentUserId);

    if (deleteError) {
      alert("تعذر حذف العنصر: " + deleteError.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      <div className="mx-auto max-w-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">قسم: {targetCategory}</h1>
          <Link href="/explore" className="text-sm text-emerald-700 font-bold">
            رجوع للاستكشاف
          </Link>
        </div>

        {loading && <p className="text-sm text-gray-500">جاري تحميل العناصر...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
            لا توجد عناصر متاحة في هذا القسم حالياً.
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => {
            const quantity = Number(item.quantity ?? 0);
            const isOwner = Boolean(currentUserId && item.user_id === currentUserId);

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">لا توجد صورة</div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-gray-900">{item.name}</h2>
                  {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}

                  <p className={`text-sm font-bold mt-3 ${quantity > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {quantity > 0 ? `باقي ${quantity} قطع فقط` : "Out of Stock"}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      disabled={quantity === 0}
                      className={`flex-1 py-2.5 rounded-xl text-white font-bold ${
                        quantity === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {quantity === 0 ? "غير متاح" : "إضافة للسلة"}
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
}
