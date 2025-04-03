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

      <!-- Categorías -->
      <div class="collapse-widget collections-list-widget">
        <h3 v-b-toggle.collapse-2 class="collapse-widget-title">
          Nuestra colección
          <i class="fas fa-angle-up"></i>
        </h3>
        <b-collapse visible id="collapse-2">
          <div v-if="loading.categorias" class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="sr-only">Cargando...</span>
            </div>
          </div>
          <ul v-else class="collections-list-row">
            <li v-for="categoria in categorias" :key="categoria.id" :class="{ active: isActive('categoria', categoria.id) }">
              <a href="#" @click.prevent="applyFilter('categoria', categoria.id, categoria.nombre)">{{ categoria.nombre }}</a>
            </li>
            <li :class="{ active: isActive('en_oferta', true) }">
              <a href="#" @click.prevent="applyFilter('en_oferta', true, 'Ofertas')">Ofertas</a>
            </li>
          </ul>
        </b-collapse>
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
          Productos populares
        </h3>

        <div v-if="loading.productosPopulares" class="text-center py-3">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="sr-only">Cargando...</span>
          </div>
        </div>
        <div v-else-if="productosPopulares.length > 0">
          <div v-for="(producto, index) in productosPopulares" :key="index" class="aside-single-products">
            <div class="products-image">
              <a href="#" @click.prevent="navigateToProduct(producto.id)">
                <img :src="producto.imagen_principal" :alt="producto.nombre">
              </a>
            </div>

            <div class="products-content">
              <h3><a href="#" @click.prevent="navigateToProduct(producto.id)">{{ producto.nombre }}</a></h3>
              <div class="product-price">
                <span class="new-price">Bs.{{ producto.precio_venta }}</span>
                <span v-if="producto.precio_oferta" class="old-price">Bs.{{ producto.precio_oferta }}</span>
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

