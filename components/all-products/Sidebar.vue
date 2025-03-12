<template>
  <div class="col-lg-4 col-md-12">
    <div class="woocommerce-sidebar-area">
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
            <a href="#" @click.prevent="clearFilters"><i class="far fa-trash-alt"></i> <span>Borrar seleciones</span></a>
          </div>
        </b-collapse>
      </div>

      <div class="collapse-widget collections-list-widget">
        <h3 v-b-toggle.collapse-2 class="collapse-widget-title">
          Nuestra coleccion
          <i class="fas fa-angle-up"></i>
        </h3>
        <b-collapse visible id="collapse-2">
          <ul class="collections-list-row">
            <li :class="{ active: isActive('categoria', 'mujeres') }">
              <a href="#" @click.prevent="applyFilter('categoria', 'mujeres', 'Mujeres')">Mujeres</a>
            </li>
            <li :class="{ active: isActive('categoria', 'hombres') }">
              <a href="#" @click.prevent="applyFilter('categoria', 'hombres', 'Hombres')">Hombres</a>
            </li>
            <li :class="{ active: isActive('categoria', 'ninos') }">
              <a href="#" @click.prevent="applyFilter('categoria', 'ninos', 'Niños')">Niños</a>
            </li>
            <li :class="{ active: isActive('en_oferta', true) }">
              <a href="#" @click.prevent="applyFilter('en_oferta', true, 'Ofertas')">Ofertas</a>
            </li>
          </ul>
        </b-collapse>
      </div>

      <div class="collapse-widget brands-list-widget">
        <h3 v-b-toggle.collapse-3 class="collapse-widget-title">
          Marcas que manejamos
          <i class="fas fa-angle-up"></i>
        </h3>

        <b-collapse visible id="collapse-3">
          <ul class="brands-list-row">
            <li v-for="marca in marcas" :key="marca.id" :class="{ active: isActive('marca', marca.id) }">
              <a href="#" @click.prevent="applyFilter('marca', marca.id, marca.nombre)">{{ marca.nombre }}</a>
            </li>
          </ul>
        </b-collapse>
      </div>

      <div class="collapse-widget size-list-widget">
        <h3 v-b-toggle.collapse-4 class="collapse-widget-title">
          Tallas
          <i class="fas fa-angle-up"></i>
        </h3>

        <b-collapse visible id="collapse-4">
          <ul class="size-list-row">
            <li v-for="talla in tallas" :key="talla.id" :class="{ active: isActive('talla', talla.id) }">
              <a href="#" @click.prevent="applyFilter('talla', talla.id, talla.nombre)">{{ talla.nombre }}</a>
            </li>
          </ul>
        </b-collapse>
      </div>

      <div class="collapse-widget price-list-widget">
        <h3 v-b-toggle.collapse-5 class="collapse-widget-title">
          Price
          <i class="fas fa-angle-up"></i>
        </h3>

        <b-collapse visible id="collapse-5">
          <ul class="price-list-row">
            <li :class="{ active: isActive('precio', '10-100') }">
              <a href="#" @click.prevent="applyFilter('precio', '10-100', '$10 - $100')">$10 - $100</a>
            </li>
            <li :class="{ active: isActive('precio', '100-200') }">
              <a href="#" @click.prevent="applyFilter('precio', '100-200', '$100 - $200')">$100 - $200</a>
            </li>
            <li :class="{ active: isActive('precio', '200-300') }">
              <a href="#" @click.prevent="applyFilter('precio', '200-300', '$200 - $300')">$200 - $300</a>
            </li>
            <li :class="{ active: isActive('precio', '300-400') }">
              <a href="#" @click.prevent="applyFilter('precio', '300-400', '$300 - $400')">$300 - $400</a>
            </li>
            <li :class="{ active: isActive('precio', '400-500') }">
              <a href="#" @click.prevent="applyFilter('precio', '400-500', '$400 - $500')">$400 - $500</a>
            </li>
            <li :class="{ active: isActive('precio', '500-600') }">
              <a href="#" @click.prevent="applyFilter('precio', '500-600', '$500 - $600')">$500 - $600</a>
            </li>
          </ul>
        </b-collapse>
      </div>

      <div class="collapse-widget color-list-widget">
        <h3 v-b-toggle.collapse-6 class="collapse-widget-title">
          Color
          <i class="fas fa-angle-up"></i>
        </h3>

        <b-collapse visible id="collapse-6">
          <ul class="color-list-row">
            <li v-for="color in colores" :key="color.id" :class="{ active: isActive('color', color.id) }">
              <a 
                href="#" 
                :title="color.nombre" 
                :class="getColorClass(color)"
                :style="getColorStyle(color)"
                @click.prevent="applyFilter('color', color.id, color.nombre)"
              ></a>
            </li>
          </ul>
        </b-collapse>
      </div>

      <div class="collapse-widget tag-list-widget">
        <h3 v-b-toggle.collapse-7 class="collapse-widget-title">
          Mas buscados
          <i class="fas fa-angle-up"></i>
        </h3>
        <b-collapse visible id="collapse-7">
          <ul class="tags-list-row">
            <li v-for="tag in tags" :key="tag.id" :class="{ active: isActive('tag', tag.id) }">
              <a href="#" @click.prevent="applyFilter('tag', tag.id, tag.nombre)">{{ tag.nombre }}</a>
            </li>
          </ul>
        </b-collapse>
      </div>

      <!-- Productos populares -->
      <div class="collapse-widget aside-products-widget">
        <h3 class="aside-widget-title">
          Productos populares
        </h3>

        <div v-if="productosPopulares.length > 0">
          <div v-for="(producto, index) in productosPopulares" :key="index" class="aside-single-products">
            <div class="products-image">
              <a href="#" @click.prevent="navigateToProduct(producto.id)">
                <img :src="producto.imagen_principal" :alt="producto.nombre">
              </a>
            </div>

            <div class="products-content">
              <span><a href="#" @click.prevent="applyFilter('categoria', producto.categoria_id, producto.categoria)">{{ producto.categoria }}</a></span>
              <h3><a href="#" @click.prevent="navigateToProduct(producto.id)">{{ producto.nombre }}</a></h3>

              <div class="product-price">
                <span class="new-price">${{ producto.precio_venta }}</span>
                <span v-if="producto.precio_original" class="old-price">${{ producto.precio_original }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>Cargando productos populares...</p>
        </div>
      </div>

      <!-- Widget de tendencias -->
      <div class="collapse-widget aside-trending-widget">
        <div class="aside-trending-products">
          <img src="../../assets/img/bestseller-hover-img1.jpg" alt="image">

          <div class="category">
            <h4>Top Trending</h4>
            <span>Spring/Summer {{ new Date().getFullYear() }} Collection</span>
          </div>

          <a href="#" @click.prevent="navigateToCollection('trending')"></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeFilters: [],
      marcas: [],
      tallas: [],
      colores: [],
      tags: [],
      productosPopulares: [],
      strapiBaseUrl: process.env.VUE_APP_STRAPI_URL || 'http://localhost:1337',
      // Mapa de colores predeterminados para compatibilidad
      colorMap: {
        'black': 'color-black',
        'red': 'color-red',
        'yellow': 'color-yellow',
        'white': 'color-white',
        'blue': 'color-blue',
        'green': 'color-green',
        'yellowgreen': 'color-yellowgreen',
        'pink': 'color-pink',
        'violet': 'color-violet',
        'blueviolet': 'color-blueviolet',
        'lime': 'color-lime',
        'plum': 'color-plum',
        'teal': 'color-teal'
      }
    };
  },
  mounted() {
    this.loadFilterOptions();
    this.loadProductosPopulares();
    // Cargar filtros desde la URL si existen
    this.loadFiltersFromUrl();
  },
  methods: {
    async loadFilterOptions() {
      try {
        // Cargar marcas
        const marcasResponse = await axios.get(`${this.strapiBaseUrl}/api/marcas`);
        this.marcas = marcasResponse.data.data.map(item => ({
          id: item.id,
          nombre: item.attributes.nombre
        }));

        // Cargar tallas
        const tallasResponse = await axios.get(`${this.strapiBaseUrl}/api/tallas`);
        this.tallas = tallasResponse.data.data.map(item => ({
          id: item.id,
          nombre: item.attributes.nombre
        }));

        // Cargar colores
        const coloresResponse = await axios.get(`${this.strapiBaseUrl}/api/colores`);
        this.colores = coloresResponse.data.data.map(item => ({
          id: item.id,
          nombre: item.attributes.nombre,
          codigo: item.attributes.codigo
        }));

        // Cargar tags
        const tagsResponse = await axios.get(`${this.strapiBaseUrl}/api/tags`);
        this.tags = tagsResponse.data.data.map(item => ({
          id: item.id,
          nombre: item.attributes.nombre
        }));
      } catch (error) {
        console.error('Error al cargar opciones de filtros:', error);
      }
    },
    
    async loadProductosPopulares() {
      try {
        // Cargar productos populares (los más vendidos o mejor calificados)
        const productosResponse = await axios.get(
          `${this.strapiBaseUrl}/api/productos`, 
          { 
            params: { 
              sort: 'ventas:desc',
              pagination: { limit: 3 },
              populate: ['imagen_principal', 'grupo_de_productos'] 
            } 
          }
        );
        
        this.productosPopulares = productosResponse.data.data.map(item => ({
          id: item.id,
          nombre: item.attributes.nombre,
          categoria: item.attributes.grupo_de_productos?.data?.attributes?.nombre || '',
          categoria_id: item.attributes.grupo_de_productos?.data?.id,
          precio_venta: item.attributes.precio_venta,
          precio_original: item.attributes.precio_original,
          imagen_principal: item.attributes.imagen_principal?.data?.attributes?.url 
            ? `${this.strapiBaseUrl}${item.attributes.imagen_principal.data.attributes.url}`
            : '../../assets/img/default-product.jpg'
        }));
      } catch (error) {
        console.error('Error al cargar productos populares:', error);
      }
    },
    
    /**
     * Aplica un filtro con etiqueta personalizada opcional
     */
    applyFilter(type, value, customLabel = null) {
      // Verificar si este filtro ya está activo
      const existingIndex = this.activeFilters.findIndex(
        filter => filter.type === type && filter.value === value
      );

      // Si ya está activo, lo eliminamos (toggle)
      if (existingIndex !== -1) {
        this.removeFilter(type, value);
        return;
      }

      // Si es un filtro que debe ser único (como categoría o precio), 
      // removemos cualquier filtro previo del mismo tipo
      if (['categoria', 'precio'].includes(type)) {
        const typeIndex = this.activeFilters.findIndex(filter => filter.type === type);
        if (typeIndex !== -1) {
          this.activeFilters.splice(typeIndex, 1);
        }
      }

      // Usar etiqueta personalizada o buscar la correspondiente
      let label = customLabel || value;
      if (!customLabel) {
        if (type === 'marca') {
          const marca = this.marcas.find(m => m.id === value);
          if (marca) label = marca.nombre;
        } else if (type === 'talla') {
          const talla = this.tallas.find(t => t.id === value);
          if (talla) label = talla.nombre;
        } else if (type === 'color') {
          const color = this.colores.find(c => c.id === value);
          if (color) label = color.nombre;
        } else if (type === 'tag') {
          const tag = this.tags.find(t => t.id === value);
          if (tag) label = tag.nombre;
        } else if (type === 'en_oferta' && value === true) {
          label = 'Ofertas';
        }
      }

      // Agregar el filtro a la lista activa
      this.activeFilters.push({ type, value, label });

      // Actualizar URL con los filtros activos
      this.updateUrlWithFilters();

      // Notificar al componente de productos para actualizar la vista
      this.notifyProductsComponent();
    },
    
    removeFilter(type, value) {
      const index = this.activeFilters.findIndex(
        filter => filter.type === type && filter.value === value
      );
      if (index !== -1) {
        this.activeFilters.splice(index, 1);
        
        // Actualizar URL con los filtros restantes
        this.updateUrlWithFilters();
        
        // Notificar al componente de productos para actualizar la vista
        this.notifyProductsComponent();
      }
    },
    
    clearFilters() {
      this.activeFilters = [];
      
      // Limpiar filtros de la URL
      this.updateUrlWithFilters();
      
      // Notificar al componente de productos para actualizar la vista
      this.notifyProductsComponent();
    },
    
    isActive(type, value) {
      return this.activeFilters.some(
        filter => filter.type === type && filter.value === value
      );
    },
    
    /**
     * Determina la clase CSS para el color según su código
     */
    getColorClass(color) {
      // Si el color tiene un código que coincide con nuestro mapa, usamos la clase predefinida
      if (color.codigo && this.colorMap[color.codigo.toLowerCase()]) {
        return this.colorMap[color.codigo.toLowerCase()];
      }
      
      // Si no encontramos el color en el mapa, usamos un estilo inline
      return `color-custom-${color.id}`;
    },

    /**
     * Genera un estilo CSS inline para colores personalizados
     */
    getColorStyle(color) {
      // Solo aplicar estilos inline para colores personalizados
      if (!color.codigo || !this.colorMap[color.codigo.toLowerCase()]) {
        return {
          backgroundColor: color.codigo || '#cccccc'
        };
      }
      return {};
    },
    
    /**
     * Actualiza la URL con los filtros activos para que sean bookmarkeables
     */
    updateUrlWithFilters() {
      if (!this.$router) return;
      
      const query = {};
      
      // Agrupar filtros por tipo
      this.activeFilters.forEach(filter => {
        if (!query[filter.type]) {
          query[filter.type] = [];
        }
        query[filter.type].push(filter.value);
      });
      
      // Convertir arrays en strings para la URL
      Object.keys(query).forEach(key => {
        if (Array.isArray(query[key])) {
          query[key] = query[key].join(',');
        }
      });
      
      this.$router.replace({ query });
    },
    
    /**
     * Carga filtros desde la URL cuando se inicia la página
     */
    loadFiltersFromUrl() {
      if (!this.$route || !this.$route.query) return;
      
      const query = this.$route.query;
      
      // Recorrer los parámetros de la URL
      Object.keys(query).forEach(type => {
        const values = query[type].split(',');
        
        values.forEach(value => {
          // Convertir a boolean o número si es necesario
          let processedValue = value;
          if (value === 'true') processedValue = true;
          if (value === 'false') processedValue = false;
          if (!isNaN(value) && type !== 'precio') processedValue = parseInt(value);
          
          // Aplicar cada filtro encontrado en la URL
          this.applyFilter(type, processedValue);
        });
      });
    },
    
    buildFilters() {
      const filters = {};
      
      // Procesamos cada filtro activo
      this.activeFilters.forEach(filter => {
        const { type, value } = filter;
        
        if (type === 'precio') {
          // Para el precio, convertimos el rango (ej: "10-100") a un objeto de filtro
          const [min, max] = value.split('-').map(Number);
          filters.precio_venta = {
            $gte: min,
            $lte: max
          };
        } else if (type === 'categoria') {
          // Para categoría, filtramos por el grupo de productos
          if (value === 'mujeres' || value === 'hombres' || value === 'ninos') {
            filters.grupo_de_productos = {
              nombre: {
                $containsi: value
              }
            };
          }
        } else if (type === 'marca') {
          // Para marca, filtramos por ID
          if (!filters.marca) {
            filters.marca = { id: { $in: [] } };
          }
          if (!filters.marca.id.$in.includes(value)) {
            filters.marca.id.$in.push(value);
          }
        } else if (type === 'talla') {
          // Para talla, filtramos en las variantes
          if (!filters.variantes) {
            filters.variantes = { talla: { id: { $in: [] } } };
          } else if (!filters.variantes.talla) {
            filters.variantes.talla = { id: { $in: [] } };
          }
          if (!filters.variantes.talla.id.$in.includes(value)) {
            filters.variantes.talla.id.$in.push(value);
          }
        } else if (type === 'color') {
          // Para color, filtramos en las variantes
          if (!filters.variantes) {
            filters.variantes = { color: { id: { $in: [] } } };
          } else if (!filters.variantes.color) {
            filters.variantes.color = { id: { $in: [] } };
          }
          if (!filters.variantes.color.id.$in.includes(value)) {
            filters.variantes.color.id.$in.push(value);
          }
        } else if (type === 'en_oferta' && value === true) {
          // Para ofertas
          filters.en_oferta = { $eq: true };
        } else if (type === 'tag') {
          // Para tags
          if (!filters.tags) {
            filters.tags = { id: { $in: [] } };
          }
          if (!filters.tags.id.$in.includes(value)) {
            filters.tags.id.$in.push(value);
          }
        }
      });
      
      return filters;
    },
    
    navigateToProduct(productId) {
      // Navegar a la página de detalle del producto
      this.$router.push(`/producto/${productId}`);
    },
    
    navigateToCollection(collectionType) {
      // Navegar a la colección especificada
      if (collectionType === 'trending') {
        this.$router.push('/coleccion/tendencias');
      }
    },
    
    // Método para buscar el componente de productos y notificarle los cambios
    notifyProductsComponent() {
      // Emitir un evento global que el componente de productos pueda escuchar
      this.$root.$emit('sidebar-filters-changed', this.buildFilters());
    }
  }
};
</script>

<style scoped>
/* Estilos adicionales para los colores personalizados que no estén en las clases predefinidas */
.color-list-row a[class^="color-custom-"] {
  display: inline-block;
  width: 25px;
  height: 25px;
  border-radius: 50%;
}

/* Asegurarse de que los colores definidos en el CSS coincidan con los del sistema */
.color-black { background-color: #000; }
.color-red { background-color: #ff0000; }
.color-yellow { background-color: #ffff00; }
.color-white { background-color: #ffffff; border: 1px solid #e1e1e1; }
.color-blue { background-color: #0000ff; }
.color-green { background-color: #008000; }
.color-yellowgreen { background-color: #9acd32; }
.color-pink { background-color: #ffc0cb; }
.color-violet { background-color: #ee82ee; }
.color-blueviolet { background-color: #8a2be2; }
.color-lime { background-color: #00ff00; }
.color-plum { background-color: #dda0dd; }
.color-teal { background-color: #008080; }

/* Estilo para filtros activos */
.active a {
  font-weight: bold;
}

.color-list-row li.active a {
  outline: 2px solid #000;
  outline-offset: 2px;
}
</style>