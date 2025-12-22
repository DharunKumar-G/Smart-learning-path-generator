import { Center, Spinner, VStack, Text } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = 'Loading...' }: LoadingSpinnerProps) => {
  return (
    <Center minH="200px">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.700"
          color="brand.500"
          size="xl"
        />
        <Text color="gray.400" fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Center>
  );
};

export default LoadingSpinner;
