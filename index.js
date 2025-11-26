import { registerRootComponent } from 'expo';
import React from 'react';
import { Provider } from 'react-redux';
import App from './App';
import store from './src/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials } from './src/redux/slices/authSlice';

const Root = () => (
	<Provider store={store}>
		<App />
	</Provider>
);

// Register root immediately so the app entry exists.
registerRootComponent(Root);

// Hydrate auth from AsyncStorage in background (do not block app registration)
async function bootstrap() {
	try {
		const token = await AsyncStorage.getItem('token');
		const userRaw = await AsyncStorage.getItem('user');
		let user = null;
		if (userRaw) {
			try {
				user = JSON.parse(userRaw);
			} catch (parseErr) {
				console.warn('Failed to parse stored user JSON', parseErr);
			}
		}
		if (token || user) {
			store.dispatch(setCredentials({ user, token }));
		}
	} catch (e) {
		console.warn('Failed to restore auth from storage', e);
	}
}

bootstrap();
