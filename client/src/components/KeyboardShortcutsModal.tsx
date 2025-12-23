import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Kbd,
  Divider,
  Box,
} from '@chakra-ui/react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Esc'], description: 'Close any modal or dialog' },
  { keys: ['Enter'], description: 'Mark topic as complete (in topic modal)' },
  { keys: ['?'], description: 'Show this help dialog' },
  { keys: ['g', 'd'], description: 'Go to Dashboard' },
  { keys: ['g', 'c'], description: 'Go to Create Roadmap' },
  { keys: ['g', 'h'], description: 'Go to Home' },
];

const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="gray.800">
        <ModalHeader>Keyboard Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={3}>
            {shortcuts.map((shortcut, index) => (
              <Box key={index}>
                <HStack justify="space-between">
                  <Text color="gray.300">{shortcut.description}</Text>
                  <HStack spacing={1}>
                    {shortcut.keys.map((key, keyIndex) => (
                      <HStack key={keyIndex} spacing={1}>
                        {keyIndex > 0 && <Text color="gray.500">then</Text>}
                        <Kbd
                          bg="gray.700"
                          borderColor="gray.600"
                          color="white"
                          px={2}
                        >
                          {key}
                        </Kbd>
                      </HStack>
                    ))}
                  </HStack>
                </HStack>
                {index < shortcuts.length - 1 && <Divider mt={3} borderColor="gray.700" />}
              </Box>
            ))}
          </VStack>
          <Text fontSize="sm" color="gray.500" mt={6} textAlign="center">
            Press <Kbd bg="gray.700" borderColor="gray.600" color="white">?</Kbd> anywhere to show this help
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default KeyboardShortcutsModal;
