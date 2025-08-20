<template lang="pug">
  section.offer-area.ptb-60
    .container
      // ✅ Loading state
      .row(v-if="loading")
        .col-12.text-center
          p Cargando categorías...
      
      // ✅ Error state
      .row(v-if="error && !loading")
        .col-12.text-center
          p.text-danger Error al cargar categorías. Intentando método alternativo...
      
      // ✅ Verifica que categoria y categoria.data existan antes de hacer v-for
      .row(v-if="categoria && categoria.data && categoria.data.length > 0 && !loading")
        .col-lg-4.col-md-6(v-for="category in categoria.data" :key="category.id")
          .offer-box
            // ✅ Protege contra imágenes nulas usando método helper
            img(
              v-if="getCategoryImageUrl(category)"
              :src="getCategoryImageUrl(category)"
              height="400"
              :alt="category.attributes.nombre"
              @error="handleImageError"
            )
            .category
              h4 {{ category.attributes.nombre }}
            .box-inner
              .inner-content
                h3 {{ category.attributes.descripcion }}
                ul
                  // ✅ Asegúrate de que grupos_de_productos tenga data
                  li(
                    v-for="grupo in category.attributes.grupos_de_productos?.data || []"
                    :key="grupo.id"
                  )
                    router-link(:to="{ name: 'products', query: { grupo_producto: grupo.id } }")
                      | {{ grupo.attributes.nombre }}
      
      // ✅ Empty state
      .row(v-if="!loading && (!categoria.data || categoria.data.length === 0)")
        .col-12.text-center
          p No hay categorías disponibles en este momento.
</template>

<script>
import categoriasQuery from '@/apollo/queries/categorias/categorias.gql'

export default {
  name: "AreaOfertas",
  data() {
    return {
      categoria: { data: [] },
      api_url: process.env.strapiBaseUri,
      loading: false,
      error: false,
      useGraphQL: true // ✅ Controlar qué método usar
    }
  },
  methods: {
    getCategoryImageUrl(category) {
      let imagenData = null;
      
      // Buscar la imagen en diferentes ubicaciones posibles
      if (category.attributes?.imagen?.data?.attributes) {
        imagenData = category.attributes.imagen.data.attributes;
      }
      else if (category.imagen?.data?.attributes) {
        imagenData = category.imagen.data.attributes;
      }
      else if (category.attributes?.image?.data?.attributes) {
        imagenData = category.attributes.image.data.attributes;
      }

      if (imagenData?.url) {
        let cleanUrl = imagenData.url.trim();
        
        // Detectar y corregir URLs malformadas
        if (cleanUrl.includes('strapiapp.comhttps')) {
          const mediaUrlMatch = cleanUrl.match(/https:\/\/[^\/]*\.media\.strapiapp\.com\/.*$/);
          if (mediaUrlMatch) {
            console.log(`AreaOfertas - Fixed malformed URL: ${mediaUrlMatch[0]}`);
            return mediaUrlMatch[0];
          }
        }
        
        // Si ya es una URL completa, devolverla tal como está
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          console.log(`AreaOfertas - Using complete URL: ${cleanUrl}`);
          return cleanUrl;
        }
        
        // Si es relativa, agregar el dominio base
        const baseUrl = this.api_url?.endsWith('/') 
          ? this.api_url.slice(0, -1) 
          : this.api_url;
        
        const finalUrl = `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
        console.log(`AreaOfertas - Constructed URL: ${finalUrl}`);
        return finalUrl;
      }

      console.log('AreaOfertas - No image found for category');
      return null;
    },

    handleImageError(event) {
      console.log('AreaOfertas - Error loading image:', event.target.src);
      event.target.style.display = 'none';
    },

    // ✅ MÉTODO FALLBACK: REST API
    async fetchCategoriasREST() {
      console.log('AreaOfertas - Usando REST API como fallback');
      this.loading = true;
      try {
        const response = await this.$axios.get('/api/categorias', {
          params: {
            'populate': [
              'imagen', 
              'grupos_de_productos',
              'image'
            ].join(',')
          }
        });
        
        this.categoria = {
          data: response.data.data || []
        };
        
        console.log('AreaOfertas - Categorías cargadas via REST:', this.categoria.data.length);
        this.error = false;
      } catch (error) {
        console.error('AreaOfertas - Error en REST API:', error);
        this.error = true;
        this.categoria = { data: [] };
      } finally {
        this.loading = false;
      }
    }
  },
  apollo: {
    categoria: {
      prefetch: true,
      query: categoriasQuery,
      // ✅ MANEJO DE ERRORES EN APOLLO
      error(error) {
        console.error('AreaOfertas - Error en GraphQL:', error);
        this.error = true;
        this.useGraphQL = false;
        // Intentar con REST API como fallback
        this.$nextTick(() => {
          this.fetchCategoriasREST();
        });
      },
      // ✅ RESULTADO EXITOSO
      result(result) {
        if (result.data && result.data.categorias) {
          console.log('AreaOfertas - Categorías cargadas via GraphQL:', result.data.categorias.data.length);
          this.error = false;
        }
      }
    }
  },
  async mounted() {
    // ✅ SI HAY ERROR EN APOLLO O NO HAY DATOS, INTENTAR REST
    this.$nextTick(() => {
      if (this.error || !this.categoria.data || this.categoria.data.length === 0) {
        setTimeout(() => {
          if (!this.categoria.data || this.categoria.data.length === 0) {
            console.log('AreaOfertas - GraphQL no funcionó, usando REST como fallback');
            this.fetchCategoriasREST();
          }
        }, 2000); // Esperar 2 segundos antes del fallback
      }
    });
  }
}
</script>

<style scoped>
/* Estilos para estados de error */
.text-danger {
  color: #dc3545;
  font-weight: 500;
}

/* Mejorar la visualización de las imágenes */
.offer-box img {
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: opacity 0.3s ease;
}

.offer-box img:hover {
  opacity: 0.9;
}

/* Loading state styling */
.offer-area .text-center p {
  font-size: 16px;
  margin: 20px 0;
}
</style>