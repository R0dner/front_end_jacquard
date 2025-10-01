<template>
    <!-- Start Cart Area -->
    <section class="cart-area ptb-60">
        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12">
                    <form>
                        <div class="cart-table table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th scope="col">Producto</th>
                                        <th scope="col" class="product-details-header">Detalles</th>
                                        <th scope="col">Precio(u)</th>
                                        <th scope="col">Cantidad</th>
                                        <th scope="col">Total</th>
                                    </tr>
                                </thead>

                                <tbody v-if="cart.length > 0">
                                    <tr v-for="(cart, i) in cart" :key="i" class="cart-item-row">
                                        <td class="product-thumbnail">
                                            <a href="#">
                                                <img :src="cart.image" :alt="cart.name" />
                                            </a>
                                        </td>

                                        <td class="product-name">
                                            <nuxt-link :to="`/products-details/${cart.id}`">
                                                {{cart.name}}
                                            </nuxt-link>
                                            <ul class="product-meta">
                                                <li>Color: <strong>{{cart.color}}</strong></li>
                                                <li>Tamaño: <strong>{{cart.size}}</strong></li>
                                                <li v-if="cart.onSale" class="on-sale-label">¡En oferta!</li>
                                            </ul>
                                        </td>

                                        <td class="product-price">
                                            <span class="unit-amount">Bs. {{cart.price}}</span>
                                            <span v-if="cart.onSale" class="original-price">Bs. {{cart.originalPrice}}</span>
                                        </td>

                                        <td class="product-quantity">
                                            <div class="input-counter">
                                                <span @click="onDecrement(cart.id, cart.quantity)" class="minus-btn"><i class="fas fa-minus"></i></span>
                                                <span class="quantity-display">{{cart.quantity}}</span>
                                                <span @click="onIncrement(cart.id)" class="plus-btn"><i class="fas fa-plus"></i></span>
                                            </div>
                                        </td>

                                        <td class="product-subtotal">
                                            <span class="subtotal-amount">Bs. {{cart.price * cart.quantity}}</span>
                                            <span v-if="cart.onSale" class="original-subtotal">Bs. {{cart.originalPrice * cart.quantity}}</span>
                                            <a href="javascript:void(0)" @click="removeItemFromCart(cart.id)" class="remove"><i class="far fa-trash-alt"></i></a>
                                        </td>
                                        
                                        <!-- Mobile layout - details for small screens -->
                                        <td class="mobile-item-details">
                                            <div class="mobile-meta">
                                                <div class="mobile-name-price">
                                                    <h4>{{cart.name}}</h4>
                                                    <div class="meta-info">
                                                        <span>Color: <strong>{{cart.color}}</strong></span>
                                                        <span>Tamaño: <strong>{{cart.size}}</strong></span>
                                                        <span v-if="cart.onSale" class="on-sale-label">¡En oferta!</span>
                                                    </div>
                                                    <div class="pricing">
                                                        <div class="price-wrapper">
                                                            <span class="unit-amount">Bs. {{cart.price}}</span>
                                                            <span v-if="cart.onSale" class="original-price">Bs. {{cart.originalPrice}}</span>
                                                        </div>
                                                        <div class="total-wrapper">
                                                            <div class="subtotal-label">Total:</div>
                                                            <span class="subtotal-amount">Bs. {{cart.price * cart.quantity}}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="mobile-controls">
                                                    <div class="input-counter">
                                                        <span @click="onDecrement(cart.id, cart.quantity)" class="minus-btn"><i class="fas fa-minus"></i></span>
                                                        <span class="quantity-display">{{cart.quantity}}</span>
                                                        <span @click="onIncrement(cart.id)" class="plus-btn"><i class="fas fa-plus"></i></span>
                                                    </div>
                                                    <a href="javascript:void(0)" @click="removeItemFromCart(cart.id)" class="remove-mobile"><i class="far fa-trash-alt"></i></a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                
                                <tbody v-else>
                                    <tr>
                                        <td colspan="5" class="empty-cart">
                                            <div class="empty-cart-message">
                                                <i class="fas fa-shopping-cart"></i>
                                                <p>Tu carrito está vacío</p>
                                                <nuxt-link to="/products" class="btn btn-primary">Ir a Comprar</nuxt-link>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="cart-buttons" v-if="cart.length > 0">
                            <div class="row">
                                <div class="col-lg-7 col-md-7 col-sm-6 continue-shopping-box-container">
                                    <div class="continue-shopping-box">
                                        <nuxt-link to="/products" class="btn btn-light">Seguir Comprando</nuxt-link>
                                    </div>
                                </div>

                                <div class="col-lg-5 col-md-5 col-sm-6 cart-totals-container">
                                    <div class="cart-totals">
                                        <h3>Precio Total</h3>

                                        <ul>
                                            <li>Subtotal <span>Bs. {{cartTotal}}</span></li>
                                            <!-- Modificación: Cambiado "Envio" por "Monto a coordinar" y eliminado el monto fijo -->
                                            <li>Envio <span>A coordinar</span></li>
                                            <li class="total-row">Total <span><b>Bs. {{parseFloat(cartTotal).toFixed(2)}}</b></span></li>
                                        </ul>
                                        <nuxt-link to="/checkout" class="btn btn-primary checkout-btn">Realizar Pedido</nuxt-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
    <!-- End Cart Area -->
