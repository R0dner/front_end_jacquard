// store/wishlist.js - CREAR ESTE ARCHIVO NUEVO

const state = {
  items: []
};

const mutations = {
  INIT_WISHLIST(state) {
    console.log('🔄 [WISHLIST] Inicializando desde localStorage');
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      try {
        state.items = JSON.parse(stored);
        console.log('✅ [WISHLIST] Cargados', state.items.length, 'items');
      } catch (e) {
        console.error('❌ [WISHLIST] Error parsing:', e);
        state.items = [];
      }
    } else {
      console.log('📝 [WISHLIST] No hay datos, iniciando vacío');
      state.items = [];
    }
  },
  
  ADD_TO_WISHLIST(state, product) {
    console.log('➕ [WISHLIST] Agregando producto ID:', product.id);
    console.log('📦 [WISHLIST] Producto completo:', product);
    
    const existingIndex = state.items.findIndex(item => item.id === product.id);
    
    if (existingIndex === -1) {
      state.items.push(product);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
      console.log('✅ [WISHLIST] Agregado! Total items:', state.items.length);
      console.log('💾 [WISHLIST] Guardado en localStorage');
    } else {
      console.log('⚠️ [WISHLIST] Producto ya existe');
    }
  },
  
  REMOVE_FROM_WISHLIST(state, productId) {
    console.log('➖ [WISHLIST] Removiendo producto ID:', productId);
    const lengthBefore = state.items.length;
    
    state.items = state.items.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(state.items));
    
    console.log('✅ [WISHLIST] Removido. Antes:', lengthBefore, '| Después:', state.items.length);
  },
  
  CLEAR_WISHLIST(state) {
    console.log('🗑️ [WISHLIST] Limpiando todo');
    state.items = [];
    localStorage.setItem('wishlist', '[]');
  }
};

const getters = {
  wishlist: state => {
    console.log('🔍 [WISHLIST GETTER] Retornando', state.items.length, 'items');
    return state.items;
  },
  
  wishlistCount: state => {
    return state.items.length;
  },
  
  isInWishlist: state => productId => {
    const exists = state.items.some(item => item.id === productId);
    console.log(`🔍 [WISHLIST] ¿Producto ${productId} en wishlist?`, exists);
    return exists;
  },
  
  wishlistIds: state => {
    const ids = state.items.map(item => item.id);
    console.log('🔢 [WISHLIST] IDs disponibles:', ids);
    return ids;
  }
};

const actions = {
  initWishlist({ commit }) {
    console.log('🚀 [WISHLIST ACTION] initWishlist');
    commit('INIT_WISHLIST');
  },
  
  addToWishlist({ commit }, product) {
    console.log('🚀 [WISHLIST ACTION] addToWishlist');
    commit('ADD_TO_WISHLIST', product);
  },
  
  removeFromWishlist({ commit }, productId) {
    console.log('🚀 [WISHLIST ACTION] removeFromWishlist');
    commit('REMOVE_FROM_WISHLIST', productId);
  },
  
  clearWishlist({ commit }) {
    console.log('🚀 [WISHLIST ACTION] clearWishlist');
    commit('CLEAR_WISHLIST');
  }
};

export default {
  namespaced: false, // Importante: acceso global sin namespace
  state,
  mutations,
  getters,
  actions
};