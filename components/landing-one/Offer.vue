<template lang="pug">
section.offer-area.ptb-60
  .container
    .row(v-if="categoria && categoria.data && categoria.data.length")
      .col-lg-4.col-md-6(v-for="category in categoria.data" :key="category.id")
        .offer-box
          img(
            v-if="category.attributes.imagen && category.attributes.imagen.data"
            :src="api_url + category.attributes.imagen.data.attributes.url" 
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
    .row(v-else)
      .col-12
        p.text-center Cargando categorías...
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
      query: categoriasQuery
    }
  }
}
</script>