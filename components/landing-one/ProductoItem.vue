<template lang="pug">
div(:class='className')
  .single-product-box
    .product-image
      div.product-clickable(@click.prevent='quickView')
        img(:src='getProductImageUrl(product)' @error='handleImageError')
      .out-of-stock-badge(v-if='isOutOfStock') Agotado
      .low-stock-badge(v-else-if='isLowStock') Pocas unidades
      ul
        li
          a(href='javascript:void(0)' title='Ver mas' v-b-tooltip.hover @click.prevent='quickView')
            i.far.fa-eye
        li
          a(href='javascript:void(0)' title='Añadir a deseados' v-b-tooltip.hover @click.prevent='addToWishlist')
            i.far.fa-heart(:class='{ "fas fa-heart": isInWishlist, "text-danger": isInWishlist }')
      timer(v-if='product.timePeriod' v-bind:datetime='product.dateTime')
    .product-content
      h3
        span.product-name(@click.prevent='quickView') {{product.nombre}}
      .product-meta
        .product-brand(v-if='product.marca?.data?.attributes?.nombre')
          span.brand-label Marca: 
          span.brand-name {{ product.marca.data.attributes.nombre }}
        .product-colors(v-if='availableColorsCount > 0')
          span.colors-label {{ availableColorsCount }} {{ availableColorsCount === 1 ? 'color disponible' : 'colores disponibles' }}
      .rating
        i.fas.fa-star
        i.fas.fa-star
        i.fas.fa-star
        i.fas.fa-star
        i.far.fa-star
      a.btn.btn-light.added-btn(
        v-if='getExistPId === id' 
        href='javascript:void(0)' 
        @click='quickView'
      ) Ya fue Agregado!
      a.btn(
        v-else 
        href='javascript:void(0)' 
        @click='quickView'
        :class='isOutOfStock ? "btn-secondary disabled-btn" : "btn-primary"'
      ) {{ isOutOfStock ? 'Ver Detalles' : 'Ver Opciones' }}
</template>

<script>
import Timer from './Timer';

