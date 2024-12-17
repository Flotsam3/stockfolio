import {Schema, model, models} from "mongoose";

const watchListSchema = new Schema({
   name: {
      type: String,
      required: [true, "A stock name is required!"]
   },
   ticker: {
      type: String,
      required: [true, "A ticker code is required!"]
   },
   isin: {
      type: String,
      required: [true, "An ISIN number is required"]
   },
   country: {
      type: String,
      required: [true, "A country is required!"]
   },
   rate: {
      type: Number,
      required: [true, "A stock rate is required!"]
   },
   dilutedEps: {
      type: Number,
      required: [true, "A value for diluted EPS (ttm) is required!"]
   },
   growthForecast: {
      type: Number,
      required: [true, "A growth forecast for the next 5 years is required!"]
   },
   peRatio: {
      type: String,
      required: [true, "A PE Ratio is required!"]
   },
   peRatioAverage: Number,
}, {timestamps:true});
  

const stockSchema = new Schema({
   name: {
      type: String,
      required: true,
      unique: true
   },
   watchList:[watchListSchema],
   anualTargetReturn: {
      type: Number,
      default: 12
   },
}, {timestamps:true});

const StockPortfolio = models.StockPortfolio || model("StockPortfolio", stockSchema);

export default StockPortfolio;
