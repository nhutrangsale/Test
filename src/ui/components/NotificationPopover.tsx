/**
 * NotificationPopover Component
 * Bảng thông báo hệ thống và tương tác cộng đồng thanh tịnh
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Bell, Check, ExternalLink, ShieldCheck, MessageSquare, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'system' | 'community' | 'moderation';
  link_url?: string;
  is_read: number;
  created_at: number;
}

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
  onCountChange?: (count: number) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<NotificationItem[]>('/api/v1/community/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
        const unread = res.data.filter((n) => n.is_read === 0).length;
        if (onCountChange) onCountChange(unread);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, linkUrl?: string) => {
    await api.post(`/api/v1/community/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
    const unread = notifications.filter((n) => n.id !== id && n.is_read === 0).length;
    if (onCountChange) onCountChange(unread);

    if (linkUrl) {
      onClose();
      if (linkUrl === '/dieu-khoan') {
        onNavigate('legal');
      } else if (linkUrl.startsWith('/bai-viet/')) {
        const slug = linkUrl.replace('/bai-viet/', '');
        onNavigate('post-detail', { slug });
      } else if (linkUrl === '/kham-pha') {
        onNavigate('explore');
      } else {
        onNavigate('home');
      }
    }
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications.filter((n) => n.is_read === 0)) {
      await api.post(`/api/v1/community/notifications/${n.id}/read`);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    if (onCountChange) onCountChange(0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl bg-[#0D1219] border border-white/[0.08] shadow-2xl overflow-hidden animate-fade-in text-xs">
        
        {/* Header popover */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-cinzel font-semibold text-slate-100">Thông Điệp Hệ Thống</span>
          </div>
          {notifications.some((n) => n.is_read === 0) && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Đã đọc tất cả
            </button>
          )}
        </div>

        {/* Content list */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-lora">
              Chưa có thông điệp nào.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id, n.link_url)}
                className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-900/60 ${
                  n.is_read === 0 ? 'bg-emerald-950/15' : 'bg-transparent'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {n.type === 'system' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : n.type === 'moderation' ? (
                    <Info className="w-4 h-4 text-amber-400" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-200 text-xs">{n.title}</h4>
                    {n.is_read === 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] font-lora line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-500 font-sans-ui block pt-0.5">
                    {new Date(n.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
};
