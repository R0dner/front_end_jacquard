<template>
    <div>
        <div class="modal-backdrop" v-if="isQuickViewOpen"></div>
        <transition name="slide-fade">
            <div v-if="isQuickViewOpen" class="modal fade productQuickView" id="productQuickView" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <!-- Botón de cierre estándar -->
                        <button type="button" class="close desktop-close" @click="closeQuickView">
                            <span aria-hidden="true"><i class="fas fa-times"></i></span>
                        </button>
                        
                        <!-- Nuevo botón de cierre para móvil -->
                        <button type="button" class="close-mobile" @click="closeQuickView">
                            <span aria-hidden="true"><i class="fas fa-times"></i></span>
                            <span class="close-text">Cerrar</span>
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
                                    <div class="price" v-if="currentInventoryItem">
                                        <span class="old-price" v-if="currentInventoryItem.en_oferta">Bs.{{ currentInventoryItem.precio_venta_sugerido.toFixed(2) }}</span>
                                        <span class="new-price">
                                            Bs.{{ currentInventoryItem.en_oferta ? currentInventoryItem.precio_oferta.toFixed(2) : currentInventoryItem.precio_venta_sugerido.toFixed(2) }}
                                        </span>
                                    </div>
                                    <div class="price" v-else>
                                        <span class="new-price">Precio no disponible</span>
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
                                            <a href="#" v-if="!loadingInventory" :class="{ 'text-danger font-weight-bold': isOutOfStock }">
                                                {{ isOutOfStock ? 'Agotado' : `En stock (${currentStock} items)` }}
                                            </a>
                                            <a href="#" v-else>Cargando stock...</a>
                                        </li>
                                        <li><span>Tipo de Producto:</span> <a href="#">{{ product.grupo_de_productos?.data?.attributes?.nombre || 'T-Shirt' }}</a></li>
                                    </ul>
                                    <div class="product-color-switch">
                                        <h4>Colores Disponibles:</h4>
                                        <ul v-if="availableColors.length > 0">
                                            <li v-for="color in availableColors" :key="color.id" 
                                                @click="selectColor(color)" 
                                                :class="{ active: selectedColor && selectedColor.id === color.id }">
                                                <span class="color-circle" 
                                                      :style="{ 'background-color': color.color_rgb }"
                                                      :title="color.nombre"></span>
                                            </li>
                                        </ul>
                                        <p v-else class="no-colors">No hay colores disponibles</p>
                                    </div>
                                    <div class="product-size-wrapper" v-if="availableSizes.length > 0">
                                        <h4>Tallas Disponibles:</h4>
                                        <ul>
                                            <li v-for="size in availableSizes" 
                                                :key="size.id" 
                                                @click="selectSize(size)" 
                                                :class="{ active: selectedSize && selectedSize.id === size.id, disabled: !isSizeAvailable(size) }">
                                                <a href="#" :class="{ disabled: !isSizeAvailable(size) }">
                                                    {{ size.sigla }}
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="product-add-to-cart">
                                        <div class="input-counter" :class="{ 'disabled': isOutOfStock }">
                                            <span @click="decreaseQuantity()" class="minus-btn" :class="{ 'disabled': isOutOfStock }">
                                                <i class="fas fa-minus"></i>
                                            </span>
                                            {{ quantity }}
                                            <span @click="increaseQuantity()" class="plus-btn" :class="{ 'disabled': isOutOfStock }">
                                                <i class="fas fa-plus"></i>
                                            </span>
                                        </div>
                                        <button 
                                            type="button" 
                                            class="btn" 
                                            :class="isOutOfStock ? 'btn-secondary' : 'btn-primary'" 
                                            @click="addToCart(product)" 
                                            :disabled="isOutOfStock || !canAddToCart"
                                        >
                                            <i :class="isOutOfStock ? 'fas fa-exclamation-triangle' : 'fas fa-cart-plus'"></i> 
                                            {{ isOutOfStock ? 'Agotado' : 'Añadir a Carrito' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Botón de cierre inferior para móvil -->
                        <button type="button" class="bottom-close-mobile" @click="closeQuickView">
                            <i class="fas fa-times-circle"></i> Cerrar Vista Rápida
                        </button>
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
            inventoryData: [],
            loadingInventory: false,
            availableColors: [],
            availableSizes: []
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

        async fetchInventoryData() {
            this.loadingInventory = true;
            try {
                if (!this.product.id) {
                    console.error('Product ID is missing');
                    return;
                }
                
                const response = await this.$axios.get(`/api/inventario-colores`, {
                    params: {
                        'filters[producto][id][$eq]': this.product.id,
                        'filters[stock_actual][$gt]': 0, // Solo items con stock
                        'filters[estado_producto][$eq]': 'Activo',
                        'populate[producto]': '*',
                        'populate[color]': '*',
                        'populate[talla]': '*'
                    }
                });
                
                if (response.data.data && response.data.data.length > 0) {
                    this.inventoryData = response.data.data.map(item => ({
                        id: item.id,
                        ...item.attributes,
                        producto: item.attributes.producto.data,
                        color: item.attributes.color.data ? {
                            id: item.attributes.color.data.id,
                            ...item.attributes.color.data.attributes
                        } : null,
                        talla: item.attributes.talla.data ? {
                            id: item.attributes.talla.data.id,
                            ...item.attributes.talla.data.attributes
                        } : null
                    }));
                    
                    this.processInventoryData();
                } else {
                    console.warn('No inventory data found for this product');
                    this.inventoryData = [];
                    this.availableColors = [];
                    this.availableSizes = [];
                }
            } catch (error) {
                console.error('Error fetching inventory:', error);
                this.inventoryData = [];
                this.availableColors = [];
                this.availableSizes = [];
            } finally {
                this.loadingInventory = false;
            }
        },

        processInventoryData() {
            // Extraer colores únicos con stock disponible
            const colorsMap = new Map();
            const sizesMap = new Map();

            this.inventoryData.forEach(item => {
                if (item.color && item.stock_actual > 0) {
                    colorsMap.set(item.color.id, item.color);
                }
                if (item.talla && item.stock_actual > 0) {
                    sizesMap.set(item.talla.id, item.talla);
                }
            });

            this.availableColors = Array.from(colorsMap.values());
            this.availableSizes = Array.from(sizesMap.values());

            // Seleccionar el primer color disponible si no hay uno seleccionado
            if (this.availableColors.length > 0 && !this.selectedColor) {
                this.selectedColor = this.availableColors[0];
            }

            console.log('Inventory processed:', {
                totalItems: this.inventoryData.length,
                colors: this.availableColors.length,
                sizes: this.availableSizes.length
            });
        },

        isSizeAvailable(size) {
            if (!this.selectedColor || !size) return false;
            
            return this.inventoryData.some(item => 
                item.color && item.color.id === this.selectedColor.id &&
                item.talla && item.talla.id === size.id &&
                item.stock_actual > 0
            );
        },

        getCurrentInventoryItem() {
            if (!this.selectedColor) return null;
            
            // Si hay talla seleccionada, buscar por color y talla
            if (this.selectedSize) {
                return this.inventoryData.find(item =>
                    item.color && item.color.id === this.selectedColor.id &&
                    item.talla && item.talla.id === this.selectedSize.id
                );
            }
            
            // Si no hay talla seleccionada, buscar por color únicamente
            return this.inventoryData.find(item =>
                item.color && item.color.id === this.selectedColor.id &&
                !item.talla
            );
        },

        addToCart(product) {
            // VALIDACIÓN PRINCIPAL: Verificar stock antes que todo
            if (this.isOutOfStock) {
                this.$toast.error("Este producto está agotado");
                return;
            }
            
            // Validación de color obligatorio
            if (!this.selectedColor) {
                this.$toast.error("Por favor, selecciona un color antes de agregar al carrito.");
                return;
            }
            
            // Validación de talla si hay tallas disponibles
            if (this.availableSizes.length > 0 && !this.selectedSize) {
                this.$toast.error("Por favor, selecciona una talla antes de agregar al carrito.");
                return; 
            }
            
            if (this.quantity > this.currentStock) {
                this.$toast.error(`Solo hay ${this.currentStock} unidades disponibles`);
                return;
            }

            const inventoryItem = this.currentInventoryItem;
            if (!inventoryItem) {
                this.$toast.error("No se pudo encontrar información de inventario para esta combinación");
                return;
            }

            // Usar precio de oferta si está disponible
            const priceToUse = inventoryItem.en_oferta ? inventoryItem.precio_oferta : inventoryItem.precio_venta_sugerido;

            const cartItem = {
                id: product.id,
                inventoryId: inventoryItem.id, // ID específico del inventario
                name: product.nombre,
                price: priceToUse,
                originalPrice: inventoryItem.precio_venta_sugerido,
                onSale: inventoryItem.en_oferta,
                image: product.imageUrl,
                quantity: this.quantity,
                size: this.selectedSize ? this.selectedSize.sigla : null,
                sizeId: this.selectedSize ? this.selectedSize.id : null,
                color: this.selectedColor ? this.selectedColor.nombre : null,
                colorId: this.selectedColor ? this.selectedColor.id : null,
                maxQuantity: this.currentStock,
                colorCode: this.selectedColor ? this.selectedColor.color_rgb : null
            };
            
            this.$store.dispatch('addToCart', cartItem);
            this.$toast("Agregado al carrito", {
                icon: 'fas fa-cart-plus'
            });
            this.closeQuickView();
        },
        
        increaseQuantity() {
            if(this.isOutOfStock) {
                this.$toast.error("Este producto está agotado", {
                    icon: 'fas fa-exclamation-triangle'
                });
                return;
            }
            
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
        
        currentInventoryItem() {
            return this.getCurrentInventoryItem();
        },
        
        currentStock() {
            const item = this.currentInventoryItem;
            return item ? item.stock_actual || 0 : 0;
        },
        
        isOutOfStock() {
            return this.currentStock <= 0;
        },

        canAddToCart() {
            // Verificar que tenga color seleccionado
            if (!this.selectedColor) return false;
            
            // Si hay tallas disponibles, debe seleccionar una
            if (this.availableSizes.length > 0 && !this.selectedSize) return false;
            
            // Debe tener stock disponible
            return this.currentStock > 0;
        }
    },
    watch: {
        product() {
            this.quantity = 1;
            this.selectedSize = null;
            this.selectedColor = null;
            this.inventoryData = [];
            this.availableColors = [];
            this.availableSizes = [];
            this.fetchInventoryData();
        },
        
        isQuickViewOpen(newVal) {
            if (newVal && this.product.id) {
                this.fetchInventoryData();
            }
        },

        selectedColor() {
            // Reset size when color changes
            this.selectedSize = null;
            this.quantity = 1;
        },

        selectedSize() {
            // Reset quantity when size changes
            this.quantity = 1;
        }
    },
    mounted() {
        if (this.product.id) {
            this.fetchInventoryData();
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
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1040;
    backdrop-filter: blur(2px);
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
    padding: 20px;
    
    @media (max-width: 767.98px) {
        padding: 10px;
        overflow-y: auto;
    }
    
    .modal-dialog {
        max-width: 900px;
        margin: 2rem auto;
        transition: all 0.3s ease;
        
        @media (max-width: 991.98px) {
            max-width: 95%;
            margin: 1.5rem auto;
        }
        
        @media (max-width: 767.98px) {
            margin: 1rem auto;
        }
        
        @media (max-width: 575.98px) {
            max-width: 100%;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        
        .modal-content {
            border: none;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
            background-color: #fff;
            position: relative;
            
            @media (max-width: 575.98px) {
                border-radius: 0;
                min-height: 100vh;
                height: auto;
                padding-top: 50px;
                padding-bottom: 60px;
            }
            
            .close.desktop-close {
                position: absolute;
                right: 20px;
                top: 20px;
                z-index: 10;
                background: rgba(255, 255, 255, 0.8);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: #333;
                opacity: 0.8;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                
                @media (max-width: 767.98px) {
                    display: none;
                }
                
                &:hover {
                    opacity: 1;
                    background: #fff;
                    transform: rotate(90deg);
                }
            }
            
            .close-mobile {
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50px;
                background-color: #4a89dc;
                color: #fff;
                border: none;
                z-index: 15;
                padding: 0;
                text-align: center;
                font-weight: 600;
                font-size: 16px;
                align-items: center;
                justify-content: center;
                width: 100%;
                
                @media (max-width: 767.98px) {
                    display: flex;
                }
                
                .close-text {
                    margin-left: 8px;
                }
                
                i {
                    font-size: 16px;
                }
                
                &:active {
                    background-color: #3a70c2;
                }
            }
            
            .bottom-close-mobile {
                display: none;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 60px;
                background-color: #f8f9fa;
                border-top: 1px solid #e0e0e0;
                color: #555;
                font-weight: 600;
                align-items: center;
                justify-content: center;
                width: 100%;
                font-size: 15px;
                padding: 0;
                border-left: none;
                border-right: none;
                border-bottom: none;
                
                @media (max-width: 767.98px) {
                    display: flex;
                }
                
                i {
                    margin-right: 8px;
                    color: #4a89dc;
                }
                
                &:active {
                    background-color: #e9ecef;
                }
            }
            
            .row {
                margin: 0;
                
                @media (max-width: 767.98px) {
                    flex-direction: column;
                }
                
                > div {
                    padding: 30px;
                    
                    @media (max-width: 991.98px) {
                        padding: 25px;
                    }
                    
                    @media (max-width: 767.98px) {
                        padding: 20px;
                    }
                    
                    @media (max-width: 575.98px) {
                        padding: 15px;
                    }
                }
            }
        }
    }
}

.productQuickView-image {
    text-align: center;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 6px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    @media (max-width: 767.98px) {
        margin-bottom: 0;
        height: auto;
        min-height: 250px;
        max-height: 300px;
        border-radius: 6px 6px 0 0;
    }
    
    @media (max-width: 575.98px) {
        min-height: 200px;
        max-height: 250px;
        padding: 10px;
    }
    
    img {
        max-width: 100%;
        max-height: 400px;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
        mix-blend-mode: multiply;
        
        @media (max-width: 991.98px) {
            max-height: 350px;
        }
        
        @media (max-width: 767.98px) {
            max-height: 280px;
        }
        
        @media (max-width: 575.98px) {
            max-height: 230px;
        }
    }
}

.product-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    
    @media (max-width: 767.98px) {
        padding-top: 15px;
    }
    
    h3 {
        font-size: 24px;
        margin-bottom: 12px;
        color: #333;
        font-weight: 600;
        line-height: 1.3;
        
        @media (max-width: 991.98px) {
            font-size: 22px;
        }
        
        @media (max-width: 767.98px) {
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        @media (max-width: 575.98px) {
            font-size: 18px;
        }
        
        a {
            color: inherit;
            text-decoration: none;
            transition: color 0.2s;
            
            &:hover {
                color: #4a89dc;
            }
        }
    }
    
    .price {
        margin-bottom: 18px;
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 12px;
        
        @media (max-width: 767.98px) {
            font-size: 18px;
            margin-bottom: 15px;
            gap: 10px;
        }
        
        @media (max-width: 575.98px) {
            font-size: 16px;
            margin-bottom: 12px;
        }
        
        .old-price {
            text-decoration: line-through;
            color: #999;
            font-size: 18px;
            font-weight: 500;
            
            @media (max-width: 767.98px) {
                font-size: 16px;
            }
            
            @media (max-width: 575.98px) {
                font-size: 14px;
            }
        }
        
        .new-price {
            color: #e74c3c;
        }
    }
    
    .product-review {
        display: flex;
        align-items: center;
        margin-bottom: 18px;
        
        @media (max-width: 767.98px) {
            margin-bottom: 15px;
        }
        
        @media (max-width: 575.98px) {
            margin-bottom: 12px;
        }
        
        .rating {
            color: #ffc107;
            margin-right: 10px;
            font-size: 15px;
            
            @media (max-width: 575.98px) {
                font-size: 14px;
            }
        }
        
        .rating-count {
            color: #7f8c8d;
            font-size: 14px;
            text-decoration: none;
            transition: color 0.2s;
            
            @media (max-width: 575.98px) {
                font-size: 13px;
            }
            
            &:hover {
                color: #4a89dc;
            }
        }
    }
    
    .product-info {
        list-style: none;
        padding: 0;
        margin-bottom: 25px;
        border-top: 1px solid #f0f0f0;
        padding-top: 15px;
        
        @media (max-width: 767.98px) {
            margin-bottom: 20px;
            padding-top: 12px;
        }
        
        @media (max-width: 575.98px) {
            margin-bottom: 15px;
            padding-top: 10px;
        }
        
        li {
            margin-bottom: 10px;
            font-size: 14px;
            display: flex;
            
            @media (max-width: 575.98px) {
                font-size: 13px;
                margin-bottom: 8px;
                flex-direction: column;
            }
            
            span {
                font-weight: 600;
                color: #555;
                margin-right: 8px;
                min-width: 120px;
                
                @media (max-width: 767.98px) {
                    min-width: 100px;
                }
                
                @media (max-width: 575.98px) {
                    min-width: auto;
                    margin-bottom: 2px;
                }
            }
            
            a {
                color: #7f8c8d;
                transition: color 0.2s;
                
                &:hover {
                    color: #4a89dc;
                    text-decoration: none;
                }
            }
        }
    }
}

.product-color-switch {
    margin-bottom: 25px;
    
    @media (max-width: 767.98px) {
        margin-bottom: 20px;
    }
    
    @media (max-width: 575.98px) {
        margin-bottom: 15px;
    }
    
    h4 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #555;
        
        @media (max-width: 575.98px) {
            font-size: 15px;
            margin-bottom: 10px;
        }
    }
    
    ul {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
        
        @media (max-width: 575.98px) {
            gap: 8px;
        }
        
        li {
            margin: 0;
            cursor: pointer;
            position: relative;
            
            .color-circle {
                display: block;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid #f0f0f0;
                transition: all 0.3s ease;
                box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
                
                @media (max-width: 575.98px) {
                    width: 28px;
                    height: 28px;
                }
                
                &:hover {
                    transform: scale(1.1);
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
                }
            }
            
            &.active .color-circle {
                box-shadow: 0 0 0 2px #fff, 0 0 0 4px #4a89dc;
            }
            
            &::after {
                content: attr(title);
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: #333;
                color: #fff;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 11px;
                opacity: 0;
                transition: opacity 0.2s;
                pointer-events: none;
                white-space: nowrap;
                z-index: 10;
                
                @media (max-width: 575.98px) {
                    font-size: 10px;
                    padding: 2px 6px;
                }
            }
            
            &:hover::after {
                opacity: 1;
            }
        }
    }
    
    .no-colors {
        font-style: italic;
        color: #95a5a6;
        margin: 0;
        font-size: 14px;
        
        @media (max-width: 575.98px) {
            font-size: 13px;
        }
    }
}

.product-size-wrapper {
    margin-bottom: 25px;
    
    @media (max-width: 767.98px) {
        margin-bottom: 20px;
    }
    
    @media (max-width: 575.98px) {
        margin-bottom: 15px;
    }
    
    h4 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #555;
        
        @media (max-width: 575.98px) {
            font-size: 15px;
            margin-bottom: 10px;
        }
    }
    
    ul {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
        
        @media (max-width: 575.98px) {
            gap: 6px;
        }
        
        li {
            margin: 0;
            
            &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                
                a {
                    color: #bdc3c7 !important;
                    cursor: not-allowed !important;
                    
                    &:hover {
                        border-color: #e0e0e0 !important;
                        background: transparent !important;
                    }
                }
            }
            
            a {
                display: block;
                padding: 8px 15px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                color: #555;
                text-decoration: none;
                transition: all 0.3s;
                font-size: 13px;
                font-weight: 500;
                min-width: 40px;
                text-align: center;
                
                @media (max-width: 767.98px) {
                    padding: 7px 12px;
                    min-width: 36px;
                }
                
                @media (max-width: 575.98px) {
                    padding: 6px 10px;
                    font-size: 12px;
                    min-width: 32px;
                }
                
                &:hover:not(.disabled) {
                    border-color: #bdc3c7;
                    background: #f8f9fa;
                }
            }
            
            &.active a {
                background-color: #4a89dc;
                color: #fff;
                border-color: #4a89dc;
            }
        }
    }
}

/* Estilos para productos agotados */
.text-danger {
    color: #dc3545 !important;
}

.font-weight-bold {
    font-weight: 700 !important;
}

.input-counter.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.input-counter span.disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: #fff;
    
    &:hover:not(:disabled) {
        background-color: #5a6268;
        border-color: #545b62;
    }
    
    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
}

