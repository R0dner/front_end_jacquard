<template lang="pug">
    section.offer-area.ptb-60
      .container
        .row
          // Añadir v-if para verificar que los datos existen
          .col-lg-4.col-md-6(v-for="category in categoria.data" :key="category.id" v-if="categoria && categoria.data")
            .offer-box
              img(:src="api_url + category.attributes.imagen.data.attributes.url" height="400")
              .category
                h4 {{ category.attributes.nombre }}
              .box-inner
                .inner-content
                  h3 {{ category.attributes.descripcion }}
                  ul
                    li(v-for="grupo in category.attributes.grupos_de_productos.data" :key="grupo.id")
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
          query: categoriasQuery
        }
      }
    }
    </script>