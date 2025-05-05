<template>
    <div>
        <!-- Start Page Title Area -->
        <div class="page-title-area">
            <div class="container">
                <ul>
                    <li><nuxt-link to="/">Inicio</nuxt-link></li>
                    <li>Todos los productos</li>
                </ul>
            </div>
        </div>
        <!-- End Page Title Area -->

        <!-- Start Collections Area -->
        <section class="products-collections-area ptb-60">
            <div class="container">
                <div class="section-title">
                    <h2><span class="dot"></span> Todos nuestros Productos</h2>
                </div>

                <div class="row">
                    <Sidebar />
                    <AllProducts />
                </div>
            </div>
        </section>
        <!-- End Collections Area -->
    </div>
</template>

<script>
import Sidebar from '../components/all-products/Sidebar';
import AllProducts from '../components/all-products/AllProducts';
export default {
    components: {
        Sidebar, AllProducts
    }
}
</script>