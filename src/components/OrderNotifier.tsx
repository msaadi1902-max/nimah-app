'use client'
import React, { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OrderNotifier() {
  useEffect(() => {
    // 1. طلب إذن الإشعارات من المتصفح
    if (Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    // 2. الاستماع اللحظي للطلبات الجديدة (Realtime)
    const channel = supabase
      .channel('merchant_orders_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          triggerNotification(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const triggerNotification = (order: any) => {
    // تشغيل صوت تنبيه احترافي
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
    audio.play().catch(() => console.log("تنبيه: يجب التفاعل مع الصفحة أولاً لتفعيل الصوت"))

    // إظهار إشعار النظام (Push Notification)
    if (Notification.permission === "granted") {
      new Notification("طلب جديد وصل! 🎉", {
        body: `الوجبة: ${order.meal_name} \n السعر: ${order.price} €`,
        icon: "/favicon.ico"
      })
    }

    // تنبيه مرئي داخل التطبيق
    alert(`📢 طلب جديد! \n الوجبة: ${order.meal_name} \n السعر: ${order.price} €`)
  }

  return null // يعمل في الخلفية فقط
}