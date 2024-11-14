import { TestBed } from '@angular/core/testing';
import { injectLocalStorage } from './inject-local-storage';

describe('injectLocalStorage', () => {
	const key = 'testKey';
	let setItemSpy: jest.SpyInstance;
	let getItemSpy: jest.SpyInstance;

	beforeEach(() => {
		setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
		getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null); // Default mock to return null
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('with primitive', () => {
		it('should set a value in localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const localStorageSignal = injectLocalStorage<string>(key);
				const testValue = 'value';
				localStorageSignal.set(testValue);
				TestBed.flushEffects();
				expect(setItemSpy).toHaveBeenCalledWith(key, JSON.stringify(testValue));
			});
		});

		it('should get a undefined value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue(undefined); // Mock return value for getItem
				const localStorageSignal = injectLocalStorage<string>(key);
				TestBed.flushEffects();
				expect(localStorageSignal()).toBeUndefined();
			});
		});

		it('should return defaultValue of type string', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue(undefined); // Mock return value for getItem
				const defaultValue = 'default';
				const localStorageSignal = injectLocalStorage<string>(key, {
					defaultValue,
				});

				expect(typeof localStorageSignal()).not.toBeUndefined();
				expect(localStorageSignal()).toEqual(defaultValue);
			});
		});

		it('should get the current value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = 'value';
				getItemSpy.mockReturnValue(JSON.stringify(testValue)); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<string>(key);

				expect(localStorageSignal()).toEqual(testValue);
			});
		});

		/**
		 * Demonstrates how parse can be used as validation
		 */
		it('should handle validation correctly', () => {
			TestBed.runInInjectionContext(() => {
				const invalidValue = 'invalid';
				const parse = () => {
					throw new Error('Invalid value');
				};

				getItemSpy.mockReturnValue(JSON.stringify(invalidValue)); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<string>(key, { parse });

				expect(localStorageSignal()).toBeUndefined();
			});
		});

		it('should set signal value to undefined if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<string>(key);
				expect(localStorageSignal()).toBeUndefined();
			});
		});

		/* TODO If we choose to emit and error instead of setting the value to undefined

		it('should emit an error if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<string>(key);
				expect(error()).toBeInstanceOf(Error);
			});
		});
		*/

		it('should react to external localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = 'old value';
				const newValue = 'new value';
				getItemSpy.mockReturnValue(JSON.stringify(oldValue)); // Mock return value for getItem after change

				const localStorageSignal = injectLocalStorage<string>(key);

				TestBed.flushEffects();

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key,
						newValue: JSON.stringify(newValue),
					}),
				);

				TestBed.flushEffects();

				expect(localStorageSignal()).toEqual(newValue);
			});
		});

		it('should dispatch localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = 'old value';
				const newValue = 'new value';
				getItemSpy.mockReturnValue(JSON.stringify(oldValue)); // Mock return value for getItem after change

				const localStorageSignal1 = injectLocalStorage<string>(key);
				const localStorageSignal2 = injectLocalStorage<string>(key);

				TestBed.flushEffects();

				localStorageSignal1.set(newValue);

				TestBed.flushEffects();

				expect(localStorageSignal2()).toEqual(newValue);
			});
		});
	});

	describe('with object', () => {
		it('should set a value in localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = { house: { rooms: 3, bathrooms: 2 } };
				const localStorageSignal = injectLocalStorage<typeof testValue>(key);
				localStorageSignal.set(testValue);
				TestBed.flushEffects();
				expect(setItemSpy).toHaveBeenCalledWith(key, JSON.stringify(testValue));
			});
		});

		it('should get the current value from localStorage', () => {
			TestBed.runInInjectionContext(() => {
				const testValue = { house: { rooms: 3, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(testValue)); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<typeof testValue>(key);

				expect(localStorageSignal()).toEqual(testValue);
			});
		});

		it('should handle validation correctly', () => {
			TestBed.runInInjectionContext(() => {
				const invalidValue = { house: { rooms: 3, bathrooms: 2 } };
				const parse = () => {
					throw new Error('Invalid value');
				};
				getItemSpy.mockReturnValue(JSON.stringify(invalidValue)); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<typeof invalidValue>(
					key,
					{ parse },
				);

				expect(localStorageSignal()).toBeUndefined();
			});
		});

		it('should set signal value to undefined if JSON parsing fails', () => {
			TestBed.runInInjectionContext(() => {
				getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

				const localStorageSignal = injectLocalStorage<string>(key);
				expect(localStorageSignal()).toBeUndefined();
			});
		});

		/* TODO If we choose to emit and error instead of setting the value to undefined

				it('should emit an error if JSON parsing fails', () => {
					TestBed.runInInjectionContext(() => {
						getItemSpy.mockReturnValue('not a valid json'); // Mock return value for getItem

						const { error } = injectLocalStorage<string>(key);
						expect(error()).toBeInstanceOf(Error);
					});
				});
				*/

		it('should react to external localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = { house: { rooms: 3, bathrooms: 2 } };
				const newValue = { house: { rooms: 4, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(oldValue));

				const localStorageSignal = injectLocalStorage<typeof newValue>(key);

				TestBed.flushEffects();

				// Simulate an external change
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key,
						newValue: JSON.stringify(newValue),
					}),
				);

				TestBed.flushEffects();

				expect(localStorageSignal()).toEqual(newValue);
			});
		});

		it('should react to multiple localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const val1 = { house: { rooms: 3, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(val1));

				const localStorageSignal = injectLocalStorage<typeof val1>(key);

				TestBed.flushEffects();

				expect(localStorageSignal()).toEqual(val1);

				const val2 = { house: { rooms: 4, bathrooms: 2 } };
				window.dispatchEvent(
					new StorageEvent('storage', {
						storageArea: localStorage,
						key,
						newValue: JSON.stringify(val2),
					}),
				);
				TestBed.flushEffects();
				expect(localStorageSignal()).toEqual(val2);

				const val3 = { house: { rooms: 5, bathrooms: 2 } };
				localStorageSignal.set(val3);
				TestBed.flushEffects();
				expect(localStorageSignal()).toEqual(val3);
				expect(localStorage.setItem).toHaveBeenCalledWith(
					key,
					JSON.stringify(val3),
				);
			});
		});

		it('should dispatch localStorage changes', () => {
			TestBed.runInInjectionContext(() => {
				const oldValue = { house: { rooms: 3, bathrooms: 2 } };
				const newValue = { house: { rooms: 4, bathrooms: 2 } };
				getItemSpy.mockReturnValue(JSON.stringify(oldValue)); // Mock return value for getItem after change

				const localStorageSignal1 = injectLocalStorage<typeof newValue>(key);
				const localStorageSignal2 = injectLocalStorage<typeof newValue>(key);

				TestBed.flushEffects();

				localStorageSignal1.set(newValue);

				TestBed.flushEffects();

				expect(localStorageSignal2()).toEqual(newValue);
			});
		});
	});
});