</template>

<script>
export default {
    computed: {
        cart(){
            return this.$store.getters.cart
        },
        cartTotal(){
            return this.$store.getters.totalAmount
        }
    }, 
    methods: {
        removeItemFromCart(id){
            this.$store.dispatch('deleteCart', id)
        },
        onIncrement(id){
            this.$store.dispatch('updateCart', {
                id,
                unit: 1,
                cart: this.cart
            })
        },
        onDecrement(id, quantity){
            if (quantity > 1) {
                this.$store.dispatch('updateCart', {
                    id,
                    unit: -1,
                    cart: this.cart
                })
            } else {
                this.removeItemFromCart(id);
                this.$toast.warning("Producto Eliminado!");
            }
        },
    }
}
</script>

<style lang="scss" scoped>
.cart-area {
    padding: 60px 0;
    
    @media (max-width: 991px) {
        padding: 50px 0;
    }
    
    @media (max-width: 767px) {
        padding: 40px 0;
    }
    
    @media (max-width: 575px) {
        padding: 30px 0;
    }
}

.cart-table {
    margin-bottom: 30px;
    
    table {
        margin-bottom: 0;
        
        thead th {
            background-color: #f8f9fa;
            padding: 15px;
            font-weight: 600;
            color: #333;
            text-align: center;
            vertical-align: middle;
            border-color: #e0e0e0;
            font-size: 16px;
            
            @media (max-width: 991px) {
                padding: 12px;
                font-size: 15px;
            }
            
            @media (max-width: 767px) {
                padding: 10px;
                font-size: 14px;
            }
            
            @media (max-width: 575px) {
                display: none; // Ocultar encabezados en móviles para diseño alternativo
            }
        }
        
        tbody {
            td {
                vertical-align: middle;
                text-align: center;
                padding: 15px;
                border-color: #e0e0e0;
                
                @media (max-width: 991px) {
                    padding: 12px;
                }
                
                @media (max-width: 767px) {
                    padding: 10px;
                }
                
                @media (max-width: 575px) {
                    display: none; // Ocultar celdas estándar en móviles
                }
            }
            
            .mobile-item-details {
                display: none; // Ocultar por defecto
                padding: 0;
                border: none;
                
                @media (max-width: 575px) {
                    display: table-cell; // Mostrar solo en móviles
                    width: 100%;
                }
                
                .mobile-meta {
                    display: flex;
                    flex-direction: column;
                    padding: 15px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    text-align: left;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    
                    .mobile-name-price {
                        h4 {
                            margin: 0 0 8px;
                            font-size: 16px;
                            font-weight: 600;
                            color: #333;
                        }
                        
                        .meta-info {
                            display: flex;
                            flex-wrap: wrap;
                            margin-bottom: 12px;
                            gap: 10px;
                            
                            span {
                                font-size: 13px;
                                color: #666;
                                margin-right: 10px;
                                
                                &.on-sale-label {
                                    color: #e41b17;
                                    font-weight: bold;
                                }
                            }
                        }
                        
                        .pricing {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                            
                            .price-wrapper {
                                .unit-amount {
                                    font-weight: 600;
                                    font-size: 15px;
                                    color: #333;
                                }
                                
                                .original-price {
                                    display: block;
                                    text-decoration: line-through;
                                    color: #999;
                                    font-size: 13px;
                                }
                            }
                            
                            .total-wrapper {
                                display: flex;
                                align-items: center;
                                
                                .subtotal-label {
                                    font-weight: 600;
                                    margin-right: 5px;
                                    color: #333;
                                }
                                
                                .subtotal-amount {
                                    font-weight: 700;
                                    color: #4a89dc;
                                    font-size: 15px;
                                }
                            }
                        }
                    }
                    
                    .mobile-controls {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        
                        .input-counter {
                            background: #f8f9fa;
                            border-radius: 4px;
                            border: 1px solid #e0e0e0;
                            display: inline-flex;
                            align-items: center;
                            
                            .minus-btn,
                            .plus-btn {
                                width: 34px;
                                height: 34px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                color: #555;
                                transition: all 0.2s;
                                
                                &:hover {
                                    background-color: #e9ecef;
                                }
                            }
                            
                            .quantity-display {
                                min-width: 34px;
                                text-align: center;
                                font-weight: 600;
                            }
                        }
                        
                        .remove-mobile {
                            background: #f8f9fa;
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 50%;
                            color: #e74c3c;
                            border: 1px solid #e0e0e0;
                            transition: all 0.2s;
                            
                            &:hover {
                                background: #fee;
                                color: #c0392b;
                            }
                        }
                    }
                }
            }
        }
    }
    
    .product-thumbnail {
        width: 100px;
        
        @media (max-width: 991px) {
            width: 90px;
        }
        
        @media (max-width: 767px) {
            width: 80px;
        }
        
        img {
            max-width: 80px;
            height: auto;
            object-fit: contain;
            border-radius: 4px;
            background-color: #f9f9f9;
            padding: 5px;
            border: 1px solid #e0e0e0;
            
            @media (max-width: 991px) {
                max-width: 70px;
            }
            
            @media (max-width: 767px) {
                max-width: 60px;
            }
        }
    }
    
    .product-name {
        text-align: left;
        
        a {
            color: #333;
            font-weight: 600;
            text-decoration: none;
            font-size: 16px;
            transition: color 0.2s;
            
            @media (max-width: 991px) {
                font-size: 15px;
            }
            
            @media (max-width: 767px) {
                font-size: 14px;
            }
            
            &:hover {
                color: #4a89dc;
            }
        }
        
        ul {
            margin: 8px 0 0;
            padding: 0;
            list-style: none;
            
            li {
                font-size: 14px;
                color: #666;
                margin-bottom: 4px;
                
                @media (max-width: 767px) {
                    font-size: 13px;
                }
            }
        }
    }
    
    .product-price,
    .product-subtotal {
        font-weight: 600;
        color: #333;
        font-size: 15px;
        
        @media (max-width: 767px) {
            font-size: 14px;
        }
    }
    
    .product-quantity {
        .input-counter {
            display: inline-flex;
            align-items: stretch;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 5px;
            border: 1px solid #dee2e6;
            max-width: 120px;
            height: 40px;
            margin: 0 auto;
            overflow: hidden;
            
            @media (max-width: 767px) {
                height: 36px;
                max-width: 110px;
            }
            
            .minus-btn,
            .plus-btn {
                flex: 0 0 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #333;
                background: transparent;
                transition: background-color 0.2s;
                border: none;
                padding: 0;
                margin: 0;
                user-select: none;
                
                @media (max-width: 767px) {
                    flex: 0 0 32px;
                }
                
                i {
                    font-size: 13px;
                    pointer-events: none;
                }
                
                &:hover {
                    background-color: #e2e6ea;
                }
                
                &:active {
                    background-color: #dae0e5;
                }
            }
            
            .quantity-display {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-weight: 600;
                font-size: 15px;
                color: #333;
                background: #ffffff;
                border-left: 1px solid #dee2e6;
                border-right: 1px solid #dee2e6;
                user-select: none;
                min-width: 40px;
                
                @media (max-width: 767px) {
                    font-size: 14px;
                    min-width: 36px;
                }
            }
        }
    }
    
    .product-subtotal {
        position: relative;
        
        .remove {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #fff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #e74c3c;
            border: 1px solid #e0e0e0;
            transition: all 0.2s;
            
            &:hover {
                background: #fee;
                color: #c0392b;
                border-color: #e74c3c;
            }
        }
    }
    
    .empty-cart {
        display: table-cell !important; /* Asegurar que siempre se muestre */
        
        .empty-cart-message {
            padding: 30px;
            text-align: center;
            
            i {
                font-size: 48px;
                color: #ccc;
                margin-bottom: 15px;
                display: block;
            }
            
            p {
                font-size: 18px;
                color: #666;
                margin-bottom: 20px;
            }
            
            .btn {
                min-width: 180px;
            }
        }
    }
    
    // Ajuste para filas de carrito vacío
    tr:not(.cart-item-row) .mobile-item-details {
        display: none !important;
    }
}

