import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Badge,
  Progress,
  Spinner,
  Center,
  Icon,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaPlus, FaRoad, FaClock, FaCalendarWeek, FaTrash, FaSearch, FaSort, FaFire, FaCheckCircle, FaBook, FaTrophy, FaBookmark } from 'react-icons/fa';
import { useRoadmapStore } from '../stores/roadmapStore';
import { useAuthStore } from '../stores/authStore';
import { getRoadmaps, deleteRoadmap } from '../services/roadmap';

const DashboardPage = () => {
  const { roadmaps, isLoading, setRoadmaps, setLoading } = useRoadmapStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      setLoading(true);
      try {
        const data = await getRoadmaps();
        setRoadmaps(data.roadmaps);
      } catch (error) {
        console.error('Failed to fetch roadmaps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [setRoadmaps, setLoading]);

  // Delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [roadmapToDelete, setRoadmapToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDeleteClick = (roadmapId: string) => {
    setRoadmapToDelete(roadmapId);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!roadmapToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteRoadmap(roadmapToDelete);
      setRoadmaps(roadmaps.filter((r) => r.id !== roadmapToDelete));
      toast({
        title: 'Roadmap deleted',
        description: 'Your learning path has been removed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setRoadmapToDelete(null);
      onClose();
    }
  };

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress' | 'name'>('newest');

  // Calculate progress for a roadmap
  const calculateProgress = (roadmap: typeof roadmaps[0]) => {
    const totalTopics = roadmap.weeks.reduce(
      (acc, week) => acc + week.topics.length,
      0
    );
    const completedTopics = roadmap.weeks.reduce(
      (acc, week) => acc + week.topics.filter((t) => t.isCompleted).length,
      0
    );
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  // Filter roadmaps based on search and status
  const filteredRoadmaps = useMemo(() => {
    let result = roadmaps.filter((roadmap) => {
      const matchesSearch = roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roadmap.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roadmap.targetGoal.toLowerCase().includes(searchQuery.toLowerCase());
      
      const progress = calculateProgress(roadmap);
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'completed' && progress === 100) ||
        (statusFilter === 'in-progress' && progress < 100);
      
      return matchesSearch && matchesStatus;
    });

    // Sort results
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'progress':
          return calculateProgress(b) - calculateProgress(a);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [roadmaps, searchQuery, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <Box py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            {/* Header Skeleton */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={2}>
                <Skeleton height="32px" width="250px" />
                <Skeleton height="20px" width="180px" />
              </VStack>
              <Skeleton height="40px" width="150px" borderRadius="md" />
            </HStack>

            {/* Stats Skeleton */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                  <CardBody py={4}>
                    <HStack spacing={3}>
                      <SkeletonCircle size="10" />
                      <VStack align="start" spacing={1}>
                        <Skeleton height="14px" width="60px" />
                        <Skeleton height="24px" width="40px" />
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            {/* Cards Skeleton */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[1, 2, 3].map((i) => (
                <Card key={i} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Skeleton height="24px" width="80px" borderRadius="md" />
                        <Skeleton height="16px" width="60px" />
                      </HStack>
                      <Skeleton height="24px" width="80%" />
                      <SkeletonText noOfLines={2} spacing={2} />
                      <HStack spacing={4}>
                        <Skeleton height="16px" width="70px" />
                        <Skeleton height="16px" width="70px" />
                      </HStack>
                      <Skeleton height="8px" borderRadius="full" />
                    </VStack>
                  </CardBody>
                  <CardFooter pt={0}>
                    <Skeleton height="40px" width="100%" borderRadius="md" />
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Heading size="lg">
                {user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'My Learning Paths'}
              </Heading>
              <Text color="gray.400">
                {roadmaps.length === 0 
                  ? 'Start your learning journey today'
                  : `You have ${roadmaps.length} learning path${roadmaps.length !== 1 ? 's' : ''} • ${roadmaps.filter(r => calculateProgress(r) === 100).length} completed`
                }
              </Text>
            </VStack>
            <Button
              as={RouterLink}
              to="/create"
              colorScheme="blue"
              leftIcon={<FaPlus />}
            >
              Create New Path
            </Button>
          </HStack>

          {/* Quick Stats */}
          {roadmaps.length > 0 && (
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
              <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                <CardBody py={4}>
                  <HStack spacing={3}>
                    <Icon as={FaBook} boxSize={6} color="blue.400" />
                    <Stat size="sm">
                      <StatLabel color="gray.400">Total Paths</StatLabel>
                      <StatNumber>{roadmaps.length}</StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>
              <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                <CardBody py={4}>
                  <HStack spacing={3}>
                    <Icon as={FaCheckCircle} boxSize={6} color="green.400" />
                    <Stat size="sm">
                      <StatLabel color="gray.400">Topics Done</StatLabel>
                      <StatNumber>
                        {roadmaps.reduce((acc, r) => acc + r.weeks.reduce((a, w) => a + w.topics.filter(t => t.isCompleted).length, 0), 0)}
                      </StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>
              <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                <CardBody py={4}>
                  <HStack spacing={3}>
                    <Icon as={FaClock} boxSize={6} color="purple.400" />
                    <Stat size="sm">
                      <StatLabel color="gray.400">Hours Learned</StatLabel>
                      <StatNumber>
                        {roadmaps.reduce((acc, r) => acc + r.weeks.reduce((a, w) => a + w.topics.filter(t => t.isCompleted).reduce((h, t) => h + t.estimatedHours, 0), 0), 0).toFixed(0)}
                      </StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>
              <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                <CardBody py={4}>
                  <HStack spacing={3}>
                    <Icon as={FaBookmark} boxSize={6} color="orange.400" />
                    <Stat size="sm">
                      <StatLabel color="gray.400">Bookmarked</StatLabel>
                      <StatNumber>
                        {roadmaps.reduce((acc, r) => acc + r.weeks.reduce((a, w) => a + w.topics.filter(t => t.isBookmarked).length, 0), 0)}
                      </StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>
              <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                <CardBody py={4}>
                  <HStack spacing={3}>
                    <Icon as={FaTrophy} boxSize={6} color="yellow.400" />
                    <Stat size="sm">
                      <StatLabel color="gray.400">Completed</StatLabel>
                      <StatNumber>{roadmaps.filter(r => calculateProgress(r) === 100).length}</StatNumber>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Search and Filter */}
          {roadmaps.length > 0 && (
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search roadmaps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                />
              </InputGroup>
              <Select
                maxW="180px"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <option value="all">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
              <Select
                maxW="150px"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                icon={<FaSort />}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="progress">By Progress</option>
                <option value="name">By Name</option>
              </Select>
              {(searchQuery || statusFilter !== 'all') && (
                <Text fontSize="sm" color="gray.400">
                  Showing {filteredRoadmaps.length} of {roadmaps.length} paths
                </Text>
              )}
            </HStack>
          )}

          {/* Roadmaps Grid */}
          {roadmaps.length === 0 ? (
            <Center
              py={20}
              bg="whiteAlpha.50"
              borderRadius="xl"
              border="2px dashed"
              borderColor="whiteAlpha.200"
            >
              <VStack spacing={4}>
                <Icon as={FaRoad} boxSize={16} color="gray.500" />
                <Heading size="md" color="gray.400">
                  No learning paths yet
                </Heading>
                <Text color="gray.500">
                  Create your first AI-powered learning path to get started
                </Text>
                <Button
                  as={RouterLink}
                  to="/create"
                  colorScheme="blue"
                  leftIcon={<FaPlus />}
                >
                  Create Your First Path
                </Button>
              </VStack>
            </Center>
          ) : filteredRoadmaps.length === 0 ? (
            <Center
              py={16}
              bg="whiteAlpha.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <VStack spacing={3}>
                <Icon as={FaSearch} boxSize={10} color="gray.500" />
                <Text color="gray.400">No matching roadmaps found</Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredRoadmaps.map((roadmap) => {
                const progress = calculateProgress(roadmap);
                // Get the most recent activity (last completed topic)
                const lastActivity = roadmap.weeks
                  .flatMap(w => w.topics)
                  .filter(t => t.completedAt)
                  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
                
                const getTimeAgo = (date: string) => {
                  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
                  if (seconds < 60) return 'just now';
                  const minutes = Math.floor(seconds / 60);
                  if (minutes < 60) return `${minutes}m ago`;
                  const hours = Math.floor(minutes / 60);
                  if (hours < 24) return `${hours}h ago`;
                  const days = Math.floor(hours / 24);
                  if (days < 7) return `${days}d ago`;
                  return new Date(date).toLocaleDateString();
                };
                
                return (
                  <Card
                    key={roadmap.id}
                    bg="whiteAlpha.50"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    _hover={{
                      borderColor: 'brand.500',
                      transform: 'translateY(-4px)',
                      boxShadow: 'xl',
                    }}
                    transition="all 0.3s"
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                          <Badge
                            colorScheme={progress === 100 ? 'green' : 'blue'}
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {progress === 100 ? 'Completed' : 'In Progress'}
                          </Badge>
                          <HStack spacing={2}>
                            <Text fontSize="sm" color="gray.400">
                              {new Date(roadmap.createdAt).toLocaleDateString()}
                            </Text>
                            <IconButton
                              aria-label="Delete roadmap"
                              icon={<FaTrash />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteClick(roadmap.id);
                              }}
                            />
                          </HStack>
                        </HStack>

                        <Heading size="md" noOfLines={2}>
                          {roadmap.title}
                        </Heading>

                        <Text color="gray.400" fontSize="sm" noOfLines={2}>
                          {roadmap.description}
                        </Text>

                        <HStack spacing={4} color="gray.400" fontSize="sm">
                          <HStack>
                            <FaCalendarWeek />
                            <Text>{roadmap.totalWeeks} weeks</Text>
                          </HStack>
                          <HStack>
                            <FaClock />
                            <Text>{roadmap.hoursPerWeek}h/week</Text>
                          </HStack>
                        </HStack>

                        {/* Last Activity */}
                        {lastActivity && (
                          <Text fontSize="xs" color="gray.500">
                            🔥 Last activity: {getTimeAgo(lastActivity.completedAt!)}
                          </Text>
                        )}

                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.400">
                              Progress
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="brand.400">
                              {progress}%
                            </Text>
                          </HStack>
                          <Tooltip
                            label={`${roadmap.weeks.reduce((acc, w) => acc + w.topics.filter(t => t.isCompleted).length, 0)} of ${roadmap.weeks.reduce((acc, w) => acc + w.topics.length, 0)} topics completed`}
                            hasArrow
                            placement="top"
                          >
                            <Progress
                              value={progress}
                              colorScheme={progress === 100 ? 'green' : 'blue'}
                              borderRadius="full"
                              size="sm"
                              bg="whiteAlpha.200"
                            />
                          </Tooltip>
                        </Box>
                      </VStack>
                    </CardBody>
                    <CardFooter pt={0}>
                      <Button
                        as={RouterLink}
                        to={`/roadmap/${roadmap.id}`}
                        w="full"
                        variant="outline"
                        colorScheme="blue"
                      >
                        Continue Learning
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </VStack>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Learning Path
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this learning path? This action cannot be undone.
                All your progress will be lost.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteConfirm}
                  ml={3}
                  isLoading={isDeleting}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default DashboardPage;
