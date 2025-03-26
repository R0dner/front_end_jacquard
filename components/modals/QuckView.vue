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
                                        <ul v-if="productColors.length > 0">
                                            <li v-for="color in productColors" :key="color.id" 
                                                @click="selectColor(color.attributes.nombre)" 
                                                :class="{ active: selectedColor === color.attributes.nombre }">
                                                <span class="color-circle" 
                                                      :style="{ 'background-color': color.attributes.color_rgb }"
                                                      :title="color.attributes.nombre"></span>
                                            </li>
                                        </ul>
                                        <p v-else class="no-colors">Color único disponible</p>
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
            loadingInventory: false,
            productColors: []
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
                    this.inventoryData = { stock_actual: 0 };
                }
            } catch (error) {
                console.error('Error fetching inventory:', error);
                this.inventoryData = { stock_actual: 0 };
            } finally {
                this.loadingInventory = false;
            }
        },
        async fetchProductColors() {
            try {
                if (this.product.colores?.data) {
                    this.productColors = this.product.colores.data;
                } else {
                    const response = await this.$axios.get(`/api/productos/${this.product.id}`, {
                        params: { 'populate': 'colores' }
                    });
                    this.productColors = response.data.data?.attributes?.colores?.data || [];
                }
                
                if (this.productColors.length > 0 && !this.selectedColor) {
                    this.selectedColor = this.productColors[0].attributes.nombre;
                }
            } catch (error) {
                console.error('Error fetching colors:', error);
                this.productColors = [];
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

            const cartItem = {
                id: product.id,
                name: product.nombre,
                price: product.precio,
                image: product.imageUrl,
                quantity: this.quantity,
                size: this.selectedSize,
                color: this.selectedColor,
                maxQuantity: this.currentStock,
                colorCode: this.productColors.find(c => c.attributes.nombre === this.selectedColor)?.attributes.color_rgb
            };
            
            // Versión compatible con Vuex estándar
            this.$store.dispatch('addToCart', cartItem);
            this.$toast("Agregado al carrito", {
                icon: 'fas fa-cart-plus'
            });
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
        }
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
            this.fetchProductColors();
        },
        isQuickViewOpen(newVal) {
            if (newVal && this.product.id) {
                this.fetchInventory();
                this.fetchProductColors();
            }
        }
    },
    mounted() {
        if (this.product.id) {
            this.fetchInventory();
            this.fetchProductColors();
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/styles/_transitions.scss";

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}

.modal.productQuickView {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1050;
    overflow: hidden;
    outline: 0;
}

.product-color-switch {
    margin-bottom: 20px;
    
    h4 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
    }
    
    ul {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
        
        li {
            margin: 0;
            cursor: pointer;
            
            .color-circle {
                display: block;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 1px solid #e0e0e0;
                transition: all 0.3s ease;
                
                &:hover {
                    transform: scale(1.1);
                }
            }
            
            &.active .color-circle {
                box-shadow: 0 0 0 2px #fff, 0 0 0 3px #333;
            }
        }
    }
    
    .no-colors {
        font-style: italic;
        color: #666;
        margin: 0;
    }
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.product-info a[href="#"] {
    color: inherit;
    text-decoration: none;
    cursor: default;
}

.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}
</style>