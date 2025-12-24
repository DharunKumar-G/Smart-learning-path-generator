import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Progress,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { register } from '../services/auth';
import { useAuthStore } from '../stores/authStore';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'gray' };
    let score = 0;
    if (password.length >= 6) score += 20;
    if (password.length >= 8) score += 20;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    
    if (score <= 20) return { score, label: 'Weak', color: 'red' };
    if (score <= 40) return { score, label: 'Fair', color: 'orange' };
    if (score <= 60) return { score, label: 'Good', color: 'yellow' };
    if (score <= 80) return { score, label: 'Strong', color: 'green' };
    return { score, label: 'Very Strong', color: 'green' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({ email, password, name: name || undefined });
      setAuth(response.user, response.token);
      
      toast({
        title: 'Account created!',
        description: 'Welcome to LearnPath AI. Let\'s create your first learning path!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/create');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="calc(100vh - 64px)" display="flex" alignItems="center" py={8}>
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={2} textAlign="center">
            <Heading size="xl">Create Your Account</Heading>
            <Text color="gray.400">
              Start your personalized learning journey today
            </Text>
          </VStack>

          <Box
            as="form"
            onSubmit={handleSubmit}
            w="full"
            p={8}
            bg="whiteAlpha.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <VStack spacing={5}>
              <FormControl>
                <FormLabel>Name (optional)</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                {password && (
                  <Box mt={2}>
                    <Progress
                      value={passwordStrength.score}
                      size="xs"
                      colorScheme={passwordStrength.color}
                      borderRadius="full"
                    />
                    <HStack justify="space-between" mt={1}>
                      <Text fontSize="xs" color={`${passwordStrength.color}.400`}>
                        {passwordStrength.label}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {password.length < 6 ? `${6 - password.length} more chars needed` : '✓ Min length met'}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  size="lg"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Create Account
              </Button>
            </VStack>
          </Box>

          <Text color="gray.400">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="brand.400">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default RegisterPage;
