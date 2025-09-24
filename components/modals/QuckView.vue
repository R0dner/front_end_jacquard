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
                                    <img :src="product.imageUrl || getProductImage()" :alt="product.nombre || 'Producto'">
                                </div>
                            </div>
                            <div class="col-lg-6 col-md-6">
                                <div class="product-content">
                                    <h3><a href="#">{{ product.nombre || 'Producto sin nombre' }}</a></h3>
                                    
                                    <!-- Precio dinámico basado en selección -->
                                    <div class="price">
                                        <span class="old-price" v-if="selectedInventoryItem && selectedInventoryItem.attributes.en_oferta">
                                            Bs.{{ selectedInventoryItem.attributes.precio_venta_sugerido.toFixed(2) }}
                                        </span>
                                        <span class="new-price">
                                            Bs.{{ currentPrice.toFixed(2) }}
                                        </span>
                                    </div>
                                    
                                    <div class="product-review">
                                        <div class="rating">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star-half-alt"></i>
                                        </div>
                                        <a href="#" class="rating-count">{{ product.valoracion || 5 }} reviews</a>
                                    </div>
                                    
                                    <ul class="product-info">
                                        <li><span>Código:</span> 
                                            <a href="#">{{ product.codigo || 'Sin código' }}</a>
                                        </li>
                                        <li><span>Disponibilidad:</span> 
                                            <a href="#" v-if="!loadingInventory" :class="{ 'text-danger font-weight-bold': isOutOfStock }">
                                                {{ isOutOfStock ? 'Agotado' : `En stock (${currentStock} items)` }}
                                            </a>
                                            <a href="#" v-else>Cargando stock...</a>
                                        </li>
                                        <li><span>Tipo de Producto:</span> 
                                            <a href="#">{{ getProductType() }}</a>
                                        </li>
                                        <li><span>Estado:</span> 
                                            <a href="#" :class="getStatusClass()">{{ getProductStatus() }}</a>
                                        </li>
                                    </ul>
                                    
                                    <div class="product-color-switch">
                                        <h4>Colores Disponibles:</h4>
                                        <ul v-if="availableColors.length > 0">
                                            <li v-for="color in availableColors" :key="color.id" 
                                                @click="selectColor(color)" 
                                                :class="{ active: selectedColor?.id === color.id }">
                                                <span class="color-circle" 
                                                      :style="{ 'background-color': color.attributes.color_rgb || color.attributes.codigo_hex || '#cccccc' }"
                                                      :title="color.attributes.nombre"></span>
                                            </li>
                                        </ul>
                                        <p v-else class="no-colors">No hay colores disponibles</p>
                                    </div>
                                    
                                    <div class="product-size-wrapper">
                                        <h4>Tallas Disponibles:</h4>
                                        <ul v-if="availableSizes.length > 0">
                                            <li v-for="size in availableSizes" :key="size.id" 
                                                @click="selectSize(size)" 
                                                :class="{ active: selectedSize?.id === size.id, disabled: getSizeStock(size) <= 0 }">
                                                <a href="#" :class="{ 'out-of-stock': getSizeStock(size) <= 0 }">
                                                    {{ size.attributes.sigla || size.attributes.nombre }}
                                                    <span class="size-stock" v-if="getSizeStock(size) <= 5 && getSizeStock(size) > 0">
                                                        ({{ getSizeStock(size) }})
                                                    </span>
                                                </a>
                                            </li>
                                        </ul>
                                        <p v-else class="no-sizes">{{ selectedColor ? 'No hay tallas para este color' : 'Selecciona un color para ver tallas' }}</p>
                                    </div>
                                    
                                    <!-- Información adicional de precios -->
                                    <div class="price-info" v-if="selectedInventoryItem">
                                        <small class="text-muted">
                                            <div v-if="selectedInventoryItem.attributes.margen_ganancia">
                                                Margen: {{ selectedInventoryItem.attributes.margen_ganancia }}%
                                            </div>
                                            <div v-if="selectedInventoryItem.attributes.unidad_de_medida">
                                                Unidad: {{ selectedInventoryItem.attributes.unidad_de_medida }}
                                            </div>
                                        </small>
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
                                            :disabled="isOutOfStock || !selectedColor || !selectedSize"
                                        >
                                            <i :class="isOutOfStock ? 'fas fa-exclamation-triangle' : 'fas fa-cart-plus'"></i> 
                                            {{ buttonText }}
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
    computed: {
        isQuickViewOpen() {
            return store.isQuickViewOpen;
        },
        
        // Obtener el item de inventario seleccionado actualmente
        selectedInventoryItem() {
            if (!this.selectedColor || !this.selectedSize || !this.inventoryData.length) {
                return null;
            }
            
            const item = this.inventoryData.find(item => 
                item.attributes.color?.data?.id === this.selectedColor.id &&
                item.attributes.talla?.data?.id === this.selectedSize.id
            );
            
            if (item) {
                console.log('Selected inventory item:', item);
            }
            
            return item;
        },
        
        // Stock actual basado en la selección
        currentStock() {
            if (this.selectedInventoryItem) {
                return this.selectedInventoryItem.attributes.stock_actual || 0;
            }
            return 0;
        },
        
        // Precio actual basado en la selección
        currentPrice() {
            if (this.selectedInventoryItem) {
                const item = this.selectedInventoryItem.attributes;
                if (item.en_oferta && item.precio_oferta && item.precio_oferta > 0) {
                    return item.precio_oferta;
                }
                return item.precio_venta_sugerido || item.precio_unitario || 0;
            }
            return 0;
        },
        
        // Estado de stock agotado
        isOutOfStock() {
            return this.currentStock <= 0;
        },
        
        // Texto del botón
        buttonText() {
            if (this.isOutOfStock) return 'Agotado';
            if (!this.selectedColor) return 'Selecciona Color';
            if (!this.selectedSize) return 'Selecciona Talla';
            return 'Añadir a Carrito';
        }
    },
    methods: {
        closeQuickView: mutations.toggleQuickView,
        
        getProductImage() {
            // Intentar obtener imagen desde diferentes fuentes
            if (this.product.imagen_principal?.data?.attributes?.url) {
                return this.product.imagen_principal.data.attributes.url;
            }
            if (this.product.imagen_principal?.url) {
                return this.product.imagen_principal.url;
            }
            if (this.product.multimedia?.data?.[0]?.attributes?.url) {
                return this.product.multimedia.data[0].attributes.url;
            }
            return '/placeholder-image.jpg'; // Imagen por defecto
        },
        
        getProductType() {
            // Intentar obtener tipo de producto desde grupos
            if (this.product.grupos_de_productos?.data?.[0]?.attributes?.nombre) {
                return this.product.grupos_de_productos.data[0].attributes.nombre;
            }
            if (this.product.grupo_de_productos?.data?.attributes?.nombre) {
                return this.product.grupo_de_productos.data.attributes.nombre;
            }
            return 'General';
        },
        
        getProductStatus() {
            if (this.selectedInventoryItem) {
                return this.selectedInventoryItem.attributes.estado_producto || 'Activo';
            }
            return this.product.activo ? 'Activo' : 'Inactivo';
        },
        
        getStatusClass() {
            const status = this.getProductStatus();
            return {
                'text-success': status === 'Activo',
                'text-danger': status === 'Inactivo' || status === 'Descontinuado',
                'text-warning': status === 'Agotado'
            };
        },
        
        async fetchInventory() {
            this.loadingInventory = true;
            try {
                if (!this.product.id) {
                    console.error('Product ID is missing');
                    return;
                }
                
                console.log(`Fetching inventory for product ID: ${this.product.id}`);
                
                const response = await this.$axios.get(`/api/inventario-colores`, {
                    params: {
                        'filters[producto][id][$eq]': this.product.id,
                        'populate[producto]': true,
                        'populate[color]': true,
                        'populate[talla]': true
                    }
                });
                
                if (response.data.data && response.data.data.length > 0) {
                    console.log(`QuickView: Found ${response.data.data.length} inventory records for product ${this.product.id}`);
                    this.inventoryData = response.data.data;
                    this.processInventoryData();
                } else {
                    console.warn(`QuickView: No inventory data found for product ${this.product.id}`);
                    // Fallback: usar información del producto
                    await this.useProductFallback();
                }
            } catch (error) {
                console.error('QuickView: Error fetching inventory:', error);
                // Fallback: usar información del producto
                await this.useProductFallback();
            } finally {
                this.loadingInventory = false;
            }
        },
        
        // Fallback para usar información básica del producto
        async useProductFallback() {
            try {
                console.log('Using product fallback for colors/sizes');
                
                // Intentar obtener el producto completo con sus relaciones
                const response = await this.$axios.get(`/api/productos/${this.product.id}`, {
                    params: { 
                        'populate[colores]': true,
                        'populate[tallas]': true,
                        'populate[grupos_de_productos]': true
                    }
                });
                
                const productData = response.data.data?.attributes || this.product;
                
                // Obtener colores
                if (productData.colores?.data) {
                    this.availableColors = productData.colores.data;
                    console.log('Colors from product API:', this.availableColors.length);
                } else if (this.product.colores?.data) {
                    this.availableColors = this.product.colores.data;
                    console.log('Colors from product prop:', this.availableColors.length);
                } else {
                    console.warn('No colors found for this product');
                    this.availableColors = [];
                }
                
                // Obtener tallas
                if (productData.tallas?.data) {
                    this.availableSizes = productData.tallas.data;
                    console.log('Sizes from product API:', this.availableSizes.length);
                } else if (this.product.tallas?.data) {
                    this.availableSizes = this.product.tallas.data;
                    console.log('Sizes from product prop:', this.availableSizes.length);
                } else {
                    console.warn('No sizes found for this product');
                    this.availableSizes = [];
                }
                
                // Auto-seleccionar primer color si hay disponibles
                if (this.availableColors.length > 0 && !this.selectedColor) {
                    this.selectColor(this.availableColors[0]);
                }
                
            } catch (error) {
                console.error('Error in product fallback:', error);
                this.availableColors = [];
                this.availableSizes = [];
            }
        },
        
        processInventoryData() {
            // Extraer colores únicos disponibles con stock
            const colorsMap = new Map();
            
            this.inventoryData.forEach(item => {
                const color = item.attributes.color?.data;
                const stock = item.attributes.stock_actual || 0;
                
                if (color && stock > 0 && !colorsMap.has(color.id)) {
                    colorsMap.set(color.id, color);
                }
            });
            
            this.availableColors = Array.from(colorsMap.values());
            console.log(`Processed ${this.availableColors.length} colors with stock`);
            
            // Preseleccionar el primer color si no hay ninguno seleccionado
            if (this.availableColors.length > 0 && !this.selectedColor) {
                this.selectColor(this.availableColors[0]);
            }
        },
        
        selectColor(color) {
            this.selectedColor = color;
            this.selectedSize = null; // Resetear talla al cambiar color
            this.updateAvailableSizes();
            console.log(`Selected color: ${color.attributes.nombre}`);
        },
        
        selectSize(size) {
            if (this.getSizeStock(size) > 0) {
                this.selectedSize = size;
                console.log(`Selected size: ${size.attributes.nombre || size.attributes.sigla}`);
            }
        },
        
        updateAvailableSizes() {
            if (!this.selectedColor) {
                this.availableSizes = [];
                return;
            }
            
            // Filtrar tallas disponibles para el color seleccionado con stock > 0
            const sizesForColor = this.inventoryData
                .filter(item => 
                    item.attributes.color?.data?.id === this.selectedColor.id &&
                    item.attributes.talla?.data && // Verificar que existe la talla
                    item.attributes.stock_actual > 0 // Solo tallas con stock
                )
                .map(item => item.attributes.talla.data);
            
            // Remover duplicados basándose en ID
            const uniqueSizes = sizesForColor.filter((size, index, self) => 
                index === self.findIndex(s => s.id === size.id)
            );
            
            this.availableSizes = uniqueSizes;
            console.log(`Tallas disponibles para color ${this.selectedColor.attributes.nombre}:`, this.availableSizes.length);
            
            // Auto-seleccionar primera talla disponible con stock
            if (this.availableSizes.length > 0 && !this.selectedSize) {
                this.selectSize(this.availableSizes[0]);
            } else if (this.availableSizes.length === 0) {
                console.warn('No se encontraron tallas con stock para este color');
            }
        },
        
        getSizeStock(size) {
            if (!this.selectedColor || !size) return 0;
            
            const inventoryItem = this.inventoryData.find(item => 
                item.attributes.color?.data?.id === this.selectedColor.id &&
                item.attributes.talla?.data?.id === size.id
            );
            
            const stock = inventoryItem ? inventoryItem.attributes.stock_actual : 0;
            return stock;
        },
        
        addToCart(product) {
            // Validaciones
            if (this.isOutOfStock) {
                this.$toast.error("Este producto está agotado");
                return;
            }
            
            if (!this.selectedColor) {
                this.$toast.error("Por favor, selecciona un color antes de agregar al carrito.");
                return;
            }
            
            if (!this.selectedSize) {
                this.$toast.error("Por favor, selecciona una talla antes de agregar al carrito.");
                return; 
            }
            
            if (this.quantity > this.currentStock) {
                this.$toast.error(`Solo hay ${this.currentStock} unidades disponibles`);
                return;
            }

            const cartItem = {
                id: `${product.id}-${this.selectedColor.id}-${this.selectedSize.id}`,
                productId: product.id,
                name: product.nombre,
                price: this.currentPrice,
                originalPrice: this.selectedInventoryItem?.attributes.precio_venta_sugerido || this.currentPrice,
                onSale: this.selectedInventoryItem?.attributes.en_oferta || false,
                image: this.getProductImage(),
                quantity: this.quantity,
                size: this.selectedSize.attributes.sigla || this.selectedSize.attributes.nombre,
                sizeId: this.selectedSize.id,
                color: this.selectedColor.attributes.nombre,
                colorId: this.selectedColor.id,
                colorCode: this.selectedColor.attributes.color_rgb || this.selectedColor.attributes.codigo_hex,
                maxQuantity: this.currentStock,
                inventoryId: this.selectedInventoryItem?.id
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
        },
        
        resetSelections() {
            this.quantity = 1;
            this.selectedSize = null;
            this.selectedColor = null;
            this.inventoryData = [];
            this.availableColors = [];
            this.availableSizes = [];
        }
    },
    watch: {
        product: {
            handler() {
                this.resetSelections();
                if (this.product.id) {
                    this.fetchInventory();
                }
            },
            deep: true
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
                    display: none;
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
    
    .price-info {
        margin-bottom: 15px;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 4px;
        
        small {
            font-size: 12px;
            
            div {
                margin-bottom: 2px;
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
                position: relative;
                
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
                
                .size-stock {
                    font-size: 10px;
                    color: #dc3545;
                    font-weight: 600;
                    display: block;
                    line-height: 1;
                    
                    @media (max-width: 575.98px) {
                        font-size: 9px;
                    }
                }
            }
            
            &.active a {
                background-color: #4a89dc;
                color: #fff;
                border-color: #4a89dc;
                
                .size-stock {
                    color: rgba(255, 255, 255, 0.9);
                }
            }
            
            &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                
                a {
                    cursor: not-allowed;
                    
                    &.out-of-stock {
                        background-color: #f8f9fa;
                        color: #6c757d;
                        text-decoration: line-through;
                        border-color: #dee2e6;
                        
                        &:hover {
                            background-color: #f8f9fa;
                            color: #6c757d;
                            border-color: #dee2e6;
                        }
                    }
                }
            }
        }
    }
    
    .no-sizes {
        font-style: italic;
        color: #95a5a6;
        margin: 0;
        font-size: 14px;
        
        @media (max-width: 575.98px) {
            font-size: 13px;
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

.text-success {
    color: #28a745 !important;
}

.text-warning {
    color: #ffc107 !important;
}

.text-muted {
    color: #6c757d !important;
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
</style>