.product-add-to-cart {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    
    @media (max-width: 767.98px) {
        gap: 12px;
        margin-bottom: 20px;
    }
    
    @media (max-width: 575.98px) {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .input-counter {
        display: flex;
        align-items: center;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 0;
        font-size: 16px;
        overflow: hidden;
        background: #f8f9fa;
        
        @media (max-width: 767.98px) {
            width: 100%;
        }
        
        span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            cursor: pointer;
            color: #555;
            transition: all 0.2s;
            user-select: none;
            
            @media (max-width: 767.98px) {
                width: 32px;
                height: 32px;
            }
            
            @media (max-width: 575.98px) {
                width: 30px;
                height: 30px;
            }
            
            &:hover {
                background-color: #f0f0f0;
            }
            
            &:active {
                background-color: #e0e0e0;
            }
        }
    }
    
    .btn {
        padding: 12px 20px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 14px;
        flex-grow: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        
        @media (max-width: 767.98px) {
            padding: 10px 16px;
        }
        
        @media (max-width: 575.98px) {
            width: 100%;
            padding: 12px;
        }
        
        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        &.btn-primary {
            background-color: #4a89dc;
            border-color: #4a89dc;
            color: #fff;
            
            &:hover:not(:disabled) {
                background-color: #3a70c2;
                border-color: #3a70c2;
            }
            
            &:active:not(:disabled) {
                background-color: #2a5ca8;
                border-color: #2a5ca8;
            }
        }
    }
}

.view-full-info {
    display: inline-block;
    margin-top: auto;
    font-size: 14px;
    color: #4a89dc;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    
    @media (max-width: 575.98px) {
        font-size: 13px;
        text-align: center;
        display: block;
    }
    
    &:hover {
        color: #2a5ca8;
        text-decoration: underline;
    }
}
</style>