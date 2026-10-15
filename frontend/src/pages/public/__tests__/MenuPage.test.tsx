import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuPage from '../MenuPage';
import { CartProvider } from '../../../features/public/cart/CartContext';
import publicMenuService from '../../../services/publicMenuService';
import type { PublicMenuResponse } from '../../../types/publicMenu';

const mockMenuResponse: PublicMenuResponse = {
  categories: [
    {
      id: 1,
      name: 'Thali Feasts',
      displayOrder: 1,
      items: [
        {
          id: 101,
          name: 'Special Mahalaxmi Thali',
          price: 350,
          categoryId: 1,
          categoryName: 'Thali Feasts',
          isVeg: false,
          available: true,
          displayOrder: 1,
          description: 'Mutton masala, chicken sukka, tambda & pandhra rassa',
        },
        {
          id: 102,
          name: 'Special Veg Thali',
          price: 170,
          categoryId: 1,
          categoryName: 'Thali Feasts',
          isVeg: true,
          available: true,
          displayOrder: 2,
          description: 'Seasonal vegetables, dal tadka, jowar bhakri, and rice',
        },
      ],
    },
    {
      id: 2,
      name: 'Kolhapuri Chicken',
      displayOrder: 2,
      items: [
        {
          id: 201,
          name: 'Chicken Sukka',
          price: 210,
          categoryId: 2,
          categoryName: 'Kolhapuri Chicken',
          isVeg: false,
          available: true,
          displayOrder: 1,
        },
        {
          id: 202,
          name: 'Chicken Handi Full',
          price: 580,
          categoryId: 2,
          categoryName: 'Kolhapuri Chicken',
          isVeg: false,
          available: false,
          displayOrder: 2,
        },
      ],
    },
  ],
};

describe('MenuPage Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  const renderMenuPage = (initialEntries = ['/menu']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <CartProvider>
          <MenuPage />
        </CartProvider>
      </MemoryRouter>
    );
  };

  it('renders loading state initially and then displays menu items', async () => {
    vi.spyOn(publicMenuService, 'getPublicMenu').mockResolvedValueOnce(mockMenuResponse);

    renderMenuPage();

    expect(screen.getByTestId('menu-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Special Mahalaxmi Thali')).toBeInTheDocument();
    });

    expect(screen.getByText('Special Veg Thali')).toBeInTheDocument();
    expect(screen.getByText('Chicken Sukka')).toBeInTheDocument();
    expect(screen.getByText('Chicken Handi Full')).toBeInTheDocument();
  });

  it('filters items by Veg and Non-Veg toggle', async () => {
    vi.spyOn(publicMenuService, 'getPublicMenu').mockResolvedValueOnce(mockMenuResponse);

    renderMenuPage();

    await waitFor(() => {
      expect(screen.getByText('Special Mahalaxmi Thali')).toBeInTheDocument();
    });

    // Click Pure Veg
    fireEvent.click(screen.getByRole('button', { name: /Pure Veg/i }));

    expect(screen.getByText('Special Veg Thali')).toBeInTheDocument();
    expect(screen.queryByText('Special Mahalaxmi Thali')).not.toBeInTheDocument();
    expect(screen.queryByText('Chicken Sukka')).not.toBeInTheDocument();

    // Click Non-Veg
    fireEvent.click(screen.getByRole('button', { name: /Non-Veg/i }));

    expect(screen.queryByText('Special Veg Thali')).not.toBeInTheDocument();
    expect(screen.getByText('Special Mahalaxmi Thali')).toBeInTheDocument();
    expect(screen.getByText('Chicken Sukka')).toBeInTheDocument();
  });

  it('filters dishes by live search input', async () => {
    vi.spyOn(publicMenuService, 'getPublicMenu').mockResolvedValueOnce(mockMenuResponse);

    renderMenuPage();

    await waitFor(() => {
      expect(screen.getByText('Special Mahalaxmi Thali')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search dishes/i);
    fireEvent.change(searchInput, { target: { value: 'Sukka' } });

    expect(screen.getByText('Chicken Sukka')).toBeInTheDocument();
    expect(screen.queryByText('Special Veg Thali')).not.toBeInTheDocument();
  });

  it('adds an item to cart and renders quantity stepper', async () => {
    vi.spyOn(publicMenuService, 'getPublicMenu').mockResolvedValueOnce(mockMenuResponse);

    renderMenuPage();

    await waitFor(() => {
      expect(screen.getByText('Special Mahalaxmi Thali')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Add Special Mahalaxmi Thali to cart/i });
    fireEvent.click(addBtn);

    // Quantity should now show 1
    expect(screen.getByLabelText(/Decrease quantity of Special Mahalaxmi Thali/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Increase quantity of Special Mahalaxmi Thali/i)).toBeInTheDocument();

    // Floating cart bar should appear with subtotal
    expect(screen.getByText(/1 item in takeaway cart/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtotal: ₹350.00/i)).toBeInTheDocument();

    // Click increment
    fireEvent.click(screen.getByLabelText(/Increase quantity of Special Mahalaxmi Thali/i));
    expect(screen.getByText(/2 items in takeaway cart/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtotal: ₹700.00/i)).toBeInTheDocument();
  });

  it('disables or marks unavailable items and hides Add to Cart button', async () => {
    vi.spyOn(publicMenuService, 'getPublicMenu').mockResolvedValueOnce(mockMenuResponse);

    renderMenuPage();

    await waitFor(() => {
      expect(screen.getByText('Chicken Handi Full')).toBeInTheDocument();
    });

    expect(screen.getByText(/Currently Unavailable/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add Chicken Handi Full to cart/i })).not.toBeInTheDocument();
  });

  it('renders error state and retries on failure', async () => {
    const getMenuMock = vi
      .spyOn(publicMenuService, 'getPublicMenu')
      .mockRejectedValueOnce(new Error('Network connection failed'))
      .mockResolvedValueOnce(mockMenuResponse);

    renderMenuPage();

    await waitFor(() => {
      expect(screen.getByText(/Failed to Load Menu/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Network connection failed')).toBeInTheDocument();

    // Click Retry Connection
    fireEvent.click(screen.getByRole('button', { name: /Retry Connection/i }));

    await waitFor(() => {
      expect(screen.getByText('Special Mahalaxmi Thali')).toBeInTheDocument();
    });

    expect(getMenuMock).toHaveBeenCalledTimes(2);
  });
});
