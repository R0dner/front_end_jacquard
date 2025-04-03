<template>
  <div class="col-lg-8 col-md-12">
    <div class="products-filter-options">
      <div class="row align-items-center">
        <div class="col d-flex">
          <p>Mostrando {{ products.length }} de {{ totalProducts }} resultados</p>
        </div>
        <div class="col d-flex">
          <span>Mostrando:</span>
          <div class="show-products-number">
            <select v-model="pageSize" @change="fetchProducts">
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
            </select>
          </div>
          <span>Ordenar:</span>
          <div class="products-ordering-list">
            <select v-model="sortOrder" @change="fetchProducts">
              <option value="createdAt:desc">Más recientes</option>
              <option value="createdAt:asc">Más antiguos</option>
              <option value="precio_venta:asc">Precio: Menor a Mayor</option>
              <option value="precio_venta:desc">Precio: Mayor a Menor</option>
              <option value="nombre:asc">Nombre: A-Z</option>
              <option value="nombre:desc">Nombre: Z-A</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Listado de productos en filas de 4 -->
    <div id="products-filter" class="products-collections-listing row">
      <ProductoItem
        v-for="product in products"
        :key="product.id"
        :id="product.id"
        :product="{
          ...product.attributes,
          imageUrl: getProductImageUrl(product),
          inventory: product.attributes.inventario?.data?.attributes || null
        }"
        @clicked="toggleQuickView(product)"
        :className="`col-lg-3 col-md-6 col-sm-6 products-col-item`"
      />
    </div>

    <div v-if="loading" class="loading-products">
      <p>Cargando productos...</p>
    </div>

    <div v-if="!loading && products.length === 0" class="no-products-found">
      <p>No se encontraron productos con los filtros seleccionados.</p>
    </div>

    <nav class="woocommerce-pagination" v-if="totalPages > 1">
      <ul>
        <li>
          <a 
            href="#" 
            class="page-numbers" 
            @click.prevent="changePage(currentPage > 1 ? currentPage - 1 : 1)"
            :class="{ 'disabled': currentPage === 1 }"
          >
            &laquo;
          </a>
        </li>
        <li v-for="page in paginationPages" :key="page">
          <a
            href="#"
            :class="['page-numbers', { 'current': page === currentPage }]"
            @click.prevent="changePage(page)"
          >
            {{ page }}
          </a>
        </li>
        <li>
          <a 
            href="#" 
            class="page-numbers" 
            @click.prevent="changePage(currentPage < totalPages ? currentPage + 1 : totalPages)"
            :class="{ 'disabled': currentPage === totalPages }"
          >
            &raquo;
          </a>
        </li>
      </ul>
    </nav>

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
import axios from 'axios';
import QuckView from '../modals/QuckView';
import ProductoItem from '../landing-one/ProductoItem';
import { mutations } from '../../utils/sidebar-util';

