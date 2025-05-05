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
                    <!-- Mostrar imagen si es una imagen -->
                    <img
                      v-if="novedad.archivo?.tipo === 'imagen'"
                      :src="`http://localhost:1337${novedad.archivo.url}`"
                      :alt="novedad.titulo"
                    />
                    <!-- Mostrar video si es un video -->
                    <video
                      v-else-if="novedad.archivo?.tipo === 'video'"
                      controls
                      :src="`http://localhost:1337${novedad.archivo.url}`"
                      :alt="novedad.titulo"
                    ></video>
                    <!-- Mostrar enlace si es un documento -->
                    <div v-else-if="novedad.archivo?.tipo === 'documento'" class="documento">
                      <a :href="`http://localhost:1337${novedad.archivo.url}`" target="_blank" rel="noopener noreferrer">
                        Descargar documento
                      </a>
                    </div>
                    <!-- Mostrar imagen por defecto si no hay archivo -->
                    <img v-else src="/images/default.jpg" :alt="novedad.titulo" />
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
        console.log('Respuesta de la API:', response.data); // Depuración
  
        if (!response.data || !response.data.data) {
          throw new Error('No se encontraron datos');
        }
  
        return {
          novedades: response.data.data.map(item => {
            const archivo = item.attributes.imagen?.data?.[0]?.attributes;
            let tipo = 'imagen'; // Por defecto, asumimos que es una imagen
  
            if (archivo) {
              const extension = archivo.url.split('.').pop().toLowerCase();
              if (['mp4', 'webm', 'ogg'].includes(extension)) {
                tipo = 'video';
              } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
                tipo = 'documento';
              }
            }
  
            return {
              id: item.id,
              titulo: item.attributes.titulo,
              FechadePublicacion: item.attributes.FechadePublicacion,
              archivo: {
                url: archivo?.url || '',
                tipo: tipo,
              },
              DescripcionBreve: item.attributes.DescripcionBreve,
              Enlace: item.attributes.Enlace,
            };
          }),
        };
      } catch (error) {
        console.error('Error al obtener las novedades:', error.message);
        return {
          novedades: [],
        };
      }
    },
    methods: {
      formatDate(dateString) {
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
    height: 400px; /* Altura fija para todas las tarjetas */
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
    height: 200px; /* Altura fija para el contenedor de la imagen/video/documento */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa; /* Fondo gris claro para el contenedor */
  }
  
  .blog-image img,
  .blog-image video {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ajusta la imagen/video al contenedor sin distorsión */
  }
  
  .blog-image .documento {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e9ecef; /* Fondo gris para el contenedor de documentos */
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