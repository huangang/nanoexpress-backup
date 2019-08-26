import { codes } from './errors';
const { FST_ERR_DEC_ALREADY_PRESENT, FST_ERR_DEC_MISSING_DEPENDENCY } = codes;

function decorate(instance, name, fn, dependencies) {
  // eslint-disable-next-line no-prototype-builtins
  if (instance.hasOwnProperty(name)) {
    throw new FST_ERR_DEC_ALREADY_PRESENT(name);
  }

  if (dependencies) {
    checkDependencies(instance, dependencies);
  }

  if (
    fn &&
    (typeof fn.getter === 'function' || typeof fn.setter === 'function')
  ) {
    Object.defineProperty(instance, name, {
      get: fn.getter,
      set: fn.setter
    });
  } else {
    instance[name] = fn;
  }
}

function checkDependencies(instance, deps) {
  for (var i = 0; i < deps.length; i++) {
    if (!checkExistence(instance, deps[i])) {
      throw new FST_ERR_DEC_MISSING_DEPENDENCY(deps[i]);
    }
  }
}

function checkExistence(instance, name) {
  if (name) {
    return name in instance;
  }

  return instance in this;
}

export { decorate, checkExistence, checkDependencies };
