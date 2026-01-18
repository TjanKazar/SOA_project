import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import App from '../../App.tsx';

describe('App', () => {
  it('renders navbar and footer', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/© 2024 FoodieExpress/i)).toBeInTheDocument();
  });

});