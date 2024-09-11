import React from 'react';
import { motion } from 'framer-motion';
import { ImDiamonds } from 'react-icons/im';

export default function Sparkles({ children }) {
    const generateRandomRGB = () => `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

    const sparkles = Array.from({ length: 5 }).map((_, i) => {
        const color1 = generateRandomRGB();
        const color2 = generateRandomRGB();
        const color3 = generateRandomRGB();

        return (
            <motion.div
                key={i}
                className="absolute"
                initial={{
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * 30 - 10,
                    y: Math.random() * 30 - 10,
                }}
                animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 40 - 10,
                    y: Math.random() * 40 - 10,
                    color: [color1, color2, color3, color2, color1]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                }}
            >
                <ImDiamonds fontSize={10} />
            </motion.div>
        );
    });

    return (
        <div className="relative inline-block">
            {sparkles}
            {children}
        </div>
    );
}