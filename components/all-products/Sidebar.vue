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

      <!-- ✅ NUEVO: Filtro de productos deseados -->
      <div class="filter-section wishlist-filter">
        <h4 class="section-title">
          <i class="fas fa-heart text-danger"></i>
          Mis Productos Deseados
          <span class="wishlist-count" v-if="wishlistCount > 0">({{ wishlistCount }})</span>
        </h4>
        <div class="wishlist-filter-actions">
          <button 
            class="btn btn-sm wishlist-toggle-btn"
            :class="{ 'btn-danger': isWishlistFilterActive, 'btn-outline-secondary': !isWishlistFilterActive }"
            @click="toggleWishlistFilter"
            :disabled="wishlistCount === 0"
          >
            <i class="fas fa-heart" v-if="isWishlistFilterActive"></i>
            <i class="far fa-heart" v-else></i>
            {{ isWishlistFilterActive ? 'Mostrar todos' : 'Solo deseados' }}
          </button>
          
          <div class="wishlist-info" v-if="wishlistCount === 0">
            <small class="text-muted">
              <i class="fas fa-info-circle"></i>
              No tienes productos en tu lista de deseados
            </small>
          </div>
        </div>

        <!-- Mostrar productos de la wishlist como vista previa -->
        <div class="wishlist-preview" v-if="wishlistProducts.length > 0">
          <h5 class="preview-title">Vista previa de deseados:</h5>
          <div class="wishlist-items">
            <div 
              v-for="product in wishlistProducts.slice(0, 3)" 
              :key="`wishlist-${product.id}`"
              class="wishlist-item-mini"
              @click="openQuickView(product)"
            >
              <img :src="product.image" :alt="product.name" class="wishlist-item-image">
              <div class="wishlist-item-info">
                <span class="wishlist-item-name">{{ product.name }}</span>
                <span class="wishlist-item-price">
                  <span v-if="product.onSale" class="old-price">Bs.{{ product.originalPrice }}</span>
                  <span class="new-price">Bs.{{ product.price }}</span>
                </span>
              </div>
            </div>
            <div v-if="wishlistProducts.length > 3" class="more-wishlist-items">
              <small class="text-muted">+ {{ wishlistProducts.length - 3 }} productos más</small>
            </div>
          </div>
        </div>
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
        { value: '0-100', label: 'Menos de $100' },
        { value: '100-200', label: '$100 - $200' },
        { value: '200-300', label: '$200 - $300' },
        { value: '300-400', label: '$300 - $400' },
        { value: '400-500', label: '$400 - $500' },
        { value: '500-1000', label: '$500 - $1000' },
        { value: '1000-999999', label: 'Más de $1000' }
      ],
      productsCache: new Map(),
      currentRequest: null
    };
  },
  computed: {
    // ✅ NUEVO: Computed properties para la wishlist
    wishlistProducts() {
      return this.$store.getters.wishlist || [];
    },
    wishlistCount() {
      return this.wishlistProducts.length;
    },
    isWishlistFilterActive() {
      return this.isActive('solo_deseados', true);
    },
    wishlistProductIds() {
      return this.wishlistProducts.map(product => product.id);
    }
  },
  created() {
    this.debouncedNotifyProductsComponent = debounce(this.notifyProductsComponent, 300);
  },
  mounted() {
    this.loadGruposProductos();
    this.loadProductosPopulares();
    this.loadFiltersFromUrl();
    
    this.$root.$on('update-filters', this.updateFiltersFromExternal);
    // ✅ NUEVO: Escuchar cambios en la wishlist
    this.$root.$on('wishlist-updated', this.handleWishlistUpdate);
  },
  beforeDestroy() {
    this.$root.$off('update-filters', this.updateFiltersFromExternal);
    this.$root.$off('wishlist-updated', this.handleWishlistUpdate);
  },
  methods: {
    // ✅ NUEVO: Métodos para manejar el filtro de wishlist
    toggleWishlistFilter() {
      if (this.wishlistCount === 0) {
        this.$toast.warning('No tienes productos en tu lista de deseados');
        return;
      }

      if (this.isWishlistFilterActive) {
        this.removeFilter('solo_deseados', true);
      } else {
        this.applyFilter('solo_deseados', true, 'Solo productos deseados');
      }
    },

    handleWishlistUpdate() {
      // Si el filtro de wishlist está activo y no hay productos, desactivarlo
      if (this.isWishlistFilterActive && this.wishlistCount === 0) {
        this.removeFilter('solo_deseados', true);
        this.$toast.info('Filtro de deseados desactivado - lista vacía');
      }
      // Si el filtro está activo, actualizar los productos mostrados
      else if (this.isWishlistFilterActive) {
        this.debouncedNotifyProductsComponent();
      }
    },

    openQuickView(producto) {
      // Preparar el objeto producto para el quickview
      const quickViewProduct = {
        id: producto.id,
        nombre: producto.nombre || producto.name,
        precio: producto.precio_venta || producto.originalPrice || producto.price,
        precioOferta: producto.precio_oferta || producto.price,
        enOferta: producto.en_oferta || producto.onSale,
        stock: producto.stock,
        imageUrl: producto.imagen_principal || producto.image,
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

          let grupoProducto = 'Sin tipo';
          let grupoProductoId = null;
          
          if (item.attributes?.grupo_de_productos?.data?.attributes?.nombre) {
            grupoProducto = item.attributes.grupo_de_productos.data.attributes.nombre;
            grupoProductoId = item.attributes.grupo_de_productos.data.id;
          } else if (item.attributes?.product_group?.data?.attributes?.name) {
            grupoProducto = item.attributes.product_group.data.attributes.name;
            grupoProductoId = item.attributes.product_group.data.id;
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
            grupo_de_productos: item.attributes?.grupo_de_productos?.data || null
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

      if (['precio', 'grupo_producto', 'solo_deseados'].includes(type)) {
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
        } else if (type === 'solo_deseados' && value === true) {
          label = 'Solo productos deseados';
        } else if (type === 'precio') {
          const range = this.priceRanges.find(r => r.value === value);
          if (range) label = range.label;
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
      
      params.populate = ['imagen_principal', 'marca', 'grupo_de_productos'].join(',');
      
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
          params['filters[grupo_de_productos][id]'] = parseInt(filter.value);
        }
        else if (filter.type === 'en_oferta' && filter.value === true) {
          params['filters[en_oferta]'] = true;
        }
        // ✅ NUEVO: Manejar filtro de solo deseados
        else if (filter.type === 'solo_deseados' && filter.value === true) {
          // En lugar de filtrar por API, usaremos los IDs de la wishlist
          if (this.wishlistProductIds.length > 0) {
            params['filters[id][$in]'] = this.wishlistProductIds.join(',');
          } else {
            // Si no hay productos en wishlist, filtrar por ID imposible
            params['filters[id][$in]'] = '-1';
          }
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
      
      this.$root.$emit('filters-changed', queryParams);
      
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

/* ✅ NUEVOS ESTILOS: Filtro de wishlist */
.wishlist-filter {
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.wishlist-filter .section-title {
  margin-bottom: 10px;
  color: #e53e3e;
}

.wishlist-count {
  background: #e53e3e;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.wishlist-filter-actions {
  margin-bottom: 15px;
}

.wishlist-toggle-btn {
  width: 100%;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.wishlist-toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wishlist-info {
  text-align: center;
  padding: 10px;
  background: #f7fafc;
  border-radius: 4px;
  border: 1px dashed #cbd5e0;
}

.wishlist-preview {
  border-top: 1px solid #fed7d7;
  padding-top: 15px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #718096;
  margin-bottom: 10px;
}

.wishlist-items {
  space-y: 8px;
}

.wishlist-item-mini {
  display: flex;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.wishlist-item-mini:hover {
  background: #f8f9fa;
  transform: translateX(3px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.wishlist-item-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.wishlist-item-info {
  flex: 1;
  min-width: 0;
}

.wishlist-item-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.wishlist-item-price {
  display: block;
  font-size: 12px;
}

.wishlist-item-price .new-price {
  color: #e53e3e;
  font-weight: 600;
}

.wishlist-item-price .old-price {
  color: #a0aec0;
  text-decoration: line-through;
  margin-right: 5px;
  font-size: 11px;
}

.more-wishlist-items {
  text-align: center;
  padding: 8px;
  background: #f7fafc;
  border-radius: 4px;
  margin-top: 5px;
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