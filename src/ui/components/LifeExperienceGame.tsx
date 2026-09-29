/**
 * Trải Nghiệm Nhân Sinh - Realtime Life Simulation Game & Draggable Floating Popup
 * Vạn Cổ Luân Hồi
 * - Trò chơi mô phỏng vòng quay nhân sinh realtime bằng UI, CSS, Button, SVG icons
 * - Có cửa sổ nổi (floating popup) tự do di chuyển (drag & drop), thu nhỏ hoặc đóng (x)
 * - Tương thích tối đa trên Mobile, Tablet và Desktop
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Heart, Brain, Scale, Coins, Award, Play, Pause, FastForward,
  RotateCcw, X, Minimize2, Maximize2, BookOpen, Compass, Shield, Smile,
  Activity, Move, ChevronRight, AlertCircle, RefreshCw, Feather
} from 'lucide-react';

export interface LifeState {
  reincarnationCount: number;
  name: string;
  origin: string;
  age: number;
  maxAge: number;
  isAlive: boolean;
  health: number; // 0 - 100
  peace: number;  // 0 - 100 (Tâm cảnh)
  wisdom: number; // 0 - 100 (Tuệ căn)
  merit: number;  // Công đức
  wealth: number; // Ngân lượng
  fame: number;   // Danh vọng
  realm: string;  // Cảnh giới nhân sinh
  logs: Array<{ year: number; text: string; type: 'info' | 'good' | 'bad' | 'special' }>;
}

const ORIGINS = [
  { name: 'Nông Gia Tử Đệ', bonus: 'Chân chất, Khí huyết dồi dào', h: 10, p: 5, w: 0, m: 5, c: 20 },
  { name: 'Thư Hương Môn Đệ', bonus: 'Hiếu học, Tuệ căn sáng tỏ', h: -5, p: 10, w: 15, m: 5, c: 50 },
  { name: 'Thương Gia Ấu Tử', bonus: 'Lanh lợi, Ngân lượng khởi đầu', h: 0, p: 0, w: 10, m: 0, c: 150 },
  { name: 'Y Đạo Truyền Nhân', bonus: 'Từ tâm tế thế, thấu hiểu sinh tử', h: 5, p: 10, w: 10, m: 15, c: 40 },
  { name: 'Cô Nhi Thảo Dã', bonus: 'Bất khuất kiên cường, tâm tĩnh như gương', h: 10, p: 15, w: 5, m: 10, c: 5 },
];

const REALMS = [
  { minAge: 0, name: 'Sơ Sinh · Hỗn Độn', stage: 'Ấu Thơ' },
  { minAge: 6, name: 'Đồng Niên · Khởi Tuệ', stage: 'Ấu Thơ' },
  { minAge: 13, name: 'Chí Học · Rèn Ý Chí', stage: 'Thiếu Niên' },
  { minAge: 20, name: 'Nhược Quán · Lập Thân', stage: 'Tráng Niên' },
  { minAge: 30, name: 'Nhi Lập · Thử Thách Giang Hồ', stage: 'Tráng Niên' },
  { minAge: 40, name: 'Bất Hoặc · Thấu Triệt Nhân Sinh', stage: 'Trung Niên' },
  { minAge: 50, name: 'Tri Thiên Mệnh · Ngẫm Đạo', stage: 'Trung Niên' },
  { minAge: 60, name: 'Nhĩ Thuận · Vạn Sự Tùy Duyên', stage: 'Lão Niên' },
  { minAge: 70, name: 'Tòng Tâm · An Nhiên Tự Tại', stage: 'Lão Niên' },
  { minAge: 85, name: 'Đại Viên Mãn · Chờ Ngày Luân Hồi', stage: 'Thánh Triết' },
];

function createInitialLife(reincarnation: number = 1): LifeState {
  const origin = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
  const maxAge = 68 + Math.floor(Math.random() * 26); // 68 - 93 tuổi
  return {
    reincarnationCount: reincarnation,
    name: `Lữ Khách Kiếp Thứ ${reincarnation}`,
    origin: origin.name,
    age: 0,
    maxAge,
    isAlive: true,
    health: Math.min(100, 75 + origin.h),
    peace: Math.min(100, 60 + origin.p),
    wisdom: Math.min(100, 30 + origin.w),
    merit: origin.m,
    wealth: origin.c,
    fame: 10,
    realm: 'Sơ Sinh · Hỗn Độn',
    logs: [
      {
        year: 0,
        text: `Chào đời tại thế gian, xuất thân ${origin.name}. (${origin.bonus})`,
        type: 'special',
      },
    ],
  };
}

interface LifeExperienceGameProps {
  isPopup?: boolean;
  onClose?: () => void;
}

export const LifeExperienceGame: React.FC<LifeExperienceGameProps> = ({
  isPopup = false,
  onClose,
}) => {
  const [life, setLife] = useState<LifeState>(() => createInitialLife(1));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1 = 2.5s/năm, 2 = 1.2s/năm, 3 = 0.6s/năm
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Vị trí Drag & Drop cho Popup tự do di chuyển
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const defaultX = Math.max(16, window.innerWidth - 440);
      const defaultY = Math.max(80, window.innerHeight - 580);
      return { x: Math.min(defaultX, window.innerWidth - 360), y: Math.min(defaultY, 100) };
    }
    return { x: 50, y: 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [life.logs]);

  // Handle Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPopup) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPopup || e.touches.length === 0) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 340, dragRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, dragRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 120, dragRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Bước 1 năm thời gian trong đời
  const stepOneYear = () => {
    setLife((prev) => {
      if (!prev.isAlive) return prev;

      const nextAge = prev.age + 1;
      let nextHealth = prev.health;
      let nextPeace = prev.peace;
      let nextWisdom = prev.wisdom;
      let nextMerit = prev.merit;
      let nextWealth = prev.wealth;
      let nextFame = prev.fame;

      // Sinh lão bệnh tử tự nhiên
      if (nextAge > 50) {
        nextHealth = Math.max(0, nextHealth - (nextAge > 70 ? 3 : 1));
      }
      if (nextAge > 65 && Math.random() < 0.2) {
        nextHealth = Math.max(0, nextHealth - 5);
      }

      // Xác định cảnh giới
      let currentRealm = prev.realm;
      for (let i = REALMS.length - 1; i >= 0; i--) {
        if (nextAge >= REALMS[i].minAge) {
          currentRealm = REALMS[i].name;
          break;
        }
      }

      // Tạo sự kiện ngẫu nhiên theo năm
      const newLogs = [...prev.logs];
      const eventChance = Math.random();

      if (nextAge === 6) {
        newLogs.push({ year: 6, text: 'Bắt đầu học chữ vỡ lòng, nhận biết thế giới.', type: 'info' });
        nextWisdom += 5;
      } else if (nextAge === 15) {
        newLogs.push({ year: 15, text: 'Thiếu niên lập chí, nuôi dưỡng ước mơ phụng sự nhân gian.', type: 'info' });
        nextPeace += 5;
      } else if (nextAge === 22) {
        newLogs.push({ year: 22, text: 'Tráng niên xuất thế, tự bước đi trên đôi chân của mình.', type: 'good' });
        nextWealth += 30;
      } else if (eventChance < 0.28) {
        // Sự kiện biến động nhân sinh
        const events = [
          { text: 'Gặp thiên tai mất mùa, mở kho chia sẻ lương thực với xóm làng.', type: 'good' as const, m: 10, w: -25, p: 8 },
          { text: 'Bị kẻ tiểu nhân mưu toan cướp giật, giữ tâm bình thản không oán hận.', type: 'info' as const, m: 5, w: -15, p: 10 },
          { text: 'Trời đổ bệnh dịch, may nhờ uống thuốc thảo mộc và tích đức mà tai qua nạn khỏi.', type: 'bad' as const, h: -10, p: 5 },
          { text: 'Đọc được thiên cổ kỳ thư, khai mở tuệ giác vô cùng sâu sắc.', type: 'special' as const, w: 12, p: 10 },
          { text: 'Gặp đạo sĩ phương xa đàm đạo một đêm, thấu hiểu đạo lý sắc sắc không không.', type: 'special' as const, p: 15, w: 8 },
          { text: 'Kinh doanh phát đạt, ngân lượng dồi dào, đóng góp tu bổ cầu đường.', type: 'good' as const, w: 60, m: 8, f: 5 },
          { text: 'Chăm sóc người thân lâm bệnh, tròn chữ hiếu nghĩa vẹn toàn.', type: 'good' as const, m: 12, h: -5, p: 8 },
        ];
        const selected = events[Math.floor(Math.random() * events.length)];
        newLogs.push({ year: nextAge, text: selected.text, type: selected.type });
        if (selected.m) nextMerit += selected.m;
        if (selected.w) nextWealth = Math.max(0, nextWealth + selected.w);
        if (selected.p) nextPeace = Math.min(100, Math.max(0, nextPeace + selected.p));
        if (selected.h) nextHealth = Math.min(100, Math.max(0, nextHealth + selected.h));
      }

      // Kiểm tra cái chết
      const isDead = nextAge >= prev.maxAge || nextHealth <= 0;
      if (isDead) {
        newLogs.push({
          year: nextAge,
          text: `Thọ mệnh viên mãn ở tuổi ${nextAge}. Hồn phiêu diêu về chốn Bát Nhã, chuẩn bị luân hồi chuyển kiếp.`,
          type: 'special',
        });
        setIsRunning(false);
      }

      return {
        ...prev,
        age: nextAge,
        health: nextHealth,
        peace: nextPeace,
        wisdom: nextWisdom,
        merit: nextMerit,
        wealth: nextWealth,
        fame: nextFame,
        realm: currentRealm,
        isAlive: !isDead,
        logs: newLogs.slice(-25), // Giữ 25 logs gần nhất cho nhẹ
      };
    });
  };

  // Real-time loop
  useEffect(() => {
    if (!isRunning || !life.isAlive) return;
    const intervalTime = speed === 3 ? 600 : speed === 2 ? 1300 : 2500;
    const timer = setInterval(() => {
      stepOneYear();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isRunning, speed, life.isAlive]);

  // Các hành động chủ động của người chơi
  const handleAction = (type: 'read' | 'charity' | 'meditate' | 'work' | 'travel' | 'heal') => {
    if (!life.isAlive) return;

    setLife((prev) => {
      let h = prev.health;
      let p = prev.peace;
      let w = prev.wisdom;
      let m = prev.merit;
      let c = prev.wealth;
      let f = prev.fame;
      let logText = '';
      let logType: 'good' | 'info' | 'special' | 'bad' = 'info';

      switch (type) {
        case 'read':
          w = Math.min(100, w + 6);
          p = Math.min(100, p + 4);
          logText = 'Đọc sách Thánh Hiền: Tuệ căn sáng bừng, tâm tư tĩnh lặng khai mở.';
          logType = 'good';
          break;
        case 'charity':
          if (c < 15) {
            logText = 'Túi tiền cạn kiệt, dẫu có lòng thiện cũng khó bề chu cấp.';
            logType = 'bad';
          } else {
            c -= 15;
            m += 10;
            p = Math.min(100, p + 6);
            f += 4;
            logText = 'Hành thiện bố thí: Cứu trợ kẻ khó khăn, công đức dâng cao, tâm an lạc.';
            logType = 'special';
          }
          break;
        case 'meditate':
          h = Math.min(100, h + 8);
          p = Math.min(100, p + 12);
          logText = 'Tĩnh tọa định tâm: Thở vào an tịnh, thở ra mỉm cười, khí huyết thông thuận.';
          logType = 'good';
          break;
        case 'work':
          if (h < 15) {
            logText = 'Sức tàn lực kiệt, không thể gắng gượng làm việc.';
            logType = 'bad';
          } else {
            h -= 8;
            c += 35;
            f += 3;
            logText = 'Bôn ba mưu sinh: Chăm chỉ lao tác, thu hoạch ngân lượng, thân xác hơi mỏi mệt.';
            logType = 'info';
          }
          break;
        case 'travel':
          if (c < 20) {
            logText = 'Thiếu lộ phí để chu du bốn bể.';
            logType = 'bad';
          } else {
            c -= 20;
            w = Math.min(100, w + 8);
            p = Math.min(100, p + 8);
            logText = 'Du ngoạn sơn thủy: Ngắm non sông cẩm tú, ngộ lý lẽ nhân sinh vô thường.';
            logType = 'good';
          }
          break;
        case 'heal':
          if (c < 25) {
            logText = 'Không đủ ngân lượng để bốc phương thuốc quý.';
            logType = 'bad';
          } else {
            c -= 25;
            h = Math.min(100, h + 22);
            logText = 'Thí dược điều dưỡng: Dùng thảo dược cổ truyền, thân thể phục hồi sinh lực.';
            logType = 'good';
          }
          break;
      }

      return {
        ...prev,
        health: h,
        peace: p,
        wisdom: w,
        merit: m,
        wealth: c,
        fame: f,
        logs: [...prev.logs, { year: prev.age, text: logText, type: logType }].slice(-25),
      };
    });
  };

  // Luân Hồi Sang Kiếp Mới
  const reincarnate = () => {
    const nextLife = createInitialLife(life.reincarnationCount + 1);
    // Kế thừa một phần công đức phước báo
    const inheritedMerit = Math.max(0, Math.floor(life.merit * 0.3));
    nextLife.merit += inheritedMerit;
    nextLife.peace += Math.min(20, Math.floor(life.peace * 0.15));
    nextLife.wisdom += Math.min(20, Math.floor(life.wisdom * 0.15));
    if (inheritedMerit > 20) {
      nextLife.logs.push({
        year: 0,
        text: `Nhờ công đức kiếp trước (${inheritedMerit} điểm), kiếp này sinh ra mang phước tướng túc duyên.`,
        type: 'special',
      });
    }
    setLife(nextLife);
    setIsRunning(false);
  };

  // Mini Floating Badge khi thu nhỏ (Minimized)
  if (isPopup && isMinimized) {
    return (
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-50 flex items-center gap-2 p-2 px-3 rounded-full bg-stone-900/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing font-sans-ui select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-display font-bold text-emerald-400">Nhân Sinh:</span>
        <span className="text-xs font-mono">{life.age} Tuổi</span>
        <span className="text-[10px] text-stone-300">({life.realm.split('·')[0]})</span>
        
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 hover:text-emerald-400 rounded-full transition-colors cursor-pointer"
          title="Mở rộng cửa sổ"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:text-rose-400 rounded-full transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  const containerStyles = isPopup
    ? {
        position: 'fixed' as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: 'min(92vw, 420px)',
        zIndex: 50,
      }
    : {
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
      };

  return (
    <div
      style={containerStyles}
      className={`rounded-2xl bg-white dark:bg-[#0A0E15] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-emerald-500/30 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-150 font-sans-ui ${
        isPopup ? 'max-h-[88vh]' : 'my-4'
      }`}
    >
      {/* ==============================================================
          1. HEADER THANH ĐIỀU HƯỚNG CỬA SỔ (DRAGGABLE HANDLE)
          ============================================================== */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`px-4 py-3 bg-stone-50 dark:bg-[#0E1520] border-b border-stone-200 dark:border-white/[0.08] flex items-center justify-between select-none ${
          isPopup ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {isPopup && <Move className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-stone-900 dark:text-slate-100 tracking-wide">
                Trải Nghiệm Nhân Sinh
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
                Kiếp {life.reincarnationCount}
              </span>
            </div>
            <div className="text-[10px] text-stone-500 dark:text-slate-400 font-reading">
              {life.origin} · {life.realm}
            </div>
          </div>
        </div>

        {/* Cụm nút điều khiển cửa sổ */}
        <div className="flex items-center gap-1">
          {isPopup && (
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Thu nhỏ cửa sổ"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          )}
          {isPopup && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Đóng trải nghiệm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==============================================================
          2. THANH THỜI GIAN REALTIME & TUỔI THỌ
          ============================================================== */}
      <div className="px-4 py-2.5 bg-stone-100/60 dark:bg-[#070B10] border-b border-stone-200/80 dark:border-white/[0.05] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-stone-900 dark:text-slate-100 text-sm">
            {life.age} <span className="text-xs font-normal text-stone-500">Tuổi</span>
          </span>
          <span className="text-[11px] text-stone-500 dark:text-slate-400">
            / Thọ {life.maxAge}
          </span>
        </div>

        {/* Cụm điều khiển Tốc độ Realtime */}
        {life.isAlive ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isRunning
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3 h-3" /> Tạm Dừng
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> Tự Hành
                </>
              )}
            </button>

            <button
              onClick={stepOneYear}
              disabled={isRunning}
              className="px-2 py-1 rounded-md bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/15 text-xs text-stone-700 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Tiến thêm 1 năm"
            >
              +1 Năm
            </button>

            <div className="flex items-center bg-stone-200 dark:bg-white/5 rounded-md p-0.5">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
                    speed === s
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={reincarnate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-semibold text-xs transition-colors cursor-pointer animate-pulse"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Luân Hồi Chuyển Kiếp
          </button>
        )}
      </div>

      {/* ==============================================================
          3. BẢNG CHỈ SỐ NHÂN SINH (HEALTH, PEACE, WISDOM, MERIT, WEALTH)
          ============================================================== */}
      <div className="p-3.5 grid grid-cols-3 gap-2 bg-stone-50/50 dark:bg-white/[0.01] border-b border-stone-200 dark:border-white/[0.05]">
        {/* Khí Huyết (Sức Khỏe) */}
        <div className="p-2 rounded-xl bg-white dark:bg-[#0E1520] border border-stone-200/80 dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" /> Khí Huyết
            </span>
            <span className="font-mono font-bold text-xs">{life.health}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                life.health < 25 ? 'bg-rose-500 animate-pulse' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, life.health))}%` }}
            />
          </div>
        </div>

        {/* Tâm Cảnh (An Lạc) */}
        <div className="p-2 rounded-xl bg-white dark:bg-[#0E1520] border border-stone-200/80 dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1">
              <Smile className="w-3 h-3 text-emerald-500" /> Tâm Cảnh
            </span>
            <span className="font-mono font-bold text-xs">{life.peace}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, life.peace))}%` }}
            />
          </div>
        </div>

        {/* Tuệ Căn (Trí Tuệ) */}
        <div className="p-2 rounded-xl bg-white dark:bg-[#0E1520] border border-stone-200/80 dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1">
              <Brain className="w-3 h-3 text-blue-500" /> Tuệ Căn
            </span>
            <span className="font-mono font-bold text-xs">{life.wisdom}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, life.wisdom))}%` }}
            />
          </div>
        </div>

        {/* Công Đức */}
        <div className="p-2 rounded-xl bg-white dark:bg-[#0E1520] border border-stone-200/80 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-slate-400 flex items-center gap-1">
            <Scale className="w-3 h-3 text-amber-500" /> Công Đức
          </span>
          <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
            +{life.merit}
          </span>
        </div>

        {/* Ngân Lượng */}
        <div className="p-2 rounded-xl bg-white dark:bg-[#0E1520] border border-stone-200/80 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-slate-400 flex items-center gap-1">
            <Coins className="w-3 h-3 text-yellow-500" /> Ngân Lượng
          </span>
          <span className="font-mono font-bold text-xs text-yellow-600 dark:text-yellow-400">
            {life.wealth} Lạng
          </span>
        </div>

        {/* Danh Vọng */}
        <div className="p-2 rounded-xl bg-white dark:bg-[#0E1520] border border-stone-200/80 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-slate-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-500" /> Danh Tiếng
          </span>
          <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
            {life.fame}
          </span>
        </div>
      </div>

      {/* ==============================================================
          4. NHẬT KÝ BIẾN CỐ NHÂN SINH (REALTIME LOGS)
          ============================================================== */}
      <div className="px-4 py-2 bg-stone-100/40 dark:bg-black/20 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Feather className="w-3 h-3 text-emerald-500" />
          Nhật Ký Dòng Đời
        </span>
        <span className="text-[10px] text-stone-400">Tự động ghi chép</span>
      </div>

      <div className="flex-1 min-h-[140px] max-h-[190px] overflow-y-auto p-3 space-y-1.5 text-xs font-reading border-b border-stone-200 dark:border-white/[0.06]">
        {life.logs.map((log, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg text-[11px] leading-relaxed transition-all ${
              log.type === 'special'
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-medium'
                : log.type === 'good'
                ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : log.type === 'bad'
                ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300'
                : 'text-stone-600 dark:text-slate-300'
            }`}
          >
            <span className="font-mono font-bold text-stone-400 mr-1.5">[{log.year} tuổi]</span>
            {log.text}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* ==============================================================
          5. CÁC HÀNH ĐỘNG NHÂN SINH CHỦ ĐỘNG
          ============================================================== */}
      {life.isAlive ? (
        <div className="p-3 bg-stone-50 dark:bg-[#0D1219]">
          <div className="text-[10px] font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Lựa Chọn Tu Tập & Hành Động
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleAction('read')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs text-stone-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Đọc Sách</span>
            </button>

            <button
              onClick={() => handleAction('meditate')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-xs text-stone-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Tĩnh Tọa</span>
            </button>

            <button
              onClick={() => handleAction('charity')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-xs text-stone-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Hành Thiện</span>
            </button>

            <button
              onClick={() => handleAction('work')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-yellow-500/40 hover:bg-yellow-50/50 dark:hover:bg-yellow-950/20 text-xs text-stone-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span className="truncate">Mưu Sinh</span>
            </button>

            <button
              onClick={() => handleAction('travel')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-purple-500/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-xs text-stone-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="truncate">Du Ngoạn</span>
            </button>

            <button
              onClick={() => handleAction('heal')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-rose-500/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs text-stone-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Dưỡng Sinh</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/30 border-t border-emerald-500/30 text-center space-y-2">
          <div className="text-sm font-display font-bold text-emerald-400">
            Một Đời Trôi Qua · Bát Nhã Khai Tâm
          </div>
          <p className="text-xs text-stone-300 font-reading">
            Tổng kết: Sống được <strong>{life.age} tuổi</strong>, tích lũy được{' '}
            <strong>{life.merit} điểm công đức</strong> và{' '}
            <strong>{life.wisdom}% tuệ căn</strong>. Nghiệp quả kiếp này sẽ mang theo sang kiếp sau!
          </p>
          <button
            onClick={reincarnate}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Bắt Đầu Kiếp Tiếp Theo
          </button>
        </div>
      )}
    </div>
  );
};
