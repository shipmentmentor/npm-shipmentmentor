# npm-shipmentmentor

Shipmentmentor platform provides REST API for companies to have industrial level shipment number generation and status update service with ability to provide instant notification about shipment status and location via email, SMS or web hook.

node.js SDK for ShipmentMentor API
## Installation
```
npm install shipmentmentor --save
```

### Shipment Mentor API Authentication

All ShipmentMentor API calls require API key for authorization.
To get API key please signup on https://www.shipmentmentor.com. You can get API key from your account settings.

### Shipment Mentor API Status Codes:

#### Processing Statuses 
  - InfoReceived - 'Information Received'
  - InTransit - 'In Transit'
  - Exception - 'Exception'
  - OutForDelivery -'Out For Delivery'
  
#### Final Statuses 
  - Delivered - 'Delivered'
  - Expired - 'Expired'  

## The Response JSON Envelope

Every response is JSON Envelope with http header code 200 always.  

Response Http Header Code:
  - 200 - communication with API was successful, additional internal status information available in JSON Envelope code parameter
  - 400,500,etc - communication with API failed
  
Response JSON Envelope:
  - {code} = 200, 201 in case of success or 400,401, etc in case of fail
  - {status} = success or fail
  - {message} = reason of success or fail
  - {payload} = array of payload data
  
Example of Success Response:  

```json
{
    "code": 201,
    "status": "success",
    "message": "operation was successful",
    "payload": []
}
```

Example of Fail Response:  

```json
{
    "code": 400,
    "status": "fail",
    "message": "Email already in system",
    "payload": []
}
```
  
#### Add UPS, USPS or FedEx Tracking

Function: addTracking

Payload:
  - {tid} = the package UPS, USPS or FedEx tracking number
  - {title} = package title or null
  - {courier} = "ups","usps","fedex" or null for auto detecting  
  - {orderId} = order id or null  
  - {customer} = customer name or null
  - {note} = custom note or null 
  - {notify} - customer notification options
	- {email} = customer email or null
	- {phone} = customer phone or null    

```json
{
    "tid":"the package UPS, USPS or FedEx tracking number",
    "title":"Your product name",
    "courier": null, 
    "orderId":"1234",
    "customer":"FirstName LastName",
    "notify":{
        "email":"customer@example.com",
        "phone":"+8218001111"
    },
    "note": null   
}
```

Response Success:

  - {code} = status code of API logic
  - {status} = status of API logic ("success","fail")
  - {message} = message from API
  - {payload} = data payload from API

Example:

```javascript
var shipmentmentor = require( 'shipmentmentor' );
var shm = new shipmentmentor(process.env.SHIPMENTMENTOR_API_TOKEN,"sandbox"); // "production"

var payload = {
        "tid":"Your UPS USPS OR FedEx tracking NUmber",
        "title":"Your product name", 
        "courier": null, 
        "orderId":"12345",
        "customer":"FirstName LastName",
        "notify":{
            "email":"customer@example.com",
            "phone":"+8188087449"
        },
        "note": null
    }                 
    shm.addTracking(payload).then((response)=> {
        console.log('response:',response);
    }).catch(error=>{
        console.log('error:',error);
    });
```  

#### Sending Custom Shipment using SHM

Function: sendShipment

Example:

```javascript
    var shipmentmentor = require( 'shipmentmentor' );
    var shm = new shipmentmentor(process.env.SHIPMENTMENTOR_API_TOKEN,"sandbox"); // "production"

    var parsels=[];
    var origin = {
            "name": "sender name",
            "company": "sender Company",
            "address1": "sender address",
            "address2":null,
            "city": "sender city",
            "state": "CA",
            "zip": "90403",
            "country": "US",
            "lat":34.032016,
            "long":-118.482805,
            "phone": "+18188081111",
            "email": "sam@example.com"                          
    }

    var destination = {
            "name": "receiver name",
            "company": null,
            "address1": "receiver address",
            "address2":null,
            "city": "receiver city",
            "state": "CA",
            "zip": "90401",
            "country": "US",
            "lat":34.032016,
            "long":-118.482805,            
            "phone": "+18188082222",
            "email": "destination@example.com"       
    };

    var parsel1 = {
            "id": "SKU45896",
            "quantity":1,
            "name": "custom package name",
            "length": 12,
            "width": 8,
            "height": 3,
            "distanceUnit": "in",
            "weight": 1.5,
            "weightUnit": "lb",
            "metadata":{}        
    };

    parsels.push(parsel1);
    var payload = {
            "origin": origin,
            "destination": destination,	
            "parcels": parsels,                        
            "expected": "2019-02-15T14:12:16Z",            
            "message": "Left in front of door",
            "orderId": "0113191348",
            "status": "InfoReceived",
            "courier":"courier person or company name",
            "courierEmail": "courier@example.com",
            "metadata":{}                        
    }                
    shm.sendShipment(payload).then((response)=> {
        console.log('response:',response);
    }).catch(error=>{
        console.log('error:',error);
    });
```  

#### Updating Custom SHM Shipment status

Function: updateShipment

Example:

```javascript
    var shipmentmentor = require( 'shipmentmentor' );
    var shm = new shipmentmentor(process.env.SHIPMENTMENTOR_API_TOKEN,"sandbox"); // "production"

    var payload = {
            "tid":"SHM123456789879",
            "status":"InTransit",
            "location": "2025 Wilshire Blvd, Santa Monica, CA 90403",
            "lat":34.032016,
            "long":-118.482805,
            "time":"2019-01-19T15:04:08-07:00"                        
    }

    shm.updateShipment(payload).then((response)=> {
        console.log('response:',response);
    }).catch(error=>{
        console.log('error:',error);
    });    
```
