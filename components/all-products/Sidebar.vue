<template>
  <div class="col-lg-4 col-md-12 order-lg-1 order-2 sidebar-container">
    <div class="woocommerce-sidebar-area">
      <!-- Filtros actualmente seleccionados -->
      <div class="collapse-widget filter-list-widget">
        <h3 v-b-toggle.collapse-1 class="collapse-widget-title">
          Seleccionados actualmente
          <i class="fas fa-angle-up"></i>
        </h3>

        <b-collapse visible id="collapse-1" class="selected-filters-wrap-list">
          <ul>
            <li v-for="(filter, index) in activeFilters" :key="index">
              <a href="#" @click.prevent="removeFilter(filter.type, filter.value)">{{ filter.label }}</a>
            </li>
          </ul>

          <div class="delete-selected-filters" v-if="activeFilters.length > 0">
            <a href="#" @click.prevent="clearFilters"><i class="far fa-trash-alt"></i> <span>Borrar selecciones</span></a>
          </div>
        </b-collapse>
      </div>
      
      <!-- Nuevo Filtro: Productos Deseados -->
      <div class="filter-section">
        <h4 class="section-title">Productos Deseados</h4>
        <div v-if="wishlist.length === 0" class="no-wishlist-items">
          <p>No tienes productos en tu lista de deseos.</p>
        </div>
        <ul class="filter-list" v-else>
          <li>
            <a href="#" 
               @click.prevent="applyFilter('deseados', true)"
               :class="{'active': isActive('deseados', true)}">
              <i class="fas fa-heart mr-1 text-danger"></i> Ver mis favoritos ({{ wishlist.length }})
            </a>
          </li>
        </ul>
      </div>
      
      <div class="filter-section">
        <h4 class="section-title">Tipos de Producto</h4>
        <div class="loading-indicator" v-if="loading.gruposProductos">
          <span>Cargando tipos de producto...</span>
        </div>
        <ul class="filter-list" v-else>
          <li v-for="grupo in gruposProductos" :key="'grupo-'+grupo.id">
            <a href="#" 
               @click.prevent="applyFilter('grupo_producto', grupo.id)"
               :class="{'active': isActive('grupo_producto', grupo.id)}">
              {{ grupo.nombre }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Precio - Versión mejorada -->
      <div class="collapse-widget price-list-widget">
        <h3 v-b-toggle.collapse-5 class="collapse-widget-title">
          Precio
          <i class="fas fa-angle-up"></i>
        </h3>

        <b-collapse visible id="collapse-5">
          <div class="price-range-slider">
            <div class="price-range-wrap mb-3">
              <b-input-group class="mb-2">
                <b-input-group-prepend>
                  <span class="input-group-text">$</span>
                </b-input-group-prepend>
                <b-form-input 
                  type="number" 
                  v-model.number="priceRange.min" 
                  placeholder="Mínimo" 
                  min="0"
                  @keyup.enter="applyPriceFilter"
                ></b-form-input>
              </b-input-group>
              <b-input-group>
                <b-input-group-prepend>
                  <span class="input-group-text">$</span>
                </b-input-group-prepend>
                <b-form-input 
                  type="number" 
                  v-model.number="priceRange.max" 
                  placeholder="Máximo" 
                  min="0"
                  @keyup.enter="applyPriceFilter"
                ></b-form-input>
              </b-input-group>
            </div>
            <button @click="applyPriceFilter" class="btn btn-sm btn-primary mt-2">Aplicar</button>
            <button @click="resetPriceFilter" class="btn btn-sm btn-outline-secondary mt-2 ml-2">Limpiar</button>
          </div>

          <!-- Rangos predefinidos -->
          <h4 class="mt-4 mb-2">Rangos sugeridos</h4>
          <ul class="price-list-row mt-3">
            <li v-for="(range, index) in priceRanges" :key="index" :class="{ active: isActive('precio', range.value) }">
              <a href="#" @click.prevent="applyFilter('precio', range.value, range.label)">{{ range.label }}</a>
            </li>
          </ul>
        </b-collapse>
      </div>

      <!-- Productos populares -->
      <div class="collapse-widget aside-products-widget">
        <h3 class="aside-widget-title">
          Productos Con Descuento
        </h3>

        <div v-if="loading.productosPopulares" class="text-center py-3">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="sr-only">Cargando...</span>
          </div>
        </div>
        <div v-else-if="productosPopulares.length > 0">
          <div v-for="(producto, index) in productosPopulares" :key="index" class="aside-single-products" @click="openQuickView(producto)">
            <div class="products-image">
              <a href="#">
                <img :src="producto.imagen_principal" :alt="producto.nombre">
              </a>
            </div>

            <div class="products-content">
              <h3><a href="#">{{ producto.nombre }}</a></h3>
              <div class="product-price">
                <span v-if="producto.en_oferta" class="old-price">Bs.{{ producto.precio_venta }}</span>
                <span v-if="producto.en_oferta" class="new-price">Bs.{{ producto.precio_oferta }}</span>
                <span v-else class="new-price">Bs.{{ producto.precio_venta }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No hay productos populares disponibles.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { debounce } from 'lodash';
import { mutations } from '../../utils/sidebar-util';

export default {
  data() {
    return {
      activeFilters: [],
      gruposProductos: [], 
      productosPopulares: [],
      strapiBaseUrl: process.env.VUE_APP_STRAPI_URL || 'https://delicate-attraction-2c7f961647.strapiapp.com',
      loading: {
        gruposProductos: false, 
        productosPopulares: false,
        applying: false
      },
      priceRange: {
        min: null,
        max: null
      },
      priceRanges: [
        { value: '0-100', label: 'Menos de Bs.100' },
        { value: '100-200', label: 'Bs.100 - Bs.200' },
        { value: '200-300', label: 'Bs.200 - Bs.300' },
        { value: '300-400', label: 'Bs.300 - Bs.400' },
        { value: '400-500', label: 'Bs.400 - Bs.500' },
        { value: '500-1000', label: 'Bs.500 - Bs.1000' },
        { value: '1000-999999', label: 'Más de Bs.1000' }
      ],
      productsCache: new Map(),
      currentRequest: null,
      wishlist: []
    };
  },
  computed: {
    wishlistIds() {
      return this.wishlist.map(item => item.id);
    }
  },
  created() {
    this.debouncedNotifyProductsComponent = debounce(this.notifyProductsComponent, 300);
  },
  mounted() {
    this.loadGruposProductos();
    this.loadProductosPopulares();
    this.loadFiltersFromUrl();
    this.loadWishlist();
    
    this.$root.$on('update-filters', this.updateFiltersFromExternal);
    this.$root.$on('wishlist-updated', this.loadWishlist);
    
    this.initializeWishlistStore();
  },
  beforeDestroy() {
    this.$root.$off('update-filters', this.updateFiltersFromExternal);
    this.$root.$off('wishlist-updated', this.loadWishlist);
  },
  methods: {
    initializeWishlistStore() {
      if (!this.$store.state.wishlist) {
        this.$store.registerModule('wishlist', {
          state: {
            items: JSON.parse(localStorage.getItem('wishlist') || '[]')
          },
          mutations: {
            addToWishlist(state, product) {
              const existingIndex = state.items.findIndex(item => item.id === product.id);
              if (existingIndex === -1) {
                state.items.push(product);
                localStorage.setItem('wishlist', JSON.stringify(state.items));
              }
            },
            removeFromWishlist(state, productId) {
              state.items = state.items.filter(item => item.id !== productId);
              localStorage.setItem('wishlist', JSON.stringify(state.items));
            },
            clearWishlist(state) {
              state.items = [];
              localStorage.setItem('wishlist', '[]');
            }
          },
          getters: {
            wishlist: state => state.items,
            wishlistCount: state => state.items.length,
            isInWishlist: state => productId => {
              return state.items.some(item => item.id === productId);
            }
          }
        });
      }
    },
    
    loadWishlist() {
      this.wishlist = this.$store.getters.wishlist || [];
      console.log("Wishlist cargada:", this.wishlist);
    },
    
    openQuickView(producto) {
      const quickViewProduct = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio_venta,
        precioOferta: producto.precio_oferta,
        enOferta: producto.en_oferta,
        stock: producto.stock,
        imageUrl: producto.imagen_principal,
        marca: producto.marca,
        grupo_de_productos: producto.grupo_de_productos
      };
      
      mutations.openQuickView(quickViewProduct);
    },

    async loadGruposProductos() {
      this.loading.gruposProductos = true;
      try {
        const endpoints = [
          'grupos-productos',
          'grupo-productos',
          'grupos-producto',
          'product-groups'
        ];
        
        let lastError = null;
        let success = false;
        
        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(`${this.strapiBaseUrl}/api/${endpoint}`, {
              params: {
                'sort': 'nombre:asc',
                'pagination[pageSize]': 50
              }
            });
            
            this.gruposProductos = response.data.data.map(item => ({
              id: item.id,
              nombre: item.attributes?.nombre || item.attributes?.name || `Tipo ${item.id}`,
              codigo: item.attributes?.codigo || ''
            }));
            
            success = true;
            break; 
          } catch (error) {
            lastError = error;
            continue; 
          }
        }
        
        if (!success && lastError) {
          throw lastError;
        }
      } catch (error) {
        console.error('Error al cargar grupos de productos:', error);
        this.$toast.error('Error al cargar tipos de productos');
        this.gruposProductos = [
          { id: 1, nombre: 'Chompas', codigo: 'chompas' },
          { id: 2, nombre: 'Pantalones', codigo: 'pantalones' },
          { id: 3, nombre: 'Accesorios', codigo: 'accesorios' }
        ];
      } finally {
        this.loading.gruposProductos = false;
      }
    },

    async loadProductosPopulares() {
      this.loading.productosPopulares = true;
      try {
        const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
          params: {
            'sort': 'precio_oferta:asc',
            'pagination[pageSize]': 3,
            'populate': '*',
            'filters[en_oferta]': true
          }
        });

        this.productosPopulares = response.data.data.map(item => {
          let imagenPrincipal = '../../assets/img/default-product.jpg';
          
          let imageUrl = null;
          if (item.attributes?.imagen_principal?.data?.attributes?.url) {
            imageUrl = item.attributes.imagen_principal.data.attributes.url;
          } else if (item.attributes?.images?.data?.[0]?.attributes?.url) {
            imageUrl = item.attributes.images.data[0].attributes.url;
          }
          
          if (imageUrl) {
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              imagenPrincipal = imageUrl;
            } else {
              imagenPrincipal = `${this.strapiBaseUrl}${imageUrl}`;
            }
          }

          let grupoProducto = 'Sin tipo';
          let grupoProductoId = null;
          
          if (item.attributes?.grupos_de_productos?.data?.length > 0) {
            grupoProducto = item.attributes.grupos_de_productos.data[0].attributes.nombre;
            grupoProductoId = item.attributes.grupos_de_productos.data[0].id;
          }
          else if (item.attributes?.grupo_de_productos?.data?.attributes?.nombre) {
            grupoProducto = item.attributes.grupo_de_productos.data.attributes.nombre;
            grupoProductoId = item.attributes.grupo_de_productos.data.id;
          }
          
          return {
            id: item.id,
            nombre: item.attributes?.nombre || item.attributes?.name || `Producto ${item.id}`,
            grupo_producto: grupoProducto,
            grupo_producto_id: grupoProductoId,
            precio_venta: item.attributes?.precio_venta || item.attributes?.price || 0,
            precio_oferta: item.attributes?.precio_oferta || item.attributes?.sale_price || null,
            en_oferta: item.attributes?.en_oferta || item.attributes?.on_sale || false,
            stock: item.attributes?.stock || 0,
            imagen_principal: imagenPrincipal,
            marca: item.attributes?.marca?.data || null,
            grupos_de_productos: item.attributes?.grupos_de_productos?.data || []
          };
        });
      } catch (error) {
        console.error('Error al cargar productos en oferta:', error);
        this.$toast.error('Error al cargar productos en oferta');
        this.productosPopulares = [];
      } finally {
        this.loading.productosPopulares = false;
      }
    },

    applyFilter(type, value, customLabel = null) {
      const existingIndex = this.activeFilters.findIndex(
        filter => filter.type === type && filter.value === value
      );

      if (existingIndex !== -1) {
        this.removeFilter(type, value);
        return;
      }

      if (['precio', 'grupo_producto', 'deseados'].includes(type)) {
        const typeIndex = this.activeFilters.findIndex(filter => filter.type === type);
        if (typeIndex !== -1) {
          this.activeFilters.splice(typeIndex, 1);
        }
      }

      let label = customLabel || value;
      if (!customLabel) {
        if (type === 'grupo_producto') {
          const grupo = this.gruposProductos.find(g => g.id === value);
          if (grupo) label = grupo.nombre;
        } else if (type === 'en_oferta' && value === true) {
          label = 'Ofertas';
        } else if (type === 'precio') {
          const range = this.priceRanges.find(r => r.value === value);
          if (range) label = range.label;
        } else if (type === 'deseados' && value === true) {
          label = 'Mis favoritos';
        }
      }

      this.activeFilters.push({ type, value, label });
      this.updateUrlWithFilters();
      this.debouncedNotifyProductsComponent();
      
      this.$root.$emit('sidebar-filters-changed', this.buildFiltersObject());
    },

    buildFiltersObject() {
      const filtersObj = {};
      this.activeFilters.forEach(filter => {
        filtersObj[filter.type] = filter.value;
      });
      return filtersObj;
    },

    applyPriceFilter() {
      if (this.priceRange.min !== null && this.priceRange.max !== null) {
        if (parseFloat(this.priceRange.min) > parseFloat(this.priceRange.max)) {
          this.$toast.warning('El precio mínimo no puede ser mayor que el máximo');
          return;
        }
        
        const value = `${this.priceRange.min}-${this.priceRange.max}`;
        const label = `$${this.priceRange.min} - $${this.priceRange.max}`;
        this.applyFilter('precio', value, label);
      } else {
        this.$toast.warning('Por favor ingrese ambos valores de precio');
      }
    },

    resetPriceFilter() {
      this.priceRange.min = null;
      this.priceRange.max = null;
      this.removeFilter('precio');
    },

    removeFilter(type, value) {
      if (type === 'precio') {
        this.priceRange.min = null;
        this.priceRange.max = null;
      }
      
      if (value === undefined) {
        const indices = [];
        this.activeFilters.forEach((filter, index) => {
          if (filter.type === type) {
            indices.push(index);
          }
        });
        
        for (let i = indices.length - 1; i >= 0; i--) {
          this.activeFilters.splice(indices[i], 1);
        }
      } else {
        const index = this.activeFilters.findIndex(
          filter => filter.type === type && filter.value === value
        );
        if (index !== -1) {
          this.activeFilters.splice(index, 1);
        }
      }
      
      this.updateUrlWithFilters();
      this.debouncedNotifyProductsComponent();
      
      this.$root.$emit('sidebar-filters-changed', this.buildFiltersObject());
    },

    clearFilters() {
      this.activeFilters = [];
      this.priceRange.min = null;
      this.priceRange.max = null;
      this.updateUrlWithFilters();
      this.debouncedNotifyProductsComponent();
      
      this.$root.$emit('sidebar-filters-changed', {});
    },

    isActive(type, value) {
      return this.activeFilters.some(
        filter => filter.type === type && filter.value === value
      );
    },

    updateUrlWithFilters() {
      if (!this.$router) return;

      const query = {};
      this.activeFilters.forEach(filter => {
        if (!query[filter.type]) {
          query[filter.type] = [];
        }
        query[filter.type].push(filter.value);
      });

      Object.keys(query).forEach(key => {
        if (Array.isArray(query[key])) {
          query[key] = query[key].join(',');
        }
      });

      if (JSON.stringify(this.$route.query) !== JSON.stringify(query)) {
        this.$router.replace({ query });
      }
    },

    loadFiltersFromUrl() {
      if (!this.$route || !this.$route.query) return;
      
      const query = this.$route.query;
      Object.keys(query).forEach(type => {
        const values = query[type].split(',');
        values.forEach(value => {
          let processedValue = value;
          
          if (value === 'true') processedValue = true;
          if (value === 'false') processedValue = false;
          
          if (!isNaN(value) && type !== 'precio') {
            processedValue = parseInt(value);
          }
          
          this.applyFilter(type, processedValue);
        });
      });
    },

    updateFiltersFromExternal(filters) {
      this.clearFilters();
      
      if (filters && typeof filters === 'object') {
        Object.keys(filters).forEach(type => {
          const value = filters[type].value;
          const label = filters[type].label || null;
          this.applyFilter(type, value, label);
        });
      }
    },

    buildStrapiFilters() {
      let params = {
        'sort': 'createdAt:desc',
        'pagination[page]': 1,
        'pagination[pageSize]': 12,
        'populate': '*'
      };
      
      params.populate = ['imagen_principal', 'marca', 'grupos_de_productos'].join(',');
      
      this.activeFilters.forEach(filter => {
        if (filter.type === 'precio') {
          const [min, max] = filter.value.split('-').map(val => parseFloat(val));
          
          if (!isNaN(min)) {
            params['filters[precio_venta][$gte]'] = min;
          }
          
          if (!isNaN(max)) {
            params['filters[precio_venta][$lte]'] = max;
          }
        } 
        else if (filter.type === 'grupo_producto') {
          params['filters[grupos_de_productos][id][$in]'] = [parseInt(filter.value)];
        }
        else if (filter.type === 'en_oferta' && filter.value === true) {
          params['filters[en_oferta]'] = true;
        }
      });
      
      return params;
    },

    async notifyProductsComponent() {
      if (this.currentRequest) {
        this.currentRequest.cancel();
      }
      
      const queryParams = this.buildStrapiFilters();
      console.log("Parámetros a enviar:", queryParams);
      
      const cacheKey = JSON.stringify(queryParams);
      
      const filtersWithWishlist = {
        ...queryParams,
        wishlistFilter: this.isActive('deseados', true) ? this.wishlistIds : null
      };
      
      this.$root.$emit('filters-changed', filtersWithWishlist);
      
      if (this.productsCache.has(cacheKey)) {
        return;
      }
      
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      this.currentRequest = source;
      
      this.$root.$emit('filters-loading', true);
      this.loading.applying = true;
      
      try {
        const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
          params: queryParams,
          cancelToken: source.token
        });
        
        this.productsCache.set(cacheKey, response.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error al filtrar productos:', error);
          
          if (error.response) {
            console.log('Respuesta del servidor:', error.response.status, error.response.data);
          }
          
          this.$root.$emit('filters-error', error.message);
          this.$toast.error('Error al aplicar filtros: ' + (error.response ? error.response.status : error.message));
          
          try {
            const fallbackResponse = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
              params: {
                'sort': 'createdAt:desc',
                'pagination[page]': 1,
                'pagination[pageSize]': 12,
                'populate': '*'
              },
              cancelToken: source.token
            });
            
            this.$root.$emit('filters-changed', {});
            this.$toast.warning('Mostrando todos los productos (filtros no aplicados)');
          } catch (fallbackError) {
            console.error('Error al cargar productos sin filtros:', fallbackError);
          }
        }
      } finally {
        this.$root.$emit('filters-loading', false);
        this.loading.applying = false;
        this.currentRequest = null;
      }
    }
  }
};
</script>