export default {
  components: {
    QuckView,
    ProductoItem,
  },
  props: {
    initialFilters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      products: [],
      totalProducts: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 12,
      sortOrder: 'createdAt:desc',
      selectedProduct: null,
      strapiBaseUrl: process.env.VUE_APP_STRAPI_URL || 'http://localhost:1337',
      activeFilters: {},
      loading: false
    };
  },
  computed: {
    // Generar un array de páginas para mostrar en la paginación
    paginationPages() {
      const showPages = 5; 
      const pages = [];
      
      // Calcular rango de páginas a mostrar
      let startPage = Math.max(1, this.currentPage - Math.floor(showPages / 2));
      let endPage = Math.min(this.totalPages, startPage + showPages - 1);
      
      // Ajustar rango si estamos cerca del final
      if (endPage - startPage + 1 < showPages) {
        startPage = Math.max(1, endPage - showPages + 1);
      }
      
      // Generar array de páginas
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    }
  },
  methods: {
    async fetchProducts() {
      this.loading = true;
      try {
        // Si estamos usando un objeto de parámetros completo (enviado desde el sidebar)
        if (this.activeFilters && this.activeFilters.params) {
          const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
            params: {
              ...this.activeFilters.params,
              'pagination[page]': this.currentPage,
              'pagination[pageSize]': this.pageSize,
            }
          });
          
          // Procesar la respuesta
          this.products = response.data.data || [];
          this.totalProducts = response.data.meta.pagination.total;
          this.totalPages = response.data.meta.pagination.pageCount;
        } else {
          // Construir los parámetros de la solicitud manualmente
          const queryParams = {
            'pagination[page]': this.currentPage,
            'pagination[pageSize]': this.pageSize,
            sort: this.sortOrder,
            populate: ['imagen_principal', 'marca', 'grupo_de_productos', 'categoria'].join(','),
          };

          // Agregar filtros si existen
          if (Object.keys(this.activeFilters).length > 0) {
            // Implementación del método buildFilters que faltaba
            Object.entries(this.activeFilters).forEach(([key, value]) => {
              if (key === 'precio') {
                const [min, max] = value.split('-').map(val => parseFloat(val));
                if (!isNaN(min)) {
                  queryParams['filters[precio_venta][$gte]'] = min;
                }
                if (!isNaN(max)) {
                  queryParams['filters[precio_venta][$lte]'] = max;
                }
              } else if (key === 'categoria') {
                queryParams['filters[categoria][id]'] = parseInt(value);
              } else if (key === 'en_oferta' && value === true) {
                queryParams['filters[en_oferta]'] = true;
              } else {
                queryParams[`filters[${key}]`] = value;
              }
            });
          }

          // Realizar la solicitud a Strapi
          const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
            params: queryParams,
          });

          // Procesar la respuesta
          this.products = response.data.data || [];
          this.totalProducts = response.data.meta.pagination.total;
          this.totalPages = response.data.meta.pagination.pageCount;
        }
      } catch (error) {
        console.error('Error al obtener productos:', error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    },
    getProductImageUrl(product) {
      // Verifica si la imagen principal existe y tiene la estructura correcta
      const imagenData = product.attributes?.imagen_principal?.data?.attributes;

      if (imagenData?.url) {
        // Si la URL de la imagen ya incluye el protocolo (http o https), úsala directamente
        if (imagenData.url.startsWith('http')) {
          return imagenData.url;
        }
        // Si no, construye la URL completa usando la base URL de Strapi
        return `${this.strapiBaseUrl}${imagenData.url}`;
      }

      // Si no hay imagen, devuelve una imagen por defecto
      return '/images/default-product.jpg';
    },
    toggleQuickView(product) {
      this.selectedProduct = product;
      mutations.toggleQuickView();
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.fetchProducts();
      // Scroll hacia arriba para ver los nuevos resultados
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    applyFilters(filters) {
      this.activeFilters = filters;
      this.currentPage = 1; // Reiniciar a la primera página
      this.fetchProducts();
    }
  },
  mounted() {
    // Aplicar filtros iniciales si existen
    if (Object.keys(this.initialFilters).length > 0) {
      this.activeFilters = this.initialFilters;
    }
    
    // Comienza a cargar los productos inmediatamente
    this.fetchProducts();
    
    // Escuchar eventos de cambio de filtros desde el componente de sidebar
    this.$root.$on('sidebar-filters-changed', (filters) => {
      this.applyFilters(filters);
    });
    
    // Evento nuevo - escuchar el evento "filters-changed" que envía el sidebar
    this.$root.$on('filters-changed', (params) => {
      this.activeFilters = { params };
      this.currentPage = 1; // Reiniciar a la primera página
      this.fetchProducts();
    });
    
    // Si el componente padre emite cambios en filtros
    this.$on('filter-changed', (filters) => {
      this.applyFilters(filters);
    });
  },
  beforeDestroy() {
    // Limpiar event listeners al destruir el componente
    this.$root.$off('sidebar-filters-changed');
    this.$root.$off('filters-changed');
  }
};
</script>

<style scoped>
.no-products-found, .loading-products {
  width: 100%;
  padding: 30px;
  text-align: center;
  font-size: 18px;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 20px;
}

.loading-products {
  background-color: #f0f8ff;
}

.products-filter-options {
  margin-bottom: 20px;
}

.woocommerce-pagination {
  margin-top: 30px;
  text-align: center;
}

.woocommerce-pagination ul {
  display: inline-flex;
  padding: 0;
  list-style-type: none;
}

.woocommerce-pagination li {
  margin: 0 5px;
}

.page-numbers {
  display: inline-block;
  padding: 8px 15px;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #333;
  text-decoration: none;
}

.page-numbers.current {
  background-color: #007bff;
  color: white;
}

.page-numbers.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mejora para filas de productos */
.products-collections-listing .products-col-item {
  margin-bottom: 30px;
}
</style>