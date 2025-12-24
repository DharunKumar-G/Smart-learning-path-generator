import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  Badge,
  Progress,
  Spinner,
  Center,
  Icon,
  Tooltip,
  Button,
  useToast,
  Wrap,
  WrapItem,
  Tag,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Input,
  InputGroup,
  InputLeftElement,
  ButtonGroup,
} from '@chakra-ui/react';
import { FaClock, FaSearch, FaQuestionCircle, FaCheckCircle, FaDownload, FaFilePdf, FaFileCode, FaFileAlt, FaArrowLeft, FaHourglass, FaShare, FaLink, FaTwitter, FaBookmark, FaFilter } from 'react-icons/fa';
import { useRoadmapStore } from '../stores/roadmapStore';
import { getRoadmap, toggleTopicComplete } from '../services/roadmap';
import { generateQuiz } from '../services/quiz';
import TopicDetailModal from '../components/TopicDetailModal';
import { exportToPDF, exportToJSON, exportToMarkdown } from '../utils/exportRoadmap';
import type { Topic } from '../types';

type FilterType = 'all' | 'completed' | 'incomplete' | 'bookmarked';

const RoadmapPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRoadmap, setCurrentRoadmap, updateTopicCompletion, updateTopic, isLoading, setLoading } = useRoadmapStore();
  const [updatingTopic, setUpdatingTopic] = useState<string | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!id) return;
      // Only set loading if we don't already have the roadmap
      if (!currentRoadmap || currentRoadmap.id !== id) {
        setLoading(true);
      }
      try {
        const data = await getRoadmap(id);
        setCurrentRoadmap(data.roadmap);
      } catch (error) {
        console.error('Failed to fetch roadmap:', error);
        toast({
          title: 'Failed to load roadmap',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTopicToggle = async (topicId: string, currentStatus: boolean) => {
    setUpdatingTopic(topicId);
    try {
      // Update local state first for instant feedback
      updateTopicCompletion(topicId, !currentStatus);
      
      // Then sync with server
      await toggleTopicComplete(topicId, !currentStatus);
      
      toast({
        title: !currentStatus ? '🎉 Topic completed!' : 'Topic marked incomplete',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Revert on error
      updateTopicCompletion(topicId, currentStatus);
      console.error('Topic toggle error:', error);
      toast({
        title: 'Failed to update topic',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingTopic(null);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    onOpen();
  };

  const handleMarkTopicComplete = async (topicId: string) => {
    onClose(); // Close modal first to prevent stale state issues
    await handleTopicToggle(topicId, false);
  };

  const handleGenerateQuiz = async (weekId: string) => {
    setGeneratingQuiz(weekId);
    try {
      const data = await generateQuiz(weekId);
      toast({
        title: 'Quiz generated!',
        description: 'Redirecting to quiz...',
        status: 'success',
        duration: 2000,
      });
      navigate(`/quiz/${data.quiz.id}`);
    } catch (error) {
      toast({
        title: 'Failed to generate quiz',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const handleTakeExistingQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  // Calculate overall progress
  const calculateProgress = () => {
    if (!currentRoadmap) return 0;
    const totalTopics = currentRoadmap.weeks.reduce(
      (acc, week) => acc + week.topics.length,
      0
    );
    const completedTopics = currentRoadmap.weeks.reduce(
      (acc, week) => acc + week.topics.filter((t) => t.isCompleted).length,
      0
    );
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  // Calculate week progress
  const calculateWeekProgress = (weekIndex: number) => {
    if (!currentRoadmap) return 0;
    const week = currentRoadmap.weeks[weekIndex];
    const completed = week.topics.filter((t) => t.isCompleted).length;
    return week.topics.length > 0 ? Math.round((completed / week.topics.length) * 100) : 0;
  };

  // Calculate remaining hours
  const calculateRemainingHours = () => {
    if (!currentRoadmap) return 0;
    return currentRoadmap.weeks.reduce((total, week) => {
      return total + week.topics
        .filter((t) => !t.isCompleted)
        .reduce((sum, t) => sum + t.estimatedHours, 0);
    }, 0);
  };

  // Filter topics based on search query and filter type
  const filterTopics = (topics: Topic[]) => {
    return topics.filter((topic) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesFilter = true;
      switch (filter) {
        case 'completed':
          matchesFilter = topic.isCompleted;
          break;
        case 'incomplete':
          matchesFilter = !topic.isCompleted;
          break;
        case 'bookmarked':
          matchesFilter = topic.isBookmarked;
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });
  };

  // Get total counts for filter badges
  const getFilterCounts = () => {
    if (!currentRoadmap) return { all: 0, completed: 0, incomplete: 0, bookmarked: 0 };
    const allTopics = currentRoadmap.weeks.flatMap(w => w.topics);
    return {
      all: allTopics.length,
      completed: allTopics.filter(t => t.isCompleted).length,
      incomplete: allTopics.filter(t => !t.isCompleted).length,
      bookmarked: allTopics.filter(t => t.isBookmarked).length,
    };
  };

  if (isLoading) {
    return (
      <Box py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            {/* Header Skeleton */}
            <Box
              p={6}
              bg="whiteAlpha.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={2} flex={1}>
                    <Skeleton height="32px" width="60%" />
                    <Skeleton height="20px" width="80%" />
                  </VStack>
                  <Skeleton height="40px" width="120px" borderRadius="md" />
                </HStack>
                <Skeleton height="8px" borderRadius="full" />
                <HStack justify="space-between">
                  <Skeleton height="16px" width="100px" />
                  <Skeleton height="16px" width="80px" />
                </HStack>
              </VStack>
            </Box>

            {/* Week Skeletons */}
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                p={4}
                bg="whiteAlpha.50"
                borderRadius="lg"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <HStack justify="space-between" mb={4}>
                  <HStack spacing={3}>
                    <SkeletonCircle size="10" />
                    <VStack align="start" spacing={1}>
                      <Skeleton height="20px" width="150px" />
                      <Skeleton height="14px" width="200px" />
                    </VStack>
                  </HStack>
                  <Skeleton height="24px" width="60px" borderRadius="full" />
                </HStack>
                <SkeletonText noOfLines={3} spacing={3} />
              </Box>
            ))}
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!currentRoadmap) {
    return (
      <Center minH="calc(100vh - 64px)">
        <Text color="gray.400">Roadmap not found</Text>
      </Center>
    );
  }

  const progress = calculateProgress();

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Back Button */}
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            alignSelf="flex-start"
          >
            Back to Dashboard
          </Button>

          {/* Header */}
          <Box
            p={6}
            bg="whiteAlpha.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="start" wrap="wrap" gap={4}>
                <VStack align="start" spacing={2}>
                  <Heading size="lg">{currentRoadmap.title}</Heading>
                  <Text color="gray.400">{currentRoadmap.description}</Text>
                  <HStack spacing={4} color="gray.500" fontSize="sm">
                    <HStack>
                      <Icon as={FaHourglass} />
                      <Text>{calculateRemainingHours().toFixed(1)} hours remaining</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaClock} />
                      <Text>{currentRoadmap.hoursPerWeek}h/week • {currentRoadmap.totalWeeks} weeks</Text>
                    </HStack>
                  </HStack>
                </VStack>
                <HStack spacing={3}>
                  <Menu>
                    <MenuButton
                      as={Button}
                      leftIcon={<FaShare />}
                      variant="outline"
                      size="sm"
                    >
                      Share
                    </MenuButton>
                    <MenuList>
                      <MenuItem 
                        icon={<FaLink />} 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: 'Link copied!',
                            description: 'Roadmap link copied to clipboard',
                            status: 'success',
                            duration: 2000,
                          });
                        }}
                      >
                        Copy Link
                      </MenuItem>
                      <MenuItem 
                        icon={<FaTwitter />}
                        onClick={() => {
                          const text = `Check out my learning roadmap: ${currentRoadmap.title} - ${progress}% complete! 🚀`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                        }}
                      >
                        Share on Twitter
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  <Menu>
                    <MenuButton
                      as={Button}
                      leftIcon={<FaDownload />}
                      variant="outline"
                      size="sm"
                    >
                      Export
                    </MenuButton>
                    <MenuList>
                      <MenuItem icon={<FaFilePdf />} onClick={() => exportToPDF(currentRoadmap)}>
                        Export as PDF
                      </MenuItem>
                      <MenuItem icon={<FaFileCode />} onClick={() => exportToJSON(currentRoadmap)}>
                        Export as JSON
                      </MenuItem>
                      <MenuItem icon={<FaFileAlt />} onClick={() => exportToMarkdown(currentRoadmap)}>
                        Export as Markdown
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  <Badge
                    colorScheme={progress === 100 ? 'green' : 'blue'}
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {progress === 100 ? '✓ Completed' : `${progress}% Complete`}
                  </Badge>
                </HStack>
              </HStack>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.400">
                    Overall Progress
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="brand.400">
                    {currentRoadmap.weeks.reduce(
                      (acc, w) => acc + w.topics.filter((t) => t.isCompleted).length,
                      0
                    )}{' '}
                    /{' '}
                    {currentRoadmap.weeks.reduce(
                      (acc, w) => acc + w.topics.length,
                      0
                    )}{' '}
                    topics
                  </Text>
                </HStack>
                <Progress
                  value={progress}
                  colorScheme={progress === 100 ? 'green' : 'blue'}
                  borderRadius="full"
                  size="md"
                  bg="whiteAlpha.200"
                />
              </Box>
            </VStack>
          </Box>

          {/* Completion Celebration Banner */}
          {progress === 100 && (
            <Box
              p={6}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="xl"
              textAlign="center"
            >
              <VStack spacing={3}>
                <Text fontSize="4xl">🎉</Text>
                <Heading size="md" color="white">
                  Congratulations! You've completed this learning path!
                </Heading>
                <Text color="whiteAlpha.800">
                  You've mastered all {currentRoadmap.weeks.reduce((acc, w) => acc + w.topics.length, 0)} topics. 
                  Keep learning and growing!
                </Text>
              </VStack>
            </Box>
          )}

          {/* Search and Filter Bar */}
          <Box
            p={4}
            bg="whiteAlpha.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="400px" flex="1">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    _focus={{ borderColor: 'brand.400', boxShadow: 'none' }}
                  />
                </InputGroup>
                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button
                    onClick={() => setFilter('all')}
                    colorScheme={filter === 'all' ? 'blue' : 'gray'}
                    variant={filter === 'all' ? 'solid' : 'outline'}
                  >
                    All ({getFilterCounts().all})
                  </Button>
                  <Button
                    onClick={() => setFilter('completed')}
                    colorScheme={filter === 'completed' ? 'green' : 'gray'}
                    variant={filter === 'completed' ? 'solid' : 'outline'}
                    leftIcon={<FaCheckCircle />}
                  >
                    Completed ({getFilterCounts().completed})
                  </Button>
                  <Button
                    onClick={() => setFilter('incomplete')}
                    colorScheme={filter === 'incomplete' ? 'orange' : 'gray'}
                    variant={filter === 'incomplete' ? 'solid' : 'outline'}
                  >
                    Incomplete ({getFilterCounts().incomplete})
                  </Button>
                  <Button
                    onClick={() => setFilter('bookmarked')}
                    colorScheme={filter === 'bookmarked' ? 'purple' : 'gray'}
                    variant={filter === 'bookmarked' ? 'solid' : 'outline'}
                    leftIcon={<FaBookmark />}
                  >
                    Bookmarked ({getFilterCounts().bookmarked})
                  </Button>
                </ButtonGroup>
              </HStack>
              {(searchQuery || filter !== 'all') && (
                <HStack>
                  <Text fontSize="sm" color="gray.400">
                    Showing filtered results
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Weeks Accordion */}
          <Accordion allowMultiple defaultIndex={[0]}>
            {currentRoadmap.weeks.map((week, weekIndex) => {
              const weekProgress = calculateWeekProgress(weekIndex);
              const filteredTopics = filterTopics(week.topics);
              
              // Skip weeks with no matching topics when filtering
              if (filteredTopics.length === 0 && (searchQuery || filter !== 'all')) {
                return null;
              }
              
              return (
                <AccordionItem
                  key={week.id}
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderRadius="xl"
                  mb={4}
                  overflow="hidden"
                >
                  <AccordionButton
                    p={5}
                    bg="whiteAlpha.50"
                    _hover={{ bg: 'whiteAlpha.100' }}
                  >
                    <HStack flex="1" spacing={4}>
                      <Box
                        bg={weekProgress === 100 ? 'green.500' : 'brand.500'}
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontWeight="bold"
                      >
                        Week {week.weekNumber}
                      </Box>
                      <VStack align="start" spacing={0} flex="1">
                        <Text fontWeight="semibold">{week.title}</Text>
                        <Text fontSize="sm" color="gray.400" noOfLines={1}>
                          {week.goals}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Progress
                          value={weekProgress}
                          colorScheme={weekProgress === 100 ? 'green' : 'blue'}
                          borderRadius="full"
                          size="sm"
                          w="100px"
                          bg="whiteAlpha.200"
                        />
                        <Text fontSize="sm" color="gray.400" w="45px">
                          {weekProgress}%
                        </Text>
                      </HStack>
                    </HStack>
                    <AccordionIcon ml={2} />
                  </AccordionButton>

                  <AccordionPanel pb={4} px={5}>
                    <VStack spacing={4} align="stretch">
                      {/* Week Description */}
                      {week.description && (
                        <Text color="gray.400" fontSize="sm">
                          {week.description}
                        </Text>
                      )}

                      {/* Topics List */}
                      <VStack spacing={3} align="stretch">
                        {filteredTopics.length === 0 ? (
                          <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                            No topics match your search
                          </Text>
                        ) : filteredTopics.map((topic, topicIndex) => (
                          <Box
                            key={topic.id}
                            p={4}
                            bg={topic.isCompleted ? 'green.900' : 'whiteAlpha.50'}
                            borderRadius="lg"
                            border="1px solid"
                            borderColor={topic.isBookmarked ? 'purple.500' : topic.isCompleted ? 'green.700' : 'whiteAlpha.100'}
                            opacity={updatingTopic === topic.id ? 0.7 : 1}
                            transition="all 0.3s ease"
                            cursor="pointer"
                            _hover={{ 
                              borderColor: 'brand.400',
                              transform: 'translateX(8px)',
                              boxShadow: 'lg',
                            }}
                            onClick={() => handleTopicClick(topic)}
                            style={{
                              animationDelay: `${topicIndex * 50}ms`,
                            }}
                          >
                            <HStack justify="space-between" align="start" spacing={4}>
                              <HStack align="start" spacing={3} flex="1">
                                <Checkbox
                                  isChecked={topic.isCompleted}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleTopicToggle(topic.id, topic.isCompleted);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  colorScheme="green"
                                  size="lg"
                                  mt={1}
                                  isDisabled={updatingTopic === topic.id}
                                />
                                <VStack align="start" spacing={2} flex="1">
                                  <HStack>
                                    <Text
                                      fontWeight="semibold"
                                      textDecoration={topic.isCompleted ? 'line-through' : 'none'}
                                    >
                                      {topic.name}
                                    </Text>
                                    {topic.isCompleted && (
                                      <Icon as={FaCheckCircle} color="green.400" />
                                    )}
                                    {topic.isBookmarked && (
                                      <Icon as={FaBookmark} color="purple.400" />
                                    )}
                                  </HStack>
                                  
                                  {topic.description && (
                                    <Text fontSize="sm" color="gray.400">
                                      {topic.description}
                                    </Text>
                                  )}

                                  <HStack spacing={4} color="gray.500" fontSize="sm">
                                    <HStack>
                                      <FaClock />
                                      <Text>{topic.estimatedHours}h</Text>
                                    </HStack>
                                    <Tooltip label={topic.whyThisFirst} hasArrow>
                                      <HStack cursor="help">
                                        <FaQuestionCircle />
                                        <Text>Why this order?</Text>
                                      </HStack>
                                    </Tooltip>
                                  </HStack>

                                  {/* Search Strings */}
                                  <Wrap spacing={2} pt={2}>
                                    {topic.searchStrings.map((search, i) => (
                                      <WrapItem key={i}>
                                        <Tag
                                          as="a"
                                          href={`https://www.google.com/search?q=${encodeURIComponent(search)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          size="sm"
                                          colorScheme="blue"
                                          cursor="pointer"
                                          _hover={{ opacity: 0.8 }}
                                        >
                                          <HStack spacing={1}>
                                            <FaSearch size={10} />
                                            <Text>{search}</Text>
                                          </HStack>
                                        </Tag>
                                      </WrapItem>
                                    ))}
                                  </Wrap>
                                </VStack>
                              </HStack>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>

                      {/* Quiz Button */}
                      {week.quizzes && week.quizzes.length > 0 ? (
                        <Button
                          variant="outline"
                          colorScheme="purple"
                          leftIcon={<FaQuestionCircle />}
                          onClick={() => handleTakeExistingQuiz(week.quizzes[0].id)}
                        >
                          {week.quizzes[0].score !== null
                            ? `Review Quiz (${week.quizzes[0].score}%)`
                            : 'Continue Quiz'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          colorScheme="purple"
                          leftIcon={<FaQuestionCircle />}
                          isDisabled={weekProgress < 100}
                          isLoading={generatingQuiz === week.id}
                          loadingText="Generating Quiz..."
                          onClick={() => handleGenerateQuiz(week.id)}
                        >
                          {weekProgress < 100
                            ? 'Complete all topics to unlock quiz'
                            : 'Take Week Quiz'}
                        </Button>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </VStack>
      </Container>

      {/* Topic Detail Modal */}
      <TopicDetailModal
        topic={selectedTopic}
        isOpen={isOpen}
        onClose={onClose}
        onMarkComplete={handleMarkTopicComplete}
        onUpdateTopic={updateTopic}
      />
    </Box>
  );
};

export default RoadmapPage;