<style scoped>
/* Estilos generales para todas las secciones de filtro */
.filter-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.loading-indicator {
  color: #6c757d;
  font-size: 14px;
  padding: 5px 0;
}

/* Estilos para listas de filtros */
.filter-list,
.price-list-row {
  padding: 0;
  list-style: none;
  margin: 0;
}

.filter-list li,
.price-list-row li {
  margin-bottom: 5px;
}

.filter-list li a,
.price-list-row li a {
  display: block;
  padding: 6px 12px;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 14px;
}

.filter-list li a:hover,
.price-list-row li a:hover {
  background-color: #f5f5f5;
  color: #007bff;
}

.filter-list li a.active,
.price-list-row li.active a {
  background-color: #007bff;
  color: white;
  font-weight: 500;
}

/* Estilos específicos para el rango de precios */
.price-range-wrap input {
  width: 100%;
  max-width: 120px;
}

/* Estilos para el botón de eliminar filtros */
.delete-selected-filters a {
  color: #dc3545;
  text-decoration: none;
}

.delete-selected-filters a:hover {
  text-decoration: underline;
}

/* Estilos para elementos de carga */
.spinner-border {
  width: 1rem;
  height: 1rem;
  vertical-align: middle;
  margin-right: 5px;
}

/* Estilos para los inputs de precio */
.input-group-text {
  background-color: #f8f9fa;
}

