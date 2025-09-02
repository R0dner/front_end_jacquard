<template lang="pug">
section.offer-area.ptb-60
  .container
    .row(v-if="categorias && categorias.length")
      .col-lg-4.col-md-6(v-for="category in categorias" :key="category.id")
        .offer-box
          img(
            v-if="category.attributes.imagen && category.attributes.imagen.data"
            :src="getImageUrl(category.attributes.imagen.data.attributes.url)"
            height="400"
            :alt="category.attributes.nombre"
          )
          .category
            h4 {{ category.attributes.nombre }}
          .box-inner
            .inner-content
              h3 {{ category.attributes.descripcion }}
              ul(v-if="category.attributes.grupos_de_productos && category.attributes.grupos_de_productos.data")
                li(v-for="grupo in category.attributes.grupos_de_productos.data" :key="grupo.id")
                  router-link(:to="{ name: 'products', query: { grupo_producto: grupo.id } }")
                    | {{ grupo.attributes.nombre }}
    .row(v-else-if="loading")
      .col-12
        p.text-center Cargando categorías...
    .row(v-else-if="error")
      .col-12
        p.text-center.text-danger Error al cargar categorías: {{ error }}
    .row(v-else)
      .col-12
        p.text-center No hay categorías disponibles
</template>

<script>
import categoriasQuery from '@/apollo/queries/categorias/categorias.gql'

export default {
  name: "AreaOfertas",
  data() {
    return {
      api_url: process.env.strapiBaseUri,
      categorias: [],
      loading: false,
      error: null,
      useGraphQL: true
    }
  },
  apollo: {
    categoria: {
      prefetch: true,
      query: categoriasQuery,
      error(error) {
        console.error('AreaOfertas - Error en GraphQL:', error);
        this.useGraphQL = false;
        this.fetchCategoriasREST();
      },
      result({ data, loading }) {
        if (data && data.categoria && data.categoria.data) {
          this.categorias = data.categoria.data;
          console.log('AreaOfertas - Categorías cargadas via GraphQL:', this.categorias.length);
        }
      }
    }
  },
  methods: {
    async fetchCategoriasREST() {
      console.log('AreaOfertas - Usando REST API como fallback');
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`${this.api_url}/api/categoria?populate=*`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        this.categorias = result.data || [];
        console.log('AreaOfertas - Categorías cargadas via REST:', this.categorias.length);
      } catch (error) {
        console.error('AreaOfertas - Error al cargar categorías via REST:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    getImageUrl(url) {
      if (!url) return '';

      if (url.startsWith('http')) {
        console.log('AreaOfertas - Using complete URL:', url);
        return url;
      }

      const fullUrl = `${this.api_url}${url}`;
      console.log('AreaOfertas - Using relative URL, converted to:', fullUrl);
      return fullUrl;
    }
  },
  
  created() {

    if (!this.useGraphQL) {
      this.fetchCategoriasREST();
    }
  }
}
</script>