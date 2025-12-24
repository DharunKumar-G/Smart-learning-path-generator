import {
  Box,
  Container,
  HStack,
  VStack,
  Text,
  Link,
  Icon,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart, FaGraduationCap } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      as="footer"
      bg="blackAlpha.400"
      borderTop="1px solid"
      borderColor="whiteAlpha.100"
      mt="auto"
    >
      <Container maxW="container.xl" py={10}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {/* Brand */}
          <VStack align={{ base: 'center', md: 'start' }} spacing={3}>
            <HStack spacing={2}>
              <Icon as={FaGraduationCap} boxSize={6} color="brand.400" />
              <Text fontWeight="bold" fontSize="lg">LearnPath AI</Text>
            </HStack>
            <Text color="gray.500" fontSize="sm" textAlign={{ base: 'center', md: 'left' }}>
              AI-powered personalized learning paths to accelerate your growth.
            </Text>
          </VStack>

          {/* Quick Links */}
          <VStack align={{ base: 'center', md: 'start' }} spacing={3}>
            <Text fontWeight="semibold" color="gray.300">Quick Links</Text>
            <Link as={RouterLink} to="/" color="gray.500" fontSize="sm" _hover={{ color: 'brand.400' }}>
              Home
            </Link>
            <Link as={RouterLink} to="/dashboard" color="gray.500" fontSize="sm" _hover={{ color: 'brand.400' }}>
              Dashboard
            </Link>
            <Link as={RouterLink} to="/create" color="gray.500" fontSize="sm" _hover={{ color: 'brand.400' }}>
              Create Roadmap
            </Link>
          </VStack>

          {/* Social Links */}
          <VStack align={{ base: 'center', md: 'start' }} spacing={3}>
            <Text fontWeight="semibold" color="gray.300">Connect</Text>
            <HStack spacing={4}>
              <Link href="https://github.com/DharunKumar-G" isExternal>
                <Icon
                  as={FaGithub}
                  boxSize={5}
                  color="gray.500"
                  _hover={{ color: 'white', transform: 'scale(1.2)' }}
                  transition="all 0.2s"
                />
              </Link>
              <Link href="https://twitter.com" isExternal>
                <Icon
                  as={FaTwitter}
                  boxSize={5}
                  color="gray.500"
                  _hover={{ color: 'twitter.400', transform: 'scale(1.2)' }}
                  transition="all 0.2s"
                />
              </Link>
              <Link href="https://linkedin.com" isExternal>
                <Icon
                  as={FaLinkedin}
                  boxSize={5}
                  color="gray.500"
                  _hover={{ color: 'linkedin.400', transform: 'scale(1.2)' }}
                  transition="all 0.2s"
                />
              </Link>
            </HStack>
          </VStack>
        </SimpleGrid>

        <Divider my={6} borderColor="whiteAlpha.100" />

        <HStack justify="center" spacing={1} color="gray.500" fontSize="sm">
          <Text>© {currentYear} LearnPath AI. Made with</Text>
          <Icon as={FaHeart} color="red.400" />
          <Text>by Dharun Kumar</Text>
        </HStack>
      </Container>
    </Box>
  );
};

export default Footer;
