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
      allProducts: [],
      totalProducts: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 12,
      sortOrder: 'createdAt:desc',
      selectedProduct: null,
      strapiBaseUrl: process.env.VUE_APP_STRAPI_URL || 'https://delicate-attraction-2c7f961647.strapiapp.com',
      activeFilters: {},
      activeWishlistFilter: false,
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
        const wishlistFilter = this.activeFilters.wishlistFilter;
        
        if (wishlistFilter && Array.isArray(wishlistFilter) && wishlistFilter.length > 0) {
          console.log('Aplicando filtro de wishlist:', wishlistFilter);
          await this.fetchProductsByIds(wishlistFilter);
        } else {
          // Filtros normales
          const queryParams = this.buildQueryParams();
          
          const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
            params: queryParams
          });

          this.products = response.data.data || [];
          this.totalProducts = response.data.meta.pagination.total;
          this.totalPages = response.data.meta.pagination.pageCount;
        }
      } catch (error) {
        console.error('Error al obtener productos:', error.response?.data || error.message);
        this.$toast.error('Error al cargar productos');
        this.products = [];
        this.totalProducts = 0;
        this.totalPages = 0;
      } finally {
        this.loading = false;
      }
    },
    
    buildQueryParams() {
      const queryParams = {
        'pagination[page]': this.currentPage,
        'pagination[pageSize]': this.pageSize,
        sort: this.sortOrder,
        populate: ['imagen_principal', 'images', 'image', 'marca', 'grupo_de_productos', 'categoria'].join(',')
      };

      // Aplicar filtros activos
      if (this.activeFilters && Object.keys(this.activeFilters).length > 0) {
        Object.entries(this.activeFilters).forEach(([key, value]) => {
          // Ignorar wishlistFilter aquí ya que se maneja separadamente
          if (key === 'wishlistFilter') return;
          
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
            // CORREGIDO: usar la estructura correcta para Strapi
            queryParams['filters[grupo_de_productos][id][$in]'] = [parseInt(value)];
          } else if (key === 'en_oferta' && value === true) {
            queryParams['filters[en_oferta]'] = true;
          }
        });
      }

      console.log('Query params construidos:', queryParams);
      return queryParams;
    },
    
    async fetchProductsByIds(productIds) {
      try {
        console.log('Obteniendo productos por IDs:', productIds);
        
        const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
          params: {
            'filters[id][$in]': productIds,
            'pagination[pageSize]': 100,
            sort: this.sortOrder,
            populate: ['imagen_principal', 'images', 'image', 'marca', 'grupo_de_productos', 'categoria'].join(',')
          }
        });
        
        let filteredProducts = response.data.data || [];
        console.log('Productos obtenidos del wishlist:', filteredProducts.length);
        
        // Aplicar filtros adicionales si existen
        if (Object.keys(this.activeFilters).length > 1) {
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
        this.$toast.error('Error al cargar productos favoritos');
        this.products = [];
        this.totalProducts = 0;
        this.totalPages = 0;
      }
    },
    
    applyAdditionalFilters(products) {
      let filtered = [...products];
      
      if (this.activeFilters.precio) {
        const [min, max] = this.activeFilters.precio.split('-').map(val => parseFloat(val));
        filtered = filtered.filter(product => {
          const precio = product.attributes.precio_venta;
          return (!isNaN(min) ? precio >= min : true) && (!isNaN(max) ? precio <= max : true);
        });
      }
      
      if (this.activeFilters.categoria) {
        const categoriaId = parseInt(this.activeFilters.categoria);
        filtered = filtered.filter(product => {
          return product.attributes.categoria?.data?.id === categoriaId;
        });
      }
      
      if (this.activeFilters.grupo_producto) {
        const grupoId = parseInt(this.activeFilters.grupo_producto);
        filtered = filtered.filter(product => {
          return product.attributes.grupo_de_productos?.data?.id === grupoId;
        });
      }
      
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
      console.log('Aplicando filtros recibidos:', filters);
      this.activeFilters = filters;
      this.activeWishlistFilter = !!filters.wishlistFilter;
      this.currentPage = 1;
      this.fetchProducts();
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
    
    this.$root.$on('filters-changed', (filters) => {
      console.log('Evento filters-changed recibido:', filters);
      this.applyFilters(filters);
    });
  },
  
  beforeDestroy() {
    this.$root.$off('filters-changed');
  }
};
</script>

