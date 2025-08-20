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
      .row(v-if="!loading && (!categoria || !categoria.data || categoria.data.length === 0)")
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
      loading: true, // ✅ Iniciar en loading
      error: false,
      useGraphQL: true,
      restAttempted: false // ✅ Evitar múltiples intentos REST
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

    // ✅ MÉTODO FALLBACK: REST API - RUTA CORREGIDA
    async fetchCategoriasREST() {
      if (this.restAttempted) {
        console.log('AreaOfertas - REST ya fue intentado, evitando duplicados');
        return;
      }
      
      this.restAttempted = true;
      console.log('AreaOfertas - Usando REST API como fallback');
      this.loading = true;
      
      try {
        // ✅ DIFERENTES RUTAS POSIBLES EN STRAPI
        const possibleRoutes = [
          '/api/categorias',
          '/categorias',
          '/api/categoria',
          '/categoria'
        ];
        
        let response = null;
        let successRoute = null;
        
        for (const route of possibleRoutes) {
          try {
            console.log(`AreaOfertas - Intentando ruta: ${route}`);
            response = await this.$axios.get(route, {
              params: {
                populate: 'deep' // ✅ Usar populate deep para obtener todo
              }
            });
            successRoute = route;
            console.log(`AreaOfertas - Éxito con ruta: ${route}`);
            break;
          } catch (routeError) {
            console.log(`AreaOfertas - Falló ruta ${route}:`, routeError.response?.status);
            continue;
          }
        }
        
        if (!response) {
          throw new Error('Ninguna ruta REST funcionó');
        }
        
        this.categoria = {
          data: response.data.data || response.data || []
        };
        
        console.log('AreaOfertas - Categorías cargadas via REST:', this.categoria.data.length);
        this.error = false;
        
      } catch (error) {
        console.error('AreaOfertas - Error en REST API:', error);
        this.error = true;
        this.categoria = { data: [] };
        
        // ✅ DATOS DE PRUEBA COMO ÚLTIMO RECURSO
        this.loadTestData();
      } finally {
        this.loading = false;
      }
    },

    // ✅ DATOS DE PRUEBA COMO FALLBACK FINAL
    loadTestData() {
      console.log('AreaOfertas - Cargando datos de prueba');
      this.categoria = {
        data: [
          {
            id: 1,
            attributes: {
              nombre: 'Ropa Casual',
              descripcion: 'Encuentra la mejor ropa casual para tu día a día',
              grupos_de_productos: {
                data: [
                  { id: 1, attributes: { nombre: 'Camisetas' } },
                  { id: 2, attributes: { nombre: 'Pantalones' } }
                ]
              },
              imagen: {
                data: {
                  attributes: {
                    url: 'https://via.placeholder.com/400x400/007bff/ffffff?text=Ropa+Casual'
                  }
                }
              }
            }
          },
          {
            id: 2,
            attributes: {
              nombre: 'Ropa Formal',
              descripcion: 'Elegancia y estilo para ocasiones especiales',
              grupos_de_productos: {
                data: [
                  { id: 3, attributes: { nombre: 'Trajes' } },
                  { id: 4, attributes: { nombre: 'Camisas' } }
                ]
              },
              imagen: {
                data: {
                  attributes: {
                    url: 'https://via.placeholder.com/400x400/28a745/ffffff?text=Ropa+Formal'
                  }
                }
              }
            }
          }
        ]
      };
      this.error = false;
    }
  },

  apollo: {
    categoria: {
      prefetch: true,
      query: categoriasQuery,
      loadingKey: 'loading', // ✅ Vincular loading con Apollo
      
      // ✅ MANEJO DE ERRORES EN APOLLO
      error(error) {
        console.error('AreaOfertas - Error en GraphQL:', error);
        this.error = true;
        this.loading = false;
        
        // Intentar con REST API como fallback
        this.$nextTick(() => {
          this.fetchCategoriasREST();
        });
      },
      
      // ✅ RESULTADO EXITOSO
      result(result) {
        console.log('AreaOfertas - Resultado GraphQL:', result);
        if (result.data && result.data.categorias && result.data.categorias.data) {
          console.log('AreaOfertas - Categorías cargadas via GraphQL:', result.data.categorias.data.length);
          this.error = false;
          this.loading = false;
        } else {
          console.log('AreaOfertas - GraphQL no retornó datos, usando REST');
          this.error = true;
          this.fetchCategoriasREST();
        }
      }
    }
  },

  mounted() {
    // ✅ TIMEOUT DE SEGURIDAD PARA GRAPHQL
    setTimeout(() => {
      if (this.loading && !this.restAttempted) {
        console.log('AreaOfertas - GraphQL timeout, usando REST como fallback');
        this.fetchCategoriasREST();
      }
    }, 5000); // 5 segundos timeout
    
    // ✅ VERIFICACIÓN ADICIONAL
    this.$nextTick(() => {
      setTimeout(() => {
        if (!this.categoria.data || this.categoria.data.length === 0) {
          if (!this.restAttempted) {
            console.log('AreaOfertas - No hay datos después de 3 segundos, usando REST');
            this.fetchCategoriasREST();
          }
        }
      }, 3000);
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

/* Placeholder styling para datos de prueba */
.offer-box {
  min-height: 450px;
  display: flex;
  flex-direction: column;
}

.box-inner {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>