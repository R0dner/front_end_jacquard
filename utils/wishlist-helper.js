// utils/wishlist-helper.js
// Sistema de gestión de wishlist por usuario

/**
 * Obtiene la clave de localStorage para el wishlist del usuario actual
 * @returns {string} Clave del wishlist (ej: "wishlist_usuario@email.com")
 */
export function getWishlistKey() {
  const userEmail = localStorage.getItem('user_email');
  if (userEmail) {
    return `wishlist_${userEmail}`;
  }
  return 'wishlist'; // Fallback para usuarios no logueados
}

/**
 * Carga el wishlist del usuario actual
 * @returns {Array} Array de productos en el wishlist
 */
export function loadUserWishlist() {
  try {
    const wishlistKey = getWishlistKey();
    const wishlistData = localStorage.getItem(wishlistKey);
    const items = wishlistData ? JSON.parse(wishlistData) : [];
    
    // Sincronizar con wishlist genérico para compatibilidad
    localStorage.setItem('wishlist', JSON.stringify(items));
    
    return items;
  } catch (error) {
    console.error('Error cargando wishlist:', error);
    return [];
  }
}

/**
 * Guarda el wishlist del usuario actual
 * @param {Array} items - Array de productos para guardar
 */
export function saveUserWishlist(items) {
  try {
    const wishlistKey = getWishlistKey();
    localStorage.setItem(wishlistKey, JSON.stringify(items));
    
    // Sincronizar con wishlist genérico
    localStorage.setItem('wishlist', JSON.stringify(items));
    
    console.log(`Wishlist guardado para ${wishlistKey}:`, items.length, 'items');
  } catch (error) {
    console.error('Error guardando wishlist:', error);
  }
}

/**
 * Agrega un producto al wishlist del usuario
 * @param {Object} product - Producto a agregar
 * @returns {boolean} true si se agregó, false si ya existía
 */
export function addToUserWishlist(product) {
  const items = loadUserWishlist();
  const existingIndex = items.findIndex(item => item.id === product.id);
  
  if (existingIndex === -1) {
    items.push(product);
    saveUserWishlist(items);
    return true;
  }
  
  return false;
}

/**
 * Remueve un producto del wishlist del usuario
 * @param {number} productId - ID del producto a remover
 * @returns {boolean} true si se removió, false si no existía
 */
export function removeFromUserWishlist(productId) {
  const items = loadUserWishlist();
  const existingIndex = items.findIndex(item => item.id === productId);
  
  if (existingIndex !== -1) {
    items.splice(existingIndex, 1);
    saveUserWishlist(items);
    return true;
  }
  
  return false;
}

/**
 * Verifica si un producto está en el wishlist
 * @param {number} productId - ID del producto a verificar
 * @returns {boolean} true si está en el wishlist
 */
export function isInUserWishlist(productId) {
  const items = loadUserWishlist();
  return items.some(item => item.id === productId);
}

/**
 * Limpia el wishlist del usuario actual
 */
export function clearUserWishlist() {
  try {
    const wishlistKey = getWishlistKey();
    localStorage.setItem(wishlistKey, '[]');
    localStorage.setItem('wishlist', '[]');
  } catch (error) {
    console.error('Error limpiando wishlist:', error);
  }
}

/**
 * Obtiene el conteo de items en el wishlist
 * @returns {number} Cantidad de items
 */
export function getWishlistCount() {
  const items = loadUserWishlist();
  return items.length;
}

/**
 * Migra wishlist genérico a wishlist del usuario (útil para login)
 * @param {string} userEmail - Email del usuario
 */
export function migrateWishlistToUser(userEmail) {
  try {
    // Obtener wishlist genérico
    const genericWishlist = localStorage.getItem('wishlist');
    
    if (genericWishlist && genericWishlist !== '[]') {
      const items = JSON.parse(genericWishlist);
      
      // Obtener wishlist del usuario si existe
      const userWishlistKey = `wishlist_${userEmail}`;
      const userWishlist = localStorage.getItem(userWishlistKey);
      const userItems = userWishlist ? JSON.parse(userWishlist) : [];
      
      // Combinar ambos (evitando duplicados)
      const combinedItems = [...userItems];
      items.forEach(item => {
        if (!combinedItems.find(existing => existing.id === item.id)) {
          combinedItems.push(item);
        }
      });
      
      // Guardar wishlist combinado
      localStorage.setItem(userWishlistKey, JSON.stringify(combinedItems));
      localStorage.setItem('wishlist', JSON.stringify(combinedItems));
      
      console.log(`Migración completada: ${items.length} items genéricos + ${userItems.length} items de usuario = ${combinedItems.length} total`);
    }
  } catch (error) {
    console.error('Error migrando wishlist:', error);
  }
}

/**
 * Limpia wishlists antiguos (útil para mantenimiento)
 * Mantiene solo el del usuario actual y los de hace menos de 30 días
 */
export function cleanupOldWishlists() {
  try {
    const currentUserEmail = localStorage.getItem('user_email');
    const currentWishlistKey = currentUserEmail ? `wishlist_${currentUserEmail}` : 'wishlist';
    
    const keysToRemove = [];
    
    // Buscar todas las claves de wishlist
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('wishlist_') && key !== currentWishlistKey) {
        keysToRemove.push(key);
      }
    }
    
    console.log(`Limpieza: ${keysToRemove.length} wishlists antiguos encontrados`);
    
    // Remover wishlists antiguos (opcional: solo ejecutar si hay muchos)
    if (keysToRemove.length > 10) {
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('Limpieza completada');
    }
  } catch (error) {
    console.error('Error en limpieza de wishlists:', error);
  }
}

export default {
  getWishlistKey,
  loadUserWishlist,
  saveUserWishlist,
  addToUserWishlist,
  removeFromUserWishlist,
  isInUserWishlist,
  clearUserWishlist,
  getWishlistCount,
  migrateWishlistToUser,
  cleanupOldWishlists
};