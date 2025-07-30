<template>
    <div>
        <!-- Resto del código permanece igual -->
        
        <section class="blog-details-area ptb-60">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8 col-md-12">
                        <div class="blog-details">
                            <!-- Carrusel para imágenes destacadas -->
                            <div class="image-carousel" v-if="carruselItems.length > 0">
                                <div class="carousel-container">
                                    <div 
                                        v-for="(slide, index) in carruselItems" 
                                        :key="'slide-'+index"
                                        class="carousel-slide"
                                        :class="{ active: currentSlide === index }">
                                        <!-- Modificado para soportar videos -->
                                        <video 
                                            v-if="isVideo(slide.imagen)"
                                            :src="getStrapiMedia(slide.imagen)"
                                            controls
                                            class="carousel-video"
                                            @click="toggleVideoPlay($event)">
                                        </video>
                                        <img 
                                            v-else
                                            :src="getStrapiMedia(slide.imagen)"
                                            :alt="slide.titulo" />
                                        <div class="carousel-caption">
                                            <h3>{{ slide.titulo }}</h3>
                                        </div>
                                    </div>
                                </div>
                                <!-- Controles del carrusel -->
                                <div class="carousel-controls">
                                    <button class="carousel-prev" @click="prevSlide">&lt;</button>
                                    <div class="carousel-dots">
                                        <span 
                                            v-for="(dot, index) in carruselItems.length" 
                                            :key="'dot-'+index"
                                            class="dot"
                                            :class="{ active: currentSlide === index-1 }"
                                            @click="goToSlide(index-1)">
                                        </span>
                                    </div>
                                    <button class="carousel-next" @click="nextSlide">&gt;</button>
                                </div>
                            </div>

                            <div class="article-content">
                                <h2>{{ empresa.titulo_historia }}</h2>
                                <p>{{ empresa.descripcion_historia }}</p>
                                
                                <!-- Imágenes de la empresa con descripciones -->
                                <h3>Nuestra Empresa en Imágenes</h3>
                                <div class="company-gallery">
                                    <div 
                                        v-for="(item, index) in galeriaEmpresa" 
                                        :key="'gallery-'+index"
                                        class="company-gallery-item">
                                        <div class="gallery-image">
                                            <!-- Modificado para soportar videos -->
                                            <video 
                                                v-if="isVideo(item.imagen)"
                                                :src="getStrapiMedia(item.imagen)"
                                                controls
                                                class="gallery-video"
                                                @click="toggleVideoPlay($event)">
                                            </video>
                                            <img 
                                                v-else
                                                :src="getStrapiMedia(item.imagen)"
                                                :alt="item.titulo" />
                                        </div>
                                        <div class="gallery-caption">
                                            <h4>{{ item.titulo }}</h4>
                                            <p>{{ item.Descripcion }}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <h3>Nuestra Filosofía</h3>
                                <p>{{ empresa.filosofia }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-12">
                        <aside class="widget-area" id="secondary">
                            <!-- Posts con imágenes o videos -->
                            <section class="widget widget_recent_posts">
                                <h3 class="widget-title"><span>Publicaciones Recientes</span></h3>
                                
                                <div class="recent-posts-list">
                                    <div 
                                        v-for="(post, index) in publicacionesRecientes" 
                                        :key="'post-'+index"
                                        class="post-item">
                                        <div class="post-thumb">
                                            <!-- Modificado para soportar videos -->
                                            <div v-if="isVideo(post.imagen)" class="video-thumb" @click="playPostVideo($event, post)">
                                                <video 
                                                    :src="getStrapiMedia(post.imagen)" 
                                                    class="thumb-video"
                                                    preload="metadata">
                                                </video>
                                                <div class="play-icon">▶</div>
                                            </div>
                                            <img v-else :src="getStrapiMedia(post.imagen)" :alt="post.titulo" />
                                        </div>
                                        <div class="post-info">
                                            <h4><a :href="post.enlace">{{ post.titulo }}</a></h4>
                                            <span class="post-date">{{ formatDate(post.fecha) }}</span>
                                            <p>{{ post.resumen }}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="view-all-posts">
                                    <nuxt-link to="/blog-one" class="view-all-button">Ver Todas las Publicaciones</nuxt-link>
                                </div>
                            </section>

                            <section class="widget widget_process">
                                <h3 class="widget-title"><span>Proceso Artesanal</span></h3>
                                <div class="process-timeline">
                                    <div class="process-step">
                                        <div class="step-bubble">1</div>
                                        <div class="step-content">
                                            <h4>Diseño</h4>
                                            <p>Creación de patrones exclusivos</p>
                                        </div>
                                    </div>
                                    <div class="process-step">
                                        <div class="step-bubble">2</div>
                                        <div class="step-content">
                                            <h4>Corte</h4>
                                            <p>Precisión milimétrica</p>
                                        </div>
                                    </div>
                                    <div class="process-step">
                                        <div class="step-bubble">3</div>
                                        <div class="step-content">
                                            <h4>Confección</h4>
                                            <p>Hecho a mano con dedicación</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="widget widget_cta">
                                <div class="cta-card" style="background-color: #f9f5ff;">
                                    <h3>Prendas en Oferta</h3>
                                    <p>Descubre piezas en descuento </p>
                                    <nuxt-link to="/products" class="cta-button">Ver Ahora</nuxt-link>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
export default {
  data() {
    return {
      currentSlide: 0,
      empresa: {
        titulo_historia: "",
        descripcion_historia: "",
        filosofia: ""
      },
      carruselItems: [],
      galeriaEmpresa: [],
      publicacionesRecientes: [],
      autoplayInterval: null
    }
  },
  
  async fetch() {
    try {
      // Fetch información principal de la empresa
      const empresaResponse = await this.$axios.get('/api/empresas', {
        params: {
          populate: ['carruselItems', 'carruselItems.imagen']
        }
      });
      
      if (empresaResponse.data && empresaResponse.data.data.length > 0) {
        const empresaData = empresaResponse.data.data[0].attributes;
        this.empresa = {
          titulo_historia: empresaData.titulo_historia || "Nuestra Historia",
          descripcion_historia: empresaData.descripcion_historia || "",
          filosofia: empresaData.filosofia || ""
        };
        
        // Procesar elementos del carrusel si existen
        if (empresaData.carruselItems && empresaData.carruselItems.data) {
          this.carruselItems = empresaData.carruselItems.data
            .map(item => {
              return {
                titulo: item.attributes.titulo,
                descripcion: item.attributes.descripcion,
                imagen: item.attributes.imagen.data,
                orden: item.attributes.orden
              };
            })
            .sort((a, b) => a.orden - b.orden);
        }
      }
      
      // Fetch imágenes de la galería
      const galeriaResponse = await this.$axios.get('/api/galeria-empresas', {
        params: {
          populate: ['imagen'],
          sort: 'orden'
        }
      });
      
      if (galeriaResponse.data && galeriaResponse.data.data) {
        this.galeriaEmpresa = galeriaResponse.data.data.map(item => ({
          titulo: item.attributes.titulo,
          Descripcion: item.attributes.Descripcion,
          imagen: item.attributes.imagen.data,
          orden: item.attributes.orden
        }));
      }
      
      // Fetch publicaciones recientes
      const publicacionesResponse = await this.$axios.get('/api/publicaciones-recientes', {
        params: {
          populate: ['imagen'],
          sort: 'fecha:desc',
          pagination: {
            limit: 3
          }
        }
      });
      
      if (publicacionesResponse.data && publicacionesResponse.data.data) {
        this.publicacionesRecientes = publicacionesResponse.data.data.map(item => ({
          titulo: item.attributes.titulo,
          fecha: item.attributes.fecha,
          resumen: item.attributes.resumen,
          imagen: item.attributes.imagen.data,
          enlace: item.attributes.enlace
        }));
      }
      
      console.log('Carrusel Items:', this.carruselItems);
      console.log('Galería:', this.galeriaEmpresa);
      console.log('Publicaciones:', this.publicacionesRecientes);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },
  
  methods: {
    // ✅ MÉTODO CORREGIDO para obtener la URL completa de la imagen o video
    getStrapiMedia(media) {
      // Valor por defecto si no hay media
      if (!media) return '/images/default.jpg';
      
      // Si es un array, tomamos el primer elemento
      if (Array.isArray(media)) {
        if (media.length === 0) return '/images/default.jpg';
        media = media[0];
      }
      
      try {
        // Extraer la URL dependiendo de la estructura de los datos
        let url = null;
        
        if (media.attributes && media.attributes.url) {
          url = media.attributes.url;
        } else if (media.data && media.data.attributes && media.data.attributes.url) {
          url = media.data.attributes.url;
        } else if (media.url) {
          url = media.url;
        }
        
        // Si tenemos una URL válida
        if (url) {
          // ✅ CORRECCIÓN: Verificar si la URL ya es completa
          if (url.startsWith('http://') || url.startsWith('https://')) {
            // La URL ya es completa, la devolvemos tal como está
            return url;
          } else {
            // La URL es relativa, le agregamos el dominio base
            return `https://delicate-attraction-2c7f961647.strapiapp.com${url}`;
          }
        }
      } catch (e) {
        console.error("Error procesando URL de media:", e, media);
      }
      
      return '/images/default.jpg';
    },
    
    // Método mejorado para verificar si es un video
    isVideo(media) {
      if (!media) return false;
      
      // Si es un array, tomamos el primer elemento
      if (Array.isArray(media)) {
        if (media.length === 0) return false;
        media = media[0];
      }
      
      try {
        // Intentamos extraer el mime type según las diferentes estructuras posibles
        let mime = null;
        
        if (media.attributes && media.attributes.mime) {
          mime = media.attributes.mime;
        } else if (media.data && media.data.attributes && media.data.attributes.mime) {
          mime = media.data.attributes.mime;
        } else if (media.mime) {
          mime = media.mime;
        }
        
        // Comprobamos si es video o gif animado
        if (mime) {
          return mime.startsWith('video/') || mime === 'image/gif';
        }
      } catch (e) {
        console.error("Error verificando tipo de media:", e, media);
      }
      
      return false;
    },
    
    // Control del carrusel
    nextSlide() {
      if (this.carruselItems.length === 0) return;
      
      // Pausa el video actual si existe
      this.pauseCurrentVideo();
      
      this.currentSlide = (this.currentSlide + 1) % this.carruselItems.length;
    },
    
    prevSlide() {
      if (this.carruselItems.length === 0) return;
      
      // Pausa el video actual si existe
      this.pauseCurrentVideo();
      
      this.currentSlide = (this.currentSlide - 1 + this.carruselItems.length) % this.carruselItems.length;
    },
    
    goToSlide(index) {
      if (index >= 0 && index < this.carruselItems.length) {
        // Pausa el video actual si existe
        this.pauseCurrentVideo();
        
        this.currentSlide = index;
      }
    },
    
    // Pausa el video en el slide actual
    pauseCurrentVideo() {
      const currentSlideEl = document.querySelector('.carousel-slide.active video');
      if (currentSlideEl) {
        currentSlideEl.pause();
      }
    },
    
    // Alterna reproducir/pausar video al hacer clic
    toggleVideoPlay(event) {
      const video = event.target;
      if (video.paused) {
        // Pausar autoplay del carrusel mientras se reproduce el video
        this.pauseAutoplay();
        video.play();
      } else {
        video.pause();
        // Reanudar autoplay del carrusel
        this.startAutoplay();
      }
    },
    
    // Pausar la reproducción automática del carrusel
    pauseAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    },
    
    // Iniciar la reproducción automática del carrusel
    startAutoplay() {
      if (!this.autoplayInterval && this.carruselItems.length > 0) {
        this.autoplayInterval = setInterval(this.nextSlide, 5000);
      }
    },
    
    // Reproducir video de publicación reciente
    playPostVideo(event, post) {
      const videoEl = event.currentTarget.querySelector('video');
      if (videoEl) {
        if (videoEl.paused) {
          videoEl.play();
          event.currentTarget.querySelector('.play-icon').style.display = 'none';
        } else {
          videoEl.pause();
          event.currentTarget.querySelector('.play-icon').style.display = 'flex';
        }
      }
    },
    
    // Formatear fecha para mostrarla en formato legible
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
    }
  },
  
  mounted() {
    // Iniciar el carrusel automático solo si hay elementos
    if (this.carruselItems.length > 0) {
      this.autoplayInterval = setInterval(this.nextSlide, 5000);
    }
  },
  
  beforeDestroy() {
    // Limpiar el intervalo al destruir el componente
    this.pauseAutoplay();
  }
}
</script>

