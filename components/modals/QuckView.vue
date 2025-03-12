<template>
    <div>
        <div class="modal-backdrop" v-if="isQuickViewOpen"></div>
        <transition name="slide-fade">
            <div v-if="isQuickViewOpen" class="modal fade productQuickView" id="productQuickView" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <button type="button" class="close" @click="closeQuickView">
                            <span aria-hidden="true"><i class="fas fa-times"></i></span>
                        </button>
                        <div class="row align-items-center">
                            <div class="col-lg-6 col-md-6">
                                <div class="productQuickView-image">
                                    <img :src="item.image" alt="image">
                                </div>
                            </div>
                            <div class="col-lg-6 col-md-6">
                                <div class="product-content">
                                    <h3><a href="#">{{ item.name }}</a></h3>
                                    <div class="price">
                                        <span class="new-price">${{ item.price.toFixed(2) }}</span>
                                    </div>
                                    <div class="product-review">
                                        <div class="rating">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star-half-alt"></i>
                                        </div>
                                        <a href="#" class="rating-count">3 reviews</a>
                                    </div>
                                    <ul class="product-info">
                                        <li><span>Vendor:</span> <a href="#">Lereve</a></li>
                                        <li><span>Availability:</span> <a href="#">In stock (7 items)</a></li>
                                        <li><span>Product Type:</span> <a href="#">T-Shirt</a></li>
                                    </ul>
                                    <div class="product-color-switch">
                                        <h4>Color:</h4>
                                        <ul>
                                            <li @click="selectColor('Black')" :class="{ active: selectedColor === 'Black' }"><a href="#" title="Black" class="color-black"></a></li>
                                            <li @click="selectColor('White')" :class="{ active: selectedColor === 'White' }"><a href="#" title="White" class="color-white"></a></li>
                                            <li @click="selectColor('Green')" :class="{ active: selectedColor === 'Green' }"><a href="#" title="Green" class="color-green"></a></li>
                                            <li @click="selectColor('Yellow Green')" :class="{ active: selectedColor === 'Yellow Green' }"><a href="#" title="Yellow Green" class="color-yellowgreen"></a></li>
                                            <li @click="selectColor('Teal')" :class="{ active: selectedColor === 'Teal' }"><a href="#" title="Teal" class="color-teal"></a></li>
                                        </ul>
                                    </div>
                                    <div class="product-size-wrapper">
                                        <h4>Size:</h4>
                                        <ul>
                                            <li @click="selectSize('XS')" :class="{ active: selectedSize === 'XS' }"><a href="#">XS</a></li>
                                            <li @click="selectSize('S')" :class="{ active: selectedSize === 'S' }"><a href="#">S</a></li>
                                            <li @click="selectSize('M')" :class="{ active: selectedSize === 'M' }"><a href="#">M</a></li>
                                            <li @click="selectSize('XL')" :class="{ active: selectedSize === 'XL' }"><a href="#">XL</a></li>
                                            <li @click="selectSize('XXL')" :class="{ active: selectedSize === 'XXL' }"><a href="#">XXL</a></li>
                                        </ul>
                                    </div>
                                    <div class="product-add-to-cart">
                                        <div class="input-counter">
                                            <span @click="decreaseQuantity()" class="minus-btn"><i class="fas fa-minus"></i></span>
                                            {{ quantity }}
                                            <span @click="increaseQuantity()" class="plus-btn"><i class="fas fa-plus"></i></span>
                                        </div>
                                        <button type="button" class="btn btn-primary" @click="addToCart(item)">
                                            <i class="fas fa-cart-plus"></i> Add to Cart
                                        </button>
                                    </div>
                                    <a href="#" class="view-full-info">View full info</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import { store, mutations } from '../../utils/sidebar-util';
export default {
    name: 'QuckView',
    data() {
        return {
            quantity: 1,
            selectedSize: null,
            selectedColor: null,
            item: {
                id: 4,
                name: 'Criss-cross V neck bodycon',
                price: 200.00,
                offer: false,
                offerPrice: 7,
                latest: true,
                bestSellers: false,
                trending: false,
                image: require('../../assets/img/img4.jpg'),
                imageHover: require('../../assets/img/img-hover4.jpg'),
                timePeriod: false,
                dateTime: new Date("December 19, 2020 17:00:00 PDT")
            }
        }
    },
    methods: {
        closeQuickView: mutations.toggleQuickView,
        selectSize(size) {
            this.selectedSize = size;
        },
        selectColor(color) {
            this.selectedColor = color;
        },
        addToCart(item) {
            // Asegúrate de que selectedSize y selectedColor no sean null
            if (!this.selectedSize || !this.selectedColor) {
                this.$toast.error("Por favor, selecciona una talla y un color antes de agregar al carrito.");
                return; // Evita continuar si no se han hecho selecciones
            }
            const product = [{
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: this.quantity,
                size: this.selectedSize,
                color: this.selectedColor
            }];
            // Lógica para agregar al carrito
            if (this.cart.length > 0) {
                let id = item.id;
                let cartIndex = this.cart.findIndex(cart => {
                    return cart.id == id;
                });
                if (cartIndex == -1) {
                    this.$store.dispatch('addToCart', product);
                    this.$toast("Agregado al carrito", {
                        icon: 'fas fa-cart-plus'
                    });
                } else {
                    this.$store.dispatch('updateCart', {
                        id, unit: 1, cart: this.cart
                    });
                    this.$toast.info("Ya agregado al carrito y actualizado con uno más");
                }
            } else {
                this.$store.dispatch('addToCart', product);
                this.$toast("Agregado al carrito", {
                    icon: 'fas fa-cart-plus'
                });
            }
            this.closeQuickView();
        },
        increaseQuantity(){
            if(this.quantity > 9){
                this.$toast.error("Can't add more than 10",{
                    icon: 'fas fa-cart-plus'
                });
            } else {
                this.quantity++;
            }
        },
        decreaseQuantity() {
            if(this.quantity < 2){
                this.$toast.error("Can't add less than 1",{
                    icon: 'fas fa-cart-plus'
                });
            } else {
                this.quantity--;
            }
        },
    },
    computed: {
        isQuickViewOpen(){
            return store.isQuickViewOpen;
        },
        cart(){
            return this.$store.getters.cart;
        }
    }
}
</script>
<style lang="scss" scoped>
@import "../../assets/scss/styles/_transitions.scss";
</style>