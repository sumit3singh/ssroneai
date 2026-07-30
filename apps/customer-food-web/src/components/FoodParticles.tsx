import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const FOOD_EMOJIS = ["🍕", "🥟", "🍔", "🌮", "🍩", "🧁", "🍟", "🌯", "🥪", "🍗", "🍰", "🧀", "🥤", "🍜", "☕"];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

let particleId = 0;

export function useFoodParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = (originX?: number, originY?: number) => {
    const count = 5 + Math.floor(Math.random() * 4);
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: ++particleId,
        emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
        x: originX ?? window.innerWidth / 2,
        y: originY ?? window.innerHeight / 2,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1200);
  };

  return { particles, burst };
}

export const FoodParticleLayer = ({ particles }: { particles: Particle[] }) => (
  <div className="fixed inset-0 pointer-events-none z-[100]">
    <AnimatePresence>
      {particles.map((p) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance - 60;
        return (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, scale: 0.5, x: p.x, y: p.y }}
            animate={{
              opacity: 0,
              scale: 1.2 + Math.random() * 0.5,
              x: p.x + endX,
              y: p.y + endY,
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: "easeOut" }}
            className="absolute text-2xl"
            style={{ left: 0, top: 0 }}
          >
            {p.emoji}
          </motion.span>
        );
      })}
    </AnimatePresence>
  </div>
);
