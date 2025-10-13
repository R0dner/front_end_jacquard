<template>
  <div class="col-lg-8 col-md-12 order-lg-2 order-1">
    <div class="products-filter-options">
      <div class="row align-items-center">
        <div class="col-lg-4 col-md-6 col-12 d-flex">
          <p>Mostrando {{ products.length }} de {{ totalProducts }} resultados</p>
        </div>
        <div class="col-lg-8 col-md-6 col-12 d-flex flex-wrap filter-controls">
          <div class="filter-item">
            <span>Mostrar:</span>
            <div class="show-products-number">
              <select v-model="pageSize" @change="fetchProducts">
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>
          <div class="filter-item">
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
        :className="`col-lg-3 col-md-6 col-sm-6 col-6 products-col-item`"
      />
    </div>

    <div v-if="loading" class="loading-products">
      <p>Cargando productos...</p>
    </div>

    <div v-if="!loading && products.length === 0" class="no-products-found">
      <p>
        {{ activeWishlistFilter 
          ? 'No tienes productos favoritos que coincidan con los filtros seleccionados.' 
          : 'No se encontraron productos con los filtros seleccionados.' 
        }}
      </p>
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
      allProducts: [], // NUEVO: Guardar todos los productos para filtrar localmente
      totalProducts: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 12,
      sortOrder: 'createdAt:desc',
      selectedProduct: null,
      strapiBaseUrl: process.env.VUE_APP_STRAPI_URL || 'https://delicate-attraction-2c7f961647.strapiapp.com',
      activeFilters: {},
      activeWishlistFilter: false, // NUEVO: Flag para saber si hay filtro de wishlist activo
      loading: false
    };
  },
  computed: {
    paginationPages() {
      const showPages = 5; 
      const pages = [];
      
      let startPage = Math.max(1, this.currentPage - Math.floor(showPages / 2));
      let endPage = Math.min(this.totalPages, startPage + showPages - 1);
      
      if (endPage - startPage + 1 < showPages) {
        startPage = Math.max(1, endPage - showPages + 1);
      }
      
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
        // MODIFICACIÓN: Verificar si hay filtro de wishlist
        const wishlistFilter = this.activeFilters.wishlistFilter;
        
        if (wishlistFilter && Array.isArray(wishlistFilter) && wishlistFilter.length > 0) {
          console.log('Aplicando filtro de wishlist:', wishlistFilter);
          
          // Filtrar productos por IDs del wishlist
          await this.fetchProductsByIds(wishlistFilter);
          
        } else if (this.activeFilters && this.activeFilters.params) {
          // Filtros normales desde el sidebar
          const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
            params: {
              ...this.activeFilters.params,
              'pagination[page]': this.currentPage,
              'pagination[pageSize]': this.pageSize,
              sort: this.sortOrder,
              populate: ['imagen_principal', 'images', 'image', 'marca', 'grupo_de_productos', 'categoria'].join(',')
            }
          });
          
          this.products = response.data.data || [];
          this.totalProducts = response.data.meta.pagination.total;
          this.totalPages = response.data.meta.pagination.pageCount;
          
        } else {
          // Carga normal sin filtros especiales
          const queryParams = {
            'pagination[page]': this.currentPage,
            'pagination[pageSize]': this.pageSize,
            sort: this.sortOrder,
            populate: ['imagen_principal', 'images', 'image', 'marca', 'grupo_de_productos', 'categoria'].join(','),
          };

          if (Object.keys(this.activeFilters).length > 0) {
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
              } else if (key === 'grupo_producto') {
                queryParams['filters[grupo_de_productos][id]'] = parseInt(value);
              } else if (key === 'en_oferta' && value === true) {
                queryParams['filters[en_oferta]'] = true;
              } else if (key !== 'wishlistFilter') { // Ignorar wishlistFilter aquí
                queryParams[`filters[${key}]`] = value;
              }
            });
          }

          const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
            params: queryParams,
          });

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
    
    // NUEVO MÉTODO: Obtener productos por IDs específicos del wishlist
    async fetchProductsByIds(productIds) {
      try {
        console.log('Obteniendo productos por IDs:', productIds);
        
        // Hacer múltiples requests o usar filtro $in si Strapi lo soporta
        const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
          params: {
            'filters[id][$in]': productIds,
            'pagination[pageSize]': 100, // Obtener todos los productos del wishlist
            sort: this.sortOrder,
            populate: ['imagen_principal', 'images', 'image', 'marca', 'grupo_de_productos', 'categoria'].join(',')
          }
        });
        
        let filteredProducts = response.data.data || [];
        console.log('Productos obtenidos del wishlist:', filteredProducts.length);
        
        // Aplicar filtros adicionales si existen (precio, categoría, etc.)
        if (Object.keys(this.activeFilters).length > 1) { // Más de uno porque wishlistFilter ya cuenta
          filteredProducts = this.applyAdditionalFilters(filteredProducts);
        }
        
        // Aplicar paginación manual
        this.totalProducts = filteredProducts.length;
        this.totalPages = Math.ceil(filteredProducts.length / this.pageSize);
        
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.products = filteredProducts.slice(start, end);
        
        console.log(`Mostrando ${this.products.length} de ${this.totalProducts} productos favoritos`);
        
      } catch (error) {
        console.error('Error al obtener productos del wishlist:', error);
        this.products = [];
        this.totalProducts = 0;
        this.totalPages = 0;
      }
    },
    
    // NUEVO MÉTODO: Aplicar filtros adicionales sobre productos del wishlist
    applyAdditionalFilters(products) {
      let filtered = [...products];
      
      // Filtro de precio
      if (this.activeFilters.precio) {
        const [min, max] = this.activeFilters.precio.split('-').map(val => parseFloat(val));
        filtered = filtered.filter(product => {
          const precio = product.attributes.precio_venta;
          return (!isNaN(min) ? precio >= min : true) && (!isNaN(max) ? precio <= max : true);
        });
      }
      
      // Filtro de categoría
      if (this.activeFilters.categoria) {
        const categoriaId = parseInt(this.activeFilters.categoria);
        filtered = filtered.filter(product => {
          return product.attributes.categoria?.data?.id === categoriaId;
        });
      }
      
      // Filtro de grupo de producto
      if (this.activeFilters.grupo_producto) {
        const grupoId = parseInt(this.activeFilters.grupo_producto);
        filtered = filtered.filter(product => {
          return product.attributes.grupo_de_productos?.data?.id === grupoId;
        });
      }
      
      // Filtro de oferta
      if (this.activeFilters.en_oferta === true) {
        filtered = filtered.filter(product => product.attributes.en_oferta === true);
      }
      
      console.log(`Filtros adicionales aplicados: ${filtered.length} productos`);
      return filtered;
    },
    
    getProductImageUrl(product) {
      let imagenData = null;
      
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
        
        if (cleanUrl.includes('strapiapp.comhttps')) {
          const mediaUrlMatch = cleanUrl.match(/https:\/\/[^\/]*\.media\.strapiapp\.com\/.*$/);
          if (mediaUrlMatch) {
            return mediaUrlMatch[0];
          }
        }
        
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          return cleanUrl;
        }
        
        const baseUrl = this.strapiBaseUrl.endsWith('/') 
          ? this.strapiBaseUrl.slice(0, -1) 
          : this.strapiBaseUrl;
        
        const finalUrl = `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
        return finalUrl;
      }

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    applyFilters(filters) {
      console.log('Aplicando filtros:', filters);
      this.activeFilters = filters;
      this.activeWishlistFilter = !!filters.wishlistFilter; // NUEVO: Detectar filtro de wishlist
      this.currentPage = 1;
      this.fetchProducts();
    },
    
    getProductGroup(product) {
      const groupData = product.attributes?.grupo_de_productos?.data;
      if (groupData) {
        return {
          id: groupData.id,
          nombre: groupData.attributes?.nombre || 'Sin tipo'
        };
      }
      return { id: null, nombre: 'Sin tipo' };
    }
  },
  mounted() {
    if (Object.keys(this.initialFilters).length > 0) {
      this.activeFilters = this.initialFilters;
    }
    
    const urlParams = this.$route.query;
    if (urlParams) {
      const filters = {};
      
      if (urlParams.categoria) {
        filters.categoria = urlParams.categoria;
      }
      
      if (urlParams.grupo_producto) {
        filters.grupo_producto = urlParams.grupo_producto;
      }
      
      if (Object.keys(filters).length > 0) {
        this.activeFilters = filters;
      }
    }
    
    this.fetchProducts();
    
    // MODIFICADO: Escuchar evento con filtros del sidebar
    this.$root.$on('sidebar-filters-changed', (filters) => {
      this.applyFilters(filters);
    });
    
    // MODIFICADO: Escuchar evento filters-changed con wishlistFilter
    this.$root.$on('filters-changed', (filters) => {
      console.log('Evento filters-changed recibido:', filters);
      
      // Si viene con wishlistFilter, tratarlo especialmente
      if (filters.wishlistFilter) {
        this.activeFilters = filters;
        this.activeWishlistFilter = true;
      } else if (filters.params) {
        this.activeFilters = { params: filters.params };
        this.activeWishlistFilter = false;
      } else {
        this.activeFilters = filters;
        this.activeWishlistFilter = false;
      }
      
      this.currentPage = 1;
      this.fetchProducts();
    });
    
    this.$on('filter-changed', (filters) => {
      this.applyFilters(filters);
    });
  },
  
  beforeDestroy() {
    // Limpiar listeners
    this.$root.$off('sidebar-filters-changed');
    this.$root.$off('filters-changed');
  }
};
</script>

<style scoped>
/* Estilos base */
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
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
}

.filter-controls {
  gap: 10px;
  margin-top: 10px;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.filter-item span {
  margin-right: 8px;
  white-space: nowrap;
  font-size: 14px;
}

.show-products-number select,
.products-ordering-list select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}

.woocommerce-pagination {
  margin-top: 30px;
  text-align: center;
}

.woocommerce-pagination ul {
  display: inline-flex;
  padding: 0;
  list-style-type: none;
  flex-wrap: wrap;
  justify-content: center;
}

.woocommerce-pagination li {
  margin: 5px;
}

.page-numbers {
  display: inline-block;
  padding: 8px 15px;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.page-numbers.current {
  background-color: #007bff;
  color: white;
}

.page-numbers.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.products-collections-listing .products-col-item {
  margin-bottom: 30px;
}

/* Estilos responsivos mejorados para el orden correcto */
@media (max-width: 1199px) {
  .products-col-item {
    flex: 0 0 33.333% !important;
    max-width: 33.333% !important;
  }
}

@media (max-width: 991px) {
  /* Asegurar que los productos aparezcan primero en móvil */
  .products-filter-options {
    margin-bottom: 25px;
  }
  
  .products-filter-options .row {
    flex-direction: column;
  }
  
  .filter-controls {
    flex-direction: column !important;
    align-items: flex-start !important;
    margin-top: 15px;
  }
  
  .filter-item {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }
  
  .products-col-item {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
  
  /* Mensaje informativo para usuarios */
  .products-filter-options::after {
    content: "Los filtros están disponibles al final de la página";
    display: block;
    font-size: 12px;
    color: #6c757d;
    text-align: center;
    margin-top: 10px;
    padding: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
  }
}

@media (max-width: 767px) {
  .products-filter-options {
    padding: 12px;
    margin-bottom: 20px;
  }
  
  .products-filter-options p {
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  .filter-item span {
    font-size: 13px;
  }
  
  .show-products-number select,
  .products-ordering-list select {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .products-col-item {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
  
  .page-numbers {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  /* Ocultar el mensaje en pantallas muy pequeñas */
  .products-filter-options::after {
    display: none;
  }
}

@media (max-width: 575px) {
  .woocommerce-pagination ul {
    flex-wrap: wrap;
  }
  
  .woocommerce-pagination li {
    margin: 3px;
  }
  
  .products-filter-options {
    padding: 10px;
  }
}
</style>