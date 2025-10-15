
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
                <option value="precio:asc">Precio: Menor a Mayor</option>
                <option value="precio:desc">Precio: Mayor a Menor</option>
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
          precio_venta: product.precio_minimo,
          precio_oferta: product.precio_oferta_minimo,
          en_oferta: product.tiene_oferta,
          stock: product.stock_total || 0
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
        precio: selectedProduct.precio_minimo,
        enOferta: selectedProduct.tiene_oferta,
        precioOferta: selectedProduct.precio_oferta_minimo
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
          await this.fetchProductsFromInventory();
        }
      } catch (error) {
        console.error('Error al obtener productos:', error.response?.data || error.message);
        this.products = [];
        this.totalProducts = 0;
        this.totalPages = 0;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchProductsFromInventory() {
      try {
        // PASO 1: Obtener productos únicos del inventario-colores con precios
        const inventoryParams = {
          'filters[estado_producto][$eq]': 'Activo',
          // REMOVIDO: 'filters[stock_actual][$gt]': 0, - Ahora muestra todos los productos
          'populate': ['producto', 'producto.imagen_principal', 'producto.grupos_de_productos', 'color', 'talla'],
          'pagination[pageSize]': 1000
        };

        // Aplicar filtro de precio si existe
        if (this.activeFilters.precio) {
          const [min, max] = this.activeFilters.precio.split('-').map(val => parseFloat(val));
          
          if (!isNaN(min)) {
            // Filtrar por precio de oferta O precio de venta
            inventoryParams['filters[$or][0][precio_oferta][$gte]'] = min;
            inventoryParams['filters[$or][1][precio_venta_sugerido][$gte]'] = min;
          }
          
          if (!isNaN(max)) {
            inventoryParams['filters[$or][0][precio_oferta][$lte]'] = max;
            inventoryParams['filters[$or][1][precio_venta_sugerido][$lte]'] = max;
          }
        }

        // Aplicar filtro de grupo de productos
        if (this.activeFilters.grupos_de_productos) {
          inventoryParams['filters[producto][grupos_de_productos][id][$eq]'] = this.activeFilters.grupos_de_productos;
        }

        console.log('Parámetros de inventario:', inventoryParams);

        const inventoryResponse = await axios.get(
          `${this.strapiBaseUrl}/api/inventario-colores`,
          { params: inventoryParams }
        );

        // PASO 2: Procesar productos únicos con sus precios mínimos
        const productosMap = new Map();
        
        if (inventoryResponse.data?.data) {
          inventoryResponse.data.data.forEach(item => {
            const producto = item.attributes?.producto?.data;
            if (!producto) return;

            const productoId = producto.id;
            const precioActual = item.attributes.en_oferta && item.attributes.precio_oferta
              ? item.attributes.precio_oferta
              : item.attributes.precio_venta_sugerido;
            
            const stockActual = item.attributes.stock_actual || 0;

            if (productosMap.has(productoId)) {
              const existing = productosMap.get(productoId);
              
              // Actualizar precio mínimo
              if (precioActual < existing.precio_minimo) {
                existing.precio_minimo = precioActual;
              }
              
              // Sumar stock total
              existing.stock_total += stockActual;
              
              // Actualizar precio de oferta mínimo
              if (item.attributes.en_oferta && item.attributes.precio_oferta) {
                if (!existing.precio_oferta_minimo || item.attributes.precio_oferta < existing.precio_oferta_minimo) {
                  existing.precio_oferta_minimo = item.attributes.precio_oferta;
                  existing.tiene_oferta = true;
                }
              }
            } else {
              productosMap.set(productoId, {
                id: productoId,
                attributes: producto.attributes,
                precio_minimo: precioActual,
                precio_oferta_minimo: item.attributes.en_oferta ? item.attributes.precio_oferta : null,
                tiene_oferta: item.attributes.en_oferta || false,
                stock_total: stockActual
              });
            }
          });
        }

        let productos = Array.from(productosMap.values());
        console.log(`Productos únicos procesados: ${productos.length}`);

        // PASO 3: Aplicar ordenamiento
        productos = this.sortProducts(productos);

        // PASO 4: Aplicar paginación
        this.totalProducts = productos.length;
        this.totalPages = Math.ceil(productos.length / this.pageSize);
        
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.products = productos.slice(start, end);

        console.log(`Mostrando ${this.products.length} de ${this.totalProducts} productos`);

      } catch (error) {
        console.error('Error al obtener productos del inventario:', error);
        throw error;
      }
    },

    async fetchProductsByIds(productIds) {
      try {
        console.log('Obteniendo productos por IDs:', productIds);
        
        // Obtener inventario de estos productos específicos
        const inventoryParams = {
          'filters[producto][id][$in]': productIds,
          'filters[estado_producto][$eq]': 'Activo',
          // REMOVIDO: 'filters[stock_actual][$gt]': 0, - Mostrar todos, incluso agotados
          'populate': ['producto', 'producto.imagen_principal', 'producto.grupos_de_productos', 'color', 'talla'],
          'pagination[pageSize]': 1000
        };

        // Aplicar filtros adicionales si existen
        if (this.activeFilters.precio) {
          const [min, max] = this.activeFilters.precio.split('-').map(val => parseFloat(val));
          
          if (!isNaN(min)) {
            inventoryParams['filters[$or][0][precio_oferta][$gte]'] = min;
            inventoryParams['filters[$or][1][precio_venta_sugerido][$gte]'] = min;
          }
          
          if (!isNaN(max)) {
            inventoryParams['filters[$or][0][precio_oferta][$lte]'] = max;
            inventoryParams['filters[$or][1][precio_venta_sugerido][$lte]'] = max;
          }
        }

        if (this.activeFilters.grupos_de_productos) {
          inventoryParams['filters[producto][grupos_de_productos][id][$eq]'] = this.activeFilters.grupos_de_productos;
        }

        const inventoryResponse = await axios.get(
          `${this.strapiBaseUrl}/api/inventario-colores`,
          { params: inventoryParams }
        );

        // Procesar productos únicos
        const productosMap = new Map();
        
        if (inventoryResponse.data?.data) {
          inventoryResponse.data.data.forEach(item => {
            const producto = item.attributes?.producto?.data;
            if (!producto) return;

            const productoId = producto.id;
            const precioActual = item.attributes.en_oferta && item.attributes.precio_oferta
              ? item.attributes.precio_oferta
              : item.attributes.precio_venta_sugerido;
            
            const stockActual = item.attributes.stock_actual || 0;

            if (productosMap.has(productoId)) {
              const existing = productosMap.get(productoId);
              
              if (precioActual < existing.precio_minimo) {
                existing.precio_minimo = precioActual;
              }
              
              // Sumar stock total
              existing.stock_total += stockActual;
              
              if (item.attributes.en_oferta && item.attributes.precio_oferta) {
                if (!existing.precio_oferta_minimo || item.attributes.precio_oferta < existing.precio_oferta_minimo) {
                  existing.precio_oferta_minimo = item.attributes.precio_oferta;
                  existing.tiene_oferta = true;
                }
              }
            } else {
              productosMap.set(productoId, {
                id: productoId,
                attributes: producto.attributes,
                precio_minimo: precioActual,
                precio_oferta_minimo: item.attributes.en_oferta ? item.attributes.precio_oferta : null,
                tiene_oferta: item.attributes.en_oferta || false,
                stock_total: stockActual
              });
            }
          });
        }

        let productos = Array.from(productosMap.values());
        console.log(`Productos favoritos filtrados: ${productos.length}`);

        // Ordenar
        productos = this.sortProducts(productos);

        // Paginar
        this.totalProducts = productos.length;
        this.totalPages = Math.ceil(productos.length / this.pageSize);
        
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.products = productos.slice(start, end);

      } catch (error) {
        console.error('Error al obtener productos del wishlist:', error);
        this.products = [];
        this.totalProducts = 0;
        this.totalPages = 0;
      }
    },

    sortProducts(productos) {
      const [campo, direccion] = this.sortOrder.split(':');
      
      return productos.sort((a, b) => {
        let valorA, valorB;
        
        switch (campo) {
          case 'precio':
            valorA = a.precio_minimo || 0;
            valorB = b.precio_minimo || 0;
            break;
          case 'nombre':
            valorA = a.attributes?.nombre || '';
            valorB = b.attributes?.nombre || '';
            return direccion === 'asc' 
              ? valorA.localeCompare(valorB)
              : valorB.localeCompare(valorA);
          case 'createdAt':
          default:
            valorA = new Date(a.attributes?.createdAt || 0);
            valorB = new Date(b.attributes?.createdAt || 0);
            break;
        }
        
        return direccion === 'asc' ? valorA - valorB : valorB - valorA;
      });
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
        filters.grupos_de_productos = urlParams.grupo_producto;
      }
      
      if (urlParams.precio) {
        filters.precio = urlParams.precio;
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