<template>
  <div class="col-lg-4 col-md-12">
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
      wishlist: [] // Lista de productos deseados
    };
  },
  computed: {
    // Obtener la lista de deseados desde Vuex
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
    // Escuchar cambios en la lista de deseados
    this.$root.$on('wishlist-updated', this.loadWishlist);
    
    // Inicializar Vuex store si no existe
    this.initializeWishlistStore();
  },
  beforeDestroy() {
    this.$root.$off('update-filters', this.updateFiltersFromExternal);
    this.$root.$off('wishlist-updated', this.loadWishlist);
  },
  methods: {
    // Inicializar el store de Vuex para la lista de deseos si no existe
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
    
    // Cargar la lista de productos deseados
    loadWishlist() {
      this.wishlist = this.$store.getters.wishlist || [];
      console.log("Wishlist cargada:", this.wishlist);
    },
    
    openQuickView(producto) {
      // Preparar el objeto producto para el quickview
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
      
      // Abrir el quickview usando el store
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
        // Modificar la solicitud para filtrar solo productos en oferta
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

          // CAMBIO: Manejar múltiples grupos de productos
          let grupoProducto = 'Sin tipo';
          let grupoProductoId = null;
          
          // Para la nueva relación many-to-many
          if (item.attributes?.grupos_de_productos?.data?.length > 0) {
            grupoProducto = item.attributes.grupos_de_productos.data[0].attributes.nombre;
            grupoProductoId = item.attributes.grupos_de_productos.data[0].id;
          }
          // Fallback para la estructura anterior si existe
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
            grupos_de_productos: item.attributes?.grupos_de_productos?.data || [] // NUEVO: Array de grupos
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
      
      // Actualizar el populate para la nueva relación many-to-many
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
        // CAMBIO PRINCIPAL: Nueva sintaxis para la relación many-to-many
        else if (filter.type === 'grupo_producto') {
          params['filters[grupos_de_productos][id][$in]'] = [parseInt(filter.value)];
        }
        else if (filter.type === 'en_oferta' && filter.value === true) {
          params['filters[en_oferta]'] = true;
        }
        // No aplicamos filtro Strapi para "deseados", se manejará en el frontend
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
      
      // Enviar información adicional sobre el filtro de deseados
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
</style>