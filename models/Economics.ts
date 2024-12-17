import {Schema, model, models} from "mongoose";

const economicsSchema = new Schema({
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
    }]
 }, {timestamps: true});

const EconomicsModel = models.Economics || model("Economics", economicsSchema);

export default EconomicsModel;
