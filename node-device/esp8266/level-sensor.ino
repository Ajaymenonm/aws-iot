#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

/*===============Ultrasonic======================*/
// define sound velocity in cm/uS
#define SOUND_VELOCITY 0.034
#define CM_TO_INCH 0.393701
//#define LED 2

long duration;
float distanceCm;

const int trigPin = 12;
const int echoPin = 14;
/*=============================================*/

/*===============Mqtt======================*/
const char *mqttServer = "192.168.0.25"; // ip of device running mqtt broker
const int mqttPort = 1883;
WiFiClient espClient;
PubSubClient client(espClient);
/*=============================================*/

void initWifi()
{
    WiFi.begin("ssid", "pass");
    Serial.print("...connecting to WiFi");

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();

    Serial.print("wifi connected, ip address: ");
    Serial.println(WiFi.localIP());
}

void initPubSub()
{
    client.setServer(mqttServer, mqttPort);
    client.setCallback(callback);

    while (!client.connected())
    {
        Serial.println("...connecting to MQTT");

        if (client.connect("level"))
        {
            Serial.println("mqtt connected");
        }
        else
        {
            Serial.print("failed with state ");
            Serial.print(client.state());
            delay(2000);
        }
    }

    // subscribe to receive data requests
    client.subscribe("store/level/deviceid/req");

    if (!client.subscribe("store/level/deviceid/req"))
    {
        Serial.println("not subscribed");
    }
}

void setup()
{
    Serial.begin(115200); // starts the serial communication
    delay(10);
    Serial.println("begin");

    initWifi();
    Serial.println("wifi initialized");

    initPubSub();
    //  pinMode(LED, OUTPUT);

    pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
    pinMode(echoPin, INPUT);  // Sets the echoPin as an Input
}

void callback(char *topic, byte *payload, unsigned int length)
{

    Serial.println();
    Serial.print("Message arrived in topic: ");
    Serial.println(topic);

    Serial.print("Message:");
    for (int i = 0; i < length; i++)
    {
        Serial.print((char)payload[i]);
    }

    // clears the trigPin
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    // sets the trigPin on HIGH state for 10 micro seconds
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    // reads the echoPin, returns the sound wave travel time in microseconds
    duration = pulseIn(echoPin, HIGH);

    // calculate the distance
    distanceCm = duration * SOUND_VELOCITY / 2;

    // prints the distance on the serial monitor
    Serial.println();
    Serial.print("Distance (cm): ");
    Serial.println(distanceCm);

    StaticJsonBuffer<300> JSONbuffer;
    JsonObject &JSONencoder = JSONbuffer.createObject();

    JsonObject &root = JSONbuffer.parseObject(payload);
    const char *requesttype = root["requestType"];

    JSONencoder["requestType"] = requesttype;
    JSONencoder["level"] = distanceCm;

    char JSONmessageBuffer[100];
    JSONencoder.printTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
    Serial.println("Sending message to MQTT topic..");
    Serial.println(JSONmessageBuffer);

    client.publish("store/level/deviceid/res", JSONmessageBuffer);

    //  if (requesttype == "ondemand") {
    //    digitalWrite(LED, LOW);
    //    delayMicroseconds(2);
    //    digitalWrite(LED, HIGH);
    //    delay(1000);
    //    digitalWrite(LED, LOW);
    //    delay(1000);
    //    digitalWrite(LED, HIGH);
    //    delay(1000);
    //    digitalWrite(LED, LOW);
    //  }

    Serial.println();
    Serial.println("-----------------------");
}

void loop()
{
    if (!client.connected())
    {
        Serial.println("mqtt not connected");
    }

    client.loop();
}
