<template lang="pug">
  div(:class='className')
    .single-product-box
      .product-image
        nuxt-link(:to='`/products-details/${id}`')
          img(:src='api_url + product.imagen_principal.data.attributes.url')
        ul
          li
            a(href='javascript:void(0)' title='Quick View' v-b-tooltip.hover @click.prevent='quickView')
              i.far.fa-eye
          li
            a(href='#' title='Add to Wishlist' v-b-tooltip.hover)
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
            | ${{product.precio_oferta}}
          span.new-price ${{product.precio_venta}}
        .rating
          i.fas.fa-star
          i.fas.fa-star
          i.fas.fa-star
          i.fas.fa-star
          i.far.fa-star
        a.btn.btn-light.added-btn(v-if='getExistPId === id' href='javascript:void(0)' @click='addToCart(product)')
          | Ya fue Agregado!
        a.btn.btn-light(v-else href='javascript:void(0)' @click='addToCart(product)')
          | Agregar al Carrito

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
            getExistPId: null
        }
    },
    props: ['id','product', 'className'],
    computed: {
        cart(){
            return this.$store.getters.cart
        }
    },
    methods: {
        quickView(e){
            this.$emit('clicked')
        },
        addToCart(item){
            const product = [{
                id: this.id,
                name: item.nombre,
                price: item.precio_venta,
                image: this.api_url + item.imagen_principal.data.attributes.url,
                quantity: 1
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
    }
}
</script>