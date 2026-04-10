<template lang="pug">
div
  .page-title-area
    .container
      ul
        li
          nuxt-link(to='/') Inicio
        li Reportes

  section.reportes-area.ptb-60
    .container
      .section-title
        h2
          span.dot
          |  Reportes de Movimientos

      .reporte-filters
        .filters-grid
          .filter-group
            label Usuario
            select.form-control(v-model="filtros.usuario_id" @change="cargarDatos")
              option(value="") Todos los usuarios
              option(v-for="u in usuarios" :key="u.id" :value="u.id") {{ u.firstname }} {{ u.lastname }}

          .filter-group
            label Tipo de movimiento
            select.form-control(v-model="filtros.tipo" @change="cargarDatos")
              option(value="") Ingresos y Salidas
              option(value="ingresos") Solo Ingresos
              option(value="salidas") Solo Salidas

          .filter-group
            label Fecha desde
            input.form-control(type="date" v-model="filtros.fecha_desde" @change="cargarDatos")

          .filter-group
            label Fecha hasta
            input.form-control(type="date" v-model="filtros.fecha_hasta" @change="cargarDatos")

          .filter-group
            label Estado
            select.form-control(v-model="filtros.estado" @change="cargarDatos")
              option(value="") Todos los estados
              option(value="Aprobado") Aprobado
              option(value="Pendiente") Pendiente
              option(value="Rechazado") Rechazado
              option(value="Completada") Completada
              option(value="Borrador") Borrador

        .filters-actions
          button.btn.btn-outline(@click="limpiarFiltros") Limpiar filtros
          button.btn.btn-primary(@click="exportarPDF" :disabled="cargando || movimientos.length === 0")
            span(v-if="!cargando") 
              | ⬇ Exportar PDF
            span(v-else) Cargando...

      .reporte-resumen(v-if="movimientos.length > 0")
        .resumen-card
          .resumen-label Total movimientos
          .resumen-valor {{ movimientos.length }}
        .resumen-card
          .resumen-label Ingresos
          .resumen-valor.verde {{ totalIngresos }}
        .resumen-card
          .resumen-label Salidas
          .resumen-valor.rojo {{ totalSalidas }}
        .resumen-card
          .resumen-label Costo total ingresos
          .resumen-valor Bs. {{ costoTotalIngresos.toFixed(2) }}

      .reporte-table-wrapper(v-if="!cargando && movimientos.length > 0")
        table.reporte-table#tabla-reporte
          thead
            tr
              th #
              th Tipo
              th Fecha
              th Movimiento
              th Usuario
              th Estado
              th Items
              th Costo / Doc.
          tbody
            tr(v-for="(mov, i) in movimientos" :key="mov.id + mov.tipo")
              td {{ i + 1 }}
              td
                span.badge(:class="mov.tipo === 'Ingreso' ? 'badge-ingreso' : 'badge-salida'") {{ mov.tipo }}
              td {{ formatFecha(mov.fecha) }}
              td {{ mov.descripcion }}
              td {{ mov.usuario }}
              td
                span.estado(:class="estadoClase(mov.estado)") {{ mov.estado }}
              td {{ mov.total_items || '-' }}
              td {{ mov.tipo === 'Ingreso' ? (mov.total_costo ? 'Bs. ' + Number(mov.total_costo).toFixed(2) : '-') : (mov.numero_documento || '-') }}

      .empty-state(v-if="!cargando && movimientos.length === 0")
        p No se encontraron movimientos con los filtros seleccionados.

      .loading-state(v-if="cargando")
        p Cargando datos...
</template>

<script>
// jsPDF se carga desde CDN para compatibilidad con Nuxt 2 / Webpack

