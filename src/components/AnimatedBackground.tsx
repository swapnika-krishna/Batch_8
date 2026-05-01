import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface MousePos {
  x: number;
  y: number;
}

export function UnifiedBackground({ mousePos }: { mousePos: MousePos }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Moving Blobs */}
      <motion.div
        style={{ y: y1 }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, isMobile ? 50 : 100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-primary/10 rounded-full blur-[80px] sm:blur-[120px]"
      />
      <motion.div
        style={{ y: y2 }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, isMobile ? -50 : -100, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-secondary/10 rounded-full blur-[80px] sm:blur-[120px]"
      />
      
      {/* Interactive Gradients - Only fully active on desktop */}
      <div className="absolute inset-0 opacity-40">
        <motion.div 
          animate={!isMobile ? { 
            x: mousePos.x * 20, 
            y: mousePos.y * 20,
            scale: [1, 1.1, 1],
          } : {
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[80px] sm:blur-[120px]"
        />
        <motion.div 
          animate={!isMobile ? { 
            x: -mousePos.x * 30, 
            y: -mousePos.y * 30,
            scale: [1, 1.2, 1],
          } : {
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-accent/10 rounded-[70%_30%_50%_50%/30%_30%_70%_70%] blur-[100px] sm:blur-[150px]"
        />
      </div>

      {/* Rising Lines - Reduced count on mobile */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: isMobile ? 6 : 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: "110%",
              height: Math.random() * 80 + 20,
              width: "1px"
            }}
            animate={{ y: ["110%", "-20%"] }}
            style={{ translateX: !isMobile ? mousePos.x * (i % 5 + 5) : 0 }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute bg-primary"
          />
        ))}
      </div>

      {/* Floating Particles - Reduced count on mobile */}
      <div className="absolute inset-0">
        {Array.from({ length: isMobile ? 10 : 25 }).map((_, i) => {
          const size = Math.random() * 4 + 1;
          return (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0 
              }}
              animate={{
                x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                opacity: [0, 0.4, 0],
                scale: [0, size, 0]
              }}
              style={{
                translateX: !isMobile ? mousePos.x * (i % 10 + 2) : 0,
                translateY: !isMobile ? mousePos.y * (i % 10 + 2) : 0,
                width: size,
                height: size,
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bg-primary rounded-full"
            />
          );
        })}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent)]" />
      </div>
    </div>
  );
}

export function CursorTrail({ mousePos }: { mousePos: MousePos }) {
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (isMobile) return;
    const newPoint = { x: mousePos.x, y: mousePos.y, id: Date.now() };
    setTrail(prev => [...prev.slice(-20), newPoint]);
  }, [mousePos, isMobile]);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {trail.map((point) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-primary/40 rounded-full blur-[1px]"
          style={{
            left: `calc(50% + ${point.x * 50}px)`,
            top: `calc(50% + ${point.y * 50}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

export function Magnetic({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouse = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    if (Math.abs(distanceX) < 100 && Math.abs(distanceY) < 100) {
      setPosition({ x: distanceX * 0.2, y: distanceY * 0.2 });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const { x, y } = position;
  return (
    <motion.div
      ref={ref}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
