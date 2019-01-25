'use strict';

var rp = require('request-promise');
var Ajv = require('ajv');
var ajv = new Ajv({ useDefaults: true });

class shipmentmentor {
	constructor(accessToken,env){
		this.accessToken = accessToken;
		this.env = (env === "sandbox") ? "sandbox":"production";
		this.apiEndpoint = (this.env  === "sandbox") ? "https://devapi.shipmentmentor.com":"https://api.shipmentmentor.com";
		ajv.addFormat("phone","^[+0-9()\\-\\.\\s]+$");

		this.shipmentDataSchema = {
			"definitions":{
				"address":{
					"type": "object",
					"properties": {
						"name": { "type": ["string","null"], "default": null },
						"company": { "type": ["string","null"], "default": null },
						"address1": { "type": "string"},
						"address2": { "type": ["string","null"], "default": null },
						"city": { "type": "string"},
						"state": { "type": "string"},
						"zip": { "type": "string"},
						"country": { "type": "string"},
						"lat": { "type": ["number","null"], "default": null },
						"long": { "type": ["number","null"], "default": null },
						"email": { "type": ["string","null"], "format": "email",  "default": null },
						"phone": { "type": ["string","null"], "format": "phone",  "default": null }
					},
					"additionalProperties": false,
					"required": ["address1", "city", "state", "zip", "country"]						
				},
				"parcel":{
					"type": "object",
					"properties": {
						"id": { "type": ["string","null"], "default": null },
						"quantity": { "type": ["number"], "default": 1 },
						"name": { "type": "string"},
						"length": { "type": "number"},
						"width": { "type": "number"},
						"height": { "type": "number"},
						"weight": { "type": "number"},
						"distanceUnit": { "type": "string", "default": "in" },
						"weightUnit": { "type": "string", "default": "lb" },
						"metadata": { "type": "object", "default": {},"additionalProperties": true, "maxProperties": 20},
					},
					"additionalProperties": false,
					"required": ["quantity", "name", "length", "width", "height","weight","distanceUnit","weightUnit"]					
				}
			},
			"type": "object",
			"properties": {
				"origin": { "$ref": "#/definitions/address" },
				"destination": { "$ref": "#/definitions/address" },	
				"parcels": {
					"type": "array",
					"items": { "$ref": "#/definitions/parcel" },
					"default": []
				  },			
				"expected": { "type": ["string","null"], "default": null },
				"message": { "type": ["string","null"], "default": null },
				"orderId": { "type": ["string","null"], "default": null },
				"status": { "type": "string", "default": "InfoReceived" },
				"courier": { "type": "string"},
				"courierEmail": { "type": "string","format": "email"},
				"metadata": { "type": "object", "default": {},"additionalProperties": true, "maxProperties": 20},
			},
			"additionalProperties": false,
			"required": ["courier", "courierEmail"]			
		}
		
		this.shipmentUpdateDataSchema = {
			"type": "object",
			"properties": {			
				"tid": { "type": "string", },
				"status": { "type": "string", "default": "InTransit" },
				"location": { "type": "string", },
				"lat": { "type": ["number","null"], "default": null },
				"long": { "type": ["number","null"], "default": null },	
				"time": { "type": "string", }			
			},
			"additionalProperties": false,
			"required": ["tid", "status","location","time"]				
		}

		this.shipmentTrackingAddSchema = {
			"type": "object",
			"properties": {			
				"tid": { "type": "string", },
				"title": { "type": ["string","null"], "default": null },
				"courier": { "type": ["string","null"], "default": null},
				"orderId": { "type": ["string","null"], "default": null},
				"customer": { "type": ["string","null"], "default": null},				
				"note": { "type": ["string","null"], "default": null},
				"notify":{
					"type": "object",
					"properties": {
						"email": { "type": ["string","null"], "format": "email",  "default": null },
						"phone": { "type": ["string","null"], "format": "phone",  "default": null }
					},
					"additionalProperties": false,
					"required": ["email","phone"]					
				}			
			},
			"additionalProperties": false,
			"required": ["tid","title","courier","customer","note","notify"]				
		}		
	}

	async sendApiRequest(payload,path,method){
		method = method ? method.toUpperCase():"POST";
		try {
			if(!this.accessToken){
				throw "Invalid access token";
			}	
			
			var options = {
				method: method,
				uri: this.apiEndpoint+path,
				headers: {
					'Content-Type': 'application/json',
					'sm-api-token': this.accessToken
				}
			};		
			
			if(method === "POST"){
				options.body = payload;
				options.json = true;
			}

			var data = await rp(options);
			return data;
		} catch (error) {
			throw error;
		}		
	}		
	
	async sendShipment(payload){
		try {
			let valid = ajv.validate(this.shipmentDataSchema, payload);
			if (!valid){
			   throw ajv.errorsText();
			}			
			var data = await this.sendApiRequest(payload,"/v1/shipment/create/");
			if(data && data.status && data.status==="success"){
				return data.payload;
			} else {
				throw data.message;
			}
		} catch (error) {
			throw error;
		}
	}	

	async updateShipment(payload){
		try {
			let valid = ajv.validate(this.shipmentUpdateDataSchema, payload);
			if (!valid){
			   throw ajv.errorsText();
			}			
			var data = await this.sendApiRequest(payload,"/v1/shipment/update/");
			if(data && data.status && data.status==="success"){
				return data.payload;
			} else {
				throw data.message;
			}
		} catch (error) {
			throw error;
		}
	}	

	async addTracking(payload){
		try {
			let valid = ajv.validate(this.shipmentTrackingAddSchema, payload);
			if (!valid){
			   throw ajv.errorsText();
			}			
			var data = await this.sendApiRequest(payload,"/v1/trackings/add/");
			if(data && data.status && data.status==="success"){
				return data.payload;
			} else {
				throw data.message;
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
	
}


module.exports = function (accessToken,env) {
	return new shipmentmentor(accessToken,env);
};