.cart-buttons {
    .continue-shopping-box {
        margin-bottom: 20px;
        
        @media (max-width: 575px) {
            text-align: center;
        }
    }
    
    .cart-totals {
        background: #f8f9fa;
        padding: 25px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        
        @media (max-width: 991px) {
            padding: 20px;
        }
        
        @media (max-width: 767px) {
            padding: 15px;
        }
        
        @media (max-width: 575px) {
            margin-top: 20px;
            text-align: center;
        }
        
        h3 {
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: 600;
            color: #333;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
            
            @media (max-width: 767px) {
                font-size: 18px;
            }
        }
        
        ul {
            margin: 0 0 20px;
            padding: 0;
            list-style: none;
            
            li {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                color: #666;
                font-size: 15px;
                border-bottom: 1px dashed #e0e0e0;
                
                @media (max-width: 767px) {
                    font-size: 14px;
                }
                
                &.total-row {
                    border-top: 2px solid #e0e0e0;
                    border-bottom: none;
                    margin-top: 5px;
                    padding-top: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    
                    @media (max-width: 767px) {
                        font-size: 16px;
                    }
                }
                
                span {
                    font-weight: 500;
                }
            }
        }
        
        .checkout-btn {
            display: block;
            width: 100%;
            padding: 12px;
            text-align: center;
            font-weight: 600;
            font-size: 16px;
            background-color: #4a89dc;
            border-color: #4a89dc;
            transition: all 0.3s;
            
            @media (max-width: 767px) {
                font-size: 15px;
                padding: 10px;
            }
            
            &:hover {
                background-color: #3a70c2;
                border-color: #3a70c2;
            }
        }
    }
}