<style scoped>
/* Estilos generales */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px;
}

.col-lg-8 { width: 66.666%; padding: 0 15px; }
.col-lg-4 { width: 33.333%; padding: 0 15px; }
.col-md-12 { width: 100%; }

/* Carrusel de imágenes destacadas */
.image-carousel {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 30px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.carousel-container {
    position: relative;
    height: 400px;
}

.carousel-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease;
}

.carousel-slide.active {
    opacity: 1;
}

.carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.carousel-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumb-video {
    width: 100%;
    height: 90px;
    object-fit: cover;
}

.carousel-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0));
    padding: 20px;
    color: white;
    text-align: center;
}

.carousel-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    position: absolute;
    bottom: 15px;
    width: 100%;
    z-index: 10;
}

.carousel-prev, .carousel-next {
    background: rgba(255,255,255,0.7);
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.carousel-prev:hover, .carousel-next:hover {
    background: rgba(255,255,255,0.9);
}

.carousel-dots {
    display: flex;
    justify-content: center;
}

.dot {
    width: 10px;
    height: 10px;
    background: rgba(255,255,255,0.5);
    border-radius: 50%;
    margin: 0 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot.active {
    background: white;
}

/* Galería de la empresa */
.company-gallery {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin: 30px 0;
}

.company-gallery-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.company-gallery-item:hover {
    transform: translateY(-5px);
}

.gallery-image {
    height: 200px;
    overflow: hidden;
}

.gallery-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.company-gallery-item:hover .gallery-image img {
    transform: scale(1.05);
}

.gallery-caption {
    padding: 15px;
    background: white;
}

.gallery-caption h4 {
    margin: 0 0 5px;
    color: #333;
    font-size: 1.1rem;
}

.gallery-caption p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

/* Posts recientes */
.recent-posts-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.post-item {
    display: flex;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s ease;
}

.post-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.post-thumb {
    flex: 0 0 120px;
    position: relative;
}

.post-thumb img {
    width: 100%;
    height: 90px;
    object-fit: cover;
}

.video-thumb {
    position: relative;
    cursor: pointer;
}

.play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    background: rgba(255,255,255,0.8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-size: 12px;
}

.post-info {
    padding: 10px 15px;
    flex-grow: 1;
}

.post-info h4 {
    margin: 0 0 5px;
    font-size: 1rem;
}

.post-info h4 a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;
}

.post-info h4 a:hover {
    color: #ff9900;
}

.post-date {
    display: block;
    font-size: 0.8rem;
    color: #999;
    margin-bottom: 5px;
}

.post-info p {
    margin: 5px 0 0;
    font-size: 0.85rem;
    color: #666;
    line-height: 1.4;
}

.view-all-posts {
    text-align: center;
    margin-top: 20px;
}

.view-all-button {
    display: inline-block;
    background: linear-gradient(to right, #e2b12b, #ed770f);
    color: white;
    padding: 8px 20px;
    border-radius: 50px;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: bold;
    transition: all 0.3s ease;
}

.view-all-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Proceso timeline */
.process-timeline {
    position: relative;
    padding-left: 30px;
}

.process-timeline::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #d9d614, #f07c10);
}

.process-step {
    position: relative;
    padding-bottom: 25px;
}

.step-bubble {
    position: absolute;
    left: -30px;
    top: 0;
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #e2c02b, #ef7605);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.step-content {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

.step-content h4 {
    margin: 0 0 5px;
    color: #333;
}

.step-content p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

/* CTA Card */
.cta-card {
    padding: 25px;
    border-radius: 10px;
    text-align: center;
    margin-top: 30px;
}

.cta-card h3 {
    margin-top: 0;
    color: #333;
}

.cta-card p {
    color: #666;
    margin-bottom: 20px;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(to right, #e2b12b, #ed770f);
    color: white;
    padding: 10px 25px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s ease;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(138, 43, 226, 0.3);
}

/* Títulos decorados */
.widget-title {
    position: relative;
    padding-bottom: 15px;
    margin-bottom: 25px;
}

.widget-title span {
    position: relative;
    display: inline-block;
}

.widget-title span::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(to right, #ceb810, #ff9900);
    border-radius: 3px;
}

@media (max-width: 991px) {
    .col-lg-8, .col-lg-4 {
        width: 100%;
    }
    
    .company-gallery {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 767px) {
    .company-gallery {
        grid-template-columns: 1fr;
    }
    
    .carousel-container {
        height: 300px;
    }
}

@media (max-width: 575px) {
    .post-item {
        flex-direction: column;
    }
    
    .post-thumb {
        flex: 0 0 auto;
    }
    
    .post-thumb img {
        width: 100%;
        height: 150px;
    }
}
</style>