'use client';

import { useState } from 'react';
import { ShoppingBag, Eye, X, MessageSquare, Tag, Shirt } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  type: 'polera' | 'poleron';
  phrase: string;
  price: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  imagePlaceholder: string;
};

const PRODUCTS: Product[] = [
  {
    id: 'polera-atreverse',
    name: 'Polera "Atreverse"',
    type: 'polera',
    phrase: 'Cuando alguien se atreve a decirlo, otro se atreve a sentirlo',
    price: 12990,
    colors: [
      { name: 'Negro', hex: '#1A1A1A' },
      { name: 'Blanco', hex: '#FFFFFF' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Polera de calce clásico unisex confeccionada en 100% Algodón Premium peinado de 180g. Estampa en serigrafía de alta definición con la frase icónica del podcast. Tacto ultrasuave y costuras reforzadas.',
    imagePlaceholder: 'bg-primary-dark/80 text-white'
  },
  {
    id: 'poleron-eco',
    name: 'Polerón "Eco"',
    type: 'poleron',
    phrase: 'Donde tu historia encuentra eco',
    price: 24990,
    colors: [
      { name: 'Azul Marino', hex: '#1C2D42' },
      { name: 'Gris Melange', hex: '#A3A3A3' }
    ],
    sizes: ['M', 'L', 'XL'],
    description: 'Polerón de calce relajado con capucha y bolsillo canguro. Interior de felpa perchada premium de 320g para máxima suavidad y abrigo. Frase bordada delicadamente en el centro del pecho.',
    imagePlaceholder: 'bg-secondary text-white'
  },
  {
    id: 'polera-proposito',
    name: 'Polera "Propósito"',
    type: 'polera',
    phrase: 'Cada historia tiene un propósito. La tuya también.',
    price: 12990,
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde Botella', hex: '#1D3B2F' }
    ],
    sizes: ['S', 'M', 'L'],
    description: 'Polera minimalista confeccionada en algodón orgánico. Estampado suave al tacto con una tipografía elegante inspiradora en el pecho. Diseño versátil para el día a día o encuentros de comunidad.',
    imagePlaceholder: 'bg-primary/80 text-white'
  }
];

export default function TiendaPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  };

  function openDetails(product: Product) {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0].name);
  }

  function handleOrder(product: Product) {
    const phone = '56930263654'; // Teléfono del ministerio para pedidos
    const text = `Hola Piedad, me interesa adquirir el producto del catálogo:\n\n*${product.name}*\n🎨 Color: ${selectedColor}\n📐 Talla: ${selectedSize}\n💵 Precio: ${formatCurrency(product.price)}\n\n¿Cómo puedo realizar el pago y coordinar la entrega?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="bg-card rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center bg-gradient-to-br from-primary/[0.02] to-secondary/[0.04]">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="text-primary" size={24} />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Catálogo de Merchandising</h1>
        <p className="text-text-light text-xs md:text-sm mt-1 max-w-md mx-auto">
          Adquiere nuestras poleras y polerones oficiales con frases inspiradoras. El 100% de los excedentes financia la producción de nuevos episodios y encuentros.
        </p>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {PRODUCTS.map(product => (
          <div key={product.id} className="bg-card rounded-xl border border-gray-200/70 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            {/* Imagen Preview */}
            <div className={`aspect-square flex flex-col items-center justify-center p-6 text-center ${product.imagePlaceholder} relative overflow-hidden`}>
              <Shirt size={48} className="opacity-40 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="font-heading italic text-sm md:text-base font-semibold max-w-[80%] leading-relaxed">
                &ldquo;{product.phrase}&rdquo;
              </p>
              <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold px-2 py-0.5 rounded-full text-white tracking-wider">
                {product.type}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div>
                <h3 className="font-heading font-bold text-primary-dark text-base leading-tight">
                  {product.name}
                </h3>
                <p className="text-[11px] text-text-light/80 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-sm text-primary">
                  {formatCurrency(product.price)}
                </span>
                <button
                  onClick={() => openDetails(product)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold rounded-lg"
                >
                  <Eye size={12} /> Ver detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Banner */}
      <div className="bg-card border border-gray-200/70 shadow-sm rounded-xl p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left space-y-0.5">
          <p className="font-semibold text-primary-dark text-sm flex items-center gap-1.5 justify-center sm:justify-start">
            <Tag size={14} className="text-primary" /> ¿Deseas un diseño personalizado?
          </p>
          <p className="text-xs text-text-light">
            Escríbenos si tienes alguna frase del podcast que te gustaría estampar en tu polera.
          </p>
        </div>
        <a
          href="https://wa.me/56930263654?text=Hola%20Piedad,%20tengo%20una%20consulta%20sobre%20el%20merchandising%20del%20podcast."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors shrink-0"
        >
          <MessageSquare size={12} /> Consultar por WhatsApp
        </a>
      </div>

      {/* Modal de Detalles */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border">
            {/* Header / Close */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="font-heading font-bold text-primary-dark text-base">Detalle del Producto</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-text-light hover:text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Product Preview */}
              <div className={`aspect-[2/1] rounded-xl flex items-center justify-center p-4 text-center ${selectedProduct.imagePlaceholder}`}>
                <p className="font-heading italic text-xs font-semibold max-w-[90%] leading-relaxed">
                  &ldquo;{selectedProduct.phrase}&rdquo;
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-dark text-lg leading-snug">{selectedProduct.name}</h4>
                <p className="text-base font-bold text-primary mt-0.5">{formatCurrency(selectedProduct.price)}</p>
                <p className="text-xs text-text-light leading-relaxed mt-2">{selectedProduct.description}</p>
              </div>

              {/* Selector Color */}
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-text-light">Color seleccionado: <strong className="text-primary-dark">{selectedColor}</strong></span>
                <div className="flex gap-2">
                  {selectedProduct.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color.name ? 'border-primary scale-110 shadow-sm' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Selector Talla */}
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-text-light">Talla seleccionada: <strong className="text-primary-dark">{selectedSize}</strong></span>
                <div className="flex gap-2">
                  {selectedProduct.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-card text-text-light border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón WhatsApp */}
              <button
                onClick={() => handleOrder(selectedProduct)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-sm active:scale-[0.98]"
              >
                <MessageSquare size={16} /> Realizar Pedido por WhatsApp
              </button>
              
              <p className="text-[10px] text-center text-text-light/60">
                Al hacer clic, se abrirá un chat directo para acordar los medios de pago (transferencia, MercadoPago) y método de despacho.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
