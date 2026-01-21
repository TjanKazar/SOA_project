import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuItemForm from '../MenuItemForm.jsx';

describe('MenuItemForm', () => {
  let mockOnSubmit;
  let mockOnCancel;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();
  });

  it('renders empty form for new item', () => {
    render(<MenuItemForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  it('renders pre-filled form for editing', () => {
    const menuItem = { name: 'Pizza', price: 10.50 };
    render(
      <MenuItemForm 
        menuItem={menuItem} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByDisplayValue('Pizza')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10.5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update item/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(<MenuItemForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText(/item name/i);
    const submitButton = screen.getByRole('button', { name: /add item/i });
    
    // HTML5 validation should prevent submission with empty name
    expect(nameInput).toBeRequired();
    
    // Try submitting with only price filled
    await user.type(screen.getByLabelText(/price/i), '10');
    await user.click(submitButton);
    
    // Form shouldn't submit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates price must be positive', async () => {
    const user = userEvent.setup();
    
    render(<MenuItemForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const priceInput = screen.getByLabelText(/price/i);
    
    // Check HTML5 validation attributes
    expect(priceInput).toBeRequired();
    expect(priceInput).toHaveAttribute('min', '0.01');
    expect(priceInput).toHaveAttribute('step', '0.01');
    
    await user.type(screen.getByLabelText(/item name/i), 'Burger');
    await user.type(priceInput, '10');
    await user.click(screen.getByRole('button', { name: /add item/i }));
    
    // Should submit with valid price
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Burger',
      price: 10,
    });
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();
    
    render(<MenuItemForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByLabelText(/item name/i), 'Pasta');
    await user.type(screen.getByLabelText(/price/i), '12.99');
    await user.click(screen.getByRole('button', { name: /add item/i }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Pasta',
      price: 12.99,
    });
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    
    render(<MenuItemForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
});