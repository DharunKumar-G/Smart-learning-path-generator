import { Box, Flex, Container, Button, HStack, Text, IconButton, useColorMode, useDisclosure, Tooltip } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaGraduationCap, FaKeyboard } from 'react-icons/fa';
import { useAuthStore } from '../stores/authStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Enable keyboard shortcuts
  useKeyboardShortcuts({ onShowHelp: onOpen });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Navigation */}
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg="rgba(26, 32, 44, 0.8)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
      >
        <Container maxW="container.xl">
          <Flex h="16" alignItems="center" justifyContent="space-between">
            {/* Logo */}
            <HStack
              as={RouterLink}
              to="/"
              spacing={2}
              _hover={{ textDecoration: 'none', opacity: 0.8 }}
            >
              <FaGraduationCap size={28} color="#0080e6" />
              <Text fontSize="xl" fontWeight="bold" color="white">
                LearnPath AI
              </Text>
            </HStack>

            {/* Right side */}
            <HStack spacing={4}>
              <Tooltip label="Keyboard shortcuts (?)" hasArrow>
                <IconButton
                  aria-label="Keyboard shortcuts"
                  icon={<FaKeyboard />}
                  onClick={onOpen}
                  variant="ghost"
                  color="white"
                  size="sm"
                />
              </Tooltip>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
                onClick={toggleColorMode}
                variant="ghost"
                color="white"
              />

              {isAuthenticated ? (
                <>
                  <Text color="gray.300" display={{ base: 'none', md: 'block' }}>
                    Hi, {user?.name || user?.email?.split('@')[0]}!
                  </Text>
                  <Button
                    as={RouterLink}
                    to="/dashboard"
                    variant="ghost"
                    color="white"
                    size="sm"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    colorScheme="red"
                    size="sm"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    as={RouterLink}
                    to="/login"
                    variant="ghost"
                    color="white"
                    size="sm"
                  >
                    Login
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/register"
                    colorScheme="blue"
                    size="sm"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main content */}
      <Box pt="16" flex="1">
        {children}
      </Box>

      {/* Footer */}
      <Footer />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Layout;
