/**
 * DonationModal Component — Quỹ Đồng Hành & Gieo Duyên Phát Triển
 * Cung cấp thông tin chuyển khoản ngân hàng VietQR, MoMo, các mốc trợ duyên
 * và Bảng vàng ghi nhận công đức của quý đạo hữu.
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Heart, QrCode, Copy, Check, MessageSquare, 
  Sparkles, Coffee, ShieldCheck, UserCheck 
} from 'lucide-react';

interface SupporterItem {
  id: string;
  supporter_name: string;
  amount: number | null;
  tier_name: string;
  message: string;
  is_anonymous: number;
  created_at: number;
}

interface DonationInfo {
  bank_name: string;
  account_number: string;
  account_name: string;
  momo_phone: string;
  transfer_syntax: string;
  vietqr_url: string;
  message: string;
  tiers: { id: string; name: string; amount: number | null; description: string }[];
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'donate' | 'wall'>('donate');
  const [donationInfo, setDonationInfo] = useState<DonationInfo | null>(null);
  const [supporters, setSupporters] = useState<SupporterItem[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Form gieo duyên
  const [supporterName, setSupporterName] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('Đồng Đạo Tri Kỷ');
  const [customAmount, setCustomAmount] = useState<string>('100000');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDonationData = async () => {
      try {
        const res = await fetch('/api/v1/advertising/supporters');
        const data = await res.json();
        if (data.success && data.data) {
          setDonationInfo(data.data.info);
          setSupporters(data.data.supporters || []);
        }
      } catch (err) {
        console.error('Error fetching donation data:', err);
      }
    };

    fetchDonationData();
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/advertising/supporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supporterName: isAnonymous ? 'Ẩn Danh Đạo Hữu' : supporterName,
          amount: Number(customAmount) || null,
          tierName: selectedTier,
          message,
          isAnonymous,
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSupporters([data.data, ...supporters]);
        setSubmitSuccess(true);
        setMessage('');
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('wall');
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting pledge:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FAF8F3] dark:bg-[#0E1520] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto z-10 font-sans-ui animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-100/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-slate-100">
                Đồng Hành & Gieo Duyên Triết Học
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-reading">
                Chung tay duy trì máy chủ và bảo vệ không gian chiêm nghiệm thanh tịnh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 dark:border-white/10 bg-white/40 dark:bg-black/20 text-xs">
          <button
            onClick={() => setActiveTab('donate')}
            className={`flex-1 py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'donate'
                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-white/[0.03]'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Thông Tin Chuyển Khoản & Gieo Duyên</span>
          </button>

          <button
            onClick={() => setActiveTab('wall')}
            className={`flex-1 py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'wall'
                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-white/[0.03]'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bảng Vàng Tri Ân ({supporters.length})</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'donate' && donationInfo && (
            <>
              {/* Message */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-stone-700 dark:text-slate-300 font-reading leading-relaxed">
                {donationInfo.message}
              </div>

              {/* Bank Details & QR Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* QR Code */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-black/30 flex flex-col items-center justify-center text-center">
                  <div className="w-40 h-40 bg-white p-2 rounded-lg border border-stone-200 shadow-sm flex items-center justify-center overflow-hidden mb-2">
                    <img
                      src={donationInfo.vietqr_url}
                      alt="VietQR MBBank Vạn Cổ Luân Hồi"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 dark:text-slate-400">
                    Quét mã VietQR trên mọi app ngân hàng
                  </span>
                </div>

                {/* Account Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02]">
                    <div className="text-[10px] text-stone-400 dark:text-slate-500 uppercase font-semibold">Ngân Hàng</div>
                    <div className="font-semibold text-stone-900 dark:text-slate-100">{donationInfo.bank_name}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400 dark:text-slate-500 uppercase font-semibold">Số Tài Khoản</div>
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {donationInfo.account_number}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(donationInfo.account_number, 'acc')}
                      className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-white/10 text-stone-500 cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'acc' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02]">
                    <div className="text-[10px] text-stone-400 dark:text-slate-500 uppercase font-semibold">Chủ Tài Khoản</div>
                    <div className="font-semibold text-stone-900 dark:text-slate-100">{donationInfo.account_name}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400 dark:text-slate-500 uppercase font-semibold">Nội Dung Chuyển Khoản</div>
                      <div className="font-mono text-stone-800 dark:text-slate-200">{donationInfo.transfer_syntax}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(donationInfo.transfer_syntax, 'syntax')}
                      className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-white/10 text-stone-500 cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'syntax' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Supporter Tiers */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-2">
                  Các Mốc Gieo Duyên Trợ Lực
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {donationInfo.tiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setSelectedTier(tier.name);
                        if (tier.amount) setCustomAmount(String(tier.amount));
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTier === tier.name
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                          : 'border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-stone-700 dark:text-slate-300 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{tier.name}</div>
                      <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {tier.amount ? `${tier.amount.toLocaleString('vi-VN')} đ` : 'Tùy Hỷ'}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {tier.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form gửi lời chúc gieo duyên */}
              <form onSubmit={handleSubmitPledge} className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] space-y-3">
                <h4 className="text-xs font-bold text-stone-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  Gửi Lời Chúc / Lưu Danh Vào Bảng Vàng Tri Ân
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-stone-500 dark:text-slate-400 mb-1">
                      Đạo Hiệu / Họ Tên Của Bạn
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={supporterName}
                      onChange={(e) => setSupporterName(e.target.value)}
                      placeholder={isAnonymous ? 'Ẩn Danh Đạo Hữu' : 'Ví dụ: Tuệ Minh, Thanh Tịnh...'}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 dark:text-slate-400 mb-1">
                      Số Tiền Gieo Duyên (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-slate-400 mb-1">
                    Lời Tâm Sự / Cảm Nghĩ / Lời Chúc Gửi Nền Tảng *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Gửi đôi dòng tâm ý chúc Vạn Cổ Luân Hồi luôn giữ được phẩm chất thanh tao..."
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-reading text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ẩn danh trên bảng vàng</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Đang lưu...</span>
                    ) : submitSuccess ? (
                      <span>Đã Ghi Nhận Tri Ân!</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Lưu Danh Tri Ân</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'wall' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-500 dark:text-slate-400 font-reading italic text-center pb-2 border-b border-stone-200 dark:border-white/10">
                "Một giọt nước hòa vào biển lớn không bao giờ cạn. Một tấm lòng thành trợ duyên thắp sáng ngọn đèn tàng kinh."
              </div>

              {supporters.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Chưa có lời chúc nào, hãy là người đầu tiên gieo duyên!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supporters.map((sup) => (
                    <div
                      key={sup.id}
                      className="p-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-bold text-xs text-stone-900 dark:text-slate-100 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{sup.supporter_name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                          {sup.tier_name}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-slate-300 font-reading leading-relaxed">
                        "{sup.message}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-slate-500 mt-2 pt-2 border-t border-stone-100 dark:border-white/[0.04]">
                        <span>{new Date(sup.created_at).toLocaleDateString('vi-VN')}</span>
                        {sup.amount && (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            +{sup.amount.toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-white/10 bg-stone-100/50 dark:bg-white/[0.02] flex items-center justify-between text-xs text-stone-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Minh bạch 100% chi phí vận hành máy chủ
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
