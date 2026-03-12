import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
}

/**
 * Legacy single-value option snapshot (kept for backward compatibility with
 * existing cart items stored in localStorage).
 */
export interface SelectedOption {
  groupName: string;
  selectedValue: string;
  priceModifier: number;
}

/**
 * Full option snapshot produced by the Q DOOR configurator engine.
 * Stores both stable IDs and human-readable labels.
 * Used by the checkout page when submitting orders to the backend.
 */
export interface SelectedOptionSnapshot {
  groupId: string;
  groupName: string;
  selectedValueIds: string[];
  selectedValueLabels: string[];
  priceModifier: number;
}

export interface CartItem {
  productId: string;
  name: string;
  /** Total price = basePrice + optionsExtraCost */
  price: number;
  /** Original base price before any option modifiers */
  basePrice: number;
  quantity: number;
  image?: string;
  selectedColor?: string | null;
  /** Legacy flat option snapshot (single-value per group). */
  selectedOptions?: SelectedOption[];
  /** Full configurator snapshot with IDs. Present for new-style configurator items. */
  selectedOptionSnapshots?: SelectedOptionSnapshot[];
  /** Sum of all priceModifiers from selected options */
  optionsExtraCost?: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedOptions?: SelectedOption[]) => void;
  updateQty: (productId: string, quantity: number, selectedOptions?: SelectedOption[]) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

function optionsKey(opts?: SelectedOption[]): string {
  if (!opts || opts.length === 0) return '';
  return opts.map(o => `${o.groupName}:${o.selectedValue}`).join('|');
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAuth: (user, token) => {
        Cookies.set('token', token, { expires: 7 });
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        Cookies.remove('token');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/auth/login';
      },
    }),
    {
      name: 'meshtalem-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const key = optionsKey(item.selectedOptions);
        const existing = get().items.find(
          (i) => i.productId === item.productId && optionsKey(i.selectedOptions) === key
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId && optionsKey(i.selectedOptions) === key
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (productId, selectedOptions) => {
        const key = optionsKey(selectedOptions);
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && optionsKey(i.selectedOptions) === key)
          ),
        });
      },
      updateQty: (productId, quantity, selectedOptions) => {
        const key = optionsKey(selectedOptions);
        if (quantity <= 0) {
          set({
            items: get().items.filter(
              (i) => !(i.productId === productId && optionsKey(i.selectedOptions) === key)
            ),
          });
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId && optionsKey(i.selectedOptions) === key
                ? { ...i, quantity }
                : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'meshtalem-cart' }
  )
);
