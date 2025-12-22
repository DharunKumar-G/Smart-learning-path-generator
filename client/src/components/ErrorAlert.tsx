import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
} from '@chakra-ui/react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorAlert = ({ title = 'Error', message, onRetry }: ErrorAlertProps) => {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="xl"
      py={6}
      bg="red.900"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <VStack spacing={2} mt={4}>
        <AlertTitle fontSize="lg">{title}</AlertTitle>
        <AlertDescription maxWidth="sm" color="gray.300">
          {message}
        </AlertDescription>
        {onRetry && (
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            mt={2}
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </VStack>
    </Alert>
  );
};

export default ErrorAlert;
