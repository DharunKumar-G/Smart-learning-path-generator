import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

const MotionCircle = motion.circle;

const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#0080e6',
  trackColor = 'rgba(255,255,255,0.1)',
  label,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <VStack spacing={2}>
      <Box position="relative" width={size} height={size}>
        <svg width={size} height={size}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <MotionCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {/* Center text */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Text fontSize="2xl" fontWeight="bold" color="white">
            {Math.round(value)}%
          </Text>
        </Box>
      </Box>
      {label && (
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {label}
        </Text>
      )}
    </VStack>
  );
};

export default CircularProgress;
