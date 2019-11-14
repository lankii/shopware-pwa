import axios from 'axios';

const defaultConfig = {
    endpoint: "https://shopware-2.vuestorefront.io/sales-channel-api/v1",
    accessToken: "SWSCBVBBZET1RTFIYWY4YVLICA",
    contextToken: "",
    defaultPaginationLimit: 10
};
let clientConfig = {};
const setupConfig = function (config = {}) {
    clientConfig = Object.assign(clientConfig, defaultConfig, config);
};
setupConfig();
const updateConfig = function (config) {
    clientConfig = Object.assign(clientConfig, config);
};
const config = clientConfig;

const apiService = axios.create({
    timeout: 1000
});
function reloadConfiguration() {
    apiService.defaults.baseURL = config.endpoint;
    apiService.defaults.headers.common["sw-access-key"] = config.accessToken;
    if (config.contextToken) {
        apiService.defaults.headers.common["sw-context-token"] =
            config.contextToken;
    }
    else {
        delete apiService.defaults.headers.common["sw-context-token"];
    }
}
reloadConfiguration();

// category
const getCategoryEndpoint = () => `/category`;
const getCategoryDetailsEndpoint = (categoryId) => `/category/${categoryId}`;
// product
const getProductEndpoint = () => `/product`;
const getProductDetailsEndpoint = (productId) => `/product/${productId}`;
const getProductsIdsEndpoint = () => `/search-ids/product`;
// customer
const getCustomerAddressEndpoint = (addressId) => addressId ? `/customer/address/${addressId}` : "/customer/address";
const getCustomerDefaultAddressEndpoint = (type, addressId) => `/customer/address/${addressId}/default-${type}`;
const getCustomerDefaultBillingAddressEndpoint = (addressId) => getCustomerDefaultAddressEndpoint("billing", addressId);
const getCustomerDefaultShippingAddressEndpoint = (addressId) => getCustomerDefaultAddressEndpoint("shipping", addressId);
const getCustomerEndpoint = () => `/customer`;
const getCustomerLoginEndpoint = () => `/customer/login`;
const getCustomerLogoutEndpoint = () => `/customer/logout`;
const getCustomerUpdateEmailEndpoint = () => `/customer/email`;
const getCustomerUpdatePasswordEndpoint = () => `/customer/password`;
// checkout
const getCheckoutCartEndpoint = () => `/checkout/cart`;
const getCheckoutCartProductEndpoint = (productId) => `/checkout/cart/product/${productId}`;
const getCheckoutCartLineItemEndpoint = (lineItemId) => `/checkout/cart/line-item/${lineItemId}`;
const getCheckoutPromotionCodeEndpoint = (code) => `/checkout/cart/code/${code}`;
// context
const getContextEndpoint = () => `/context`;
const getContextCurrencyEndpoint = () => `/currency`;
const getContextLanguageEndpoint = () => `/language`;
const getContextCountryEndpoint = () => `/country`;
const getContextPaymentMethodEndpoint = () => `/payment-method`;
const getContextShippingMethodEndpoint = () => `/shipping-method`;

var PaginationLimit;
(function (PaginationLimit) {
    PaginationLimit[PaginationLimit["ONE"] = 1] = "ONE";
    PaginationLimit[PaginationLimit["FIVE"] = 5] = "FIVE";
    PaginationLimit[PaginationLimit["TEN"] = 10] = "TEN";
    PaginationLimit[PaginationLimit["TWENTY_FIVE"] = 25] = "TWENTY_FIVE";
    PaginationLimit[PaginationLimit["FIFTY"] = 50] = "FIFTY";
    PaginationLimit[PaginationLimit["SEVENTY_FIVE"] = 75] = "SEVENTY_FIVE";
    PaginationLimit[PaginationLimit["HUNDRED"] = 100] = "HUNDRED";
    PaginationLimit[PaginationLimit["FIVE_HUNDRED"] = 500] = "FIVE_HUNDRED";
})(PaginationLimit || (PaginationLimit = {}));

