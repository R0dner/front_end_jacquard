<template lang="pug">
section.offer-area.ptb-60
  .container
    // ✅ Loading state
    .text-center(v-if="loading")
      p Cargando categorías...
    
    // ✅ Error state
    .text-center(v-if="error && !loading")
      p.text-danger Error al cargar categorías. Intentando método alternativo...
    
    // ✅ Success state
    .row(v-else-if="categoria && categoria.data && categoria.data.length")
      .col-lg-4.col-md-6(v-for="category in categoria.data" :key="category.id")
        .offer-box
          img(
            v-if="category.attributes.imagen && category.attributes.imagen.data"
            :src="getCategoryImageUrl(category)"
            height="400"
            :alt="category.attributes.nombre"
          )
          .category
            h4 {{ category.attributes.nombre }}
          .box-inner
            .inner-content
              h3 {{ category.attributes.descripcion }}
              ul
                li(
                  v-for="grupo in category.attributes.grupos_de_productos?.data || []"
                  :key="grupo.id"
                )
                  router-link(:to="{ name: 'products', query: { grupo_producto: grupo.id } }")
                    | {{ grupo.attributes.nombre }}
    
    // ✅ Empty state
    .text-center(v-else-if="!loading")
      p No se encontraron categorías.
</template>

<script>
import categoriasQuery from '@/apollo/queries/categorias/categorias.gql'

export default {
  name: "AreaOfertas",
  data() {
    return {
      api_url: process.env.strapiBaseUri,
      categoria: { data: [] },
      loading: false,
      error: false,
      useGraphQL: true
    }
  },
  methods: {
    getCategoryImageUrl(category) {
      if (category.attributes?.imagen?.data?.attributes?.url) {
        let imageUrl = category.attributes.imagen.data.attributes.url;
        
        // Detectar y corregir URLs malformadas
        if (imageUrl.includes('strapiapp.comhttps')) {
          const mediaUrlMatch = imageUrl.match(/https:\/\/[^\/]*\.media\.strapiapp\.com\/.*$/);
          if (mediaUrlMatch) {
            console.log(`AreaOfertas - Fixed malformed URL: ${mediaUrlMatch[0]}`);
            return mediaUrlMatch[0];
          }
        }
        
        // Si ya es una URL completa
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          console.log(`AreaOfertas - Using complete URL: ${imageUrl}`);
          return imageUrl;
        }
        
        // Si es relativa, agregar el dominio base
        const baseUrl = this.api_url?.endsWith('/') 
          ? this.api_url.slice(0, -1) 
          : this.api_url;
        
        const finalUrl = `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
        console.log(`AreaOfertas - Constructed URL: ${finalUrl}`);
        return finalUrl;
      }
      
      console.log('AreaOfertas - No image found, using default');
      return '/images/default-category.jpg';
    },

    // ✅ MÉTODO FALLBACK: REST API para categorías
    async fetchCategoriasREST() {
      console.log('AreaOfertas - Usando REST API como fallback');
      this.loading = true;
      try {
        // PRIMERO intenta con /categorias (sin /api/)
        let response;
        try {
          response = await this.$axios.get('/categorias', {
            params: {
              'populate': ['imagen', 'grupos_de_productos'].join(',')
            }
          });
        } catch (firstError) {
          // SI falla, intenta con /api/categorias
          console.log('AreaOfertas - Intentando con /api/ prefix');
          response = await this.$axios.get('/api/categorias', {
            params: {
              'populate': ['imagen', 'grupos_de_productos'].join(',')
            }
          });
        }
        
        this.categoria = {
          data: response.data.data || []
        };
        
        console.log('AreaOfertas - Categorías cargadas via REST:', this.categoria.data.length);
        this.error = false;
      } catch (error) {
        console.error('AreaOfertas - Error en REST API:', error);
        this.error = true;
        this.categoria = { data: [] };
        
        // ✅ CARGAR DATOS DE PRUEBA COMO ÚLTIMO RECURSO
        this.loadFallbackData();
      } finally {
        this.loading = false;
      }
    },

    // ✅ DATOS DE FALLBACK PARA EVITAR PANTALLAS VACÍAS
    loadFallbackData() {
      console.log('AreaOfertas - Cargando datos de fallback');
      this.categoria = {
        data: [
          {
            id: 1,
            attributes: {
              nombre: "Categoría Ejemplo",
              descripcion: "Descripción de ejemplo",
              imagen: {
                data: {
                  attributes: {
                    url: "/images/default-category.jpg"
                  }
                }
              },
              grupos_de_productos: {
                data: [
                  {
                    id: 1,
                    attributes: {
                      nombre: "Grupo Ejemplo"
                    }
                  }
                ]
              }
            }
          }
        ]
      };
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
    // ✅ EN PRODUCCIÓN, USAR DIRECTAMENTE REST API
    if (process.env.NODE_ENV === 'production') {
      console.log('AreaOfertas - Modo producción, usando REST API directamente');
      this.fetchCategoriasREST();
    } else {
      // ✅ EN DESARROLLO, INTENTAR GraphQL PRIMERO
      this.$nextTick(() => {
        if (this.error || !this.categoria.data || this.categoria.data.length === 0) {
          setTimeout(() => {
            if (!this.categoria.data || this.categoria.data.length === 0) {
              console.log('AreaOfertas - GraphQL no funcionó, usando REST como fallback');
              this.fetchCategoriasREST();
            }
          }, 2000);
        }
      });
    }
  }
}
</script>

<style scoped>
.text-danger {
  color: #dc3545;
  font-weight: 500;
}

.loading-text {
  color: #6c757d;
  font-style: italic;
}
</style>