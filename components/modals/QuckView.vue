<template>
    <div>
        <div class="modal-backdrop" v-if="isQuickViewOpen"></div>
        <transition name="slide-fade">
            <div v-if="isQuickViewOpen" class="modal fade productQuickView" id="productQuickView" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <button type="button" class="close desktop-close" @click="closeQuickView">
                            <span aria-hidden="true"><i class="fas fa-times"></i></span>
                        </button>
                        
                        <button type="button" class="close-mobile" @click="closeQuickView">
                            <span aria-hidden="true"><i class="fas fa-times"></i></span>
                            <span class="close-text">Cerrar</span>
                        </button>
                        
                        <div class="row align-items-center">
                            <div class="col-lg-6 col-md-6">
                                <div class="productQuickView-image">
                                    <img v-if="productImage" :src="productImage" :alt="product.nombre">
                                    <div v-else class="no-image">📦</div>
                                </div>
                            </div>
                            <div class="col-lg-6 col-md-6">
                                <div class="product-content">
                                    <h3><a href="#">{{ product.nombre }}</a></h3>
                                    
                                    <!-- Precio dinámico basado en el inventario seleccionado -->
                                    <div class="price">
                                        <template v-if="selectedInventoryItem">
                                            <template v-if="selectedInventoryItem.en_oferta && selectedInventoryItem.precio_oferta > 0">
                                                <span class="new-price">Bs.{{ formatPrice(selectedInventoryItem.precio_oferta) }}</span>
                                                <span class="old-price">Bs.{{ formatPrice(selectedInventoryItem.precio_venta_sugerido) }}</span>
                                                <span class="offer-badge">OFERTA</span>
                                            </template>
                                            <template v-else>
                                                <span class="new-price">Bs.{{ formatPrice(selectedInventoryItem.precio_venta_sugerido) }}</span>
                                            </template>
                                        </template>
                                        <template v-else-if="!loadingInventory && inventoryItems.length > 0">
                                            <span class="new-price">Desde Bs.{{ minPrice }}</span>
                                        </template>
                                        <template v-else>
                                            <span class="new-price">Precio no disponible</span>
                                        </template>
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
                                        <li><span>Colección:</span> <a href="#">{{ product.marca?.data?.attributes?.nombre || 'Verano' }}</a></li>
                                        <li><span>Disponibilidad:</span> 
                                            <a href="#" v-if="!loadingInventory" :class="stockStatusClass">
                                                {{ stockStatusText }}
                                            </a>
                                            <a href="#" v-else>Cargando stock...</a>
                                        </li>
                                        <li><span>Tipo de Producto:</span> <a href="#">{{ product.grupo_de_productos?.data?.attributes?.nombre || 'T-Shirt' }}</a></li>
                                    </ul>

                                    <!-- Selector de Color -->
                                    <div class="product-color-switch">
                                        <h4>Colores Disponibles:</h4>
                                        <ul v-if="availableColors.length > 0">
                                            <li v-for="color in availableColors" :key="color.id" 
                                                @click="selectColor(color)" 
                                                :class="{ active: selectedColor && selectedColor.id === color.id }">
                                                <span class="color-circle" 
                                                      :style="{ 'background-color': color.codigo_hex || color.color_rgb }"
                                                      :title="color.nombre"></span>
                                            </li>
                                        </ul>
                                        <p v-else class="no-colors">No hay colores disponibles</p>
                                    </div>

                                    <!-- Selector de Talla -->
                                    <div class="product-size-wrapper" v-if="availableSizes.length > 0">
                                        <h4>Tallas Disponibles:</h4>
                                        <ul>
                                            <li v-for="size in availableSizes" :key="size.id"
                                                @click="selectSize(size)" 
                                                :class="{ active: selectedSize && selectedSize.id === size.id }">
                                                <a href="#">{{ size.nombre }}</a>
                                            </li>
                                        </ul>
                                    </div>

                                    <!-- Información de stock específica -->
                                    <div v-if="selectedInventoryItem" class="stock-info">
                                        <p><strong>Stock disponible:</strong> {{ selectedInventoryItem.stock_actual }} {{ selectedInventoryItem.unidad_de_medida || 'unidades' }}</p>
                                        <p v-if="selectedInventoryItem.stock_minimo"><small>Stock mínimo: {{ selectedInventoryItem.stock_minimo }}</small></p>
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
                                            @click="addToCart()" 
                                            :disabled="isOutOfStock || !canAddToCart"
                                        >
                                            <i :class="isOutOfStock ? 'fas fa-exclamation-triangle' : 'fas fa-cart-plus'"></i> 
                                            {{ addToCartButtonText }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
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
            selectedInventoryItem: null,
            inventoryItems: [],
            loadingInventory: false,
            availableColors: [],
            availableSizes: []
        }
    },
    methods: {
        closeQuickView: mutations.toggleQuickView,

        selectColor(color) {
            this.selectedColor = color;
            this.updateAvailableSizes();
            this.updateSelectedInventoryItem();
        },

        selectSize(size) {
            this.selectedSize = size;
            this.updateSelectedInventoryItem();
        },

        async fetchInventory() {
            this.loadingInventory = true;
            try {
                if (!this.product.id) {
                    console.error('Product ID is missing');
                    return;
                }
                
                console.log('Fetching inventory for product ID:', this.product.id);
                
                // Primero intenta con diferentes nombres de endpoint
                const possibleEndpoints = [
                    'inventario-colores',
                    'inventario-por-color-y-tallas', 
                    'inventario-color-tallas',
                    'inventario-color'
                ];
                
                let response = null;
                let usedEndpoint = '';
                
                for (const endpoint of possibleEndpoints) {
                    try {
                        console.log(`Trying endpoint: /api/${endpoint}`);
                        response = await this.$axios.get(`/api/${endpoint}`, {
                            params: {
                                'filters[producto][id][$eq]': this.product.id,
                                'populate[producto][populate]=imagen': '*',
                                'populate[color]': '*',
                                'populate[talla]': '*'
                            }
                        });
                        usedEndpoint = endpoint;
                        console.log(`Success with endpoint: /api/${endpoint}`);
                        break;
                    } catch (error) {
                        console.log(`Failed with endpoint /api/${endpoint}:`, error.response?.status);
                        continue;
                    }
                }
                
                if (!response) {
                    throw new Error('No valid endpoint found for inventory');
                }
                
                if (response.data.data && response.data.data.length > 0) {
                    this.inventoryItems = response.data.data.map(item => ({
                        id: item.id,
                        ...item.attributes,
                        color: item.attributes.color?.data?.attributes,
                        talla: item.attributes.talla?.data?.attributes
                    }));
                    
                    this.setupAvailableOptions();
                } else {
                    console.warn('No inventory data found for this product');
                    this.inventoryItems = [];
                }
            } catch (error) {
                console.error('Error fetching inventory:', error);
                this.inventoryItems = [];
            } finally {
                this.loadingInventory = false;
            }
        },

        setupAvailableOptions() {
            // Extraer colores únicos
            const colorsMap = new Map();
            this.inventoryItems.forEach(item => {
                if (item.color && item.stock_actual > 0) {
                    colorsMap.set(item.color.id, {
                        id: item.color.id,
                        nombre: item.color.nombre,
                        codigo_hex: item.color.codigo_hex,
                        color_rgb: item.color.color_rgb
                    });
                }
            });
            this.availableColors = Array.from(colorsMap.values());

            // Seleccionar primer color disponible
            if (this.availableColors.length > 0 && !this.selectedColor) {
                this.selectedColor = this.availableColors[0];
                this.updateAvailableSizes();
            }

            this.updateSelectedInventoryItem();
        },

        updateAvailableSizes() {
            if (!this.selectedColor) {
                this.availableSizes = [];
                return;
            }

            const sizesMap = new Map();
            this.inventoryItems
                .filter(item => item.color && item.color.id === this.selectedColor.id && item.stock_actual > 0)
                .forEach(item => {
                    if (item.talla) {
                        sizesMap.set(item.talla.id, {
                            id: item.talla.id,
                            nombre: item.talla.nombre
                        });
                    } else {
                        // Si no tiene talla, crear una entrada "sin talla"
                        sizesMap.set('sin-talla', {
                            id: 'sin-talla',
                            nombre: 'Talla única'
                        });
                    }
                });

            this.availableSizes = Array.from(sizesMap.values());

            // Seleccionar primera talla disponible o limpiar selección
            if (this.availableSizes.length > 0) {
                if (!this.selectedSize || !this.availableSizes.find(s => s.id === this.selectedSize.id)) {
                    this.selectedSize = this.availableSizes[0];
                }
            } else {
                this.selectedSize = null;
            }
        },

        updateSelectedInventoryItem() {
            if (!this.selectedColor) {
                this.selectedInventoryItem = null;
                return;
            }

            let targetItem;
            
            if (this.selectedSize) {
                // Buscar item específico con color y talla
                if (this.selectedSize.id === 'sin-talla') {
                    targetItem = this.inventoryItems.find(item => 
                        item.color && item.color.id === this.selectedColor.id && !item.talla
                    );
                } else {
                    targetItem = this.inventoryItems.find(item => 
                        item.color && item.color.id === this.selectedColor.id && 
                        item.talla && item.talla.id === this.selectedSize.id
                    );
                }
            } else {
                // Buscar cualquier item con el color seleccionado
                targetItem = this.inventoryItems.find(item => 
                    item.color && item.color.id === this.selectedColor.id
                );
            }

            this.selectedInventoryItem = targetItem || null;
        },

        formatPrice(price) {
            const numPrice = typeof price === 'number' ? price : parseFloat(price || 0);
            return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
        },

        addToCart() {
            if (!this.selectedInventoryItem || this.isOutOfStock) {
                this.$toast.error("Este producto no está disponible");
                return;
            }

            if (!this.selectedColor) {
                this.$toast.error("Por favor, selecciona un color");
                return;
            }

            if (this.availableSizes.length > 0 && !this.selectedSize) {
                this.$toast.error("Por favor, selecciona una talla");
                return;
            }

            if (this.quantity > this.selectedInventoryItem.stock_actual) {
                this.$toast.error(`Solo hay ${this.selectedInventoryItem.stock_actual} unidades disponibles`);
                return;
            }

            // Determinar precio final
            const finalPrice = this.selectedInventoryItem.en_oferta && this.selectedInventoryItem.precio_oferta > 0 
                ? this.selectedInventoryItem.precio_oferta 
                : this.selectedInventoryItem.precio_venta_sugerido;

            const cartItem = {
                id: this.product.id,
                inventoryId: this.selectedInventoryItem.id,
                name: this.product.nombre,
                price: parseFloat(finalPrice || 0),
                originalPrice: parseFloat(this.selectedInventoryItem.precio_venta_sugerido || 0),
                onSale: this.selectedInventoryItem.en_oferta || false,
                image: this.product.imageUrl,
                quantity: this.quantity,
                size: this.selectedSize ? this.selectedSize.nombre : null,
                color: this.selectedColor.nombre,
                colorCode: this.selectedColor.codigo_hex || this.selectedColor.color_rgb,
                maxQuantity: this.selectedInventoryItem.stock_actual,
                unidadMedida: this.selectedInventoryItem.unidad_de_medida
            };

            this.$store.dispatch('addToCart', cartItem);
            this.$toast("Agregado al carrito", {
                icon: 'fas fa-cart-plus'
            });
            this.closeQuickView();
        },

        increaseQuantity() {
            if (this.isOutOfStock) {
                this.$toast.error("Este producto está agotado");
                return;
            }

            const maxStock = this.selectedInventoryItem ? this.selectedInventoryItem.stock_actual : 0;
            
            if (this.quantity >= maxStock) {
                this.$toast.error(`No puedes agregar más de ${maxStock} unidades`);
            } else if (this.quantity >= 10) {
                this.$toast.error("No puedes agregar más de 10 unidades por pedido");
            } else {
                this.quantity++;
            }
        },

        decreaseQuantity() {
            if (this.quantity <= 1) {
                this.$toast.error("No puedes agregar menos de 1 unidad");
            } else {
                this.quantity--;
            }
        },

        resetSelections() {
            this.quantity = 1;
            this.selectedSize = null;
            this.selectedColor = null;
            this.selectedInventoryItem = null;
            this.inventoryItems = [];
            this.availableColors = [];
            this.availableSizes = [];
        }
    },

    computed: {
        isQuickViewOpen() {
            return store.isQuickViewOpen;
        },

        isOutOfStock() {
            if (!this.selectedInventoryItem) {
                return true;
            }
            return this.selectedInventoryItem.stock_actual <= 0;
        },

        canAddToCart() {
            return this.selectedColor && 
                   (this.availableSizes.length === 0 || this.selectedSize) && 
                   this.selectedInventoryItem && 
                   !this.isOutOfStock;
        },

        addToCartButtonText() {
            if (this.isOutOfStock) return 'Agotado';
            if (!this.selectedColor) return 'Selecciona Color';
            if (this.availableSizes.length > 0 && !this.selectedSize) return 'Selecciona Talla';
            return 'Añadir a Carrito';
        },

        stockStatusText() {
            if (this.loadingInventory) return 'Cargando...';
            if (this.inventoryItems.length === 0) return 'Sin stock';
            
            const totalStock = this.inventoryItems.reduce((sum, item) => sum + (item.stock_actual || 0), 0);
            
            if (totalStock <= 0) return 'Agotado';
            if (this.selectedInventoryItem) {
                return `${this.selectedInventoryItem.stock_actual} disponibles`;
            }
            return `${totalStock} unidades disponibles`;
        },

        stockStatusClass() {
            const totalStock = this.inventoryItems.reduce((sum, item) => sum + (item.stock_actual || 0), 0);
            return totalStock <= 0 ? 'text-danger font-weight-bold' : '';
        },

        minPrice() {
            if (this.inventoryItems.length === 0) return '0.00';
            
            const prices = this.inventoryItems
                .filter(item => item.stock_actual > 0)
                .map(item => {
                    const offerPrice = item.en_oferta && item.precio_oferta > 0 ? item.precio_oferta : null;
                    return offerPrice || item.precio_venta_sugerido || 0;
                })
                .filter(price => price > 0);

            if (prices.length === 0) return '0.00';
            return this.formatPrice(Math.min(...prices));
        },

        productImage() {
            // Buscar imagen del producto principal
            if (this.product.imagen?.data?.attributes?.url) {
                return this.product.imagen.data.attributes.url;
            }
            if (this.product.imageUrl) {
                return this.product.imageUrl;
            }
            // Buscar imagen en el primer item de inventario
            if (this.inventoryItems.length > 0 && this.inventoryItems[0].producto?.imagen?.data?.attributes?.url) {
                return this.inventoryItems[0].producto.imagen.data.attributes.url;
            }
            return null;
        }
    },

    watch: {
        product() {
            this.resetSelections();
            this.fetchInventory();
        },

        isQuickViewOpen(newVal) {
            if (newVal && this.product.id) {
                this.fetchInventory();
            } else if (!newVal) {
                this.resetSelections();
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
                padding-top: 50px; /* Añadir espacio para el botón superior */
                padding-bottom: 60px; /* Añadir espacio para el botón inferior */
            }
            
            /* Botón de cierre estándar (escritorio) */
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
                    display: none; /* Ocultar en móvil, usaremos el nuevo botón */
                }
                
                &:hover {
                    opacity: 1;
                    background: #fff;
                    transform: rotate(90deg);
                }
            }
            
            /* Nuevo botón de cierre superior para móvil */
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
            
            /* Botón de cierre inferior para móvil */
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
                
                &:hover {
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