.product-meta {
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
}

.original-price {
    display: block;
    text-decoration: line-through;
    color: #999;
    font-size: 0.85em;
    margin-top: 3px;
}

.original-subtotal {
    display: block;
    text-decoration: line-through;
    color: #999;
    font-size: 0.85em;
    margin-top: 3px;
}

.on-sale-label {
    color: #e41b17;
    font-weight: bold;
    margin-top: 5px;
}

// Estilo global para botones
.btn {
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s;
    
    &.btn-light {
        background-color: #f8f9fa;
        border-color: #e0e0e0;
        color: #555;
        
        &:hover {
            background-color: #e9ecef;
            border-color: #d0d0d0;
        }
    }
    
    &.btn-primary {
        background-color: #4a89dc;
        border-color: #4a89dc;
        color: #fff;
        
        &:hover {
            background-color: #3a70c2;
            border-color: #3a70c2;
        }
    }
}

@media (max-width: 575px) {
    // Estilos específicos para móvil
    .continue-shopping-box-container,
    .cart-totals-container {
        width: 100%;
        max-width: 100%;
        flex: 0 0 100%;
    }
    
    .cart-item-row {
        margin-bottom: 15px;
        display: block;
        width: 100%;
        
        td {
            display: block;
        }
    }
}
</style>