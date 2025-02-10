<template>
    <div>
        <!-- Start Page Title Area -->
        <div class="page-title-area">
            <div class="container">
                <ul>
                    <li><nuxt-link to="/">Inicio</nuxt-link></li>
                    <li>Carrito de Compras</li>
                </ul>
            </div>
        </div>
        <!-- End Page Title Area -->
        <CartItems />
    </div>
</template>

<script>
import CartItems from '../components/cart/CartItems';
export default {
    components: {
        CartItems
    }
}
</script>