// simple
// const equals = {
//   type: "equals",
//   field: string,
//   value: string | number
// }
// const contains = {
//   type: "contains",
//   field: string,
//   value: string | number
// }
// const equalsAny = {
//   type: "equalsAny",
//   field: string,
//   value: string // "wartosc|wartosc2|wartosc3"
// }
// interface range {
//   type: string // "range",
//   field: string,
//   parameters: {
//     lt?: string|number
//     gt?: string|number
//     lte?:  string|number
//     gte?: string|number
//   }
// }
// advanced
// const not = {
//   type: "not",
//   operator: "AND" | "OR" | "XOR"
//   queries: Array[ShopwareFilter]
// }
// const multi = {
//   type: "multi",
//   operator: "AND" | "OR" | "XOR"
//   queries: Array[ShopwareFilter]
// }
// interface ShopwareSort { //?sort=-field
// }
function convertAssociations(associations = []) {
    if (!associations || !associations.length)
        return;
    let shopwareAssociations = {};
    associations.forEach(association => {
        shopwareAssociations[association.name] = {
            associations: convertAssociations(association.associations)
        };
    });
    return shopwareAssociations;
}
const convertSearchCriteria = (searchCriteria) => {
    let params = {};
    if (!searchCriteria)
        return params;
    const { filters, sort, pagination, configuration } = searchCriteria;
    if (pagination) {
        const { limit, page } = pagination;
        if (limit && Object.values(PaginationLimit).includes(limit))
            params.limit = limit;
        if (page) {
            params.page = page;
            if (!params.limit)
                params.limit = config.defaultPaginationLimit;
        }
    }
    if (sort) {
        let prefix = sort.desc ? "-" : "";
        params.sort = `${prefix}${sort.field}`;
    }
    if (filters && filters.length) {
        params.filter = filters;
    }
    if (configuration) {
        params.associations = convertAssociations(configuration.associations);
    }
    return params;
};

async function getCategories(searchCriteria) {
    const resp = await apiService.post(getCategoryEndpoint(), convertSearchCriteria(searchCriteria));
    return resp.data;
}
async function getCategory(categoryId) {
    const resp = await apiService.get(getCategoryDetailsEndpoint(categoryId));
    return resp.data.data;
}

/**
 * Get default amount of products' ids
 */
const getProductsIds = async function () {
    const resp = await apiService.post(getProductsIdsEndpoint());
    return resp.data;
};
/**
 * Get default amount of products
 */
const getProducts = async function (searchCriteria) {
    const resp = await apiService.post(`${getProductEndpoint()}`, convertSearchCriteria(searchCriteria));
    return resp.data;
};
/**
 * Get the product with passed productId
 */
async function getProduct(productId, params = null) {
    const resp = await apiService.get(getProductDetailsEndpoint(productId), {
        params
    });
    return resp.data.data;
}

/**
 * Register a customer
 */
async function register(params) {
    const resp = await apiService.post(getCustomerEndpoint(), params);
    return resp.data;
}
/**
 * Get the context token for current user
 */
async function login(params) {
    const resp = await apiService.post(getCustomerLoginEndpoint(), params);
    const contextToken = resp.data["sw-context-token"];
    update({ contextToken });
    return { contextToken };
}
/**
 * End up the session
 */
async function logout() {
    await apiService.post(getCustomerLogoutEndpoint());
    update({ contextToken: "" });
}
/**
 * End up the session
 */
async function getCustomer() {
    const resp = await apiService.get(getCustomerEndpoint());
    return resp.data.data;
}
/**
 * Get all customer's addresses
 */
async function getCustomerAddresses() {
    const resp = await apiService.get(getCustomerAddressEndpoint());
    return resp.data.data;
}
/**
 * Get the customer's address by id
 */
async function getCustomerAddress(addressId) {
    const resp = await apiService.get(getCustomerAddressEndpoint(addressId));
    return resp.data.data;
}
/**
 * Create an address and respond the new address's id
 */
async function createCustomerAddress(params) {
    const resp = await apiService.post(getCustomerAddressEndpoint(), params);
    return resp.data;
}
/**
 * Delete's the customer's address by id
 */
async function deleteCustomerAddress(addressId) {
    await apiService.delete(getCustomerAddressEndpoint(addressId));
}
/**
 * Set address as default
 */
async function setDefaultCustomerBillingAddress(addressId) {
    const response = await apiService.patch(getCustomerDefaultBillingAddressEndpoint(addressId));
    return response.data;
}
/**
 * Set address as default
 */
async function setDefaultCustomerShippingAddress(addressId) {
    const response = await apiService.patch(getCustomerDefaultShippingAddressEndpoint(addressId));
    return response.data;
}
/**
 * Update a customer's email
 */
async function updateEmail(params) {
    await apiService.patch(getCustomerUpdateEmailEndpoint(), params);
}
/**
 * Update a customer's password
 */
async function updatePassword(params) {
    await apiService.patch(getCustomerUpdatePasswordEndpoint(), params);
}
/**
 * Update a customer's profile data
 */
async function updateProfile(params) {
    await apiService.patch(getCustomerEndpoint(), params);
}

