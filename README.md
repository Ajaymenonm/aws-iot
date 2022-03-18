# Food Parameter Tracker

An IoT application that monitors parameters that are crucial in keeping food safe at places like fast food joints. 

## Architecture

This application is built using simple iot devices, sensors and leverages AWS cloud. 
There are two major parts to it:

- Edge:
    - Raspberry Pi connected to a dht22 sensor 
    (temperature and humidity)
    - Esp8266 microcontroller connected to ultrasonic level sensor
- Cloud: 
    - AWS and specifically IoT service which acts as a connectivity between physical and logical world.

Raspberry pi with dht22 sensor measures temperature and humidity at the place where food is stored / used. This could be in a fridge or on the food prep station. 

Esp8266 along with ultrasonic sensor is used to measure levels of liquid items. This could be a container of soup / sauce, etc.

The high level architecture of the application is shown in the image below.    

<img src="https://lucid.app/publicSegments/view/df1b45a7-0a12-4d27-a823-fdb2fb67acf0/image.png" alt="High Level Architecture" width="1000"/>

<br>

## Application Components
### Edge

1. [Raspberry Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) + [DHT22](https://www.adafruit.com/product/385)
<br>
This component performs the following actions:
    - Connects to AWS IoT to communicate to and from the cloud.
    - Acts as a gateway device and connects to other node devices locally.
    - Run edge workload like collecting sensor data, local data storage, stream / batch telemetry to cloud among others.
    - DHT22 is connected to RPi as shown below in the image. It collects temperature and humidity data and does serial communication with RPi.
    - Runs a [Mosquitto](https://mosquitto.org/) MQTT broker as a demon service.
    - Connects to node device (esp8266) via mqtt to gather data.

<img src="https://lucid.app/publicSegments/view/37576343-a007-405b-accb-14baa4d749d5/image.png" alt="RPi Wiring" width="1000"/>
[Diagram Source: Web]

<br>

2. [ESP8266 NodeMcu](https://en.wikipedia.org/wiki/ESP8266) + [Ultrasonic Level Sensor](https://www.sparkfun.com/products/15569)
<br>
This component performs the following actions:
    - Connects locally to RPi via MQTT
    - Collects liquid level data

<img src="https://lucid.app/publicSegments/view/1ce174a8-15a0-4460-8977-0dd48330cc3a/image.png" alt="Esp8266 Wiring" width="1000"/>
[Diagram Source: Web]

<br>

### Cloud
1. AWS IoT Core
    - This service is used to connect a physical device to the cloud. 
    - A logical device on the AWS IoT platform is created under the concept of **"Things"**. 
    - x509 **Certificates** are created during this process and they will be used on the device to authenticate with the cloud. 
    - **Policy** is created by attaching specific roles that a resource is going to use / perform. Ex: iot publish / subscribe.
    - Policy is then attached to the certificate, which in turn is tied to the Thing. 
    
    <br>


2. AWS IoT Rules
    - Based on the data received from a topic, certain actions can be performed. 
    - More on application specific rules explained below.

3. Dynamo Db
    - `device_data` is the name of the table

        | Attribute | Primary Key | Type | Required |
        |------|-------------|------|:--------:|
        | deviceId | Partition key | String | Yes |
        | ts | Sort key | String | Yes | 
        | humidity | N/A | String | No |
        | temp | N/A | String | No |
        | level | N/A | Float | No |
4. S3
    - `all-device-telemetry` is the name of the bucket
    - Naming format: `<deviceid>/<timestamp>.csv`
    - This bucket acts as a cold storage for all device telemetry data.

5. Lambda function
    - Lambda function is used to process the compressed telemetry and dump into a S3 bucket
    - This function is setup with Node v14 runtime
    - A new policy is created with S3 Put permission and Cloudwatch log access. Policy is attched to the lambda function. The policy also specifies S3 ARN - which the lambda function now has access to PUT objects.
    - This function is triggered from AWS IoT.

## Device Software

### Core App 
 This is a device software that powers Raspberry Pi. Acts as a gateway device and also connects to other node devices locally.

#### Features:

1. DHT22 Sensor Interface

    Raspberri pi is connected to dht22 sensor via gpio ports and communicates serially. This sensor collects temperature and humidity data. 

    | Temperature | °C |
    |-------------|----|
    | Humidity| RH|

2. Connectivity

    - AWS IoT

      How is IoT core used in this application?
        - Register/Provision device (RPi, Web Server)
        - Connect device to cloud (RPi, Web Server)
        - Act as a MQTT broker to facilitate pub/sub between clients 
        - D2C - Device to cloud communication
        - C2D - Cloud to device communication
        - Perform various business actions using rules. Like, re-publish a message as an alert when certain criteria is met.
    - Mosquitto MQTT
        - Mosquitto mqtt broker is installed as a demon on RPi that runs in the background. 
        - Since the node device needs a way to communicate with RPi locally, the mqtt broker works well. 

        <br>

        MQTT Topic design pattern
        
        Topic Format: `<store_name>/<action_performed>/<device_id>/<communication_type>`

        | Topic Name | Topic |  Action | Broker |
        |------------|-------|---------|--------|
        | STREAM | `store/stream/deviceid` | Stream telemetry from device to cloud | AWS IoT|
        | BATCH | `store/batch/deviceid` | Batch send telemetry from device to cloud | AWS IoT|
        | ONDEMAND_REQ | `store/ondemand/deviceid/req` | Send request from web server to device for data | AWS IoT |
        | ONDEMAND_RES | `store/ondemand/deviceid/res` | Send data from device to web server on demand | AWS IoT |
        | ESP8266_REQ | `store/level/deviceid/req` | RPi requesting data from esp | Mosquitto MQTT |
        | ESP8266_RES | `store/level/deviceid/res` | Esp responding with data to RPi | Mosquitto MQTT |
        | ALERT | `store/alert/deviceid`| IoT rule publish alert | AWS IoT|


3. Telemetry

    - There are two ways telemetry is collected. One is as a result of on-demand request and the other being collected proactively at intervals. 
    - As soon as data is aggregated from sensors, it is written into a file on disk. 
    - At certain interval, this file is read, data is compressed and sent to upstream via a topic. 
    
    <br>

    On Demand request:
    
    The below sequence diagram demonstrates how an on-demand request is received, data is gathered and sent back. 

    <img src="https://lucid.app/publicSegments/view/3533a7b4-4682-4229-a615-9f1ece412fb8/image.png" alt="On-demand request" width="1000"/> 

    <br>

    Interval:

    RPi also collects data at 5s interval as shown below.
    
    <img src="https://lucid.app/publicSegments/view/61375c18-d71b-42e5-9c55-31ff04572832/image.png" alt="Interval request" width="1000"/> 

     <br>

    There is a sample data written in a file

    ```
       {
            "messageType":"response",
            "requestType": "ondemand"
            "deviceId":"deviceId",
            "humidity":"20",
            "temp":"10",
            "level":12.5,
            "ts":"20220316054923"
        } 
    ```

4. Rules and Alerts

    The below diagram represents how various rules are triggered based on data:

    <img src="https://lucid.app/publicSegments/view/62c1f96b-b4dc-41db-b3f6-c3c30eb996f9/image.png" alt="Rules and Alerts" width="1000"/>

    <br>

    - **PublishLevelAlert**
        
        This rule publishes a message to an alert topic `store/alert/deviceid` when the level is > 20cm. 
        ```
        SELECT level, deviceId, ts FROM 'store/stream/deviceid' WHERE level > 20
        ```

    - **PublishTempAlert**

        This rule publishes a message to an alert topic `store/alert/deviceid` when the temperature is > 29C. 
        ```
        SELECT temp, deviceId, ts FROM 'store/stream/deviceid' WHERE temp > 29
        ```

    - **StoreToDynamo**

        This rule stores streaming data to a dynamo db table
        ```
        SELECT deviceId, humidity, temp, level, ts FROM 'store/stream/deviceid'
        ```
    
    - **BatchTelemetryToLambda**

        This rule redirects batched telemetry to lambda function
        ```
        SELECT * FROM 'store/batch/deviceid'
        ```

#### Install and Run Instructions

1. Prepare the hardware setup as shown above.
2. Git clone this repo into RPi
3. Install dependencies `npm i`
4. Run `node main.js`

<br>

### Esp software

This code is written in Arudino to run on ESP 8266 to collect level data. 

#### Install and Run Instructions
1. Prepare the hardware setup as shown above.
2. Prepare Arduino IDE by downloading ESP8266 board
3. Connect to esp via usb and choose the correct port on the IDE
4. Install the required libraries from the library repo
5. Flash the hardware with the software

<br>

### Web server
[Adding view (button, notification box) to this app is WIP]

This app serves as a dashboard to interact with devices. 
On click of a button, an on-demand data request is sent to the device. The data is displayed instantaneous. 

It also receives alerts from IoT if certain rules are triggered.

#### Install and Run Instructions
1. Git clone the app
2. Install dependencies `npm i`
3. Run `node main.js`

<br>

### Lambda function
Lambda function is triggered by IoT rule when batch data comes in. The main function of this is to decompress the data and save this to a file in S3.