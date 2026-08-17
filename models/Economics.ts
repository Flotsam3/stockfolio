import {Schema, model, models} from "mongoose";

const economicsSchema = new Schema({
    scope: {
       type: String,
       default: "global",
       immutable: true
    },
    inflation: [{
       value:Number,
       date:Date
    }],
    cpi: [{
          value:Number,
          date:Date
       }],
    unemployment: [{
       value:Number,
       date:Date
    }],
    interest: [{
       value:Number,
       date:Date
    }],
    lastRefreshAttemptAt: Date,
    refreshStartedAt: Date
 }, {timestamps: true});

economicsSchema.index(
  { scope: 1 },
  { unique: true, partialFilterExpression: { scope: { $type: "string" } } }
);

const EconomicsModel = models.Economics || model("Economics", economicsSchema);

export default EconomicsModel;
