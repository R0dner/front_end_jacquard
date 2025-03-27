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
            <a href="#" @click.prevent="clearFilters"><i class="far fa-trash-alt"></i> <span>Borrar selecciones</span></a>
          </div>
        </b-collapse>
      </div>

      <div class="collapse-widget collections-list-widget">
        <h3 v-b-toggle.collapse-2 class="collapse-widget-title">
          Nuestra colección
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

      <div class="collapse-widget price-list-widget">
        <h3 v-b-toggle.collapse-5 class="collapse-widget-title">
          Precio
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
                <span class="new-price">Bs.{{ producto.precio_venta }}</span>
                <span v-if="producto.precio_original" class="old-price">Bs.{{ producto.precio_original }}</span>
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
      productosPopulares: [],
      strapiBaseUrl: process.env.VUE_APP_STRAPI_URL || 'http://localhost:1337',
    };
  },
  mounted() {
    this.loadFilterOptions();
    this.loadProductosPopulares();
    this.loadFiltersFromUrl();
  },
  methods: {
    async loadFilterOptions() {
      try {
        // Cargar marcas
        const marcasResponse = await axios.get(`${this.strapiBaseUrl}/api/marcas`);
        this.marcas = marcasResponse.data.data.map(item => ({
          id: item.id,
          nombre: item.attributes.nombre,
        }));
      } catch (error) {
        console.error('Error al cargar opciones de filtros:', error.response?.data || error.message);
        this.marcas = []; // Si hay un error, inicializa marcas como un array vacío
      }
},

    async loadProductosPopulares() {
      try {
        const productosResponse = await axios.get(
          `${this.strapiBaseUrl}/api/productos`,
          {
            params: {
              sort: 'ventas:desc',
              'pagination[limit]': 3, // Enviar paginación correctamente
              populate: ['imagen_principal', 'grupo_de_productos'].join(','),
            },
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
            : '../../assets/img/default-product.jpg',
        }));
      } catch (error) {
        console.error('Error al cargar productos populares:', error);
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

      if (['categoria', 'precio'].includes(type)) {
        const typeIndex = this.activeFilters.findIndex(filter => filter.type === type);
        if (typeIndex !== -1) {
          this.activeFilters.splice(typeIndex, 1);
        }
      }

      let label = customLabel || value;
      if (!customLabel) {
        if (type === 'marca') {
          const marca = this.marcas.find(m => m.id === value);
          if (marca) label = marca.nombre;
        } else if (type === 'en_oferta' && value === true) {
          label = 'Ofertas';
        }
      }

      this.activeFilters.push({ type, value, label });
      this.updateUrlWithFilters();
      this.notifyProductsComponent();
    },

    removeFilter(type, value) {
      const index = this.activeFilters.findIndex(
        filter => filter.type === type && filter.value === value
      );
      if (index !== -1) {
        this.activeFilters.splice(index, 1);
        this.updateUrlWithFilters();
        this.notifyProductsComponent();
      }
    },

    clearFilters() {
      this.activeFilters = [];
      this.updateUrlWithFilters();
      this.notifyProductsComponent();
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

      // Verificar si los parámetros actuales son diferentes a los nuevos
      const currentQuery = { ...this.$route.query };
      const newQuery = { ...query };

      if (JSON.stringify(currentQuery) !== JSON.stringify(newQuery)) {
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
          if (!isNaN(value) && type !== 'precio') processedValue = parseInt(value);
          this.applyFilter(type, processedValue);
        });
      });
    },

    buildFilters() {
      const filters = {};
      this.activeFilters.forEach(filter => {
        const { type, value } = filter;

        if (type === 'precio') {
          const [min, max] = value.split('-').map(Number); // Convertir el rango a números
          filters.precio_venta = {
            $gte: min, // Precio mayor o igual que el mínimo
            $lte: max, // Precio menor o igual que el máximo
          };
        } else if (type === 'categoria') {
          filters.grupo_de_productos = {
            nombre: {
              $containsi: value, // Filtrar por nombre de categoría
            },
          };
        } else if (type === 'marca') {
          if (!filters.marca) {
            filters.marca = { id: { $in: [] } };
          }
          filters.marca.id.$in.push(value); // Filtrar por ID de marca
        } else if (type === 'en_oferta' && value === true) {
          filters.en_oferta = { $eq: true }; // Filtrar por productos en oferta
        }
      });
      return filters;
    },

    navigateToProduct(productId) {
      this.$router.push(`/producto/${productId}`);
    },

    navigateToCollection(collectionType) {
      if (collectionType === 'trending') {
        this.$router.push('/coleccion/tendencias');
      }
    },

    notifyProductsComponent() {
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