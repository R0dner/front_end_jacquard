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
            // ✅ Protege contra imágenes nulas usando método helper mejorado
            img(
              v-if="getCategoryImageUrl(category)"
              :src="getCategoryImageUrl(category)"
              height="400"
              :alt="category.attributes.nombre"
              @error="handleImageError"
              @load="handleImageLoad"
            )
            // ✅ Imagen por defecto si no hay imagen
            .default-image(
              v-else
              :style="{ height: '400px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }"
            )
              p No imagen disponible
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
      loading: true,
      error: false,
      useGraphQL: true,
      restAttempted: false
    }
  },
  methods: {
    getCategoryImageUrl(category) {
      console.log('AreaOfertas - Procesando imagen para categoría:', category.attributes.nombre);
      console.log('AreaOfertas - Datos completos de categoría:', JSON.stringify(category, null, 2));
      
      let imagenData = null;
      
      // ✅ BÚSQUEDA EXHAUSTIVA DE IMÁGENES EN DIFERENTES UBICACIONES
      if (category.attributes?.imagen?.data?.attributes) {
        imagenData = category.attributes.imagen.data.attributes;
        console.log('AreaOfertas - Imagen encontrada en category.attributes.imagen.data.attributes');
      }
      else if (category.attributes?.imagen?.data?.[0]?.attributes) {
        imagenData = category.attributes.imagen.data[0].attributes;
        console.log('AreaOfertas - Imagen encontrada en category.attributes.imagen.data[0].attributes');
      }
      else if (category.imagen?.data?.attributes) {
        imagenData = category.imagen.data.attributes;
        console.log('AreaOfertas - Imagen encontrada en category.imagen.data.attributes');
      }
      else if (category.attributes?.image?.data?.attributes) {
        imagenData = category.attributes.image.data.attributes;
        console.log('AreaOfertas - Imagen encontrada en category.attributes.image.data.attributes');
      }
      else if (category.attributes?.images?.data?.[0]?.attributes) {
        imagenData = category.attributes.images.data[0].attributes;
        console.log('AreaOfertas - Imagen encontrada en category.attributes.images.data[0].attributes');
      }

      if (imagenData?.url) {
        let cleanUrl = imagenData.url.trim();
        console.log('AreaOfertas - URL original:', cleanUrl);
        
        // ✅ DETECTAR Y CORREGIR URLs MALFORMADAS (mismo patrón que productos)
        if (cleanUrl.includes('strapiapp.comhttps')) {
          const mediaUrlMatch = cleanUrl.match(/https:\/\/[^\/]*\.media\.strapiapp\.com\/.*$/);
          if (mediaUrlMatch) {
            console.log(`AreaOfertas - Fixed malformed URL: ${mediaUrlMatch[0]}`);
            return mediaUrlMatch[0];
          }
        }
        
        // ✅ SI YA ES UNA URL COMPLETA, DEVOLVERLA TAL COMO ESTÁ
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          console.log(`AreaOfertas - Using complete URL: ${cleanUrl}`);
          return cleanUrl;
        }
        
        // ✅ SI ES RELATIVA, AGREGAR EL DOMINIO BASE
        const baseUrl = this.api_url?.endsWith('/') 
          ? this.api_url.slice(0, -1) 
          : this.api_url;
        
        const finalUrl = `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
        console.log(`AreaOfertas - Constructed URL: ${finalUrl}`);
        return finalUrl;
      }

      console.log('AreaOfertas - No image found for category:', category.attributes.nombre);
      return null;
    },

    handleImageError(event) {
      console.error('AreaOfertas - Error loading image:', event.target.src);
      // ✅ En lugar de ocultar, mostrar imagen por defecto
      event.target.style.display = 'none';
      // Mostrar el div de imagen por defecto
      const defaultDiv = event.target.parentNode.querySelector('.default-image');
      if (defaultDiv) {
        defaultDiv.style.display = 'flex';
      }
    },

    handleImageLoad(event) {
      console.log('AreaOfertas - Image loaded successfully:', event.target.src);
    },

    // ✅ MÉTODO FALLBACK: REST API MEJORADO
    async fetchCategoriasREST() {
      if (this.restAttempted) {
        console.log('AreaOfertas - REST ya fue intentado, evitando duplicados');
        return;
      }
      
      this.restAttempted = true;
      console.log('AreaOfertas - Usando REST API como fallback');
      this.loading = true;
      
      try {
        // ✅ DIFERENTES RUTAS Y CONFIGURACIONES POSIBLES
        const possibleConfigs = [
          {
            route: '/api/categorias',
            params: {
              'populate': 'deep'
            }
          },
          {
            route: '/api/categorias',
            params: {
              'populate': ['imagen', 'grupos_de_productos', 'image', 'images'].join(',')
            }
          },
          {
            route: '/categorias',
            params: {
              'populate': '*'
            }
          },
          {
            route: '/api/categoria',
            params: {
              'populate': 'deep'
            }
          }
        ];
        
        let response = null;
        let successConfig = null;
        
        for (const config of possibleConfigs) {
          try {
            console.log(`AreaOfertas - Intentando: ${config.route} con params:`, config.params);
            response = await this.$axios.get(config.route, {
              params: config.params
            });
            successConfig = config;
            console.log(`AreaOfertas - Éxito con: ${config.route}`);
            break;
          } catch (routeError) {
            console.log(`AreaOfertas - Falló ${config.route}:`, routeError.response?.status);
            continue;
          }
        }
        
        if (!response) {
          throw new Error('Ninguna configuración REST funcionó');
        }
        
        // ✅ PROCESAR LA RESPUESTA
        let categoriesData = response.data.data || response.data || [];
        
        // ✅ LOGGING DETALLADO PARA DEBUG
        console.log('AreaOfertas - Respuesta REST completa:', JSON.stringify(response.data, null, 2));
        console.log('AreaOfertas - Categorías procesadas:', categoriesData.length);
        
        this.categoria = {
          data: categoriesData
        };
        
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

    // ✅ DATOS DE PRUEBA MEJORADOS
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
                    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
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
                    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
                  }
                }
              }
            }
          },
          {
            id: 3,
            attributes: {
              nombre: 'Accesorios',
              descripcion: 'Complementa tu look con nuestros accesorios',
              grupos_de_productos: {
                data: [
                  { id: 5, attributes: { nombre: 'Bolsos' } },
                  { id: 6, attributes: { nombre: 'Relojes' } }
                ]
              },
              imagen: {
                data: {
                  attributes: {
                    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
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
      loadingKey: 'loading',
      
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
      
      // ✅ RESULTADO EXITOSO CON LOGGING DETALLADO
      result(result) {
        console.log('AreaOfertas - Resultado GraphQL completo:', JSON.stringify(result, null, 2));
        if (result.data && result.data.categorias && result.data.categorias.data) {
          console.log('AreaOfertas - Categorías cargadas via GraphQL:', result.data.categorias.data.length);
          
          // ✅ LOGGING DE CADA CATEGORÍA PARA DEBUG
          result.data.categorias.data.forEach((cat, index) => {
            console.log(`AreaOfertas - Categoría ${index + 1}:`, cat.attributes.nombre);
            console.log(`AreaOfertas - Imagen data:`, JSON.stringify(cat.attributes.imagen, null, 2));
          });
          
          this.error = false;
          this.loading = false;
        } else {
          console.log('AreaOfertas - GraphQL no retornó datos esperados, usando REST');
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
    }, 5000);
    
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

    // ✅ DEBUG DE VARIABLES DE ENTORNO
    console.log('AreaOfertas - API URL configurada:', this.api_url);
    console.log('AreaOfertas - Variables de entorno disponibles:', process.env);
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

/* ✅ Estilo para imagen por defecto */
.default-image {
  width: 100%;
  border-radius: 8px;
  background-color: #f8f9fa !important;
  border: 2px dashed #dee2e6;
  color: #6c757d;
  font-weight: 500;
}

.default-image p {
  margin: 0;
  font-size: 14px;
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
  margin-bottom: 30px;
}

.box-inner {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ✅ Mejorar la categoría header */
.category h4 {
  font-weight: 600;
  margin: 10px 0;
  color: #333;
}

.inner-content h3 {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.inner-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.inner-content ul li {
  margin-bottom: 8px;
}

.inner-content ul li a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.inner-content ul li a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>