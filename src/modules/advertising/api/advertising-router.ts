/**
 * Advertising, Banner & Affiliate Router
 * Quản lý banner trượt ngang (3-5s), vị trí đa dạng (header, content, bottom, footer)
 * Quản lý tiếp thị liên kết (Affiliate) và Quỹ ủng hộ phát triển / Gieo Duyên
 * Vạn Cổ Luân Hồi
 */

import { Router, Request, Response } from 'express';
import { coreDb, AdBannerRow, AffiliateProductRow, SupporterRecordRow } from '../../../core/database/index.js';
import { CoreAuthService } from '../../../core/auth/index.js';
import { coreLogger } from '../../../core/logger/index.js';
import { sanitizeText } from '../../../core/security/index.js';

export const advertisingRouter = Router();

// Middleware kiểm tra quyền admin cho các thao tác quản trị quảng cáo
function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.session_token as string);

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Yêu cầu đăng nhập quản trị viên' } });
  }

  const user = CoreAuthService.validateSession(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Bạn không có quyền quản lý quảng cáo' } });
  }

  (req as any).user = user;
  next();
}

// ==========================================
// PUBLIC BANNER ADVERTISING APIS
// ==========================================

// 1. Lấy danh sách banner quảng cáo theo vị trí hiển thị (placement) hoặc toàn bộ
advertisingRouter.get('/banners', (req: Request, res: Response) => {
  const { placement } = req.query;

  let banners = coreDb.ads.filter(a => a.is_active === 1);

  if (placement && typeof placement === 'string') {
    banners = banners.filter(a => a.placement === placement);
  }

  // Tăng lượt hiển thị (view count)
  banners.forEach(b => {
    b.views_count = (b.views_count || 0) + 1;
  });
  coreDb.save();

  // Gom nhóm theo group_id để hỗ trợ 1 banner chứa nhiều quảng cáo trượt ngang luân phiên
  const groups: Record<string, AdBannerRow[]> = {};
  banners.forEach(b => {
    const gid = b.group_id || 'default_group';
    if (!groups[gid]) groups[gid] = [];
    groups[gid].push(b);
  });

  res.json({
    success: true,
    data: {
      banners,
      grouped: groups,
    }
  });
});

// 2. Ghi nhận lượt nhấp (Click) vào banner quảng cáo / affiliate
advertisingRouter.post('/banners/:id/click', (req: Request, res: Response) => {
  const { id } = req.params;
  const banner = coreDb.ads.find(a => a.id === id);

  if (!banner) {
    return res.status(404).json({ success: false, error: { message: 'Không tìm thấy banner' } });
  }

  banner.clicks_count = (banner.clicks_count || 0) + 1;
  coreDb.save();

  coreLogger.info('ADVERTISING', `Banner clicked: ${banner.title} (ID: ${banner.id})`);

  res.json({
    success: true,
    data: {
      target_url: banner.target_url,
      affiliate_tag: banner.affiliate_tag,
      clicks_count: banner.clicks_count,
    }
  });
});

// ==========================================
// PUBLIC AFFILIATE PRODUCTS APIS
// ==========================================

// 3. Lấy danh sách vật phẩm tiếp thị liên kết tuyển chọn
advertisingRouter.get('/affiliate-products', (req: Request, res: Response) => {
  const { category, featured } = req.query;

  let items = coreDb.affiliateProducts.filter(p => p.is_active === 1);

  if (category && typeof category === 'string' && category !== 'all') {
    items = items.filter(p => p.category === category);
  }

  if (featured === 'true' || featured === '1') {
    items = items.filter(p => p.is_featured === 1);
  }

  res.json({
    success: true,
    data: items,
  });
});

// 4. Ghi nhận nhấp vào liên kết affiliate
advertisingRouter.post('/affiliate-products/:id/click', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = coreDb.affiliateProducts.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, error: { message: 'Không tìm thấy vật phẩm' } });
  }

  product.clicks_count = (product.clicks_count || 0) + 1;
  coreDb.save();

  coreLogger.info('AFFILIATE', `Affiliate product clicked: ${product.title} (${product.provider})`);

  res.json({
    success: true,
    data: {
      affiliate_url: product.affiliate_url,
      clicks_count: product.clicks_count,
    }
  });
});

// ==========================================
// SUPPORTER & DONATION APIS (Ủng Hộ Phát Triển)
// ==========================================

