<template>
    <div>
        <div class="modal-backdrop" v-if="isPanelOpen"></div>
        <!-- Start Shopping Cart Modal -->
        <transition name="slide-fade">
            <div v-if="isPanelOpen" class="modal right shoppingCartModal" id="shoppingCartModal" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <button type="button" class="close" @click="closeSidebarPanel"><span aria-hidden="true">&times;</span></button>
                        
                        <div class="modal-body" v-if="cart.length > 0">
                            <h3>Mi Carrito ({{cart.length}})</h3>
                            
                            <div class="product-cart-content">
                                <div
                                    class="product-cart"
                                    v-for="item in cart"
                                    :key="item.id"
                                >
                                    <div class="product-image">
                                        <img :src="item.image" :alt="item.name" />
                                    </div>
                                    
                                    <div class="product-content">
                                        <div class="product-price">
                                            <span>{{item.quantity}}</span>
                                            <span>x</span>
                                            <span class="price">Bs.{{item.price}}</span>
                                            <span v-if="item.onSale" class="original-price">Bs.{{item.originalPrice}}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="cart-summary">
                                <div class="product-cart-subtotal">
                                    <span>Subtotal</span>
                                    <span class="subtotal">Bs.{{cartTotal}}</span>
                                </div>
                                
                                <div @click="closeSidebarPanel" class="product-cart-btn">
                                    <nuxt-link to="/cart" class="btn btn-light">Ver Mi Carrito</nuxt-link>
                                </div>
                            </div>
                        </div>
                        <div class="modal-body" v-else>
                            <h3>Carrito Vacio!</h3>
                            <div @click="closeSidebarPanel" class="product-cart-btn">
                                <nuxt-link to="/products" class="btn btn-primary">Ver mas Productos</nuxt-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- End Shopping Cart Modal -->
    </div>
</template>

<script>
import { store, mutations } from '../utils/sidebar-util';
export default {
    name: 'SidebarPanel',
    methods: {
        closeSidebarPanel: mutations.toggleNav
    },
    computed: {
        isPanelOpen(){
            return store.isNavOpen
        },
        cart(){
            return this.$store.getters.cart
        },
        cartTotal(){
            return this.$store.getters.totalAmount
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/styles/_transitions.scss";

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.85em;
  margin-left: 5px;
}

.cart-summary {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.product-cart-content {
  max-height: 350px;
  overflow-y: auto;
}

.product-cart-subtotal {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 15px;
}

.product-cart-btn {
  margin-top: 10px;
  width: 100%;
}

.product-cart-btn .btn {
  width: 100%;
  padding: 10px;
  text-align: center;
}

.product-cart {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 60px;
  height: 60px;
  overflow: hidden;
  margin-right: 10px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  flex: 1;
}
</style>