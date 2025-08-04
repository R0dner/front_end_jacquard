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
                      :key="index"
                      :product="{
                          ...product.attributes,
                          imageUrl: getProductImageUrl(product),
                          inventory: product.attributes.inventario?.data?.attributes || null
                      }"
                      @clicked="toggleQuickView(product)"
                      :className="`col-lg-3 col-md-6 col-sm-6`"
                  ></ProductoItem>
              </div>
              
              <!-- Loading state -->
              <div v-if="loading" class="text-center">
                  <p>Cargando productos...</p>
              </div>
              
              <!-- Error state -->
              <div v-if="error && !loading" class="text-center">
                  <p class="text-danger">Error al cargar productos. Intentando método alternativo...</p>
              </div>
              
              <!-- Enlace para ver más productos -->
              <div class="text-center mt-4 mb-4" v-if="!loading && limitedProducts.length > 0">
                  <nuxt-link to="/products" class="btn btn-primary">Ver más productos</nuxt-link>
              </div>
          </div>
      </section>
      <!-- End all Products Area -->
      
      <QuckView
          v-if="selectedProduct"
          :product="{
              ...selectedProduct.attributes,
              id: selectedProduct.id,
              imageUrl: getProductImageUrl(selectedProduct),
              precio: selectedProduct.attributes.precio_venta,
              enOferta: selectedProduct.attributes.en_oferta,
              precioOferta: selectedProduct.attributes.precio_oferta
          }"
      />
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
    productos: { data: [] },
    api_url: process.env.strapiBaseUri,
    selectedProduct: null,
    loading: false,
    error: false,
    useGraphQL: true // ✅ Controlar qué método usar
  }
},
methods: {
  toggleQuickView(product) {
    this.selectedProduct = product;
    mutations.toggleQuickView();
  },
  
  getProductImageUrl(product) {
    let imagenData = null;
    
    // Buscar la imagen en diferentes ubicaciones
    if (product.attributes?.imagen_principal?.data?.attributes) {
      imagenData = product.attributes.imagen_principal.data.attributes;
    }
    else if (product.imagen_principal?.data?.attributes) {
      imagenData = product.imagen_principal.data.attributes;
    }
    else if (product.attributes?.images?.data?.[0]?.attributes) {
      imagenData = product.attributes.images.data[0].attributes;
    }
    else if (product.attributes?.image?.data?.attributes) {
      imagenData = product.attributes.image.data.attributes;
    }

    if (imagenData?.url) {
      let cleanUrl = imagenData.url.trim();
      
      // Detectar y corregir URLs malformadas
      if (cleanUrl.includes('strapiapp.comhttps')) {
        const mediaUrlMatch = cleanUrl.match(/https:\/\/[^\/]*\.media\.strapiapp\.com\/.*$/);
        if (mediaUrlMatch) {
          console.log(`UltimosProductos - Fixed malformed URL: ${mediaUrlMatch[0]}`);
          return mediaUrlMatch[0];
        }
      }
      
      // Si ya es una URL completa, devolverla tal como está
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        console.log(`UltimosProductos - Using complete URL: ${cleanUrl}`);
        return cleanUrl;
      }
      
      // Si es relativa, agregar el dominio base
      const baseUrl = this.api_url?.endsWith('/') 
        ? this.api_url.slice(0, -1) 
        : this.api_url;
      
      const finalUrl = `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
      console.log(`UltimosProductos - Constructed URL: ${finalUrl}`);
      return finalUrl;
    }

    console.log('UltimosProductos - No image found, using default');
    return '/images/default-product.jpg';
  },

  // ✅ MÉTODO FALLBACK: REST API
  async fetchProductosREST() {
    console.log('UltimosProductos - Usando REST API como fallback');
    this.loading = true;
    try {
      const response = await this.$axios.get('/api/productos', {
        params: {
          'sort': 'createdAt:desc',
          'pagination[limit]': 12,
          'populate': [
            'imagen_principal', 
            'multimedia', 
            'talla', 
            'grupo_de_productos',
            'images',
            'image'
          ].join(',')
        }
      });
      
      this.productos = {
        data: response.data.data || []
      };
      
      console.log('UltimosProductos - Productos cargados via REST:', this.productos.data.length);
      this.error = false;
    } catch (error) {
      console.error('UltimosProductos - Error en REST API:', error);
      this.error = true;
      this.productos = { data: [] };
    } finally {
      this.loading = false;
    }
  }
},
computed: {
  limitedProducts() {
    if (!this.productos.data || !this.productos.data.length) return [];
    return this.productos.data.slice(0, 4);
  }
},
apollo: {
  productos: {
    prefetch: true,
    query: productosQuery,
    // ✅ MANEJO DE ERRORES EN APOLLO
    error(error) {
      console.error('UltimosProductos - Error en GraphQL:', error);
      this.error = true;
      this.useGraphQL = false;
      // Intentar con REST API como fallback
      this.$nextTick(() => {
        this.fetchProductosREST();
      });
    },
    // ✅ RESULTADO EXITOSO
    result(result) {
      if (result.data && result.data.productos) {
        console.log('UltimosProductos - Productos cargados via GraphQL:', result.data.productos.data.length);
        this.error = false;
      }
    }
  }
},
async mounted() {
  // ✅ SI HAY ERROR EN APOLLO, INTENTAR REST
  this.$nextTick(() => {
    if (this.error || !this.productos.data || this.productos.data.length === 0) {
      setTimeout(() => {
        if (!this.productos.data || this.productos.data.length === 0) {
          console.log('UltimosProductos - GraphQL no funcionó, usando REST como fallback');
          this.fetchProductosREST();
        }
      }, 2000); // Esperar 2 segundos antes del fallback
    }
  });
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

/* Estilos para estados de error */
.text-danger {
  color: #dc3545;
  font-weight: 500;
}
</style>