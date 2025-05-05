const state = () => ({
    cart: [],
    totalAmount: 0,
    totalQuantity: 0,
    orders: [],
    wishlist: [] // Nuevo estado para la lista de deseos
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
    // Nuevas mutaciones para wishlist
    'ADD_TO_WISHLIST'(state, productId) {
        if (!state.wishlist.includes(productId)) {
            state.wishlist.push(productId)
            if (process.client) {
                localStorage.setItem('wishlist', JSON.stringify(state.wishlist))
            }
        }
    },
    'REMOVE_FROM_WISHLIST'(state, productId) {
        state.wishlist = state.wishlist.filter(id => id !== productId)
        if (process.client) {
            localStorage.setItem('wishlist', JSON.stringify(state.wishlist))
        }
    },
    'TOGGLE_WISHLIST'(state, productId) {
        const index = state.wishlist.indexOf(productId)
        if (index === -1) {
            state.wishlist.push(productId)
        } else {
            state.wishlist.splice(index, 1)
        }
        if (process.client) {
            localStorage.setItem('wishlist', JSON.stringify(state.wishlist))
        }
    },
    'SET_WISHLIST'(state, items) {
        state.wishlist = items
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
    // Nuevas acciones para wishlist
    toggleWishlist({ commit }, productId) {
        commit('TOGGLE_WISHLIST', productId)
    },
    nuxtClientInit({ commit }) {
        if (process.client) {
            const wishlist = localStorage.getItem('wishlist')
            if (wishlist) {
                commit('SET_WISHLIST', JSON.parse(wishlist))
            }
        }
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
    // Nuevos getters para wishlist
    isInWishlist: (state) => (productId) => {
        return state.wishlist.includes(productId)
    },
    wishlistItems: (state) => {
        return state.wishlist
    },
    wishlistCount: (state) => {
        return state.wishlist.length
    }
};

export default{
    state, 
    mutations, 
    actions, 
    getters
};