<template>
    <div>
      <div class="page-title-area">
        <div class="container">
          <ul>
            <li><nuxt-link to="/">Inicio</nuxt-link></li>
            <li>Novedades</li>
          </ul>
        </div>
      </div>
  
      <section class="news-area ptb-60">
        <div class="container">
          <div class="row">
            <div v-for="(novedad, index) in novedades" :key="index" class="col-lg-4 col-md-6">
              <div class="single-blog-post">
                <div class="blog-image">
                  <a :href="novedad.Enlace" target="_blank" rel="noopener noreferrer">
                    <!-- DEBUG: Mostrar información de la imagen -->
                    <!-- <pre>{{ JSON.stringify(novedad.archivo, null, 2) }}</pre> -->
                    
                    <!-- Mostrar imagen si es una imagen -->
                    <img
                      v-if="novedad.archivo?.tipo === 'imagen' && novedad.archivo?.url"
                      :src="getStrapiMedia(novedad.archivo.url)"
                      :alt="novedad.titulo"
                      @error="onImageError($event, novedad)"
                    />
                    <!-- Mostrar video si es un video -->
                    <video
                      v-else-if="novedad.archivo?.tipo === 'video' && novedad.archivo?.url"
                      controls
                      :src="getStrapiMedia(novedad.archivo.url)"
                      :alt="novedad.titulo"
                    ></video>
                    <!-- Mostrar enlace si es un documento -->
                    <div v-else-if="novedad.archivo?.tipo === 'documento' && novedad.archivo?.url" class="documento">
                      <a :href="getStrapiMedia(novedad.archivo.url)" target="_blank" rel="noopener noreferrer">
                        Descargar documento
                      </a>
                    </div>
                    <!-- Mostrar imagen por defecto si no hay archivo válido -->
                    <div v-else class="no-image">
                      <img src="/images/default.jpg" :alt="novedad.titulo" />
                      <small>No hay imagen disponible</small>
                    </div>
                  </a>
                </div>
  
                <div class="blog-post-content">
                  <span class="date">{{ formatDate(novedad.FechadePublicacion) }}</span>
                  <h3>
                    <a :href="novedad.Enlace" target="_blank" rel="noopener noreferrer">{{ novedad.titulo }}</a>
                  </h3>
                  <p>{{ novedad.DescripcionBreve }}</p>
                  <a :href="novedad.Enlace" target="_blank" rel="noopener noreferrer" class="read-more-btn">Read More</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    async asyncData({ $axios }) {
      try {
        const response = await $axios.get('/api/novedades?populate=imagen');
        console.log('📊 Respuesta completa de la API:', JSON.stringify(response.data, null, 2));
  
        if (!response.data || !response.data.data) {
          throw new Error('No se encontraron datos');
        }
  
        const novedades = response.data.data.map((item, index) => {
          console.log(`📝 Procesando item ${index}:`, JSON.stringify(item, null, 2));
          
          // ✅ CORRECCIÓN: Manejo más robusto de la estructura de datos
          let archivo = null;
          let tipo = 'imagen';
          
          // Intentar diferentes estructuras posibles
          if (item.attributes.imagen?.data) {
            // Si es un array de imágenes
            if (Array.isArray(item.attributes.imagen.data)) {
              archivo = item.attributes.imagen.data[0]?.attributes;
            } 
            // Si es un objeto único
            else {
              archivo = item.attributes.imagen.data.attributes;
            }
          }
          
          console.log(`🖼️ Archivo extraído para ${item.attributes.titulo}:`, archivo);
          
          // Determinar tipo de archivo
          if (archivo && archivo.url) {
            const extension = archivo.url.split('.').pop().toLowerCase();
            if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension)) {
              tipo = 'video';
            } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(extension)) {
              tipo = 'documento';
            } else {
              tipo = 'imagen';
            }
          }
  
          const resultado = {
            id: item.id,
            titulo: item.attributes.titulo,
            FechadePublicacion: item.attributes.FechadePublicacion,
            archivo: {
              url: archivo?.url || '',
              tipo: tipo,
              mime: archivo?.mime || '',
              name: archivo?.name || ''
            },
            DescripcionBreve: item.attributes.DescripcionBreve,
            Enlace: item.attributes.Enlace,
          };
          
          console.log(`✅ Resultado final para ${item.attributes.titulo}:`, resultado);
          return resultado;
        });
        
        console.log('🎯 Novedades procesadas:', novedades);
        return { novedades };
        
      } catch (error) {
        console.error('❌ Error al obtener las novedades:', error.message);
        console.error('🔍 Stack trace:', error.stack);
        return {
          novedades: [],
        };
      }
    },
    methods: {
      // ✅ MÉTODO mejorado para manejar URLs de Strapi
      getStrapiMedia(url) {
        console.log('🔗 getStrapiMedia recibió:', url);
        
        // Valor por defecto si no hay URL
        if (!url) {
          console.log('⚠️ No hay URL, usando imagen por defecto');
          return '/images/default.jpg';
        }
        
        // Verificar si la URL ya es completa
        if (url.startsWith('http://') || url.startsWith('https://')) {
          console.log('✅ URL completa encontrada:', url);
          return url;
        } else {
          const fullUrl = `https://delicate-attraction-2c7f961647.strapiapp.com${url}`;
          console.log('🔧 URL construida:', fullUrl);
          return fullUrl;
        }
      },
      
      // ✅ MÉTODO añadido para debugging de errores de imagen
      onImageError(event, novedad) {
        console.error('❌ Error cargando imagen:', {
          src: event.target.src,
          novedad: novedad.titulo,
          archivo: novedad.archivo
        });
        // Cambiar a imagen por defecto
        event.target.src = '/images/default.jpg';
      },
      
      formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      },
    },
  };
  </script>
  
  <style scoped>
  .page-title-area {
    background-color: #f8f9fa;
    padding: 20px 0;
  }
  
  .page-title-area ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 10px;
  }
  
  .page-title-area ul li {
    font-size: 16px;
    color: #333;
  }
  
  .news-area {
    padding: 60px 0;
  }
  
  .single-blog-post {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 400px;
    display: flex;
    flex-direction: column;
  }
  
  .single-blog-post:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .blog-image {
    position: relative;
    overflow: hidden;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
  }
  
  .blog-image img,
  .blog-image video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .blog-image .documento {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e9ecef;
  }
  
  .blog-image .documento a {
    padding: 10px 20px;
    background-color: #e25315;
    color: #fff;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
  
  .blog-image .documento a:hover {
    background-color: #e94214;
  }
  
  .no-image {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    color: #666;
  }
  
  .no-image img {
    width: 60px;
    height: 60px;
    opacity: 0.5;
    margin-bottom: 10px;
  }
  
  .no-image small {
    font-size: 12px;
    color: #999;
  }
  
  .blog-post-content {
    padding: 20px;
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .blog-post-content .date {
    font-size: 14px;
    color: #666;
    display: block;
    margin-bottom: 10px;
  }
  
  .blog-post-content h3 {
    font-size: 20px;
    margin: 0 0 10px;
  }
  
  .blog-post-content h3 a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .blog-post-content h3 a:hover {
    color: #f1620f;
  }
  
  .blog-post-content p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  .read-more-btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #ea7a12;
    color: #fff;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    text-align: center;
  }
  
  .read-more-btn:hover {
    background-color: #ee5c07;
  }
  </style>