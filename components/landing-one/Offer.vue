<template lang="pug">
section.offer-area.ptb-60
  .container
    // Debug info
    .debug-info(style="background: white; padding: 20px; margin: 20px 0;")
      p Debug Info:
      p Categoria exists: {{ !!categoria }}
      p Categoria data: {{ categoria?.data?.length || 0 }} items
      pre {{ JSON.stringify(categoria, null, 2) }}
    
    // Tu código original
    .row(v-if="categoria && categoria.data && categoria.data.length > 0")
      .col-lg-4.col-md-6(v-for="category in categoria.data" :key="category.id")
        .offer-box
          img(
            v-if="category.attributes.imagen && category.attributes.imagen.data"
            :src="api_url + category.attributes.imagen.data.attributes.url"
            height="400"
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
</template>

<script>
import categoriasQuery from '@/apollo/queries/categorias/categorias.gql'

export default {
  name: "AreaOfertas",
  data() {
    return {
      api_url: process.env.strapiBaseUri
    }
  },
  apollo: {
    categoria: {
      prefetch: true,
      query: categoriasQuery,
      error(error) {
        console.error('Apollo error:', error);
      }
    }
  },
  mounted() {
    console.log('Component mounted');
    console.log('API URL:', this.api_url);
    console.log('Categoria data:', this.categoria);
  },
  watch: {
    categoria: {
      handler(newVal) {
        console.log('Categoria changed:', newVal);
      },
      deep: true
    }
  }
}
</script>