export default {
  data() {
    return {
      activeFilters: [],
      categorias: [],
      productosPopulares: [],
      strapiBaseUrl: process.env.VUE_APP_STRAPI_URL || 'http://localhost:1337',
      loading: {
        categorias: false,
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
  created() {
    this.debouncedNotifyProductsComponent = debounce(this.notifyProductsComponent, 300);
  },
  mounted() {
    this.loadCategorias();
    this.loadProductosPopulares();
    this.loadFiltersFromUrl();
    
    this.$root.$on('update-filters', this.updateFiltersFromExternal);
  },
  beforeDestroy() {
    this.$root.$off('update-filters', this.updateFiltersFromExternal);
  },
  methods: {
    async loadCategorias() {
      this.loading.categorias = true;
      try {
        // Intenta con diferentes endpoints comunes en Strapi
        const endpoints = [
          'categorias',
          'grupo-productos',
          'categories',
          'product-categories'
        ];
        
        let lastError = null;
        
        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(`${this.strapiBaseUrl}/api/${endpoint}`, {
              params: {
                'sort': 'nombre:asc',
                'pagination[pageSize]': 50
              }
            });
            
            this.categorias = response.data.data.map(item => ({
              id: item.id,
              nombre: item.attributes?.nombre || item.attributes?.name || `Categoría ${item.id}`
            }));
            lastError = null;
            break; // Si tiene éxito, sal del bucle
          } catch (error) {
            lastError = error;
            continue; // Intenta con el siguiente endpoint
          }
        }
        
        if (lastError) {
          throw lastError;
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        this.$toast.error('Error al cargar categorías');
        // Proporciona categorías de ejemplo para que la UI no se rompa
        this.categorias = [
          { id: 1, nombre: 'Electrónicos' },
          { id: 2, nombre: 'Ropa' },
          { id: 3, nombre: 'Hogar' }
        ];
      } finally {
        this.loading.categorias = false;
      }
    },

    async loadProductosPopulares() {
      this.loading.productosPopulares = true;
      try {
        // Intenta diferentes estrategias de ordenación
        const sortOptions = [
          'stock:desc', 
          'createdAt:desc',
          'updatedAt:desc',
          'precio_venta:asc'
        ];
        
        let lastError = null;
        let success = false;
        
        for (const sortOption of sortOptions) {
          try {
            const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
              params: {
                'sort': sortOption,
                'pagination[pageSize]': 3,
                'populate': '*'
              }
            });

            this.productosPopulares = response.data.data.map(item => {
              // Manejo flexible de la imagen principal
              let imagenPrincipal = '../../assets/img/default-product.jpg';
              if (item.attributes?.imagen_principal?.data?.attributes?.url) {
                imagenPrincipal = `${this.strapiBaseUrl}${item.attributes.imagen_principal.data.attributes.url}`;
              } else if (item.attributes?.images?.data?.[0]?.attributes?.url) {
                imagenPrincipal = `${this.strapiBaseUrl}${item.attributes.images.data[0].attributes.url}`;
              }
              
              // Manejo flexible de la categoría
              let categoriaNombre = 'General';
              let categoriaId = null;
              
              if (item.attributes?.categoria?.data?.attributes?.nombre) {
                categoriaNombre = item.attributes.categoria.data.attributes.nombre;
                categoriaId = item.attributes.categoria.data.id;
              } else if (item.attributes?.category?.data?.attributes?.name) {
                categoriaNombre = item.attributes.category.data.attributes.name;
                categoriaId = item.attributes.category.data.id;
              }
              
              return {
                id: item.id,
                nombre: item.attributes?.nombre || item.attributes?.name || `Producto ${item.id}`,
                categoria: categoriaNombre,
                categoria_id: categoriaId,
                precio_venta: item.attributes?.precio_venta || item.attributes?.price || 0,
                precio_oferta: item.attributes?.precio_oferta || item.attributes?.sale_price || null,
                en_oferta: item.attributes?.en_oferta || item.attributes?.on_sale || false,
                stock: item.attributes?.stock || 0,
                imagen_principal: imagenPrincipal
              };
            });
            
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
        console.error('Error al cargar productos populares:', error);
        this.$toast.error('Error al cargar productos populares');
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

      // Si es un filtro exclusivo (sólo puede haber uno), eliminamos el anterior
      if (['precio', 'categoria'].includes(type)) {
        const typeIndex = this.activeFilters.findIndex(filter => filter.type === type);
        if (typeIndex !== -1) {
          this.activeFilters.splice(typeIndex, 1);
        }
      }

      let label = customLabel || value;
      if (!customLabel) {
        if (type === 'categoria') {
          const categoria = this.categorias.find(c => c.id === value);
          if (categoria) label = categoria.nombre;
        } else if (type === 'en_oferta' && value === true) {
          label = 'Ofertas';
        } else if (type === 'precio') {
          const range = this.priceRanges.find(r => r.value === value);
          if (range) label = range.label;
        }
      }

      this.activeFilters.push({ type, value, label });
      this.updateUrlWithFilters();
      this.debouncedNotifyProductsComponent();
      
      // También emitir evento 'sidebar-filters-changed' para mejor compatibilidad
      this.$root.$emit('sidebar-filters-changed', this.buildFiltersObject());
    },

    buildFiltersObject() {
      // Construir un objeto de filtros compatible con el primer componente
      const filtersObj = {};
      this.activeFilters.forEach(filter => {
        filtersObj[filter.type] = filter.value;
      });
      return filtersObj;
    },

    applyPriceFilter() {
      if (this.priceRange.min !== null && this.priceRange.max !== null) {
        // Validar que el mínimo no sea mayor que el máximo
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
      // Si es el filtro de precio, también limpiamos los inputs
      if (type === 'precio') {
        this.priceRange.min = null;
        this.priceRange.max = null;
      }
      
      if (value === undefined) {
        // Eliminar todos los filtros de este tipo
        const indices = [];
        this.activeFilters.forEach((filter, index) => {
          if (filter.type === type) {
            indices.push(index);
          }
        });
        
        // Eliminar desde el final para no afectar los índices
        for (let i = indices.length - 1; i >= 0; i--) {
          this.activeFilters.splice(indices[i], 1);
        }
      } else {
        // Eliminar un filtro específico
        const index = this.activeFilters.findIndex(
          filter => filter.type === type && filter.value === value
        );
        if (index !== -1) {
          this.activeFilters.splice(index, 1);
        }
      }
      
      this.updateUrlWithFilters();
      this.debouncedNotifyProductsComponent();
      
      // También emitir evento 'sidebar-filters-changed' para mejor compatibilidad
      this.$root.$emit('sidebar-filters-changed', this.buildFiltersObject());
    },

    clearFilters() {
      this.activeFilters = [];
      this.priceRange.min = null;
      this.priceRange.max = null;
      this.updateUrlWithFilters();
      this.debouncedNotifyProductsComponent();
      
      // También emitir evento 'sidebar-filters-changed' para mejor compatibilidad
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

      // Convertir arrays a strings separados por comas
      Object.keys(query).forEach(key => {
        if (Array.isArray(query[key])) {
          query[key] = query[key].join(',');
        }
      });

      // Verificar si los parámetros son diferentes antes de actualizar
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
          
          // Procesar valores especiales
          if (value === 'true') processedValue = true;
          if (value === 'false') processedValue = false;
          
          // Convertir a número si es un ID (excepto rangos de precio)
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
      // En lugar de usar la sintaxis de filtros avanzada, creamos parámetros simples
      let params = {
        'sort': 'createdAt:desc',
        'pagination[page]': 1,
        'pagination[pageSize]': 12,
        'populate': '*'
      };
      
      // Asegurarse de añadir las categorías al populate
      params.populate = ['imagen_principal', 'marca', 'grupo_de_productos', 'categoria'].join(',');
      
      // Recorrer los filtros activos
      this.activeFilters.forEach(filter => {
        if (filter.type === 'precio') {
          const [min, max] = filter.value.split('-').map(val => parseFloat(val));
          
          // Usar nombres de campos simples
          if (!isNaN(min)) {
            params['filters[precio_venta][$gte]'] = min;
          }
          
          if (!isNaN(max)) {
            params['filters[precio_venta][$lte]'] = max;
          }
        } 
        else if (filter.type === 'categoria') {
          // Filtrado por categoria
          params['filters[categoria][id]'] = parseInt(filter.value);
        }
        else if (filter.type === 'en_oferta' && filter.value === true) {
          // Filtrado por ofertas
          params['filters[en_oferta]'] = true;
        }
      });
      
      return params;
    },

    navigateToProduct(productId) {
      this.$router.push(`/producto/${productId}`);
    },

    async notifyProductsComponent() {
      // Cancelar solicitudes anteriores
      if (this.currentRequest) {
        this.currentRequest.cancel();
      }
      
      // Construir parámetros de consulta
      const queryParams = this.buildStrapiFilters();
      console.log("Parámetros a enviar:", queryParams);
      
      const cacheKey = JSON.stringify(queryParams);
      
      // Emit the parameters to the products component
      this.$root.$emit('filters-changed', queryParams);
      
      // Usar caché si disponible
      if (this.productsCache.has(cacheKey)) {
        return;
      }
      
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      this.currentRequest = source;
      
      this.$root.$emit('filters-loading', true);
      this.loading.applying = true;
      
      try {
        // Enfoque muy simple: pasar los parámetros directamente a axios
        const response = await axios.get(`${this.strapiBaseUrl}/api/productos`, {
          params: queryParams,
          cancelToken: source.token
        });
        
        this.productsCache.set(cacheKey, response.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error al filtrar productos:', error);
          
          // Intentar mostrar más detalles del error
          if (error.response) {
            console.log('Respuesta del servidor:', error.response.status, error.response.data);
          }
          
          this.$root.$emit('filters-error', error.message);
          this.$toast.error('Error al aplicar filtros: ' + (error.response ? error.response.status : error.message));
          
          // Si hay un error, intentar cargar todos los productos sin filtros
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
.price-range-wrap input {
  width: 100%;
  max-width: 120px;
}

.price-list-row {
  padding: 0;
  list-style: none;
}

.price-list-row li {
  margin-bottom: 5px;
}

.price-list-row li a {
  display: block;
  padding: 5px 10px;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
}

.price-list-row li a:hover {
  background-color: #f5f5f5;
}

.price-list-row li.active a {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

.delete-selected-filters a {
  color: #dc3545;
  text-decoration: none;
}

.delete-selected-filters a:hover {
  text-decoration: underline;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
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

.aside-single-products {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
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
</style>