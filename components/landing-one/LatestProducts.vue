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
        <QuckView :product="selectedProduct" v-if="selectedProduct" />
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
      api_url: process.env.strapiBaseUri,
      selectedProduct: null  // Add a selectedProduct property
    }
  },
  methods: {
    // Update this method to take the product parameter
    toggle(product) {
      this.selectedProduct = {
        ...product,
        id: product.id,
        imageUrl: this.getProductImageUrl(product),
        precio: product.precio_venta || product.precio,
        enOferta: product.en_oferta,
        precioOferta: product.precio_oferta,
        nombre: product.nombre
      };
      mutations.toggleQuickView();
    },
    
    // Add a method to handle image URLs
    getProductImageUrl(product) {
      // Check if the main image exists and has the correct structure
      const imagenData = product.imagen_principal?.data?.attributes;

      if (imagenData?.url) {
        // If the image URL already includes the protocol (http or https), use it directly
        if (imagenData.url.startsWith('http')) {
          return imagenData.url;
        }
        // If not, build the complete URL using the Strapi base URL
        return `${this.api_url}${imagenData.url}`;
      }

      // If there's no image, return a default image
      return '/images/default-product.jpg';
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