async function updateContext(params) {
    const resp = await apiService.patch(getContextEndpoint(), params);
    const contextToken = resp.data["sw-context-token"];
    update({ contextToken });
    return { contextToken };
}
async function getAvailableCurrencies() {
    const resp = await apiService.get(getContextCurrencyEndpoint());
    return resp.data;
}
async function setCurrentCurrency(newCurrencyID) {
    let params = { currencyId: newCurrencyID };
    const resp = await updateContext(params);
    return resp;
}
async function getAvailableLanguages() {
    const resp = await apiService.get(getContextLanguageEndpoint());
    return resp.data;
}
async function setCurrentLanguage(newLanguageId) {
    let params = { languageId: newLanguageId };
    const resp = await updateContext(params);
    return resp;
}
async function getAvailableCountries() {
    const resp = await apiService.get(getContextCountryEndpoint());
    return resp.data;
}
async function getAvailablePaymentMethods() {
    const resp = await apiService.get(getContextPaymentMethodEndpoint());
    return resp.data;
}
async function setCurrentPaymentMethod(newPaymentMethodId) {
    let params = { paymentMethodId: newPaymentMethodId };
    const resp = await updateContext(params);
    return resp;
}
async function getAvailableShippingMethods() {
    const resp = await apiService.get(getContextShippingMethodEndpoint());
    return resp.data;
}
async function setCurrentShippingMethod(newShippingMethodId) {
    let params = { shippingMethodId: newShippingMethodId };
    const resp = await updateContext(params);
    return resp;
}

var CartItemType;
(function (CartItemType) {
    CartItemType["PRODUCT"] = "product";
    CartItemType["CREDIT"] = "credit";
    CartItemType["CUSTOM"] = "custom";
    CartItemType["PROMOTION"] = "promotion";
})(CartItemType || (CartItemType = {}));

/**
 * When no sw-context-token given then this method return an empty cart with the new sw-context-token.
 *
 * When sw-context-token given then this method simply returns the current state of the cart.
 *
 * As the purpose of this method is not clear we recommend to use getCart() method because its behaviour seems to be the same.
 */
async function clearCart() {
    const resp = await apiService.post(getCheckoutCartEndpoint());
    let contextToken = resp.data["sw-context-token"];
    update({ contextToken });
    return { contextToken };
}
/**
 * Gets the current cart for the sw-context-token.
 */
async function getCart() {
    const resp = await apiService.get(getCheckoutCartEndpoint());
    return resp.data;
}
/**
 * Adds specific quantity of the product to the cart by productId. It creates a new cart line item.
 *
 * Warning: This method does not change the state of the cart in any way if productId already exists in a cart. For changing the quantity use addQuantityToCartLineItem() or changeCartLineItemQuantity() methods.
 */
async function addProductToCart(productId, quantity) {
    const resp = await apiService.post(getCheckoutCartProductEndpoint(productId), { quantity: quantity });
    return resp.data;
}
/**
 * Increases the current quantity in specific cart line item by given quantity.
 *
 * Example: If current quantity is 3 and you pass 2 as quantity parameter, you will get a new cart's state with quantity 5.
 */
async function addCartItemQuantity(itemId, quantity) {
    let params = { type: CartItemType.PRODUCT, quantity: quantity };
    const resp = await apiService.post(getCheckoutCartLineItemEndpoint(itemId), params);
    return resp.data;
}
/**
 * Changes the current quantity in specific cart line item to given quantity.
 *
 * Example: If current quantity is 3 and you pass 2 as quantity parameter, you will get a new cart's state with quantity 2.
 */
async function changeCartItemQuantity(itemId, newQuantity) {
    let params = { quantity: newQuantity };
    const resp = await apiService.patch(getCheckoutCartLineItemEndpoint(itemId), params);
    return resp.data;
}
/**
 * Deletes the cart line item by id.
 *
 * This method may be used for deleting "product" type item lines as well as "promotion" type item lines.
 */
async function removeCartItem(itemId) {
    const resp = await apiService.delete(getCheckoutCartLineItemEndpoint(itemId));
    return resp.data;
}
/**
 * Adds new promotion code to the cart by its code.
 *
 * Promotion code is being added as separate cart item line.
 *
 */
async function addPromotionCode(promotionCode) {
    const resp = await apiService.post(getCheckoutPromotionCodeEndpoint(promotionCode));
    return resp.data;
}

/**
 * Setup configuration. Merge default values with provided in param.
 * This method will override existing config. For config update invoke **update** method.
 */
function setup(config = {}) {
    setupConfig(config);
    reloadConfiguration();
}
/**
 * Update current configuration. This will change only provided values.
 */
function update(config = {}) {
    updateConfig(config);
    reloadConfiguration();
}

export { addCartItemQuantity, addProductToCart, addPromotionCode, changeCartItemQuantity, clearCart, config, createCustomerAddress, deleteCustomerAddress, getAvailableCountries, getAvailableCurrencies, getAvailableLanguages, getAvailablePaymentMethods, getAvailableShippingMethods, getCart, getCategories, getCategory, getCustomer, getCustomerAddress, getCustomerAddresses, getProduct, getProducts, getProductsIds, login, logout, register, removeCartItem, setCurrentCurrency, setCurrentLanguage, setCurrentPaymentMethod, setCurrentShippingMethod, setDefaultCustomerBillingAddress, setDefaultCustomerShippingAddress, setup, update, updateEmail, updatePassword, updateProfile };
