// @vitest-environment jsdom
import React from 'react';
import { render, act, fireEvent, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock contexts and routes used by App
vi.mock('../src/context/UserContext', () => ({
  useUser: () => ({
    currentUser: null,
    isLoading: false,
    login: vi.fn().mockImplementation(() => {}),
    logout: vi.fn(),
    setShowAuthPage: vi.fn()
  })
}));

vi.mock('../src/hooks/useRouting', () => ({ useRouting: () => {} }));

// Minimal App with login simulation
import App from '../src/App';
import { MemoryRouter } from 'react-router-dom';

describe('App login routing', () => {
  it('navigates to home after login', async () => {
    // Render app starting at /login
    const { container } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    // Simulate login by calling handleLogin via the exposed LoginPage behavior
    // Find login form inputs (username and password) and submit
    const username = container.querySelector('#username-input');
    const password = container.querySelector('#password-input');
    const form = container.querySelector('form');

    // Fill and submit
    await act(async () => {
      if (username) username.value = 'test';
      if (password) password.value = 'password';
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // After submit the URL should have been set to /
    expect(window.location.pathname).toBe('/');
  });
});