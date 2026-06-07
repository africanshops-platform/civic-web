import Cookie from 'js-cookie';
import { getUserFoodCartApi, getUserShoppingCart } from 'app/configs/data/client/RepositoryAuthClient';

export function formatCurrency(num) {
	if (num === undefined) return '';
	return parseFloat(num)
		.toString()
		.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export const formatDateUtil = (dateString) => {
	if (!dateString) return '';

	const date = new Date(dateString);
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const dayName = days[date.getDay()];
	const monthName = months[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();

	return `${dayName} ${monthName} ${day} ${year}`;
};

export function calculateTax() {
	// return Object.values(_obj)
	//     .reduce((acc, { quantity, price }) => acc + quantity * price, 0)
	//     .toFixed(2);
}

/** *Cart Totalling */
export function calculateCartTotalAmount(obj) {
	return Object.values(obj)
		.reduce((acc, { quantity, price }) => acc + quantity * price, 0)
		.toFixed(2);
}

export function generateClientUID() {
	let firstPart = Math.floor(Math.random() * 466566);
	let secondPart = Math.floor(Math.random() * 466566);
	firstPart = `000${firstPart.toString(36)}`.slice(-3);
	secondPart = `000${secondPart.toString(36)}`.slice(-3);
	return `${firstPart}${secondPart}`;
}

/** **store user client shopping session */
export const storeShoppingSession = async (payloadData) => {
	const cartItems = await getCartItems();

	if (cartItems.length < 1) {
		Cookie.set('cartSession', JSON.stringify({ payloadData }));
	}
};

/** **get user client shopping session */
export function getShoppingSession() {
	const cookie = Cookie.get('cartSession');
	if (!cookie) return null;
	const { payloadData } = JSON.parse(cookie);
	return payloadData ?? null;
}

async function getCartItems() {
	const cartResponseData = await getUserShoppingCart();
	return cartResponseData?.data?.cartItems;
}

/**
 * ###################################################################################
 * ----------------FOOD CART UTILS---------------------------------------------------
 * ###################################################################################
 */

/** **store user FOOD_VENDOR client shopping session */
export const storeFoodVendorSession = async (payloadData) => {
	const cartItems = await getFoodCartItems();

	if (cartItems.length < 1) {
		Cookie.set('foodCartSession', JSON.stringify({ payloadData }));
	}
};

/** **get user FOOD_VENDOR client shopping session */
export function getFoodVendorSession() {
	const cookie = Cookie.get('foodCartSession');
	if (!cookie) return null;
	const { payloadData } = JSON.parse(cookie);
	return payloadData ?? null;
}

async function getFoodCartItems() {
	const foodCartResponseData = await getUserFoodCartApi();
	return foodCartResponseData?.data?.foodcart;
}
