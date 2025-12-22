import { useEffect } from 'react';
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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaPlus, FaRoad, FaClock, FaCalendarWeek } from 'react-icons/fa';
import { useRoadmapStore } from '../stores/roadmapStore';
import { getRoadmaps } from '../services/roadmap';

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
                          <Text fontSize="sm" color="gray.400">
                            {new Date(roadmap.createdAt).toLocaleDateString()}
                          </Text>
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
      </Container>
    </Box>
  );
};

export default DashboardPage;
