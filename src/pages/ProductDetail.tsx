import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { ShopifyProduct } from "@/lib/shopify";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading, error } = useProduct(handle || '');
  const addItem = useCartStore(state => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.edges || [];
  const currentImage = images[selectedImageIndex]?.node;
  const options = product.options || [];

  // Initialize selected options with first value of each option
  const effectiveOptions = { ...selectedOptions };
  options.forEach(option => {
    if (!effectiveOptions[option.name] && option.values.length > 0) {
      effectiveOptions[option.name] = option.values[0];
    }
  });

  // Find matching variant based on selected options
  const selectedVariant = product.variants?.edges?.find(({ node }) => {
    return node.selectedOptions.every(
      opt => effectiveOptions[opt.name] === opt.value
    );
  })?.node || product.variants?.edges?.[0]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
      const shopifyProduct: ShopifyProduct = {
        node: product
      };
      
      await addItem({
        product: shopifyProduct,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || []
      });
      toast.success("Ajouté au panier", {
        description: product.title,
        position: "top-center"
      });
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux produits
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary/10">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Pas d'image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-muted'
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-bold text-primary">
                {parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
                {selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode}
              </p>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Options */}
            {options.map((option) => (
              <div key={option.name}>
                <label className="block text-sm font-medium mb-2">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                      className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                        effectiveOptions[option.name] === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:border-primary'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isAdding || !selectedVariant?.availableForSale}
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : !selectedVariant?.availableForSale ? (
                "Rupture de stock"
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ajouter au panier
                </>
              )}
            </Button>

            {/* Features */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Up to 240W ultra-fast charging</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Connecteur 90° ergonomique</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Compatible avec tous les appareils</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
