<template lang="pug">
div(:class='className')
  .single-product-box
    .product-image
      div.product-clickable(@click.prevent='quickView')
        img(:src='getProductImageUrl(product)' @error='handleImageError')
      .out-of-stock-badge(v-if='isOutOfStock') Agotado
      ul
        li
          a(href='javascript:void(0)' title='Ver mas' v-b-tooltip.hover @click.prevent='quickView')
            i.far.fa-eye
        li
          a(href='javascript:void(0)' title='Añadir a deseados' v-b-tooltip.hover @click.prevent='toggleWishlist')
            i.far.fa-heart(:class='{ "fas fa-heart": isInWishlist, "text-danger": isInWishlist }')
      timer(v-if='product.timePeriod' v-bind:datetime='product.dateTime')
    .product-content
      h3
        span.product-name(@click.prevent='quickView') {{product.nombre}}
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
        @click='addToCart(product)'
        :class='isOutOfStock ? "btn-secondary disabled-btn" : "btn-light"'
        :disabled='isOutOfStock'
      ) {{ isOutOfStock ? 'Agotado' : 'Agregar al Carrito' }}
</template>

<script>
import Timer from './Timer';
import { 
  loadUserWishlist, 
  addToUserWishlist, 
  removeFromUserWishlist, 
  isInUserWishlist 
} from '~/utils/wishlist-helper';

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
      inventoryData: null,
      userWishlist: []
    }
  },
  props: ['id', 'product', 'className'],
  computed: {
    cart() {
      return this.$store.getters.cart
    },
    wishlist() {
      // Usar la función del helper para obtener el wishlist
      return this.userWishlist;
    },
    isInWishlist() {
      // Usar la función del helper para verificar si está en wishlist
      return isInUserWishlist(this.id);
    },
    currentStock() {
      if (this.inventoryData) {
        return this.inventoryData.stock_total || 0;
      }
      if (this.product.stock) {
        return this.product.stock;
      }
      return 0;
    },
    isOutOfStock() {
      return this.currentStock <= 0;
    },
    isUserLoggedIn() {
      try {
        const userEmail = localStorage.getItem('user_email');
        return !!userEmail;
      } catch {
        return false;
      }
    }
  },
  methods: {
    loadWishlistData() {
      // Cargar wishlist del usuario actual
      this.userWishlist = loadUserWishlist();
    },

    initializeWishlistStore() {
      if (!this.$store.state.wishlist) {
        this.$store.registerModule('wishlist', {
          state: {
            items: loadUserWishlist()
          },
          mutations: {
            addToWishlist(state, product) {
              if (addToUserWishlist(product)) {
                state.items = loadUserWishlist();
              }
            },
            removeFromWishlist(state, productId) {
              if (removeFromUserWishlist(productId)) {
                state.items = loadUserWishlist();
              }
            },
            loadWishlist(state) {
              state.items = loadUserWishlist();
            }
          },
          getters: {
            wishlist: state => state.items,
            wishlistCount: state => state.items.length,
            isInWishlist: state => productId => {
              return isInUserWishlist(productId);
            }
          }
        });
      }
    },

    getProductImageUrl(product) {
      let imagenData = null;
      
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
        
        if (cleanUrl.includes('strapiapp.comhttps')) {
          const mediaUrlMatch = cleanUrl.match(/https:\/\/[^\/]*\.media\.strapiapp\.com\/.*$/);
          if (mediaUrlMatch) {
            return mediaUrlMatch[0];
          }
        }
        
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          return cleanUrl;
        }
        
        const baseUrl = this.api_url?.endsWith('/') 
          ? this.api_url.slice(0, -1) 
          : this.api_url;
        
        const finalUrl = `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
        return finalUrl;
      }

      return '/images/default-product.jpg';
    },

    handleImageError(event) {
      console.log('Error loading image:', event.target.src);
      event.target.src = '/images/default-product.jpg';
    },

    toggleWishlist() {
      // Verificar si el usuario está logueado
      if (!this.isUserLoggedIn) {
        this.$toast.warning("Debes iniciar sesión para agregar productos a tu lista de deseos", {
          icon: 'fas fa-lock'
        });
        // Opcionalmente, redirigir al login
        // this.$router.push('/login');
        return;
      }

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

      // Verificar si ya está en wishlist usando el helper
      const isCurrentlyInWishlist = isInUserWishlist(this.id);

      if (isCurrentlyInWishlist) {
        // Remover del wishlist usando el helper
        const removed = removeFromUserWishlist(this.id);
        
        if (removed) {
          // Actualizar store si existe
          if (this.$store.state.wishlist) {
            this.$store.commit('removeFromWishlist', this.id);
          }
          
          this.$toast.info("Removido de la lista de deseados", {
            icon: 'fas fa-heart-broken'
          });
        }
      } else {
        // Añadir al wishlist usando el helper
        const added = addToUserWishlist(wishlistItem);
        
        if (added) {
          // Actualizar store si existe
          if (this.$store.state.wishlist) {
            this.$store.commit('addToWishlist', wishlistItem);
          }
          
          this.$toast.success("Agregado a la lista de deseados", {
            icon: 'fas fa-heart'
          });
        } else {
          this.$toast.info("El producto ya estaba en tu lista de deseados");
        }
      }
      
      // Recargar el wishlist local
      this.loadWishlistData();
      
      // Emitir evento global para actualizar el filtro
      this.$root.$emit('wishlist-updated');
      
      // Forzar actualización del componente
      this.$forceUpdate();
    },

    quickView(e) {
      e.preventDefault();
      e.stopPropagation();
      
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
        tallas: this.product.tallas,
        categoria: this.product.categoria
      };
      
      this.$emit('clicked', productForQuickView);
    },

    async fetchInventory() {
      this.loadingInventory = true;
      try {
        if (!this.id) {
          console.error('Product ID is missing');
          return;
        }
        
        const productResponse = await this.$axios.get(`/api/productos/${this.id}`, {
          params: {
            'populate': ['tallas', 'colores', 'imagen_principal', 'images', 'image']
          }
        });
        
        if (productResponse.data.data) {
          Object.assign(this.product, productResponse.data.data.attributes);
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
          this.inventoryData = { stock_total: 0 };
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        this.inventoryData = { stock_total: 0 };
      } finally {
        this.loadingInventory = false;
      }
    },

    addToCart(item) {
      if (this.isOutOfStock) {
        this.$toast.error("Este producto está agotado", {
          icon: 'fas fa-times-circle'
        });
        return;
      }

      const hasSizes = item.tallas?.data?.length > 0;
      const hasColors = item.colores?.data?.length > 0;
      
      if (hasSizes || hasColors) {
        this.$toast.info("Por favor selecciona talla y color", {
          icon: 'fas fa-hand-pointer'
        });
        this.quickView(new Event('click'));
        return;
      }

      const product = [{
        id: this.id,
        name: item.nombre,
        price: item.en_oferta ? item.precio_oferta : item.precio_venta,
        originalPrice: item.precio_venta,
        onSale: item.en_oferta,
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
          this.$toast.success("Agregado al Carrito", {
            icon: 'fas fa-cart-plus'
          });
        } else {
          const currentCartQuantity = this.cart[cartIndex].quantity;
          if (currentCartQuantity >= this.currentStock) {
            this.$toast.error(`Solo hay ${this.currentStock} unidades disponibles`, {
              icon: 'fas fa-exclamation-triangle'
            });
            return;
          }
          
          this.$store.dispatch('updateCart', {
            id, unit: 1, cart: this.cart
          });
          this.$toast.info("Ya fue agregado al carrito, y se incremento la cantidad en uno");
        }
      } else {
        this.$store.dispatch('addToCart', product)
        this.$toast.success("Agregado al Carrito", {
          icon: 'fas fa-cart-plus'
        });
      }
    },

    handleUserLogin() {
      console.log('Usuario logueado - Cargando wishlist');
      this.loadWishlistData();
      this.$forceUpdate();
    },

    handleUserLogout() {
      console.log('Usuario deslogueado - Limpiando wishlist');
      this.userWishlist = [];
      this.$forceUpdate();
    }
  },
  created() {
    if (this.product.inventory) {
      this.inventoryData = this.product.inventory;
    } else {
      this.fetchInventory();
    }
    
    this.initializeWishlistStore();
    this.loadWishlistData();
  },
  mounted() {
    // Escuchar eventos de login/logout
    this.$nuxt.$on('user-logged-in', this.handleUserLogin);
    this.$nuxt.$on('user-logged-out', this.handleUserLogout);
    
    // Escuchar evento de actualización de wishlist
    this.$root.$on('wishlist-updated', this.loadWishlistData);
  },
  beforeDestroy() {
    // Limpiar listeners
    this.$nuxt.$off('user-logged-in', this.handleUserLogin);
    this.$nuxt.$off('user-logged-out', this.handleUserLogout);
    this.$root.$off('wishlist-updated', this.loadWishlistData);
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

.disabled-btn {
  background-color: #6c757d !important;
  color: #fff !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  opacity: 0.65 !important;
  border-color: #6c757d !important;
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
</style>