export default {
  name: 'ProductoUnico',
  components: {
    Timer
  },
  data() {
    return {
      api_url: process.env.strapiBaseUri,
      getExistPId: null,
      loadingInventory: false,
      inventoryData: [],
      availableColorsCount: 0,
      totalStock: 0,
      basicProductInfo: null // Para almacenar info básica del producto
    }
  },
  props: ['id', 'product', 'className'],
  computed: {
      cart() {
        return this.$store.getters.cart
      },
      wishlist() {
        return this.$store.state.wishlist?.items || [];
      },
      isInWishlist() {
        return this.wishlist.some(item => item.id === this.id)
      },
      currentStock() {
        return this.totalStock;
      },
      isOutOfStock() {
        return this.currentStock <= 0;
      },
      isLowStock() {
        return this.currentStock > 0 && this.currentStock <= 5;
      }
    },
  methods: {
    // Método para inicializar el store de wishlist
    initializeWishlistStore() {
      if (!this.$store.state.wishlist) {
        this.$store.registerModule('wishlist', {
          state: {
            items: JSON.parse(localStorage.getItem('wishlist') || '[]')
          },
          mutations: {
            addToWishlist(state, product) {
              const existingIndex = state.items.findIndex(item => item.id === product.id);
              if (existingIndex === -1) {
                state.items.push(product);
                localStorage.setItem('wishlist', JSON.stringify(state.items));
              }
            },
            removeFromWishlist(state, productId) {
              state.items = state.items.filter(item => item.id !== productId);
              localStorage.setItem('wishlist', JSON.stringify(state.items));
            }
          },
          getters: {
            wishlist: state => state.items,
            wishlistCount: state => state.items.length,
            isInWishlist: state => productId => {
              return state.items.some(item => item.id === productId);
            }
          }
        });
      }
    },

    getProductImageUrl(product) {
      let imagenData = null;
      
      // Buscar la imagen en diferentes ubicaciones
      if (product?.imagen_principal?.data?.attributes) {
        imagenData = product.imagen_principal.data.attributes;
      }
      else if (product?.images?.data?.[0]?.attributes) {
        imagenData = product.images.data[0].attributes;
      }
      else if (product?.image?.data?.attributes) {
        imagenData = product.image.data.attributes;
      }

      if (imagenData?.url) {
        let cleanUrl = imagenData.url.trim();
        
        // Detectar y corregir URLs malformadas
        if (cleanUrl.includes('strapiapp.comhttps')) {
          const mediaUrlMatch = cleanUrl.match(/https:\/\/[^\/]*\.media\.strapiapp\.com\/.*$/);
          if (mediaUrlMatch) {
            return mediaUrlMatch[0];
          }
        }
        
        // Si ya es una URL completa, devolverla tal como está
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          return cleanUrl;
        }
        
        // Si es relativa, agregar el dominio base
        const baseUrl = this.api_url?.endsWith('/') 
          ? this.api_url.slice(0, -1) 
          : this.api_url;
        
        const finalUrl = `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
        return finalUrl;
      }

      return '/images/default-product.jpg';
    },

    // Manejar errores de imagen
    handleImageError(event) {
      console.log('Error loading image:', event.target.src);
      event.target.src = '/images/default-product.jpg';
    },

    // Añadir/quitar de la lista de deseados
    addToWishlist() {
      // Obtener el precio base del primer item disponible para wishlist
      const basePrice = this.getBasePrice();
      
      const wishlistItem = {
        id: this.id,
        name: this.product.nombre,
        price: basePrice,
        image: this.getProductImageUrl(this.product),
        marca: this.product.marca,
        stock: this.currentStock,
        hasMultiplePrices: this.inventoryData.length > 1
      };

      if (this.isInWishlist) {
        this.$store.commit('removeFromWishlist', this.id);
        this.$toast.info("Removido de la lista de deseados", {
          icon: 'fas fa-heart-broken'
        });
      } else {
        this.$store.commit('addToWishlist', wishlistItem);
        this.$toast.success("Agregado a la lista de deseados", {
          icon: 'fas fa-heart'
        });
      }
      
      // Emitir evento global para actualizar el filtro
      this.$root.$emit('wishlist-updated');
    },

    // Obtener precio base para wishlist (el más bajo disponible)
    getBasePrice() {
      if (!this.inventoryData.length) return 0;
      
      const prices = this.inventoryData
        .filter(item => item.attributes.stock_actual > 0)
        .map(item => {
          if (item.attributes.en_oferta && item.attributes.precio_oferta) {
            return item.attributes.precio_oferta;
          }
          return item.attributes.precio_venta_sugerido || 0;
        });
      
      return prices.length > 0 ? Math.min(...prices) : 0;
    },

    // QuickView mejorado
    quickView(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Preparar datos del producto para QuickView
      const productForQuickView = {
        id: this.id,
        nombre: this.product.nombre,
        imageUrl: this.getProductImageUrl(this.product),
        marca: this.product.marca,
        grupo_de_productos: this.product.grupo_de_productos,
        categoria: this.product.categoria,
        // Agregar información de inventario
        hasInventory: this.inventoryData.length > 0,
        totalStock: this.totalStock,
        colorsCount: this.availableColorsCount
      };
      
      // Emitir evento al componente padre
      this.$emit('clicked', productForQuickView);
    },

    // Nueva función para obtener inventario por color
    async fetchInventory() {
      this.loadingInventory = true;
      try {
        if (!this.id) {
          console.error('Product ID is missing');
          return;
        }
        
        // Primero obtener datos básicos del producto para fallback
        await this.getProductBasicInfo();
        
        // Intentar obtener inventario detallado
        const response = await this.$axios.get(`/api/inventario-colores`, {
          params: {
            'filters[producto][id][$eq]': this.id,
            'populate': 'color,talla,producto'
          }
        });
        
        if (response.data.data && response.data.data.length > 0) {
          console.log(`Found inventory data for product ${this.id}:`, response.data.data);
          this.inventoryData = response.data.data;
          this.processInventoryData();
        } else {
          console.warn(`No inventory data found for product ${this.id}, using basic product info`);
          this.useBasicProductInfo();
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        console.log('Falling back to basic product information');
        this.useBasicProductInfo();
      } finally {
        this.loadingInventory = false;
      }
    },

    // Obtener información básica del producto como fallback
    async getProductBasicInfo() {
      try {
        const response = await this.$axios.get(`/api/productos/${this.id}`, {
          params: {
            'populate[colores]': '*',
            'populate[tallas]': '*'
          }
        });
        
        if (response.data.data) {
          this.basicProductInfo = response.data.data.attributes;
        }
      } catch (error) {
        console.error('Error fetching basic product info:', error);
      }
    },

    // Usar información básica del producto cuando no hay inventario detallado
    useBasicProductInfo() {
      if (this.basicProductInfo) {
        // Usar colores del producto
        if (this.basicProductInfo.colores?.data) {
          this.availableColorsCount = this.basicProductInfo.colores.data.length;
        } else {
          this.availableColorsCount = 0;
        }
        
        // Stock por defecto o del producto
        this.totalStock = this.product.stock || 0;
      } else {
        this.inventoryData = [];
        this.totalStock = 0;
        this.availableColorsCount = 0;
      }
    },

    // Procesar datos del inventario
    processInventoryData() {
      // Calcular stock total
      this.totalStock = this.inventoryData.reduce((total, item) => {
        return total + (item.attributes.stock_actual || 0);
      }, 0);

      // Contar colores únicos
      const uniqueColors = new Set();
      this.inventoryData.forEach(item => {
        if (item.attributes.color?.data?.id) {
          uniqueColors.add(item.attributes.color.data.id);
        }
      });
      this.availableColorsCount = uniqueColors.size;
      
      console.log(`Inventory processed: ${this.totalStock} total stock, ${this.availableColorsCount} colors`);
    },

    // Método simplificado - solo abre QuickView
    addToCart(item) {
      // Redirigir al QuickView para seleccionar opciones
      this.quickView({ preventDefault: () => {}, stopPropagation: () => {} });
    }
  },
  created() {
    // Obtener inventario del nuevo sistema
    this.fetchInventory();
    
    // Inicializar el store de wishlist si no existe
    this.initializeWishlistStore();
  }
}
</script>

<style scoped>
.out-of-stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #dc3545;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  z-index: 10;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.low-stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f39c12;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  z-index: 10;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(243, 156, 18, 0.3);
}

.disabled-btn {
  background-color: #6c757d !important;
  color: #fff !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  opacity: 0.65 !important;
  border-color: #6c757d !important;
}

.btn-primary {
  background-color: #4a89dc;
  border-color: #4a89dc;
  color: #fff;
}

.btn-primary:hover {
  background-color: #3a70c2;
  border-color: #3a70c2;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.product-image {
  position: relative;
  overflow: hidden;
}

.product-meta {
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.product-brand {
  margin-bottom: 6px;
}

.brand-label {
  color: #999;
  font-weight: 500;
}

.brand-name {
  color: #555;
  font-weight: 600;
}

.product-colors {
  color: #4a89dc;
  font-weight: 500;
}

.colors-label {
  font-size: 12px;
}

/* Efecto visual cuando el producto está agotado */
.single-product-box .product-image img {
  transition: all 0.3s ease;
}

.single-product-box:has(.out-of-stock-badge) .product-image img {
  filter: grayscale(30%) opacity(0.8);
}

.single-product-box:has(.out-of-stock-badge) {
  opacity: 0.85;
}

.single-product-box:hover {
  opacity: 0.9;
}

/* ESTILOS PARA ELEMENTOS CLICKEABLES */
.product-clickable {
  cursor: pointer;
  display: block;
  position: relative;
  transition: transform 0.2s ease;
}

.product-clickable:hover {
  transform: scale(1.02);
}

.product-name {
  cursor: pointer;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.product-name:hover {
  color: #4a89dc;
}

/* ESTILOS PARA EL CORAZÓN DE WISHLIST */
.fa-heart.text-danger {
  color: #dc3545 !important;
}

.fa-heart {
  transition: all 0.3s ease;
}

.fa-heart:hover {
  transform: scale(1.1);
}

/* Mejorar visibilidad del botón deshabilitado */
.btn:disabled,
.btn.disabled-btn {
  cursor: not-allowed;
  user-select: none;
}

.btn.disabled-btn:hover {
  transform: none;
  background-color: #6c757d !important;
}

/* Estilos adicionales para mejor UX */
.added-btn {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
  color: #fff !important;
}

.added-btn:hover {
  background-color: #218838 !important;
  border-color: #1e7e34 !important;
}
</style>