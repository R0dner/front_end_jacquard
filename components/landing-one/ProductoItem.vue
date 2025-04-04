<template lang="pug">
  div(:class='className')
    .single-product-box
      .product-image
        nuxt-link(:to='`/products-details/${id}`')
          img(:src='api_url + product.imagen_principal.data.attributes.url')
        .out-of-stock-badge(v-if='currentStock === 0') Agotado
        ul
          li
            a(href='javascript:void(0)' title='Ver mas' v-b-tooltip.hover @click.prevent='quickView')
              i.far.fa-eye
          li
            a(href='#' title='Añadir a deseados' v-b-tooltip.hover)
              i.far.fa-heart
          li
            a(href='#' title='Add to Compare' v-b-tooltip.hover)
              i.fas.fa-sync
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
          @click='quickView'
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
              inventoryData: null
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
          quickView(e){
              this.$emit('clicked')
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
                  image: this.api_url + item.imagen_principal.data.attributes.url,
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
  }z
  
  .product-image {
    position: relative;
  }
  
  .single-product-box:hover {
    opacity: 0.9;
  }
  </style>