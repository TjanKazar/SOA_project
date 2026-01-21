import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getRestaurants,
  createRestaurant,
  addMenuItem,
  deleteRestaurant,
} from '../api.jsx';

// Mock fetch globally
global.fetch = vi.fn(); 

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRestaurants', () => {
    it('fetches all restaurants successfully', async () => {
      const mockData = [
        { _id: '1', name: 'Pizza Place', status: 'open' },
        { _id: '2', name: 'Burger Joint', status: 'closed' },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getRestaurants();

      expect(fetch).toHaveBeenCalledWith('https://rirs-backend-1pv7.onrender.com/restaurants');
      expect(result).toEqual(mockData);
    });

    it('throws error on failed request', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      await expect(getRestaurants()).rejects.toThrow('Server error');
    });
  });

  describe('createRestaurant', () => {
    it('creates a restaurant successfully', async () => {
      const newRestaurant = { name: 'New Place' };
      const mockResponse = { _id: '123', name: 'New Place', status: 'closed' };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await createRestaurant(newRestaurant);

      expect(fetch).toHaveBeenCalledWith('https://rirs-backend-1pv7.onrender.com/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRestaurant),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addMenuItem', () => {
    it('adds menu item successfully', async () => {
      const restaurantId = '123';
      const menuItem = { name: 'Pizza', price: 10 };
      const mockResponse = { id: 'item1', ...menuItem };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await addMenuItem(restaurantId, menuItem);

      expect(fetch).toHaveBeenCalledWith(
        `https://rirs-backend-1pv7.onrender.com/restaurants/${restaurantId}/menu`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuItem),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteRestaurant', () => {
    it('handles 204 No Content response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await deleteRestaurant('123');

      expect(result).toBeNull();
    });
  });
});