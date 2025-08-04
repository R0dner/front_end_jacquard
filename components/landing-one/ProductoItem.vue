<template lang="pug">
  div(:class='className')
    .single-product-box
      .product-image
        nuxt-link(:to='`/products-details/${id}`')
          //- ✅ CORREGIDO: Usar método para procesar la URL
          img(:src='getProductImageUrl(product)' @error='handleImageError')
        .out-of-stock-badge(v-if='currentStock === 0') Agotado
        ul
          li
            a(href='javascript:void(0)' title='Ver mas' v-b-tooltip.hover @click.prevent='quickView')
              i.far.fa-eye
          li
            a(href='#' title='Añadir a deseados' v-b-tooltip.hover)
              i.far.fa-heart
        timer(v-if='product.timePeriod' v-bind:datetime='product.dateTime')
      .product-content
        h3
          nuxt-link(:to='`/products-details/${id}`') {{product.nombre}}
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
    
    QuickView(
      v-if="showQuickView"
      :product="quickViewProduct"
      @close="showQuickView = false"
    )
</template>

<script>
import Timer from './Timer';
export default {
    name: 'ProductoUnico',
    components: {
        Timer
    },
    data(){
          return {
              api_url: process.env.strapiBaseUri,
              getExistPId: null,
              loadingInventory: false,
              inventoryData: null,
              showQuickView: false,
              quickViewProduct: null
          }
      },
    props: ['id','product', 'className'],
    computed: {
        cart(){
            return this.$store.getters.cart
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
      // ✅ MÉTODO NUEVO: Procesar URLs de imagen correctamente
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
              console.log(`ProductoUnico - Fixed malformed URL: ${mediaUrlMatch[0]}`);
              return mediaUrlMatch[0];
            }
          }
          
          // Si ya es una URL completa, devolverla tal como está
          if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
            console.log(`ProductoUnico - Using complete URL: ${cleanUrl}`);
            return cleanUrl;
          }
          
          // Si es relativa, agregar el dominio base
          const baseUrl = this.api_url?.endsWith('/') 
            ? this.api_url.slice(0, -1) 
            : this.api_url;
          
          const finalUrl = `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
          console.log(`ProductoUnico - Constructed URL: ${finalUrl}`);
          return finalUrl;
        }

        console.log('ProductoUnico - No image found, using default');
        return '/images/default-product.jpg';
      },

      // ✅ MÉTODO NUEVO: Manejar errores de imagen
      handleImageError(event) {
        console.log('ProductoUnico - Error loading image:', event.target.src);
        event.target.src = '/images/default-product.jpg';
      },

      quickView(e){
          this.showQuickView = true;
          this.quickViewProduct = this.product;
          this.$emit('clicked');
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
        addToCart(item){
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
                // ✅ CORREGIDO: Usar el método para obtener la URL de imagen
                image: this.getProductImageUrl(item),
                quantity: 1,
                maxQuantity: this.currentStock
            }]

            if(this.cart.length > 0){
                let id = this.id 
                this.getExistPId = id
                let cartIndex = this.cart.findIndex(cart => {
                    return cart.id == id
                })

                if(cartIndex == -1){
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
                this.$toast("Agregado al Carrito",{
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
</style>