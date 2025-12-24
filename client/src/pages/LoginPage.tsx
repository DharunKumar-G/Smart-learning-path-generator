import { useState } from 'react';
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
  Checkbox,
  HStack,
  Divider,
  Center,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { login, googleSignIn } from '../services/auth';
import { useAuthStore } from '../stores/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      setAuth(response.user, response.token);
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response = await googleSignIn(credentialResponse.credential);
      setAuth(response.user, response.token);
      
      toast({
        title: 'Welcome!',
        description: 'You have successfully signed in with Google.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Google Sign In failed',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: 'Google Sign In failed',
      description: 'Could not sign in with Google. Please try again.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box minH="calc(100vh - 64px)" display="flex" alignItems="center">
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={2} textAlign="center">
            <Heading size="xl">Welcome Back</Heading>
            <Text color="gray.400">
              Sign in to continue your learning journey
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
                    placeholder="Enter your password"
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
              </FormControl>

              <HStack justify="space-between" w="full">
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  colorScheme="blue"
                >
                  <Text fontSize="sm" color="gray.400">Remember me</Text>
                </Checkbox>
                <Link color="brand.400" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                  Forgot password?
                </Link>
              </HStack>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>

              <HStack w="full">
                <Divider borderColor="whiteAlpha.300" />
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">or continue with</Text>
                <Divider borderColor="whiteAlpha.300" />
              </HStack>

              <Center w="full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text="signin_with"
                />
              </Center>
            </VStack>
          </Box>

          <Text color="gray.400">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="brand.400">
              Sign up for free
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;
