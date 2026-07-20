import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import './mocks/firebase'; // Registra os mocks do Firebase globalmente para todos os testes

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
