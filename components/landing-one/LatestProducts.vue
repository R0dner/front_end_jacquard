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
                        v-for="(product, index) in productos.data"
                        :id="product.id"
                        :product="product.attributes"
                        :key="index"
                        @clicked="toggle"
                        :className="`col-lg-3 col-md-6 col-sm-6`"
                    ></ProductoItem>
                    
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
    name:"UltimosProductos",
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
        products(){
            return this.$store.state.products.all.filter(product => product.latest === true)
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