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
                                    <img :src="product.imageUrl" alt="image">
                                </div>
                            </div>
                            <div class="col-lg-6 col-md-6">
                                <div class="product-content">
                                    <h3><a href="#">{{ product.nombre }}</a></h3>
                                    <div class="price">
                                        <span class="old-price" v-if="product.enOferta">${{ product.precioOferta.toFixed(2) }}</span>
                                        <span class="new-price">${{ product.precio.toFixed(2) }}</span>
                                    </div>
                                    <div class="product-review">
                                        <div class="rating">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star-half-alt"></i>
                                        </div>
                                        <a href="#" class="rating-count">5 reviews</a>
                                    </div>
                                    <ul class="product-info">
                                        <li><span>Coleccion:</span> <a href="#">{{ product.marca?.data?.attributes?.nombre || 'Verano' }}</a></li>
                                        <li><span>Disponibilidad:</span> 
                                            <a href="#" v-if="!loadingInventory">
                                                {{ currentStock > 0 ? `En stock (${currentStock} items)` : 'Agotado' }}
                                            </a>
                                            <a href="#" v-else>Cargando stock...</a>
                                        </li>
                                        <li><span>Tipo de Producto:</span> <a href="#">{{ product.grupo_de_productos?.data?.attributes?.nombre || 'T-Shirt' }}</a></li>
                                    </ul>
                                    <div class="product-color-switch">
                                        <h4>Colores Disponibles:</h4>
                                        <ul>
                                            <li @click="selectColor('Black')" :class="{ active: selectedColor === 'Black' }"><a href="#" title="Black" class="color-black"></a></li>
                                            <li @click="selectColor('White')" :class="{ active: selectedColor === 'White' }"><a href="#" title="White" class="color-white"></a></li>
                                            <li @click="selectColor('Green')" :class="{ active: selectedColor === 'Green' }"><a href="#" title="Green" class="color-green"></a></li>
                                            <li @click="selectColor('Yellow Green')" :class="{ active: selectedColor === 'Yellow Green' }"><a href="#" title="Yellow Green" class="color-yellowgreen"></a></li>
                                            <li @click="selectColor('Teal')" :class="{ active: selectedColor === 'Teal' }"><a href="#" title="Teal" class="color-teal"></a></li>
                                        </ul>
                                    </div>
                                    <div class="product-size-wrapper">
                                        <h4>Tallas Disponibles:</h4>
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
                                        <button type="button" class="btn btn-primary" @click="addToCart(product)" :disabled="currentStock <= 0">
                                            <i class="fas fa-cart-plus"></i> 
                                            {{ currentStock > 0 ? 'Añadir a Carrito' : 'Agotado' }}
                                        </button>
                                    </div>
                                    <a href="#" class="view-full-info">Ver Informacion Completa</a>
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
    name: 'QuickView',
    props: {
        product: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            quantity: 1,
            selectedSize: null,
            selectedColor: null,
            inventoryData: null,
            loadingInventory: false
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
        async fetchInventory() {
            this.loadingInventory = true;
            try {
                if (!this.product.id) {
                    console.error('Product ID is missing');
                    return;
                }
                
                // Asegúrate de usar el endpoint correcto de tu API Strapi
                const response = await this.$axios.get(`/api/inventarios`, {
                    params: {
                        'filters[producto][id][$eq]': this.product.id,
                        'populate': '*'
                    }
                });
                
                if (response.data.data && response.data.data.length > 0) {
                    this.inventoryData = response.data.data[0].attributes;
                } else {
                    console.warn('No inventory data found for this product');
                    this.inventoryData = { stock_actual: 0 }; // Valor por defecto si no hay registro
                }
            } catch (error) {
                console.error('Error fetching inventory:', error);
                this.inventoryData = { stock_actual: 0 }; // Valor por defecto en caso de error
            } finally {
                this.loadingInventory = false;
            }
        },
        addToCart(product) {
            if (this.currentStock <= 0) {
                this.$toast.error("Este producto está agotado");
                return;
            }
            
            if (!this.selectedSize || !this.selectedColor) {
                this.$toast.error("Por favor, selecciona una talla y un color antes de agregar al carrito.");
                return; 
            }
            
            if (this.quantity > this.currentStock) {
                this.$toast.error(`Solo hay ${this.currentStock} unidades disponibles`);
                return;
            }

            const cartProduct = [{
                id: product.id,
                name: product.nombre,
                price: product.precio,
                image: product.imageUrl,
                quantity: this.quantity,
                size: this.selectedSize,
                color: this.selectedColor,
                maxQuantity: this.currentStock // Agregamos el stock máximo disponible
            }];
            
            if (this.cart.length > 0) {
                let id = product.id;
                let cartIndex = this.cart.findIndex(cart => {
                    return cart.id == id;
                });
                
                if (cartIndex == -1) {
                    this.$store.dispatch('addToCart', cartProduct);
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
                this.$store.dispatch('addToCart', cartProduct);
                this.$toast("Agregado al carrito", {
                    icon: 'fas fa-cart-plus'
                });
            }
            this.closeQuickView();
        },
        increaseQuantity() {
            if(this.quantity >= this.currentStock) {
                this.$toast.error(`No puedes agregar más de ${this.currentStock} unidades`, {
                    icon: 'fas fa-cart-plus'
                });
            } else if(this.quantity >= 10) {
                this.$toast.error("No puedes agregar más de 10 unidades por pedido", {
                    icon: 'fas fa-cart-plus'
                });
            } else {
                this.quantity++;
            }
        },
        decreaseQuantity() {
            if(this.quantity <= 1) {
                this.$toast.error("No puedes agregar menos de 1 unidad", {
                    icon: 'fas fa-cart-plus'
                });
            } else {
                this.quantity--;
            }
        },
    },
    computed: {
        isQuickViewOpen() {
            return store.isQuickViewOpen;
        },
        cart() {
            return this.$store.getters.cart;
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
    watch: {
        product() {
            this.quantity = 1;
            this.selectedSize = null;
            this.selectedColor = null;
            this.fetchInventory();
        },
        isQuickViewOpen(newVal) {
            if (newVal && this.product.id) {
                this.fetchInventory();
            }
        }
    },
    mounted() {
        if (this.product.id) {
            this.fetchInventory();
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/styles/_transitions.scss";

/* Estilos adicionales para estado agotado */
button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.product-info a[href="#"] {
    color: inherit;
    text-decoration: none;
    cursor: default;
}
</style>