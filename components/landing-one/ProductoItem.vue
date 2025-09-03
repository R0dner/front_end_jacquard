<template lang="pug">
div(:class='className')
  .single-product-box
    .product-image
      div.product-clickable(@click.prevent='quickView')
        img(:src='getProductImageUrl(product)' @error='handleImageError')
      .out-of-stock-badge(v-if='currentStock === 0') Agotado
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
        .product-price
          span.old-price(v-if='product.en_oferta')
            | Bs.{{product.precio_venta}}
          span.new-price(v-if='product.en_oferta') Bs.{{product.precio_oferta}}
          span.new-price(v-else) Bs.{{product.precio_venta}}
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
      a.btn.btn-light(
        v-else 
        href='javascript:void(0)' 
        @click='addToCart(product)'
        :class='{ "disabled-btn": currentStock === 0 }'
      ) {{ currentStock === 0 ? 'Agotado' : 'Agregar al Carrito' }}
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
      inventoryData: null
    }
  },
  props: ['id', 'product', 'className'],
  computed: {
    cart() {
      return this.$store.getters.cart
    },
    wishlist() {
      // Acceder al store de wishlist correctamente
      return this.$store.state.wishlist?.items || [];
    },
    isInWishlist() {
      return this.wishlist.some(item => item.id === this.id)
    },
    currentStock() {
      if (this.inventoryData) {
        return this.inventoryData.stock_actual;
      }
      if (this.product.stock) {
        return this.product.stock;
      }
      return 0;
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
      const wishlistItem = {
        id: this.id,
        name: this.product.nombre,
        price: this.product.en_oferta ? this.product.precio_oferta : this.product.precio_venta,
        originalPrice: this.product.precio_venta,
        onSale: this.product.en_oferta,
        image: this.getProductImageUrl(this.product),
        marca: this.product.marca,
        stock: this.currentStock
      };

      if (this.isInWishlist) {
        // Usar mutación en lugar de acción
        this.$store.commit('removeFromWishlist', this.id);
        this.$toast.info("Removido de la lista de deseados", {
          icon: 'fas fa-heart-broken'
        });
      } else {
        // Usar mutación en lugar de acción
        this.$store.commit('addToWishlist', wishlistItem);
        this.$toast.success("Agregado a la lista de deseados", {
          icon: 'fas fa-heart'
        });
      }
      
      // Emitir evento global para actualizar el filtro
      this.$root.$emit('wishlist-updated');
    },

    // QuickView mejorado
    quickView(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Preparar datos del producto para QuickView
      const productForQuickView = {
        id: this.id,
        nombre: this.product.nombre,
        precio: this.product.precio_venta,
        precioOferta: this.product.precio_oferta,
        enOferta: this.product.en_oferta,
        imageUrl: this.getProductImageUrl(this.product),
        marca: this.product.marca,
        grupo_de_productos: this.product.grupo_de_productos,
        stock: this.currentStock,
        colores: this.product.colores,
        categoria: this.product.categoria
      };
      
      // Emitir evento al componente padre
      this.$emit('clicked', productForQuickView);
    },

    async fetchInventory() {
      this.loadingInventory = true;
      try {
        if (!this.id) {
          console.error('Product ID is missing');
          return;
        }
        
        const response = await this.$axios.get(`/api/inventarios`, {
          params: {
            'filters[producto][id][$eq]': this.id,
            'populate': '*'
          }
        });
        
        if (response.data.data && response.data.data.length > 0) {
          this.inventoryData = response.data.data[0].attributes;
        } else {
          console.warn('No inventory data found for this product');
          this.inventoryData = { stock_actual: 0 };
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        this.inventoryData = { stock_actual: 0 };
      } finally {
        this.loadingInventory = false;
      }
    },

    addToCart(item) {
      if (this.currentStock === 0) {
        this.$toast.error("Este producto está agotado", {
          icon: 'fas fa-times-circle'
        });
        return;
      }

      const product = [{
        id: this.id,
        name: item.nombre,
        price: item.precio_venta,
        image: this.getProductImageUrl(item),
        quantity: 1,
        maxQuantity: this.currentStock
      }]

      if (this.cart.length > 0) {
        let id = this.id 
        this.getExistPId = id
        let cartIndex = this.cart.findIndex(cart => {
          return cart.id == id
        })

        if (cartIndex == -1) {
          this.$store.dispatch('addToCart', product);
          this.$toast("Agregado al Carrito", {
            icon: 'fas fa-cart-plus'
          });
        } else {
          this.$store.dispatch('updateCart', {
            id, unit: 1, cart: this.cart
          });
          this.$toast.info("Ya fue agregado al carrito, y se incremento la cantidad en uno");
        }
      } else {
        this.$store.dispatch('addToCart', product)
        this.$toast("Agregado al Carrito", {
          icon: 'fas fa-cart-plus'
        });
      }
    }
  },
  created() {
    if (this.product.inventory) {
      this.inventoryData = this.product.inventory;
    } else {
      this.fetchInventory();
    }
    
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
  background-color: #ff0000;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
}

.disabled-btn {
  background-color: #cccccc !important;
  color: #666666 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

.product-image {
  position: relative;
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
</style>