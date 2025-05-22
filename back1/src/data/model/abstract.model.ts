import { modelOptions, plugin, Severity } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import {
  forceValidatorsOnUpdate,
  mongooseLeanHiddenVirtualsAndGetters,
} from "@vpoll-shared/mongoose-plugins";
import * as mhidden from "mongoose-hidden";

export interface AbstractModel extends Base<string>, TimeStamps {}
@plugin(mhidden({ defaultHidden: {}, applyRecursively: true }))
@plugin(require("mongoose-autopopulate"))
@plugin(require("mongoose-lean-defaults"))
@plugin(mongooseLeanHiddenVirtualsAndGetters)
@plugin(forceValidatorsOnUpdate)
@modelOptions({
  schemaOptions: {
    id: false,
    timestamps: true,
    versionKey: false,
    toObject: { getters: true, virtuals: true },
    toJSON: { getters: true, virtuals: true },
  },
  options: { allowMixed: Severity.ALLOW },
})
export abstract class AbstractModel {}