<style scoped>
/* Variables CSS para consistencia - Tema profesional */
:root {
  --sidebar-bg: #1a1a1a;
  --sidebar-card-bg: #2d3748;
  --sidebar-text: #0b0b0b;
  --sidebar-text-muted: #a0aec0;
  --sidebar-accent: #95adc5; /* Azul profesional */
  --sidebar-accent-hover: #b9c1ce;
  --sidebar-accent-light: #9fbcd3;
  --sidebar-border: #4a5568;
  --sidebar-hover-bg: #374151;
  --sidebar-selected-bg: #5a6576; /* Fondo para elementos seleccionados */
  --sidebar-radius: 12px;
  --sidebar-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --sidebar-accent-shadow: 0 4px 15px rgba(129, 147, 164, 0.3);
}

/* Contenedor principal del sidebar */
.sidebar-container {
  background: var(--sidebar-bg);
  border-radius: var(--sidebar-radius);
  box-shadow: var(--sidebar-shadow);
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--sidebar-border);
}

.woocommerce-sidebar-area {
  padding: 20px;
}

/* Estilos para secciones de filtro */
.filter-section {
  margin-top: 24px; /* Margen superior mejorado */
  margin-bottom: 24px;
  padding: 20px;
  background: var(--sidebar-card-bg);
  border-radius: var(--sidebar-radius);
  border: 1px solid var(--sidebar-border);
  transition: all 0.3s ease;
}

/* Primera sección de filtro */
.filter-section:first-of-type {
  margin-top: 16px;
}

.filter-section:hover {
  box-shadow: var(--sidebar-accent-shadow);
  border-color: var(--sidebar-accent);
}

/* Espaciado específico para la sección de productos deseados */
.filter-section:has(.no-wishlist-items),
.filter-section:has(.fa-heart) {
  margin-top: 32px !important; /* Más espacio superior para la sección de wishlist */
  border: 2px solid rgba(129, 147, 164, 0.3); /* Borde más visible */
  background: linear-gradient(145deg, var(--sidebar-card-bg), rgba(129, 147, 164, 0.1));
}

/* Clase específica para productos deseados (alternativa) */
.productos-deseados-section {
  margin-top: 40px !important;
  position: relative;
}

.productos-deseados-section::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--sidebar-accent), transparent);
  opacity: 0.3;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--sidebar-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 8px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, var(--sidebar-accent), transparent);
}

.loading-indicator {
  color: var(--sidebar-text-muted);
  font-size: 14px;
  padding: 12px 0;
  text-align: center;
  font-style: italic;
}

/* Listas de filtros con mejor contraste */
.filter-list,
.price-list-row {
  padding: 0;
  list-style: none;
  margin: 0;
}

.filter-list li,
.price-list-row li {
  margin-bottom: 8px;
}

.filter-list li a,
.price-list-row li a {
  display: flex;
  align-items: center;
  padding: 14px 16px; /* Más padding para mejor área de click */
  border-radius: 8px;
  color: var(--sidebar-text);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.filter-list li a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--sidebar-accent);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.filter-list li a:hover,
.price-list-row li a:hover {
  background: var(--sidebar-hover-bg);
  color: var(--sidebar-text);
  transform: translateX(4px);
  border-color: var(--sidebar-accent-light);
}

.filter-list li a:hover::before {
  transform: scaleY(1);
}

/* Estilo especial para el enlace de favoritos */
.filter-list li a:has(.fa-heart) {
  background: linear-gradient(135deg, rgba(129, 147, 164, 0.15), rgba(129, 147, 164, 0.05));
  border: 2px solid rgba(129, 147, 164, 0.3);
  font-weight: 600;
  padding: 16px 18px; /* Más padding para destacar */
}

.filter-list li a:has(.fa-heart):hover {
  background: linear-gradient(135deg, rgba(129, 147, 164, 0.25), rgba(129, 147, 164, 0.1));
  border-color: var(--sidebar-accent);
  transform: translateX(6px);
}