export default {
  name: 'ReportesPage',
  middleware: ['admin'],

  data() {
    return {
      cargando: false,
      usuarios: [],
      movimientos: [],
      filtros: {
        usuario_id: '',
        tipo: '',
        fecha_desde: '',
        fecha_hasta: '',
        estado: ''
      }
    }
  },

  computed: {
    totalIngresos() {
      return this.movimientos.filter(m => m.tipo === 'Ingreso').length
    },
    totalSalidas() {
      return this.movimientos.filter(m => m.tipo === 'Salida').length
    },
    costoTotalIngresos() {
      return this.movimientos
        .filter(m => m.tipo === 'Ingreso' && m.total_costo)
        .reduce((acc, m) => acc + Number(m.total_costo), 0)
    }
  },

  async mounted() {
    await this.cargarUsuarios()
    await this.cargarDatos()
  },

  methods: {
    getToken() {
      try {
        if (this.$store?.state?.auth?.token) return this.$store.state.auth.token
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        return user.jwt || localStorage.getItem('jwt') || ''
      } catch {
        return ''
      }
    },

    getHeaders() {
      const token = this.getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },

    async cargarUsuarios() {
      try {
        const { data } = await this.$axios({
          baseURL: process.env.strapiBaseUri,
          url: '/api/users?populate=role',
          method: 'get',
          headers: this.getHeaders()
        })
        this.usuarios = data.filter(u => {
          const rol = u.role?.name || ''
          return ['administrador', 'Super Admin', 'preventista'].includes(rol)
        })
      } catch (e) {
        console.error('Error cargando usuarios:', e)
      }
    },

    async cargarDatos() {
      this.cargando = true
      this.movimientos = []

      try {
        const ingresos = this.filtros.tipo !== 'salidas' ? await this.fetchIngresos() : []
        const salidas = this.filtros.tipo !== 'ingresos' ? await this.fetchSalidas() : []
        const todos = [...ingresos, ...salidas]
        todos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        this.movimientos = todos
      } catch (e) {
        console.error('Error cargando datos:', e)
      } finally {
        this.cargando = false
      }
    },

    buildFiltrosIngreso() {
      const params = new URLSearchParams()
      params.append('populate[ingresado_por]', 'true')
      params.append('populate[aprobado_por]', 'true')
      params.append('populate[Productos]', 'true')

      if (this.filtros.usuario_id) {
        params.append('filters[ingresado_por][id][$eq]', this.filtros.usuario_id)
      }
      if (this.filtros.fecha_desde) {
        params.append('filters[fecha_ingreso][$gte]', this.filtros.fecha_desde)
      }
      if (this.filtros.fecha_hasta) {
        params.append('filters[fecha_ingreso][$lte]', this.filtros.fecha_hasta)
      }
      if (this.filtros.estado) {
        params.append('filters[estado][$eq]', this.filtros.estado)
      }
      params.append('pagination[pageSize]', '200')
      return params.toString()
    },

    buildFiltrosSalida() {
      const params = new URLSearchParams()
      params.append('populate[solicitado_por]', 'true')
      params.append('populate[aprobado_por]', 'true')
      params.append('populate[Productos]', 'true')

      if (this.filtros.usuario_id) {
        params.append('filters[solicitado_por][id][$eq]', this.filtros.usuario_id)
      }
      if (this.filtros.fecha_desde) {
        params.append('filters[fecha_salida][$gte]', this.filtros.fecha_desde)
      }
      if (this.filtros.fecha_hasta) {
        params.append('filters[fecha_salida][$lte]', this.filtros.fecha_hasta)
      }
      if (this.filtros.estado) {
        params.append('filters[estado][$eq]', this.filtros.estado)
      }
      params.append('pagination[pageSize]', '200')
      return params.toString()
    },

    async fetchIngresos() {
      const qs = this.buildFiltrosIngreso()
      const { data } = await this.$axios({
        baseURL: process.env.strapiBaseUri,
        url: `/api/ingresos?${qs}`,
        method: 'get',
        headers: this.getHeaders()
      })
      const items = data.data || []
      return items.map(item => {
        const a = item.attributes || item
        const usuario = a.ingresado_por?.data?.attributes || a.ingresado_por || {}
        return {
          id: item.id,
          tipo: 'Ingreso',
          fecha: a.fecha_ingreso,
          descripcion: a.tipo_ingreso || '-',
          usuario: usuario.firstname ? `${usuario.firstname} ${usuario.lastname}` : (usuario.username || '-'),
          estado: a.estado || '-',
          total_items: a.total_items,
          total_costo: a.total_costo,
          numero_documento: a.numero_factura
        }
      })
    },

    async fetchSalidas() {
      const qs = this.buildFiltrosSalida()
      const { data } = await this.$axios({
        baseURL: process.env.strapiBaseUri,
        url: `/api/salidas?${qs}`,
        method: 'get',
        headers: this.getHeaders()
      })
      const items = data.data || []
      return items.map(item => {
        const a = item.attributes || item
        const usuario = a.solicitado_por?.data?.attributes || a.solicitado_por || {}
        return {
          id: item.id,
          tipo: 'Salida',
          fecha: a.fecha_salida,
          descripcion: a.tipo_solicitud || '-',
          usuario: usuario.firstname ? `${usuario.firstname} ${usuario.lastname}` : (usuario.username || '-'),
          estado: a.estado || '-',
          total_items: a.total_items,
          total_costo: null,
          numero_documento: a.numero_documento
        }
      })
    },

    formatFecha(fecha) {
      if (!fecha) return '-'
      const d = new Date(fecha)
      return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    estadoClase(estado) {
      const map = {
        'Aprobado': 'estado-aprobado',
        'Aprobada': 'estado-aprobado',
        'Completada': 'estado-aprobado',
        'Pendiente': 'estado-pendiente',
        'Borrador': 'estado-borrador',
        'Rechazado': 'estado-rechazado',
        'Rechazada': 'estado-rechazado',
        'Creado': 'estado-pendiente'
      }
      return map[estado] || ''
    },

    limpiarFiltros() {
      this.filtros = { usuario_id: '', tipo: '', fecha_desde: '', fecha_hasta: '', estado: '' }
      this.cargarDatos()
    },

    cargarScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = src
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    },

    async exportarPDF() {
      try {
        // Cargar jsPDF y autotable desde CDN (compatible con Nuxt 2 / Webpack)
        await this.cargarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
        await this.cargarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')

        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'landscape' })

        // Cabecera
        doc.setFontSize(18)
        doc.setTextColor(40, 40, 40)
        doc.text('JACQUARD TEX', 14, 18)

        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text('Reporte de Movimientos de Inventario', 14, 26)

        // Info de filtros
        const hoy = new Date().toLocaleDateString('es-BO')
        const usuarioFiltro = this.filtros.usuario_id
          ? this.usuarios.find(u => u.id == this.filtros.usuario_id)
          : null
        const nombreUsuario = usuarioFiltro
          ? `${usuarioFiltro.firstname} ${usuarioFiltro.lastname}`
          : 'Todos'

        doc.setFontSize(9)
        doc.setTextColor(120)
        doc.text(`Generado: ${hoy}`, 14, 33)
        doc.text(`Usuario: ${nombreUsuario}`, 80, 33)
        doc.text(`Tipo: ${this.filtros.tipo || 'Ingresos y Salidas'}`, 160, 33)
        if (this.filtros.fecha_desde || this.filtros.fecha_hasta) {
          doc.text(`Período: ${this.filtros.fecha_desde || '---'} al ${this.filtros.fecha_hasta || '---'}`, 14, 39)
        }

        // Línea separadora
        doc.setDrawColor(200)
        doc.line(14, 42, 283, 42)

        // Resumen
        doc.setFontSize(9)
        doc.setTextColor(60)
        doc.text(`Total: ${this.movimientos.length}  |  Ingresos: ${this.totalIngresos}  |  Salidas: ${this.totalSalidas}  |  Costo total: Bs. ${this.costoTotalIngresos.toFixed(2)}`, 14, 48)

        // Tabla
        const filas = this.movimientos.map((mov, i) => [
          i + 1,
          mov.tipo,
          this.formatFecha(mov.fecha),
          mov.descripcion,
          mov.usuario,
          mov.estado,
          mov.total_items || '-',
          mov.tipo === 'Ingreso'
            ? (mov.total_costo ? `Bs. ${Number(mov.total_costo).toFixed(2)}` : '-')
            : (mov.numero_documento || '-')
        ])

        doc.autoTable({
          startY: 52,
          head: [['#', 'Tipo', 'Fecha', 'Movimiento', 'Usuario', 'Estado', 'Items', 'Costo / Doc.']],
          body: filas,
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        })

        // Pie de página
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 8)
          doc.text('Jacquard Tex — Reporte confidencial', 200, doc.internal.pageSize.height - 8)
        }

        const nombreArchivo = `reporte_${usuarioFiltro ? nombreUsuario.replace(/ /g, '_') : 'todos'}_${hoy.replace(/\//g, '-')}.pdf`
        doc.save(nombreArchivo)

      } catch (e) {
        console.error('Error generando PDF:', e)
        alert('Hubo un error al generar el PDF. Intenta de nuevo.')
      }
    }
  }
}
</script>

<style scoped>
.ptb-60 { padding: 60px 0; }

.reporte-filters {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filters-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ccc;
  color: #555;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-outline:hover { background: #f5f5f5; }

.reporte-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.resumen-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px 20px;
}

.resumen-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  margin-bottom: 6px;
}

.resumen-valor {
  font-size: 24px;
  font-weight: 700;
  color: #222;
}
.resumen-valor.verde { color: #2e7d32; }
.resumen-valor.rojo { color: #c62828; }

.reporte-table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.reporte-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.reporte-table thead tr {
  background: #1e1e1e;
  color: #fff;
}

.reporte-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reporte-table td {
  padding: 11px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.reporte-table tbody tr:hover { background: #fafafa; }
.reporte-table tbody tr:last-child td { border-bottom: none; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.badge-ingreso { background: #e8f5e9; color: #2e7d32; }
.badge-salida  { background: #fce4ec; color: #c62828; }

.estado { font-size: 12px; font-weight: 600; }
.estado-aprobado  { color: #2e7d32; }
.estado-pendiente { color: #e65100; }
.estado-borrador  { color: #757575; }
.estado-rechazado { color: #c62828; }

.empty-state, .loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  font-size: 15px;
}
</style>