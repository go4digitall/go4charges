import { useQuery } from '@tanstack/react-query';
import { fetchProductByHandle, ShopifyProduct } from '@/lib/shopify';

// Bundle product handles
const BUNDLE_HANDLES = {
  single: 'chargestand-240w-90-fast-charging-cable',
  duo: 'pack-duo-2x-chargestand™-240w',
  family: 'pack-famille-3x-chargestand™-240w',
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

// Static bundle configuration
const BUNDLE_CONFIG: Record<string, Omit<BundleOption, 'price' | 'variantId' | 'product'>> = {
  single: {
    id: 'single',
    name: 'Single Cable',
    subtitle: '1x ChargeStand™ (Up to 240W)',
    comparePrice: 49.90,
    discountPercent: 50,
    badges: ['-50%'],
    productHandle: BUNDLE_HANDLES.single,
  },
  duo: {
    id: 'duo',
    name: 'Duo Pack',
    subtitle: '2x ChargeStand™ (Up to 240W)',
    comparePrice: 99.80,
    discountPercent: 65,
    badges: ['POPULAR', '-65%'],
    productHandle: BUNDLE_HANDLES.duo,
  },
  family: {
    id: 'family',
    name: 'Family Pack',
    subtitle: '3x ChargeStand™ (Up to 240W)',
    comparePrice: 149.70,
    discountPercent: 70,
    badges: ['BEST VALUE', '70% OFF'],
    productHandle: BUNDLE_HANDLES.family,
  },
};

async function fetchBundleProducts() {
  // Fetch all 3 products in parallel
  const [single, duo, family] = await Promise.all([
    fetchProductByHandle(BUNDLE_HANDLES.single),
    fetchProductByHandle(BUNDLE_HANDLES.duo),
    fetchProductByHandle(BUNDLE_HANDLES.family),
  ]);

  const products: Record<string, ShopifyProduct['node'] | null> = {
    single,
    duo,
    family,
  };

  return products;
}

export function useBundleProducts() {
  const query = useQuery({
    queryKey: ['bundle-products'],
    queryFn: fetchBundleProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Transform products into BundleOption array
  const bundleOptions: BundleOption[] = [];

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
  };
}
