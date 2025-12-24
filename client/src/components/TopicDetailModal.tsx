import { useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Box,
  Link,
  Icon,
  Checkbox,
  useColorModeValue,
  useToast,
  Wrap,
  WrapItem,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FaClock, FaSearch, FaYoutube, FaGoogle, FaCheckCircle, FaLightbulb, FaCopy } from 'react-icons/fa';
import type { Topic } from '../types';

interface TopicDetailModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkComplete?: (topicId: string) => Promise<void>;
}

const TopicDetailModal = ({ topic, isOpen, onClose, onMarkComplete }: TopicDetailModalProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const handleMarkComplete = useCallback(async () => {
    if (onMarkComplete && topic && !topic.isCompleted) {
      await onMarkComplete(topic.id);
    }
  }, [onMarkComplete, topic]);

  // Keyboard shortcut: Enter to mark complete
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && topic && !topic.isCompleted && onMarkComplete) {
        e.preventDefault();
        handleMarkComplete();
      }
    },
    [topic, onMarkComplete, handleMarkComplete]
  );

  useEffect(() => {
    if (isOpen && topic) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown, topic]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Search string copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        status: 'error',
        duration: 2000,
      });
    }
  };

  // Early return AFTER all hooks
  if (!topic) return null;

  // Generate search URLs
  const youtubeUrl = (query: string) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const googleUrl = (query: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Text>{topic.name}</Text>
            {topic.isCompleted && (
              <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
                <Icon as={FaCheckCircle} />
                Completed
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack align="stretch" spacing={5}>
            {/* Description */}
            {topic.description && (
              <Box>
                <Text color="gray.600">{topic.description}</Text>
              </Box>
            )}

            {/* Meta info */}
            <HStack spacing={6}>
              <HStack color="gray.600">
                <Icon as={FaClock} />
                <Text fontSize="sm">
                  <strong>{topic.estimatedHours}</strong> hours estimated
                </Text>
              </HStack>
              <Badge colorScheme="brand" variant="subtle">
                #{topic.order + 1} in order
              </Badge>
            </HStack>

            <Divider />

            {/* Why This First - Prerequisite Reasoning */}
            <Box
              bg={bgColor}
              p={4}
              borderRadius="md"
              borderWidth={1}
              borderColor={borderColor}
            >
              <HStack mb={2} color="brand.500">
                <Icon as={FaLightbulb} />
                <Text fontWeight="semibold">Why Learn This Now?</Text>
              </HStack>
              <Text fontSize="sm">{topic.whyThisFirst}</Text>
            </Box>

            <Divider />

            {/* Smart Resource Finder */}
            <Box>
              <HStack mb={3}>
                <Icon as={FaSearch} color="brand.500" />
                <Text fontWeight="semibold">Smart Resource Finder</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Use these curated search strings to find the best learning resources:
              </Text>
              
              <VStack align="stretch" spacing={3}>
                {topic.searchStrings.map((searchString, index) => (
                  <Box
                    key={index}
                    p={3}
                    bg={bgColor}
                    borderRadius="md"
                    borderWidth={1}
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontFamily="mono">
                        "{searchString}"
                      </Text>
                      <Tooltip label="Copy to clipboard" hasArrow>
                        <IconButton
                          aria-label="Copy search string"
                          icon={<FaCopy />}
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(searchString)}
                        />
                      </Tooltip>
                    </HStack>
                    <Wrap spacing={2}>
                      <WrapItem>
                        <Link
                          href={youtubeUrl(searchString)}
                          isExternal
                          _hover={{ textDecoration: 'none' }}
                        >
                          <Button
                            size="xs"
                            leftIcon={<FaYoutube />}
                            colorScheme="red"
                            variant="outline"
                          >
                            YouTube
                          </Button>
                        </Link>
                      </WrapItem>
                      <WrapItem>
                        <Link
                          href={googleUrl(searchString)}
                          isExternal
                          _hover={{ textDecoration: 'none' }}
                        >
                          <Button
                            size="xs"
                            leftIcon={<FaGoogle />}
                            colorScheme="blue"
                            variant="outline"
                          >
                            Google
                          </Button>
                        </Link>
                      </WrapItem>
                    </Wrap>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Completion toggle */}
            {!topic.isCompleted && onMarkComplete && (
              <>
                <Divider />
                <Checkbox
                  colorScheme="green"
                  size="lg"
                  onChange={handleMarkComplete}
                >
                  <Text>Mark as completed</Text>
                </Checkbox>
              </>
            )}

            {/* Completed at timestamp */}
            {topic.isCompleted && topic.completedAt && (
              <Text fontSize="sm" color="gray.500">
                Completed on {new Date(topic.completedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Text fontSize="xs" color="gray.500" mr="auto">
            Press Esc to close{!topic.isCompleted && onMarkComplete ? ', Enter to complete' : ''}
          </Text>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          {!topic.isCompleted && onMarkComplete && (
            <Button colorScheme="green" onClick={handleMarkComplete}>
              Mark Complete
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TopicDetailModal;
