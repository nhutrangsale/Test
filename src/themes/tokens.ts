/**
 * Bảng màu & Quy chuẩn Thẩm mỹ Cổ Phong Hắc Sắc Ngọc Bích
 * Vạn Cổ Luân Hồi - Triết lý & Chiêm nghiệm
 */

export const THEME_TOKENS = {
  colors: {
    // 60% Nền canvas trung tính huyền mặc
    canvas: {
      deep: '#07090D',       // Đen huyền mặc sâu thẳm
      base: '#0B0F15',       // Nền chính
      surface: '#121820',    // Bề mặt card / phiến đá
      surfaceHover: '#18212C', // Di chuột
      border: '#1F2B37',     // Viền hairline tinh tế
      borderSubtle: 'rgba(255, 255, 255, 0.07)',
    },
    // 30% Cấu trúc & Thư họa
    ink: {
      primary: '#F1F5F9',    // Chữ sáng ngà voi (90% contrast)
      secondary: '#CBD5E1',  // Chữ phụ
      muted: '#64748B',      // Metadata, thời gian, chú thích
      faint: '#334155',      // Đường kẻ chỉ
    },
    // 10% Điểm nhấn thanh tao sắc ngọc bích (Celadon Jade)
    jade: {
      light: '#34D399',      // Ngọc sáng
      primary: '#10B981',    // Ngọc bích chủ đạo
      dark: '#059669',       // Ngọc bích thâm trầm
      glow: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    // Điểm nhấn phụ: Kim sa hoàng hôn
    amber: {
      primary: '#D97706',
      subtle: 'rgba(217, 119, 6, 0.15)',
    },
    // Cảnh báo & trạng thái
    semantic: {
      danger: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    }
  },
  typography: {
    fontDisplay: "'Cinzel', 'Lora', serif",
    fontBody: "'Lora', serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  }
} as const;
