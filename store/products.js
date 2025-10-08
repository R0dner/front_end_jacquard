// store/products.js - REEMPLAZAR desde la línea 1

const state = () => ({
    cart: [],
    totalAmount: 0,
    totalQuantity: 0,
    orders: [],
    wishlist: { items: [] } // ✅ CAMBIO: Ahora es un objeto con items
});

export const totals = (paylodArr) => {
    const totalAmount = paylodArr.map(cartArr => {
        return cartArr.price * cartArr.quantity
    }).reduce((a, b) => a + b, 0);

    const totalQuantity = paylodArr.map(cartArr => {
        return cartArr.quantity;
    }).reduce((a, b) => a + b, 0);

    return {
        amount: totalAmount.toFixed(2),
        qty: totalQuantity
    }
};

const mutations = {
    'GET_ORDER'(state, payload){
        state.orders = payload
    },
    'GET_CART'(state, payload){
        state.cart = payload
        state.totalAmount = totals(payload).amount
        state.totalQuantity = totals(payload).qty
    },
    'ADD_TO_CART'(state, payload){
        const itemsToAdd = Array.isArray(payload) ? payload : [payload];
        
        itemsToAdd.forEach(newItem => {
            const existingIndex = state.cart.findIndex(item => 
                item.id === newItem.id && 
                item.size === newItem.size && 
                item.color === newItem.color
            );
            
            if (existingIndex >= 0) {
                state.cart[existingIndex].quantity += newItem.quantity;
            } else {
                state.cart.push(newItem);
            }
        });
        
        state.totalAmount = totals(state.cart).amount;
        state.totalQuantity = totals(state.cart).qty;
    },
    'DELETE_CART'(state, id){
        const currentCartToDelete = state.cart
        const indexToDelete = currentCartToDelete.findIndex(cart => {
            return cart.id == id
        })

        state.cart = [...currentCartToDelete.slice(0, indexToDelete), ...currentCartToDelete.slice(indexToDelete + 1)]
        state.totalAmount = totals(state.cart).amount
        state.totalQuantity = totals(state.cart).qty
    },
    'UPDATE_CART'(state, payload){
        state.cart = payload
        state.totalAmount = totals(payload).amount
        state.totalQuantity = totals(payload).qty
    }, 
    'CART_EMPTY'(state){
        state.cart = []
        state.totalAmount = 0
        state.totalQuantity = 0
    },
    
    // ✅ WISHLIST MUTATIONS CORREGIDAS
    'INIT_WISHLIST'(state) {
        console.log('🔄 [STORE] Inicializando wishlist');
        if (process.client) {
            const stored = localStorage.getItem('wishlist');
            if (stored) {
                try {
                    state.wishlist.items = JSON.parse(stored);
                    console.log('✅ [STORE] Wishlist cargada:', state.wishlist.items.length, 'items');
                } catch (e) {
                    console.error('❌ [STORE] Error parsing wishlist:', e);
                    state.wishlist.items = [];
                }
            } else {
                state.wishlist.items = [];
            }
        }
    },
    
    'ADD_TO_WISHLIST'(state, product) {
        console.log('➕ [STORE] ADD_TO_WISHLIST mutation');
        console.log('Producto a agregar:', product);
        
        const existingIndex = state.wishlist.items.findIndex(item => item.id === product.id);
        
        if (existingIndex === -1) {
            state.wishlist.items.push(product);
            if (process.client) {
                localStorage.setItem('wishlist', JSON.stringify(state.wishlist.items));
            }
            console.log('✅ [STORE] Agregado. Total:', state.wishlist.items.length);
        } else {
            console.log('⚠️ [STORE] Ya existe en wishlist');
        }
    },
    
    'REMOVE_FROM_WISHLIST'(state, productId) {
        console.log('➖ [STORE] REMOVE_FROM_WISHLIST mutation');
        console.log('ID a remover:', productId);
        
        const lengthBefore = state.wishlist.items.length;
        state.wishlist.items = state.wishlist.items.filter(item => item.id !== productId);
        
        if (process.client) {
            localStorage.setItem('wishlist', JSON.stringify(state.wishlist.items));
        }
        
        console.log('✅ [STORE] Removido. Antes:', lengthBefore, '| Después:', state.wishlist.items.length);
    },
    
    'CLEAR_WISHLIST'(state) {
        console.log('🗑️ [STORE] Limpiando wishlist');
        state.wishlist.items = [];
        if (process.client) {
            localStorage.setItem('wishlist', '[]');
        }
    }
};

const actions = {
    addToCart({ commit }, product){
        commit('ADD_TO_CART', product)
    },
    deleteCart({ commit }, id){
        commit('DELETE_CART', id)
    },
    updateCart({ commit }, payload){
        const currentCartToUpdate = payload.cart
        const indexToUpdate = currentCartToUpdate.findIndex(cart => {
            return cart.id == payload.id
        })

        const newCart = {
            ...currentCartToUpdate[indexToUpdate],
            quantity: currentCartToUpdate[indexToUpdate].quantity + payload.unit
        }

        const cartUpdate = [...currentCartToUpdate.slice(0, indexToUpdate), newCart, ...currentCartToUpdate.slice(indexToUpdate + 1)]
        commit('UPDATE_CART', cartUpdate)
    }, 
    cartEmpty({commit}){
        commit('CART_EMPTY')
    },
    
    // ✅ WISHLIST ACTIONS CORREGIDAS
    initWishlist({ commit }) {
        console.log('🚀 [STORE] initWishlist action');
        commit('INIT_WISHLIST');
    },
    
    addToWishlist({ commit }, product) {
        console.log('🚀 [STORE] addToWishlist action');
        commit('ADD_TO_WISHLIST', product);
    },
    
    removeFromWishlist({ commit }, productId) {
        console.log('🚀 [STORE] removeFromWishlist action');
        commit('REMOVE_FROM_WISHLIST', productId);
    },
    
    clearWishlist({ commit }) {
        console.log('🚀 [STORE] clearWishlist action');
        commit('CLEAR_WISHLIST');
    }
};

const getters = {
    cart(state){
        return state.cart
    },
    totalAmount(state){
        return state.totalAmount
    },
    totalQuantity(state){
        return state.totalQuantity
    },
    getOrders(state){
        return state.orders
    },
    
    // ✅ WISHLIST GETTERS CORREGIDOS
    wishlist: (state) => {
        console.log('🔍 [STORE GETTER] wishlist -', state.wishlist.items.length, 'items');
        return state.wishlist.items;
    },
    
    wishlistCount: (state) => {
        return state.wishlist.items.length;
    },
    
    isInWishlist: (state) => (productId) => {
        const exists = state.wishlist.items.some(item => item.id === productId);
        console.log(`🔍 [STORE GETTER] ¿Producto ${productId} en wishlist?`, exists);
        return exists;
    },
    
    wishlistIds: (state) => {
        const ids = state.wishlist.items.map(item => item.id);
        console.log('🔢 [STORE GETTER] wishlistIds:', ids);
        return ids;
    }
};

export default{
    state, 
    mutations, 
    actions, 
    getters
};