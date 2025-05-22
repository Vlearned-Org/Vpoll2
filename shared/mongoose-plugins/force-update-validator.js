"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceValidatorsOnUpdate = void 0;
function setRunValidators() {
    this.setOptions({ runValidators: true, context: "query", new: true });
}
const forceValidatorsOnUpdate = schema => {
    schema.pre("findOneAndUpdate", setRunValidators);
    schema.pre("updateMany", setRunValidators);
    schema.pre("updateOne", setRunValidators);
    schema.pre("update", setRunValidators);
};
exports.forceValidatorsOnUpdate = forceValidatorsOnUpdate;
//# sourceMappingURL=force-update-validator.js.map