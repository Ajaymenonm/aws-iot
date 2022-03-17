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
    - Runs a [(Mosquitto)](https://mosquitto.org/) MQTT broker as a demon service.
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

    How is IoT core used in this application?
    - Register/Provision device (RPi, Web Server)
    - Connect device to cloud (RPi, Web Server)
    - Act as a MQTT broker to facilitate pub/sub between clients 
    - D2C - Device to cloud communication
    - C2D - Cloud to device communication
    - Perform various business actions using rules. Like, re-publish a message as an alert when certain criteria is met.

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


