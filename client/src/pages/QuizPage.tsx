import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Radio,
  RadioGroup,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Divider,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaRedo, FaArrowLeft, FaTrophy } from 'react-icons/fa';
import { getQuiz, submitQuiz, resetQuiz } from '../services/quiz';
import type { Quiz, QuizAnswer, QuizResult } from '../types';

const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const correctBg = useColorModeValue('green.50', 'green.900');
  const incorrectBg = useColorModeValue('red.50', 'red.900');

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      
      try {
        const data = await getQuiz(quizId);
        setQuiz(data.quiz);
        
        // If quiz was already attempted, show results
        if (data.quiz.score !== null && data.quiz.score !== undefined) {
          setScore(data.quiz.score);
          // Reconstruct results from questions
          const existingResults: QuizResult[] = data.quiz.questions.map(q => ({
            questionId: q.id,
            correct: q.userAnswer === q.correctIndex,
            correctIndex: q.correctIndex,
            userAnswer: q.userAnswer ?? -1,
            explanation: q.explanation,
          }));
          setResults(existingResults);
          
          // Pre-fill answers
          const existingAnswers: Record<string, number> = {};
          data.quiz.questions.forEach(q => {
            if (q.userAnswer !== null && q.userAnswer !== undefined) {
              existingAnswers[q.id] = q.userAnswer;
            }
          });
          setAnswers(existingAnswers);
        }
      } catch (error) {
        toast({
          title: 'Error loading quiz',
          description: 'Could not load the quiz. Please try again.',
          status: 'error',
          duration: 5000,
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate, toast]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value, 10),
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    const unanswered = quiz.questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      toast({
        title: 'Incomplete quiz',
        description: `Please answer all questions. ${unanswered.length} remaining.`,
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setSubmitting(true);
    try {
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));

      const response = await submitQuiz(quiz.id, quizAnswers);
      setScore(response.score);
      setResults(response.results);
      
      toast({
        title: 'Quiz submitted!',
        description: `You scored ${response.score}% (${response.correctCount}/${response.totalQuestions})`,
        status: response.score >= 70 ? 'success' : 'info',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Could not submit quiz. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!quiz) return;
    
    try {
      await resetQuiz(quiz.id);
      setAnswers({});
      setResults(null);
      setScore(null);
      
      // Refetch quiz
      const data = await getQuiz(quiz.id);
      setQuiz(data.quiz);
      
      toast({
        title: 'Quiz reset',
        description: 'You can now retake the quiz.',
        status: 'info',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: 'Could not reset quiz. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getResultForQuestion = (questionId: string): QuizResult | undefined => {
    return results?.find(r => r.questionId === questionId);
  };

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text>Loading quiz...</Text>
        </VStack>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Quiz not found</AlertTitle>
          <AlertDescription>
            The quiz you're looking for doesn't exist.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              Back to Roadmap
            </Button>
            <Heading size="lg">Quiz</Heading>
            <Text color="gray.600">Test your knowledge for this week</Text>
          </VStack>
          
          {score !== null && (
            <VStack align="end">
              <Badge
                colorScheme={score >= 70 ? 'green' : score >= 50 ? 'yellow' : 'red'}
                fontSize="xl"
                px={4}
                py={2}
                borderRadius="full"
              >
                <HStack>
                  <Icon as={FaTrophy} />
                  <Text>{score}%</Text>
                </HStack>
              </Badge>
              <Button
                size="sm"
                leftIcon={<FaRedo />}
                onClick={handleReset}
                variant="outline"
              >
                Retake Quiz
              </Button>
            </VStack>
          )}
        </HStack>

        {/* Progress bar (only show when not submitted) */}
        {score === null && (
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                Progress
              </Text>
              <Text fontSize="sm" color="gray.600">
                {answeredCount}/{totalQuestions} answered
              </Text>
            </HStack>
            <Progress
              value={progress}
              colorScheme="brand"
              borderRadius="full"
              size="sm"
            />
          </Box>
        )}

        <Divider />

        {/* Questions */}
        <VStack spacing={6} align="stretch">
          {quiz.questions.map((question, index) => {
            const result = getResultForQuestion(question.id);
            const isReviewing = results !== null;
            
            return (
              <Card
                key={question.id}
                bg={
                  isReviewing
                    ? result?.correct
                      ? correctBg
                      : incorrectBg
                    : cardBg
                }
                borderWidth={1}
                borderColor={
                  isReviewing
                    ? result?.correct
                      ? 'green.300'
                      : 'red.300'
                    : 'gray.200'
                }
              >
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <Badge colorScheme="brand">Question {index + 1}</Badge>
                    {isReviewing && (
                      <Icon
                        as={result?.correct ? FaCheck : FaTimes}
                        color={result?.correct ? 'green.500' : 'red.500'}
                        boxSize={5}
                      />
                    )}
                  </HStack>
                  <Text fontWeight="semibold" mt={2} fontSize="lg">
                    {question.question}
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <RadioGroup
                    value={answers[question.id]?.toString() || ''}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                    isDisabled={isReviewing}
                  >
                    <VStack align="stretch" spacing={3}>
                      {question.options.map((option, optIndex) => {
                        const isCorrect = optIndex === question.correctIndex;
                        const isUserAnswer = result?.userAnswer === optIndex;
                        
                        return (
                          <Box
                            key={optIndex}
                            p={3}
                            borderRadius="md"
                            borderWidth={1}
                            borderColor={
                              isReviewing
                                ? isCorrect
                                  ? 'green.400'
                                  : isUserAnswer
                                  ? 'red.400'
                                  : 'gray.200'
                                : answers[question.id] === optIndex
                                ? 'brand.400'
                                : 'gray.200'
                            }
                            bg={
                              isReviewing && isCorrect
                                ? 'green.100'
                                : isReviewing && isUserAnswer && !isCorrect
                                ? 'red.100'
                                : 'transparent'
                            }
                          >
                            <Radio
                              value={optIndex.toString()}
                              colorScheme="brand"
                            >
                              <HStack>
                                <Text>{option}</Text>
                                {isReviewing && isCorrect && (
                                  <Badge colorScheme="green" size="sm">
                                    Correct
                                  </Badge>
                                )}
                              </HStack>
                            </Radio>
                          </Box>
                        );
                      })}
                    </VStack>
                  </RadioGroup>

                  {/* Show explanation after submission */}
                  {isReviewing && question.explanation && (
                    <Alert status="info" mt={4} borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Explanation</AlertTitle>
                        <AlertDescription>
                          {question.explanation}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </VStack>

        {/* Submit button */}
        {score === null && (
          <Button
            colorScheme="brand"
            size="lg"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText="Submitting..."
            isDisabled={answeredCount < totalQuestions}
          >
            Submit Quiz
          </Button>
        )}

        {/* Results summary */}
        {score !== null && results && (
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md">Quiz Complete!</Heading>
                <HStack spacing={8}>
                  <VStack>
                    <Text fontSize="4xl" fontWeight="bold" color="brand.500">
                      {score}%
                    </Text>
                    <Text color="gray.600">Score</Text>
                  </VStack>
                  <VStack>
                    <Text fontSize="4xl" fontWeight="bold" color="green.500">
                      {results.filter(r => r.correct).length}
                    </Text>
                    <Text color="gray.600">Correct</Text>
                  </VStack>
                  <VStack>
                    <Text fontSize="4xl" fontWeight="bold" color="red.500">
                      {results.filter(r => !r.correct).length}
                    </Text>
                    <Text color="gray.600">Incorrect</Text>
                  </VStack>
                </HStack>
                <HStack spacing={4} pt={4}>
                  <Button
                    leftIcon={<FaRedo />}
                    onClick={handleReset}
                    variant="outline"
                  >
                    Retake Quiz
                  </Button>
                  <Button
                    leftIcon={<FaArrowLeft />}
                    colorScheme="brand"
                    onClick={() => navigate(-1)}
                  >
                    Back to Roadmap
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default QuizPage;
