function setRunValidators() {
  this.setOptions({ runValidators: true, context: "query", new: true });
}
export const forceValidatorsOnUpdate = schema => {
  schema.pre("findOneAndUpdate", setRunValidators);
  schema.pre("updateMany", setRunValidators);
  schema.pre("updateOne", setRunValidators);
  schema.pre("update", setRunValidators);
};
