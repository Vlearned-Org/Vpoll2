const mapResult = (res, schema, options) => {
  const newRes = res;
  if (schema.paths && res) {
    Object.keys(schema.virtuals).forEach(key => {
      if (key && schema.virtuals) {
        newRes[key] = schema.virtuals[key].applyGetters(res[key], res, true);
      }
    });
    Object.keys(schema.paths).forEach(key => {
      if (key) {
        if ((schema.paths[key].options.hide || schema.paths[key].options.hideJSON) && options.lean && options.lean.hide) {
          delete newRes[key];
        }
        if (schema.paths[key].options.get) {
          newRes[key] = schema.paths[key].options.get(newRes[key]);
        }
      }
    });
  }
  return newRes;
};
// tslint:disable-next-line: only-arrow-functions
const callback = function (schema) {
  return function (res) {
    const options = this._mongooseOptions;
    if (Array.isArray(res)) {
      const len = res.length;
      for (let i = 0; i < len; ++i) {
        res[i] = mapResult(res[i], schema, options);
      }
      return res;
    }
    return mapResult(res, schema, options);
  };
};

// TODO: create a cleaner plugin
// this beta mongoose plugin is to do hidden and virtuals with lean
// working only on abstract repo 'all' with lean(),
// do not enable on other methods for now!
export const mongooseLeanHiddenVirtualsAndGetters = schema => {
  const fn = callback(schema);

  schema.post("find", fn);
};
