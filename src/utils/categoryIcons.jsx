import {
  Tag, ShoppingCart, Car, Pill, Film, Zap, Home, Plane,
  BookOpen, Gamepad2, Briefcase, Monitor, TrendingUp,
  DollarSign, Gift, Dumbbell, Coffee, Pizza, Music,
  Smartphone, GraduationCap, Hospital, Trophy, Palette,
  Utensils, Shirt, Bus, Heart, Baby, Dog, Flower2,
  Globe, Wrench, Hammer, Camera, Headphones, Bike,
  Train, Ship, Rocket, Star, Sun, Moon, Cloud, Leaf,
  Apple, Wine, Beer, IceCream, Sandwich, Soup,
  ShoppingBag, CreditCard, Banknote, PiggyBank, Wallet,
  Receipt, BarChart2, PieChart, Activity, Layers,
} from 'lucide-react'

// ── Icon Map ── shared between the Categories page (icon picker) and every
// place a category icon is displayed (Dashboard, TransactionRow, Transaction
// detail). Categories created in-app store a *key from this map* as `icon`;
// categories seeded from the backend/local fallback list store an emoji
// string instead — CategoryIcon (below) renders either correctly.
export const ICON_MAP = {
  ShoppingCart, Car, Pill, Film, Zap, Home, Plane,
  BookOpen, Gamepad2, Briefcase, Monitor, TrendingUp,
  DollarSign, Gift, Dumbbell, Coffee, Pizza, Music,
  Smartphone, GraduationCap, Hospital, Trophy, Palette,
  Utensils, Shirt, Bus, Heart, Baby, Dog, Flower2,
  Globe, Wrench, Hammer, Camera, Headphones, Bike,
  Train, Ship, Rocket, Star, Sun, Moon, Cloud, Leaf,
  Apple, Wine, Beer, IceCream, Sandwich, Soup,
  ShoppingBag, CreditCard, Banknote, PiggyBank, Wallet,
  Receipt, BarChart2, PieChart, Activity, Layers,
}

export const ICON_KEYS = Object.keys(ICON_MAP)

export const CATEGORY_COLORS = [
  '#f97316', '#3b82f6', '#a855f7', '#ef4444', '#ec4899',
  '#eab308', '#10b981', '#06b6d4', '#8b5cf6', '#f43f5e',
  '#64748b', '#0ea5e9', '#84cc16', '#f59e0b', '#14b8a6',
  '#e879f9', '#fb923c', '#34d399',
]

/**
 * Renders a category's icon regardless of whether it's a Lucide icon-map
 * key (e.g. "ShoppingCart", used by categories created in-app) or an emoji
 * string (e.g. "🍔", used by the built-in/fallback category list).
 */
export function CategoryIcon({ icon, color, size = 16, className = '' }) {
  const IconComp = icon && ICON_MAP[icon]
  if (IconComp) return <IconComp size={size} color={color} className={className} />
  return <span className={className} style={{ fontSize: size, lineHeight: 1 }}>{icon || '📦'}</span>
}
