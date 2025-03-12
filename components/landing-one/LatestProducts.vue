<template>
    <div>
        <!-- Start All Products Area -->
        <section class="all-products-area pb-60">
            <div class="container">
                <div class="section-title">
                    <h2><span class="dot"></span> Ultimos Productos</h2>
                </div>
                
                <div class="row">
                    <ProductoItem
                        v-for="(product, index) in limitedProducts"
                        :id="product.id"
                        :product="product.attributes"
                        :key="index"
                        @clicked="toggle"
                        :className="`col-lg-3 col-md-6 col-sm-6`"
                    ></ProductoItem>
                </div>
                
                <!-- Enlace para ver más productos -->
                <div class="text-center mt-4 mb-4">
                    <nuxt-link to="/products" class="btn btn-primary">Ver más productos</nuxt-link>
                </div>
            </div>
        </section>
        <!-- End all Products Area -->
        <QuckView />
    </div>
</template>

<script>
import QuckView from '../modals/QuckView';
import { mutations } from '../../utils/sidebar-util';
import ProductoItem from './ProductoItem';

import productosQuery from '@/apollo/queries/productos/ultimos_productos.gql'

export default {
    name: "UltimosProductos",
    components: {
        QuckView,
        ProductoItem
    },
    data() {
        return {
            productos: {},
            api_url: process.env.strapiBaseUri
        }
    },
    methods: {
        toggle() {
            mutations.toggleQuickView();
        }
    },
    computed: {
        // Limit to only show the first 4 products
        limitedProducts() {
            if (!this.productos.data || !this.productos.data.length) return [];
            return this.productos.data.slice(0, 4);
        }
    },
    apollo: {
        productos: {
            prefetch: true,
            query: productosQuery
        }
    }
}
</script>

<style scoped>
/* Estilos para el botón "Ver más productos" */
.btn-primary {
    padding: 10px 25px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-top: 20px;
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>