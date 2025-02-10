<template>
    <div 
        :class="className">
        <div class="single-product-box">
            <div class="product-image">
                <nuxt-link :to="`/products-details/${id}`">
                    <!--<img :src="product.image" :alt="product.nombre">-->
                    <!--api_url + product.imagen_principal.data.attributes.url-->
                    <!--<img :src="api_url + product.imagen_principal.data.attributes.url" height="400">-->
                    <!--<img :src="product.imageHover" :alt="product.nombre">-->
                </nuxt-link>

                <ul>
                    <li>
                        <a 
                            href="javascript:void(0)" 
                            title="Quick View"
                            v-b-tooltip.hover
                            @click.prevent="quickView"
                        >
                            <i class="far fa-eye"></i>
                        </a>
                    </li>
                    <li>
                        <a 
                            href="#"
                            title="Add to Wishlist"
                            v-b-tooltip.hover
                        >
                            <i class="far fa-heart"></i>
                        </a>
                    </li>
                    <li>
                        <a 
                            href="#"
                            title="Add to Compare"
                            v-b-tooltip.hover
                        >
                            <i class="fas fa-sync"></i>
                        </a>
                    </li>
                </ul>
                
                <Timer v-if="product.timePeriod" v-bind:dateTime="product.dateTime"></Timer>
            </div>

            <div class="product-content">
                <h3>
                    <nuxt-link :to="`/products-details/${id}`">{{product.nombre}}</nuxt-link>
                </h3>

                <div class="product-price">
                    <span class="old-price" v-if="product.en_oferta">
                        ${{product.precio_oferta}}
                    </span>
                    <span class="new-price">${{product.precio_venta}}</span>
                </div>

                <div class="rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="far fa-star"></i>
                </div>

                <a 
                    v-if="getExistPId === id"
                    href="javascript:void(0)" 
                    class="btn btn-light added-btn"
                    @click="addToCart(product)">
                    Added Already!
                </a>

                <a 
                    v-else
                    href="javascript:void(0)" 
                    class="btn btn-light" 
                    @click="addToCart(product)">
                    Add to Cart
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import Timer from './Timer';
export default {
    name: 'ProductItem',
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
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1
            }]

            if(this.cart.length > 0){
                let id = item.id 
                this.getExistPId = id
                let cartIndex = this.cart.findIndex(cart => {
                    return cart.id == id
                })

                if(cartIndex == -1){
                    this.$store.dispatch('addToCart', product);
                    this.$toast("Added to cart", {
                        icon: 'fas fa-cart-plus'
                    });
                } else {
                    this.$store.dispatch('updateCart', {
                        id, unit: 1, cart: this.cart
                    });
                    this.$toast.info("Already added to the cart and update with one");
                }
            } else {
                this.$store.dispatch('addToCart', product)
                this.$toast("Added to cart",{
                    icon: 'fas fa-cart-plus'
                });
            }
        }
    }
}
</script>