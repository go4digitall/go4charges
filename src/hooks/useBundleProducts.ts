import { useQuery } from '@tanstack/react-query';
import { fetchProductByHandle, ShopifyProduct } from '@/lib/shopify';

// Cable type
export type CableType = 'usbc' | 'lightning';

// Bundle product handles by cable type
const BUNDLE_HANDLES = {
  usbc: {
    single: 'chargestand-240w-90-fast-charging-cable',
    duo: 'pack-duo-2x-chargestand™-240w',
    family: 'pack-famille-3x-chargestand™-240w',
  },
  lightning: {
    single: 'chargestand-lightning-up-to-240w',
    duo: 'duo-pack-2x-chargestand™-lightning',
    family: 'family-pack-3x-chargestand™-lightning',
  },
} as const;

export interface BundleOption {
  id: 'single' | 'duo' | 'family';
  name: string;
  subtitle: string;
  price: number;
  comparePrice: number;
  discountPercent: number;
  badges: string[];
  productHandle: string;
  variantId: string;
  product: ShopifyProduct;
}

// Static bundle configuration (same for both cable types)
const BUNDLE_CONFIG: Record<string, Omit<BundleOption, 'price' | 'variantId' | 'product' | 'productHandle'>> = {
  single: {
    id: 'single',
    name: 'Single Cable',
    subtitle: '1x ChargeStand™ (Up to 240W)',
    comparePrice: 49.90,
    discountPercent: 50,
    badges: ['-50%'],
  },
  duo: {
    id: 'duo',
    name: 'Duo Pack',
    subtitle: '2x ChargeStand™ (Up to 240W)',
    comparePrice: 99.80,
    discountPercent: 65,
    badges: ['POPULAR', '-65%'],
  },
  family: {
    id: 'family',
    name: 'Family Pack',
    subtitle: '3x ChargeStand™ (Up to 240W)',
    comparePrice: 149.70,
    discountPercent: 70,
    badges: ['BEST VALUE', '70% OFF'],
  },
};

async function fetchBundleProductsByType(cableType: CableType) {
  const handles = BUNDLE_HANDLES[cableType];
  
  // Fetch all 3 products in parallel
  const [single, duo, family] = await Promise.all([
    fetchProductByHandle(handles.single),
    fetchProductByHandle(handles.duo),
    fetchProductByHandle(handles.family),
  ]);

  const products: Record<string, ShopifyProduct['node'] | null> = {
    single,
    duo,
    family,
  };

  return products;
}

export function useBundleProducts(cableType: CableType = 'usbc') {
  const query = useQuery({
    queryKey: ['bundle-products', cableType],
    queryFn: () => fetchBundleProductsByType(cableType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Transform products into BundleOption array
  const bundleOptions: BundleOption[] = [];
  const handles = BUNDLE_HANDLES[cableType];

  if (query.data) {
    const order: Array<'single' | 'duo' | 'family'> = ['single', 'duo', 'family'];
    
    for (const key of order) {
      const productNode = query.data[key];
      const config = BUNDLE_CONFIG[key];
      
      if (productNode && config) {
        const variant = productNode.variants?.edges?.[0]?.node;
        const price = variant ? parseFloat(variant.price.amount) : 0;
        
        bundleOptions.push({
          ...config,
          price,
          productHandle: handles[key],
          variantId: variant?.id || '',
          product: { node: productNode },
        });
      }
    }
  }

  return {
    bundleOptions,
    isLoading: query.isLoading,
    error: query.error,
    cableType,
  };
}

// Helper to get display info for cable types
export const CABLE_TYPE_INFO = {
  usbc: {
    label: 'USB-C to USB-C',
    shortLabel: 'USB-C',
    icon: '⚡',
    compatibility: 'iPhone 15+, MacBook, iPad Pro, Android',
  },
  lightning: {
    label: 'USB-C to Lightning',
    shortLabel: 'Lightning',
    icon: '🍎',
    compatibility: 'iPhone 5-14, iPad, AirPods',
  },
} as const;