// 5. Lấy danh sách người ủng hộ và thông tin tiếp nhận đóng góp
advertisingRouter.get('/supporters', (req: Request, res: Response) => {
  const donationInfo = {
    bank_name: 'Ngân Hàng Quân Đội (MBBank)',
    account_number: '999988886666',
    account_name: 'VAN CO LUAN HOI - DAO TAM',
    momo_phone: '0988889999',
    transfer_syntax: 'VCLH [Tên của bạn] Gieo Duyen',
    vietqr_url: 'https://img.vietqr.io/image/MB-999988886666-compact2.jpg?amount=50000&addInfo=VCLH%20Gieo%20Duyen',
    message: 'Mọi sự trợ duyên của quý đạo hữu đều được sử dụng 100% để chi trả hạ tầng máy chủ tốc độ cao, bản quyền thư tịch cổ và kiến tạo không gian chiêm nghiệm thanh tịnh không quảng cáo rác.',
    tiers: [
      { id: 'tier_1', name: 'Hữu Duyên Trà Khách', amount: 50000, description: 'Gửi tặng một ấm trà nóng cho ban biên dịch thư tịch.' },
      { id: 'tier_2', name: 'Đồng Đạo Tri Kỷ', amount: 100000, description: 'Trợ duyên duy trì máy chủ và cơ sở dữ liệu triết học.' },
      { id: 'tier_3', name: 'Hộ Pháp Viện Chủ', amount: 200000, description: 'Đồng hành phát triển hệ thống Giác Ngộ và mở rộng tàng thư.' },
      { id: 'tier_custom', name: 'Tùy Hỷ Công Đức', amount: null, description: 'Tùy tâm hoan hỷ trợ duyên cho nền tảng.' }
    ]
  };

  const sortedSupporters = [...coreDb.supporters].sort((a, b) => b.created_at - a.created_at);

  res.json({
    success: true,
    data: {
      info: donationInfo,
      supporters: sortedSupporters,
    }
  });
});

// 6. Gửi lời chúc gieo duyên / ghi nhận ủng hộ
advertisingRouter.post('/supporters', (req: Request, res: Response) => {
  const { supporterName, amount, tierName, message, isAnonymous } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: { message: 'Vui lòng gửi lại đôi dòng tâm sự hoặc lời chúc gieo duyên.' } });
  }

  const cleanMessage = sanitizeText(message.slice(0, 300));
  const cleanName = isAnonymous ? 'Ẩn Danh Đạo Hữu' : sanitizeText((supporterName || 'Vô Danh Cư Sĩ').slice(0, 50));

  const newRecord: SupporterRecordRow = {
    id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    supporter_name: cleanName,
    amount: amount ? Number(amount) : null,
    tier_name: tierName || 'Tùy Hỷ Công Đức',
    message: cleanMessage,
    is_anonymous: isAnonymous ? 1 : 0,
    created_at: Date.now(),
  };

  coreDb.supporters.unshift(newRecord);
  coreDb.save();

  coreLogger.info('DONATION', `New supporter recorded: ${cleanName} - Tier: ${tierName}`);

  res.json({
    success: true,
    data: newRecord,
    message: 'Đã lưu danh công đức gieo duyên. Kính chúc đạo hữu an lạc vạn phần!',
  });
});

// ==========================================
// ADMIN ADS & AFFILIATE MANAGEMENT APIS
// ==========================================

// 7. Tạo banner quảng cáo mới (Admin)
advertisingRouter.post('/admin/banners', requireAdmin, (req: Request, res: Response) => {
  const {
    title, subtitle, placement, group_id, target_url, cta_text,
    badge_text, sponsor_name, affiliate_tag, is_affiliate, delay_seconds
  } = req.body;

  if (!title || !target_url) {
    return res.status(400).json({ success: false, error: { message: 'Tiêu đề và đường dẫn đích là bắt buộc' } });
  }

  const newBanner: AdBannerRow = {
    id: `ad_${Date.now()}`,
    title: sanitizeText(title),
    subtitle: subtitle ? sanitizeText(subtitle) : undefined,
    placement: placement || 'header',
    group_id: group_id || `grp_${placement || 'header'}`,
    target_url: target_url.trim(),
    cta_text: cta_text ? sanitizeText(cta_text) : 'Khám Phá',
    badge_text: badge_text ? sanitizeText(badge_text) : 'Tài Trợ',
    sponsor_name: sponsor_name ? sanitizeText(sponsor_name) : undefined,
    affiliate_tag: affiliate_tag ? sanitizeText(affiliate_tag) : undefined,
    is_affiliate: is_affiliate ? 1 : 0,
    delay_seconds: Math.max(3, Math.min(10, Number(delay_seconds) || 4)), // Delay trượt ngang từ 3-5s
    is_active: 1,
    views_count: 0,
    clicks_count: 0,
    created_at: Date.now(),
  };

  coreDb.ads.unshift(newBanner);
  coreDb.save();

  res.json({ success: true, data: newBanner });
});

