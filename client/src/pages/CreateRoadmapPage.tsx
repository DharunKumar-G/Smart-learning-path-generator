import { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  HStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaBrain, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { generateRoadmap } from '../services/roadmap';
import { useRoadmapStore } from '../stores/roadmapStore';

const MotionBox = motion(Box);

const CreateRoadmapPage = () => {
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [totalWeeks, setTotalWeeks] = useState(8);
  
  const { isGenerating, setGenerating, addRoadmap } = useRoadmapStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentSkills.length < 10) {
      toast({
        title: 'Please describe your current skills in more detail',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (targetGoal.length < 10) {
      toast({
        title: 'Please describe your target goal in more detail',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setGenerating(true);

    try {
      const response = await generateRoadmap({
        currentSkills,
        targetGoal,
        hoursPerWeek,
        totalWeeks,
      });

      addRoadmap(response.roadmap);

      toast({
        title: '🎉 Learning path created!',
        description: 'Your personalized roadmap is ready.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate(`/roadmap/${response.roadmap.id}`);
    } catch (error: any) {
      toast({
        title: 'Failed to generate roadmap',
        description: error.response?.data?.error || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box py={8}>
      <Container maxW="container.lg">
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Heading size="xl">Create Your Learning Path</Heading>
            <Text color="gray.400" maxW="lg">
              Tell our AI about your current skills and goals, and we'll generate a
              personalized week-by-week learning roadmap for you.
            </Text>
          </VStack>

          {/* Form */}
          <MotionBox
            as="form"
            onSubmit={handleSubmit}
            w="full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} align="stretch">
              {/* Current Skills */}
              <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                <CardBody>
                  <HStack spacing={3} mb={4}>
                    <Icon as={FaBrain} color="brand.400" boxSize={6} />
                    <Heading size="md">What do you already know?</Heading>
                  </HStack>
                  <FormControl isRequired>
                    <FormLabel color="gray.400">Current Skills & Experience</FormLabel>
                    <Textarea
                      value={currentSkills}
                      onChange={(e) => setCurrentSkills(e.target.value)}
                      placeholder="Example: I know basic HTML and CSS, and I've built a few simple static websites. I understand what JavaScript is but haven't really used it much beyond simple DOM manipulation."
                      rows={4}
                      resize="vertical"
                    />
                  </FormControl>
                </CardBody>
              </Card>

              {/* Target Goal */}
              <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                <CardBody>
                  <HStack spacing={3} mb={4}>
                    <Icon as={FaRocket} color="accent.400" boxSize={6} />
                    <Heading size="md">What do you want to achieve?</Heading>
                  </HStack>
                  <FormControl isRequired>
                    <FormLabel color="gray.400">Target Goal</FormLabel>
                    <Textarea
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value)}
                      placeholder="Example: I want to become a full-stack React developer. I want to be able to build complete web applications with a React frontend, Node.js backend, and deploy them to production."
                      rows={4}
                      resize="vertical"
                    />
                  </FormControl>
                </CardBody>
              </Card>

              {/* Time Commitment */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                  <CardBody>
                    <HStack spacing={3} mb={4}>
                      <Icon as={FaClock} color="yellow.400" boxSize={6} />
                      <Heading size="md">Hours per week</Heading>
                    </HStack>
                    <FormControl isRequired>
                      <FormLabel color="gray.400">
                        How many hours can you dedicate weekly?
                      </FormLabel>
                      <NumberInput
                        value={hoursPerWeek}
                        onChange={(_, value) => setHoursPerWeek(value || 10)}
                        min={1}
                        max={60}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </CardBody>
                </Card>

                <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
                  <CardBody>
                    <HStack spacing={3} mb={4}>
                      <Icon as={FaCalendarAlt} color="purple.400" boxSize={6} />
                      <Heading size="md">Total weeks</Heading>
                    </HStack>
                    <FormControl isRequired>
                      <FormLabel color="gray.400">
                        How long is your learning journey?
                      </FormLabel>
                      <NumberInput
                        value={totalWeeks}
                        onChange={(_, value) => setTotalWeeks(value || 8)}
                        min={1}
                        max={52}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* AI Info */}
              <Alert status="info" borderRadius="lg" bg="blue.900" color="white">
                <AlertIcon color="blue.300" />
                <Text>
                  Our AI will analyze your inputs and create a structured learning path
                  with topics ordered by prerequisites, estimated time for each topic,
                  and smart search queries to find the best resources.
                </Text>
              </Alert>

              {/* Submit Button */}
              <VStack spacing={2}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isGenerating}
                  loadingText="AI is generating your roadmap..."
                  leftIcon={<FaRocket />}
                >
                  Generate My Learning Path
                </Button>
                {isGenerating && (
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    ✨ This usually takes 15-30 seconds. Our AI is crafting your personalized path...
                  </Text>
                )}
              </VStack>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateRoadmapPage;