/* Estilos para los botones de aplicar/limpiar */
.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}

/* Estilos para productos individuales en el aside */
.aside-single-products {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s ease;
}

.aside-single-products:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.products-image img {
  max-width: 80px;
  height: auto;
}

.product-price .new-price {
  font-weight: bold;
  color: #d32f2f;
}

.product-price .old-price {
  text-decoration: line-through;
  color: #999;
  margin-left: 8px;
}

/* Hacer que los enlaces dentro de los productos sean clicables pero no subrayados */
.products-image a, 
.products-content h3 a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.products-content h3 a:hover {
  color: #007bff;
}

/* Estilos para la sección de lista de deseos vacía */
.no-wishlist-items {
  color: #6c757d;
  font-size: 14px;
  padding: 10px 0;
  text-align: center;
}

/* ESTILOS PARA ORDEN RESPONSIVO */
/* En móvil, añadir separación visual para el sidebar */
@media (max-width: 991px) {
  .sidebar-container {
    margin-top: 30px;
    border-top: 3px solid #007bff;
    padding-top: 25px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  
  /* Título para indicar que son filtros */
  .sidebar-container::before {
    content: "Filtros de Búsqueda";
    display: block;
    font-size: 20px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 20px;
    text-align: center;
    border-bottom: 2px solid #dee2e6;
    padding-bottom: 10px;
  }
  
  /* Hacer que los widgets colapsables sean más compactos en móvil */
  .collapse-widget {
    margin-bottom: 15px;
  }
  
  .collapse-widget-title {
    background-color: white;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
}

@media (min-width: 992px) {
  .sidebar-container {
    position: sticky;
    top: 20px;
    height: fit-content;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
  }
  
  /* Scrollbar personalizado para desktop */
  .sidebar-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .sidebar-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .sidebar-container::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 3px;
  }
  
  .sidebar-container::-webkit-scrollbar-thumb:hover {
    background: #0056b3;
  }
}

/* Tablets */
@media (min-width: 768px) and (max-width: 991px) {
  .sidebar-container {
    margin-top: 20px;
    border-top: 2px solid #007bff;
    padding-top: 20px;
    background-color: #f8f9fa;
    border-radius: 6px;
  }
  
  .sidebar-container::before {
    content: "Filtros de Búsqueda";
    display: block;
    font-size: 18px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 15px;
    text-align: center;
    border-bottom: 2px solid #dee2e6;
    padding-bottom: 8px;
  }
  
  /* Hacer los filtros en dos columnas en tablets */
  .woocommerce-sidebar-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .collapse-widget,
  .filter-section {
    margin-bottom: 10px;
  }
}

/* Móviles */
@media (max-width: 767px) {
  .sidebar-container {
    margin-top: 30px;
    border-top: 3px solid #007bff;
    padding: 25px 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  /* Título más prominente en móvil */
  .sidebar-container::before {
    content: "🔍 Filtros de Búsqueda";
    display: block;
    font-size: 22px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 25px;
    text-align: center;
    border-bottom: 3px solid #007bff;
    padding-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  /* Widgets colapsables más compactos */
  .collapse-widget {
    margin-bottom: 20px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .collapse-widget-title {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white !important;
    padding: 15px 20px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    border: none;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
  }
  
  .collapse-widget-title:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    transform: translateY(-1px);
  }
  
  .collapse-widget-title i {
    transition: transform 0.3s ease;
  }
  
  .collapse-widget-title[aria-expanded="false"] i {
    transform: rotate(180deg);
  }
  
  /* Contenido del colapso */
  .collapse {
    padding: 0;
  }
  
  .collapse > div,
  .collapse > ul {
    padding: 15px 20px;
    background: white;
  }
  
  /* Secciones de filtros más compactas */
  .filter-section {
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid #007bff;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 15px;
    color: #007bff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  /* Lista de filtros más táctil */
  .filter-list li a,
  .price-list-row li a {
    padding: 12px 15px;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 500;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .filter-list li a:hover,
  .price-list-row li a:hover {
    background-color: #e3f2fd;
    border-color: #007bff;
    transform: translateX(5px);
  }
  
  .filter-list li a.active,
  .price-list-row li.active a {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    font-weight: 600;
    box-shadow: 0 3px 10px rgba(0, 123, 255, 0.3);
  }
  
  /* Botones de precio más grandes */
  .btn {
    padding: 12px 20px;
    font-weight: 600;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border: none;
    box-shadow: 0 3px 10px rgba(0, 123, 255, 0.3);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
  }
  
  /* Inputs de precio más grandes */
  .price-range-wrap .form-control {
    padding: 12px 15px;
    font-size: 16px;
    border-radius: 6px;
    border: 2px solid #dee2e6;
    transition: all 0.3s ease;
  }
  
  .price-range-wrap .form-control:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  /* Filtros activos más visibles */
  .selected-filters-wrap-list ul {
    padding: 15px 20px;
    background: #fff3cd;
    border-radius: 6px;
    margin: 0;
  }
  
  .selected-filters-wrap-list li {
    margin-bottom: 8px;
  }
  
  .selected-filters-wrap-list li a {
    background: #ffc107;
    color: #856404;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
  }
  
  .selected-filters-wrap-list li a:hover {
    background: #e0a800;
    transform: scale(1.05);
  }
  
  .delete-selected-filters {
    text-align: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 2px solid #dee2e6;
  }
  
  .delete-selected-filters a {
    background: #dc3545;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-block;
  }
  
  .delete-selected-filters a:hover {
    background: #c82333;
    transform: scale(1.05);
  }
  
  /* Productos del aside más táctiles */
  .aside-single-products {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 15px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .aside-single-products:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    border-color: #007bff;
  }
  
  .products-image img {
    max-width: 100px;
    border-radius: 6px;
  }
  
  .product-price {
    margin-top: 8px;
  }
  
  .product-price .new-price {
    font-size: 16px;
    font-weight: 700;
  }
  
  /* Lista de deseos vacía */
  .no-wishlist-items {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 2px dashed #dee2e6;
    text-align: center;
    color: #6c757d;
    font-style: italic;
  }
  
  /* Indicadores de carga */
  .loading-indicator {
    text-align: center;
    padding: 20px;
    color: #007bff;
    font-weight: 600;
  }
  
  .spinner-border {
    width: 1.5rem;
    height: 1.5rem;
  }
}

/* Muy pequeño (menos de 480px) */
@media (max-width: 479px) {
  .sidebar-container {
    margin: 20px -15px 0 -15px;
    border-radius: 0;
    border-top: 4px solid #007bff;
  }
  
  .collapse-widget-title {
    font-size: 15px;
    padding: 12px 15px;
  }
  
  .filter-section {
    margin: 15px;
    padding: 15px;
  }
  
  .section-title {
    font-size: 15px;
  }
  
  .filter-list li a,
  .price-list-row li a {
    font-size: 14px;
    padding: 10px 12px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .price-range-wrap .input-group {
    margin-bottom: 10px;
  }
}

/* Animaciones para la carga */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-section,
.collapse-widget {
  animation: fadeIn 0.3s ease-out;
}

/* Estados de hover mejorados */
.filter-list li a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #007bff;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.filter-list li a:hover::before,
.filter-list li a.active::before {
  transform: scaleY(1);
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
.btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Dark mode support (opcional) */
@media (prefers-color-scheme: dark) {
  .sidebar-container {
    background-color: #2d3748;
    color: #e2e8f0;
  }
  
  .filter-section,
  .collapse-widget {
    background-color: #4a5568;
    border-color: #4a5568;
  }
  
  .section-title {
    color: #63b3ed;
  }
  
  .filter-list li a:hover {
    background-color: #4a5568;
    color: #63b3ed;
  }
}

</style>
