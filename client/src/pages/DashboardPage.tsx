import { useEffect, useState, useRef } from 'react';
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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaPlus, FaRoad, FaClock, FaCalendarWeek, FaTrash } from 'react-icons/fa';
import { useRoadmapStore } from '../stores/roadmapStore';
import { getRoadmaps, deleteRoadmap } from '../services/roadmap';

const DashboardPage = () => {
  const { roadmaps, isLoading, setRoadmaps, setLoading } = useRoadmapStore();

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

  if (isLoading) {
    return (
      <Center minH="calc(100vh - 64px)">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Heading size="lg">My Learning Paths</Heading>
              <Text color="gray.400">
                Track your progress and continue learning
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
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {roadmaps.map((roadmap) => {
                const progress = calculateProgress(roadmap);
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

                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.400">
                              Progress
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="brand.400">
                              {progress}%
                            </Text>
                          </HStack>
                          <Progress
                            value={progress}
                            colorScheme="blue"
                            borderRadius="full"
                            size="sm"
                            bg="whiteAlpha.200"
                          />
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
