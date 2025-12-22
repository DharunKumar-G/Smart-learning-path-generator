import {
  Box,
  HStack,
  Text,
  Progress,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaCheckCircle, FaClock, FaFire } from 'react-icons/fa';

interface ProgressCardProps {
  completedTopics: number;
  totalTopics: number;
  currentStreak?: number;
  totalHours?: number;
}

const ProgressCard = ({
  completedTopics,
  totalTopics,
  currentStreak = 0,
  totalHours = 0,
}: ProgressCardProps) => {
  const progressPercent = totalTopics > 0 
    ? Math.round((completedTopics / totalTopics) * 100) 
    : 0;

  return (
    <Box
      p={6}
      bg="whiteAlpha.50"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">Your Progress</Text>
          <Text color="brand.400" fontWeight="bold" fontSize="2xl">
            {progressPercent}%
          </Text>
        </HStack>

        <Progress
          value={progressPercent}
          colorScheme={progressPercent === 100 ? 'green' : 'blue'}
          borderRadius="full"
          size="lg"
          bg="whiteAlpha.200"
        />

        <HStack justify="space-around" pt={2}>
          <VStack spacing={1}>
            <HStack color="green.400">
              <Icon as={FaCheckCircle} />
              <Text fontWeight="bold">{completedTopics}/{totalTopics}</Text>
            </HStack>
            <Text fontSize="xs" color="gray.500">Topics Done</Text>
          </VStack>

          <VStack spacing={1}>
            <HStack color="orange.400">
              <Icon as={FaFire} />
              <Text fontWeight="bold">{currentStreak}</Text>
            </HStack>
            <Text fontSize="xs" color="gray.500">Day Streak</Text>
          </VStack>

          <VStack spacing={1}>
            <HStack color="purple.400">
              <Icon as={FaClock} />
              <Text fontWeight="bold">{totalHours}h</Text>
            </HStack>
            <Text fontSize="xs" color="gray.500">Time Spent</Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProgressCard;