// 8. Cập nhật banner quảng cáo (Admin)
advertisingRouter.put('/admin/banners/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const banner = coreDb.ads.find(a => a.id === id);

  if (!banner) {
    return res.status(404).json({ success: false, error: { message: 'Không tìm thấy banner' } });
  }

  const {
    title, subtitle, placement, group_id, target_url, cta_text,
    badge_text, sponsor_name, affiliate_tag, is_affiliate, delay_seconds, is_active
  } = req.body;

  if (title) banner.title = sanitizeText(title);
  if (subtitle !== undefined) banner.subtitle = subtitle ? sanitizeText(subtitle) : undefined;
  if (placement) banner.placement = placement;
  if (group_id) banner.group_id = group_id;
  if (target_url) banner.target_url = target_url.trim();
  if (cta_text) banner.cta_text = sanitizeText(cta_text);
  if (badge_text !== undefined) banner.badge_text = badge_text ? sanitizeText(badge_text) : undefined;
  if (sponsor_name !== undefined) banner.sponsor_name = sponsor_name ? sanitizeText(sponsor_name) : undefined;
  if (affiliate_tag !== undefined) banner.affiliate_tag = affiliate_tag ? sanitizeText(affiliate_tag) : undefined;
  if (is_affiliate !== undefined) banner.is_affiliate = is_affiliate ? 1 : 0;
  if (delay_seconds !== undefined) banner.delay_seconds = Math.max(3, Math.min(10, Number(delay_seconds) || 4));
  if (is_active !== undefined) banner.is_active = is_active ? 1 : 0;

  coreDb.save();

  res.json({ success: true, data: banner });
});

// 9. Xóa banner quảng cáo (Admin)
advertisingRouter.delete('/admin/banners/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = coreDb.ads.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: { message: 'Không tìm thấy banner' } });
  }

  coreDb.ads.splice(index, 1);
  coreDb.save();

  res.json({ success: true, message: 'Đã xóa banner quảng cáo thành công' });
});

// 10. Tạo vật phẩm tiếp thị liên kết mới (Admin)
advertisingRouter.post('/admin/affiliate-products', requireAdmin, (req: Request, res: Response) => {
  const { title, description, category, provider, price_text, image_url, affiliate_url, commission_note, is_featured } = req.body;

  if (!title || !affiliate_url) {
    return res.status(400).json({ success: false, error: { message: 'Tên vật phẩm và đường dẫn tiếp thị là bắt buộc' } });
  }

  const newProduct: AffiliateProductRow = {
    id: `aff_${Date.now()}`,
    title: sanitizeText(title),
    description: sanitizeText(description || ''),
    category: category || 'sach_triet_ly',
    provider: sanitizeText(provider || 'Shopee'),
    price_text: sanitizeText(price_text || 'Liên hệ'),
    rating: 5.0,
    image_url: image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    affiliate_url: affiliate_url.trim(),
    commission_note: commission_note ? sanitizeText(commission_note) : undefined,
    is_featured: is_featured ? 1 : 0,
    clicks_count: 0,
    is_active: 1,
    created_at: Date.now(),
  };

  coreDb.affiliateProducts.unshift(newProduct);
  coreDb.save();

  res.json({ success: true, data: newProduct });
});

// 11. Xóa vật phẩm affiliate (Admin)
advertisingRouter.delete('/admin/affiliate-products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = coreDb.affiliateProducts.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: { message: 'Không tìm thấy vật phẩm' } });
  }

  coreDb.affiliateProducts.splice(index, 1);
  coreDb.save();

  res.json({ success: true, message: 'Đã xóa vật phẩm tiếp thị liên kết' });
});
