import { createReduxStore } from '../../src/core/utils/store';
import { PersistModel } from './PersistModel';

let model: PersistModel;
let duration = 0;

const sleep = async () => {
  duration += 30;

  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

const getAlias = (): string => {
  return duration.toString();
};

afterEach(() => {
  model.clear();
});

test('Restore persist data from storage', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":2}","__persist":{"version":1}}');
  model = new PersistModel(getAlias());

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {
        model,
      },
    },
  });

  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":3}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":4}","__persist":{"version":1}}');
});

test('Clear the persist data when the json data invalid', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":2}","__persist":{"version":2}}}}}}}');
  model = new PersistModel();

  const spy = jest.spyOn(console, 'error').mockImplementation();
  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 2,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {
        model,
      },
    },
  });
  expect(spy).toHaveBeenCalledTimes(1);

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":2}}');
});

test('Clear the persist data when version is not matched', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":2}","__persist":{"version":1}}');
  model = new PersistModel(getAlias());

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 3,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {
        model,
      },
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":3}}');
});

test('No persist data in storage', async () => {
  await sleep();
  localStorage.removeItem('ReduxModel:Persist:test-persist');
  model = new PersistModel(getAlias());

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {
        model,
      },
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
});

test('Reducer data is not hint', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"__persist":{"version":1}}');
  model = new PersistModel(getAlias());

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {
        model,
      },
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
  model.increase();
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":1}","__persist":{"version":1}}');
});

test('Restore data from storage without whitelist', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":2}","__persist":{"version":1}}');

  model = new PersistModel(getAlias());

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {},
    },
  });

  expect(model.data.counter).toBe(0);
  model.increase();
  expect(model.data.counter).toBe(1);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(2);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
});

test('Restore data from storage with whitelist', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":2}","__persist":{"version":1}}');

  model = new PersistModel(getAlias());

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {
        model,
      },
    },
  });

  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":3}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":4}","__persist":{"version":1}}');
});

test('Delay to restore data', async (done) => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":2}","__persist":{"version":1}}');

  model = new PersistModel(getAlias());

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
      whitelist: {
        model,
      },
      restoreDelay: 200,
    },
  });

  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":2}","__persist":{"version":1}}');

  setTimeout(() => {
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":4}","__persist":{"version":1}}');
  }, 301);

  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":2}","__persist":{"version":1}}');

  setTimeout(() => {
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":4}","__persist":{"version":1}}');
    done();
  }, 301);
});