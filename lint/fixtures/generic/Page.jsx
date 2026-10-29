import { motion } from 'framer-motion';

export function Page() {
  return (
    <main>
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>Features</motion.h2>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3, ease: "easeInOut" }}>Card</motion.div>
      <motion.button whileHover={{ scale: 1.05 }} transition={{ type: "spring", bounce: 0.6, duration: 0.3 }}>Go</motion.button>
      <div className="transition-all duration-300 ease-in-out hover:scale-105 animate-bounce">Bouncy</div>
      <motion.ul variants={{ show: { transition: { staggerChildren: 0.2 } } }} />
    </main>
  );
}
