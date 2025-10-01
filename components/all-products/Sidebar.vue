<template>
  <div class="col-lg-4 col-md-12 order-lg-1 order-2 sidebar-container">
    <div class="woocommerce-sidebar-area">
      <!-- Filtros actualmente seleccionados -->
      <div class="collapse-widget filter-list-widget">
        <h3 v-b-toggle.collapse-1 class="collapse-widget-title">
          Seleccionados actualmente
          <i class="fas fa-angle-up"></i>
        </h3>

        <b-collapse visible id="collapse-1">
          <div class="selected-filters-wrap-list" v-if="activeFilters.length > 0">
            <ul>
              <li v-for="(filter, index) in activeFilters" :key="index">
                <a href="#" @click.prevent="removeFilter(filter.type, filter.value)">
                  {{ filter.label }}
                  <i class="fas fa-times ml-2"></i>
                </a>
              </li>
            </ul>

            <div class="delete-selected-filters">
              <a href="#" @click.prevent="clearFilters">
                <i class="far fa-trash-alt"></i> 
                <span>Borrar selecciones</span>
              </a>
            </div>
          </div>
          
          <div class="no-filters-selected" v-else>
            <p>No hay filtros seleccionados</p>
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
  async mounted() {
    // Cargar grupos primero antes de cargar filtros desde URL
    await this.loadGruposProductos();
    this.loadProductosPopulares();
    
    // Ahora cargar filtros desde URL cuando ya tenemos los grupos
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
        // Intentar cargar productos con descuentos desde inventario-colores
        const inventarioResponse = await axios.get(`${this.strapiBaseUrl}/api/inventario-colores`, {
          params: {
            'filters[en_oferta][$eq]': true,
            'filters[estado_producto][$eq]': 'Activo',
            'filters[stock_actual][$gt]': 0,
            'sort': 'precio_oferta:asc',
            'pagination[pageSize]': 10,
            'populate': ['producto', 'producto.imagen_principal', 'producto.grupos_de_productos', 'color', 'talla']
          }
        });

        if (inventarioResponse.data?.data?.length > 0) {
          // Agrupar por producto para evitar duplicados
          const productosMap = new Map();
          
          inventarioResponse.data.data.forEach(item => {
            const producto = item.attributes?.producto?.data;
            if (!producto) return;
            
            const productoId = producto.id;
            
            // Si ya tenemos este producto, comparar precios y quedarnos con el menor
            if (productosMap.has(productoId)) {
              const existing = productosMap.get(productoId);
              if (item.attributes.precio_oferta < existing.precio_oferta) {
                productosMap.set(productoId, {
                  id: productoId,
                  producto: producto,
                  precio_venta: item.attributes.precio_venta_sugerido,
                  precio_oferta: item.attributes.precio_oferta,
                  en_oferta: true
                });
              }
            } else {
              productosMap.set(productoId, {
                id: productoId,
                producto: producto,
                precio_venta: item.attributes.precio_venta_sugerido,
                precio_oferta: item.attributes.precio_oferta,
                en_oferta: true
              });
            }
          });
          
          // Convertir el Map a array y tomar solo los primeros 3
          const productosConDescuento = Array.from(productosMap.values()).slice(0, 3);
          
          this.productosPopulares = productosConDescuento.map(item => {
            let imagenPrincipal = '../../assets/img/default-product.jpg';
            
            let imageUrl = null;
            if (item.producto.attributes?.imagen_principal?.data?.attributes?.url) {
              imageUrl = item.producto.attributes.imagen_principal.data.attributes.url;
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
            
            if (item.producto.attributes?.grupos_de_productos?.data?.length > 0) {
              grupoProducto = item.producto.attributes.grupos_de_productos.data[0].attributes.nombre;
              grupoProductoId = item.producto.attributes.grupos_de_productos.data[0].id;
            }
            
            return {
              id: item.id,
              nombre: item.producto.attributes?.nombre || `Producto ${item.id}`,
              grupo_producto: grupoProducto,
              grupo_producto_id: grupoProductoId,
              precio_venta: item.precio_venta,
              precio_oferta: item.precio_oferta,
              en_oferta: true,
              imagen_principal: imagenPrincipal,
              marca: item.producto.attributes?.marca?.data || null,
              grupos_de_productos: item.producto.attributes?.grupos_de_productos?.data || []
            };
          });
        } else {
          // Fallback: si no hay productos con descuento en inventario-colores, 
          // intentar con el sistema anterior
          const fallbackResponse = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
            params: {
              'sort': 'createdAt:desc',
              'pagination[pageSize]': 3,
              'populate': '*'
            }
          });

          this.productosPopulares = fallbackResponse.data.data.map(item => {
            let imagenPrincipal = '../../assets/img/default-product.jpg';
            
            let imageUrl = null;
            if (item.attributes?.imagen_principal?.data?.attributes?.url) {
              imageUrl = item.attributes.imagen_principal.data.attributes.url;
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
            
            return {
              id: item.id,
              nombre: item.attributes?.nombre || `Producto ${item.id}`,
              grupo_producto: grupoProducto,
              grupo_producto_id: grupoProductoId,
              precio_venta: 0,
              precio_oferta: null,
              en_oferta: false,
              imagen_principal: imagenPrincipal,
              marca: item.attributes?.marca?.data || null,
              grupos_de_productos: item.attributes?.grupos_de_productos?.data || []
            };
          });
        }
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

      // Remover filtro anterior del mismo tipo para filtros únicos
      if (['precio', 'grupo_producto', 'deseados'].includes(type)) {
        const typeIndex = this.activeFilters.findIndex(filter => filter.type === type);
        if (typeIndex !== -1) {
          this.activeFilters.splice(typeIndex, 1);
        }
      }

      // Generar label correctamente
      let label = customLabel || String(value);
      
      if (!customLabel) {
        if (type === 'grupo_producto') {
          const grupo = this.gruposProductos.find(g => g.id === parseInt(value));
          label = grupo ? grupo.nombre : `Tipo ${value}`;
        } else if (type === 'en_oferta' && value === true) {
          label = 'Productos en oferta';
        } else if (type === 'precio') {
          const range = this.priceRanges.find(r => r.value === value);
          label = range ? range.label : value;
        } else if (type === 'deseados' && value === true) {
          label = `Mis favoritos (${this.wishlist.length})`;
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
          
          // IMPORTANTE: NO pasar customLabel aquí, dejar que applyFilter lo genere
          this.applyFilter(type, processedValue, null);
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