/* Estados activos con mejor contraste */
.filter-list li a.active,
.price-list-row li.active a,
.filter-list li.selected a,
.price-list-row li.selected a {
  background: linear-gradient(135deg, var(--sidebar-accent), var(--sidebar-accent-hover));
  color: rgb(9, 1, 64) !important; /* Forzar color blanco para máximo contraste */
  font-weight: 700;
  box-shadow: var(--sidebar-accent-shadow);
  border-color: var(--sidebar-accent-light);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.filter-list li a.active::before,
.filter-list li.selected a::before {
  transform: scaleY(1);
  background: rgba(255, 255, 255, 0.4);
  width: 4px;
}

/* Widget colapsable mejorado */
.collapse-widget {
  margin-top: 24px; /* Margen superior consistente */
  margin-bottom: 24px;
  background: var(--sidebar-card-bg);
  border-radius: var(--sidebar-radius);
  border: 1px solid var(--sidebar-border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.collapse-widget:hover {
  box-shadow: var(--sidebar-accent-shadow);
  border-color: var(--sidebar-accent);
}

.collapse-widget-title {
  background: linear-gradient(135deg, var(--sidebar-card-bg), #374151);
  color: var(--sidebar-text) !important;
  padding: 18px 24px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  border: none;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.collapse-widget-title:hover {
  background: linear-gradient(135deg, #374151, var(--sidebar-hover-bg));
  color: var(--sidebar-accent-light) !important;
}

.collapse-widget-title i {
  color: var(--sidebar-accent);
  transition: transform 0.3s ease;
  font-size: 14px;
}

.collapse-widget-title[aria-expanded="false"] i {
  transform: rotate(180deg);
}

/* Contenido del colapso */
.collapse > div,
.collapse > ul {
  padding: 20px 24px;
  background: var(--sidebar-card-bg);
}

/* Filtros activos - eliminar fondo rosa */
.selected-filters-wrap-list {
  padding: 16px;
}

.selected-filters-wrap-list ul {
  padding: 0;
  background: rgba(98, 106, 113, 0.15);
  border-radius: 8px;
  margin: 0;
  border: 1px solid rgba(49, 130, 206, 0.3);
  list-style: none;
}

.selected-filters-wrap-list li {
  margin: 0;
  padding: 8px 16px;
}

.selected-filters-wrap-list li:first-child {
  padding-top: 16px;
}

.selected-filters-wrap-list li:last-child {
  padding-bottom: 16px;
}

.selected-filters-wrap-list li a {
  background: white;
  color: rgb(9, 2, 76) !important;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-shadow: none;
  border: 2px solid #1a202c; /* Borde oscuro visible desde el inicio */
}

.selected-filters-wrap-list li a:hover {
  background: #f7fafc;
  transform: scale(1.05);
  border-color: var(--sidebar-accent); /* Borde azul al hover */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Eliminar cualquier contenido heredado */
.selected-filters-wrap-list li a::before,
.selected-filters-wrap-list li a::after {
  content: none !important;
  display: none !important;
}

.selected-filters-wrap-list li a .fa-times {
  font-weight: 700;
  font-size: 14px;
  color: #e53e3e; /* X roja */
  margin-left: 4px;
}

.selected-filters-wrap-list li a:hover .fa-times {
  color: #c53030; /* X roja más oscura al hover */
}

.delete-selected-filters {
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  border-top: 1px solid var(--sidebar-border);
}

.delete-selected-filters a {
  background: rgba(0, 3, 33, 0.2);
  color: #988888;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(6, 3, 79, 0.3);
}

.delete-selected-filters a:hover {
  background: rgba(87, 84, 103, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 65, 97, 0.4);
}

/* Inputs de precio con mejor contraste */
.price-range-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Más espacio entre elementos */
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid var(--sidebar-border);
}

.price-range-wrap .input-group {
  margin-bottom: 0;
}

.price-range-wrap .form-control {
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid var(--sidebar-border);
  color: var(--sidebar-text) !important;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.price-range-wrap .form-control:focus {
  background: rgba(255, 255, 255, 0.18);
  border-color: var(--sidebar-accent) !important;
  box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.15);
  color: var(--sidebar-text) !important;
  outline: none;
}

.price-range-wrap .form-control::placeholder {
  color: var(--sidebar-text-muted) !important;
  font-weight: 400;
}

.input-group-text {
  background: var(--sidebar-accent);
  color: white;
  border: 2px solid var(--sidebar-accent);
  font-weight: 600;
  font-size: 14px;
  padding: 12px 16px;
}

/* Etiquetas de precio */
.price-range-wrap label {
  color: var(--sidebar-text) !important;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Botones mejorados */
.btn {
  padding: 14px 28px;
  font-weight: 700;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--sidebar-accent), var(--sidebar-accent-hover));
  color: rgb(17, 17, 17);
  box-shadow: var(--sidebar-accent-shadow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(15, 15, 16, 0.4);
}

.btn-outline-secondary {
  border: 2px solid var(--sidebar-border);
  color: var(--sidebar-text);
  background: transparent;
}

.btn-outline-secondary:hover {
  background: var(--sidebar-hover-bg);
  border-color: var(--sidebar-accent);
  color: var(--sidebar-accent-light);
}

/* Productos del aside mejorados */
.aside-products-widget {
  background: var(--sidebar-card-bg);
  border-radius: var(--sidebar-radius);
  border: 1px solid var(--sidebar-border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.aside-products-widget:hover {
  box-shadow: var(--sidebar-accent-shadow);
  border-color: var(--sidebar-accent);
}

.aside-widget-title {
  background: linear-gradient(135deg, var(--sidebar-card-bg), #374151);
  color: var(--sidebar-text);
  padding: 18px 24px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  border-bottom: 1px solid var(--sidebar-border);
}

.aside-single-products {
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  gap: 16px;
}

.aside-single-products:last-child {
  border-bottom: none;
}

.aside-single-products:hover {
  background: var(--sidebar-hover-bg);
  transform: translateX(4px);
}

.products-image {
  flex-shrink: 0;
}

.products-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--sidebar-border);
}

.products-content {
  flex-grow: 1;
}

.products-content h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.3;
}

.products-content h3 a {
  color: var(--sidebar-text);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.products-content h3 a:hover {
  color: var(--sidebar-accent-light);
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-price .new-price {
  font-weight: 700;
  color: var(--sidebar-accent-light);
  font-size: 15px;
}

.product-price .old-price {
  text-decoration: line-through;
  color: var(--sidebar-text-muted);
  font-size: 13px;
}

/* Lista de deseos vacía mejorada */
.no-wishlist-items,
.no-filters-selected {
  background: rgba(255, 255, 255, 0.05);
  padding: 24px 20px; /* Más padding vertical */
  border-radius: 8px;
  border: 2px dashed var(--sidebar-border);
  text-align: center;
  color: var(--sidebar-text-muted);
  font-style: italic;
  margin-top: 8px; /* Pequeño margen del título */
}

.no-filters-selected p {
  margin: 0;
  font-size: 14px;
}

/* Separador visual entre secciones */
.filter-section + .filter-section::before {
  content: '';
  display: block;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--sidebar-border), transparent);
  margin: -24px 0 24px 0; /* Posicionar entre secciones */
}

/* Indicadores de carga */
.spinner-border {
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--sidebar-accent);
  border-right-color: transparent;
}

/* Iconos en filtros de wishlist */
.fa-heart {
  color: var(--sidebar-accent);
}

/* Rangos sugeridos con mejor estilo */
h3, h4, h5 {
  color: var(--sidebar-text) !important;
  font-weight: 700;
  margin-bottom: 16px;
}

/* Estilos específicos para elementos de precio */
.price-filter-section {
  background: var(--sidebar-selected-bg);
  border: 1px solid var(--sidebar-accent);
}

.price-filter-section .section-title {
  color: var(--sidebar-text) !important;
  font-size: 16px;
  font-weight: 700;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus states para navegación por teclado */
.filter-list li a:focus,
.price-list-row li a:focus,
.btn:focus,
.form-control:focus {
  outline: 3px solid var(--sidebar-accent);
  outline-offset: 2px;
}

/* Asegurar contraste en texto seleccionado */
::selection {
  background: var(--sidebar-accent);
  color: white;
}

::-moz-selection {
  background: var(--sidebar-accent);
  color: white;
}
</style>