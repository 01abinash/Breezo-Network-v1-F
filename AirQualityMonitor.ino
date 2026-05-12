#include <Wire.h>
#include <U8g2lib.h>
#include <DHT.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiUdp.h>
#include <NTPClient.h>

const char* NODE_ID   = "NODE_001";
const char* SIGNATURE = "KJXG3pULqQnKhDPk3RgoRWz2XoWUcEfCrEM6z5uFM64fHcBPqLpywuzMP6UgmxGjGsfzDmJYH2c6UHVuXGYSsFb";
const float LATITUDE  = 28.209300351219984; 
const float LONGITUDE = 83.90802503721822;
const char* ssid      = "nsvilla_fpmdi";
const char* password  = "CLED033486";
const char* serverURL = "https://api.cka.one/api/v1/node/ingest";

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000);

#define DHTPIN             D4
#define DHTTYPE            DHT22
#define SDS_RX             D7
#define SDS_TX             D8
#define BUZZER_PIN         D5
#define LED_PIN            D0
#define AQI_BUZZ_THRESHOLD 100

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE, 5, 4);
SoftwareSerial sdsSerial(SDS_RX, SDS_TX);
DHT dht(DHTPIN, DHTTYPE);

float temperature = 0, humidity = 0, pm25Value = 0;
int   co2Value = 0, aqiPM25 = 0, aqiCO2 = 0, aqiValue = 0;

unsigned long lastRead = 0, lastSend = 0;
const long readEvery = 120000, sendEvery = 120000;

bool readSDS011() {
  unsigned long start = millis();
  while (millis() - start < 1000) {
    if (!sdsSerial.available()) continue;
    if (sdsSerial.peek() != 0xAA) { sdsSerial.read(); continue; }
    unsigned long wait = millis();
    while (sdsSerial.available() < 10 && millis() - wait < 500);
    if (sdsSerial.available() < 10) break;
    byte buf[10];
    for (int i = 0; i < 10; i++) buf[i] = sdsSerial.read();
    if (buf[0] != 0xAA || buf[1] != 0xC0 || buf[9] != 0xAB) continue;
    byte checksum = 0;
    for (int i = 2; i <= 7; i++) checksum += buf[i];
    if (checksum != buf[8]) continue;
    pm25Value = ((buf[3] << 8) | buf[2]) / 10.0;
    return true;
  }
  return false;
}

int epaAQI(float C, float Cl, float Ch, int Il, int Ih) {
  return (int)(((float)(Ih - Il) / (Ch - Cl)) * (C - Cl) + Il);
}

int aqiFromPM25(float p) {
  if (p <= 0)    return 0;
  if (p <= 12.0) return epaAQI(p,   0.0,  12.0,   0,  50);
  if (p <= 35.4) return epaAQI(p,  12.0,  35.4,  50, 100);
  if (p <= 55.4) return epaAQI(p,  35.4,  55.4, 100, 150);
  if (p <= 150.4)return epaAQI(p,  55.4, 150.4, 150, 200);
  if (p <= 250.4)return epaAQI(p, 150.4, 250.4, 200, 300);
  if (p <= 350.4)return epaAQI(p, 250.4, 350.4, 300, 400);
  if (p <= 500.4)return epaAQI(p, 350.4, 500.4, 400, 500);
  return 500;
}

int aqiFromCO2(int c) {
  if (c <= 400)  return 0;
  if (c <= 600)  return epaAQI(c,  400,  600,   0,  50);
  if (c <= 1000) return epaAQI(c,  600, 1000,  50, 100);
  if (c <= 2000) return epaAQI(c, 1000, 2000, 100, 150);
  if (c <= 3000) return epaAQI(c, 2000, 3000, 150, 200);
  if (c <= 5000) return epaAQI(c, 3000, 5000, 200, 300);
  return 300;
}

String getAQIStatus(int aqi) {
  if (aqi <= 50)  return "GOOD";
  if (aqi <= 100) return "MODERATE";
  if (aqi <= 150) return "UNHEALTHY";
  if (aqi <= 200) return "VERY BAD";
  if (aqi <= 300) return "HAZARDOUS";
  return "HAZARDOUS+";
}

int readMQ135() {
  return (int)map(analogRead(A0), 0, 1023, 400, 5000);
}

void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;
  readSDS011();
  co2Value = readMQ135();
  aqiPM25  = (pm25Value > 0) ? aqiFromPM25(pm25Value) : 0;
  aqiCO2   = aqiFromCO2(co2Value);
  aqiValue = max(aqiPM25, aqiCO2);
}

void handleBuzzer() {
  if (aqiValue > 200) {
    tone(BUZZER_PIN, 1500, 1000);
  } else if (aqiValue > 150) {
    for (int i = 0; i < 3; i++) { tone(BUZZER_PIN, 1200, 200); delay(350); }
    noTone(BUZZER_PIN);
  } else if (aqiValue > AQI_BUZZ_THRESHOLD) {
    tone(BUZZER_PIN, 1000, 150); delay(250);
    tone(BUZZER_PIN, 1000, 150); delay(250);
    noTone(BUZZER_PIN);
  } else {
    noTone(BUZZER_PIN);
  }
}

void handleLED() {
  digitalWrite(LED_PIN, WiFi.status() == WL_CONNECTED ? HIGH : (millis()/800)%2);
}

void oledMsg(const char* l1, const char* l2 = "") {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB10_tr);
  u8g2.drawStr(0, 24, l1);
  if (l2[0] != '\0') u8g2.drawStr(0, 44, l2);
  u8g2.sendBuffer();
  delay(1200);
}

void showOLED() {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x10_tr);
  u8g2.drawStr(22, 9, "BREEZO NETWORK v1");
  u8g2.drawHLine(0, 11, 128);
  u8g2.setFont(u8g2_font_logisoso22_tr);
  u8g2.drawStr(2, 36, String(aqiValue).c_str());
  u8g2.setFont(u8g2_font_6x10_tr);
  u8g2.drawStr(58, 24, getAQIStatus(aqiValue).c_str());
  u8g2.setFont(u8g2_font_5x7_tr);
  u8g2.drawStr(58, 36, ("T:"+String(temperature,1)+" H:"+String(humidity,0)+"%").c_str());
  u8g2.drawHLine(0, 39, 128);
  u8g2.setFont(u8g2_font_6x10_tr);
  u8g2.drawStr(0,  50, "PM:");
  u8g2.drawStr(18, 50, String(pm25Value, 1).c_str());
  u8g2.drawStr(65, 50, "CO2:");
  u8g2.drawStr(89, 50, String(co2Value).c_str());
  int bw = constrain(map(aqiValue, 0, 500, 0, 124), 0, 124);
  u8g2.drawFrame(0, 54, 128, 10);
  u8g2.drawBox(2, 56, bw, 6);
  u8g2.sendBuffer();
}

void sendToDashboard() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Not connected");
    return;
  }
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();
  String json = "{";
  json += "\"nodeId\":\""    + String(NODE_ID)   + "\",";
  json += "\"signature\":\"" + String(SIGNATURE) + "\",";
  json += "\"timestamp\":"   + String(epochTime) + ",";
  json += "\"payload\":{";
  json += "\"temperature\":"  + String(temperature, 1) + ",";
  json += "\"humidity\":"     + String(humidity, 1)    + ",";
  json += "\"pm25\":"         + String(pm25Value, 1)   + ",";
  json += "\"pm10\":"         + String((float)co2Value, 1) + ",";
  json += "\"aqi\":"          + String(aqiValue)       + ",";
  json += "\"aqiLevel\":\""   + getAQIStatus(aqiValue) + "\",";
  json += "\"location\":{\"lat\":" + String(LATITUDE, 6) + ",\"lng\":" + String(LONGITUDE, 6) + "}";
  json += "}}";
  Serial.println("\n[JSON]: " + json);
  Serial.print("[Timestamp]: "); Serial.println(epochTime);
  BearSSL::WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000);
  int code = http.POST(json);
  String reply = http.getString();
  http.end();
  Serial.print("[HTTP Code]: ");    Serial.println(code);
  Serial.print("[Server Reply]: "); Serial.println(reply);

  // ── Print current data in clean JSON format ──
  Serial.println("\n[CURRENT DATA]:");
  Serial.println("{");
  Serial.println("  \"nodeId\"       : \"" + String(NODE_ID) + "\",");
  Serial.println("  \"timestamp\"    : " + String(epochTime) + ",");
  Serial.println("  \"temperature\"  : " + String(temperature, 1) + ",");
  Serial.println("  \"humidity\"     : " + String(humidity, 1) + ",");
  Serial.println("  \"pm25\"         : " + String(pm25Value, 1) + ",");
  Serial.println("  \"co2\"          : " + String(co2Value) + ",");
  Serial.println("  \"aqi\"          : " + String(aqiValue) + ",");
  Serial.println("  \"aqiLevel\"     : \"" + getAQIStatus(aqiValue) + "\",");
  Serial.println("  \"location\"     : {");
  Serial.println("    \"lat\"        : " + String(LATITUDE, 6) + ",");
  Serial.println("    \"lng\"        : " + String(LONGITUDE, 6));
  Serial.println("  }");
  Serial.println("}");
  Serial.println("─────────────────────────────");
}

void setup() {
  Serial.begin(115200);
  sdsSerial.begin(9600);
  delay(100);
  while (sdsSerial.available()) sdsSerial.read();
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  noTone(BUZZER_PIN);
  u8g2.begin();
  oledMsg("BREEZO", "NETWORK");
  dht.begin();
  oledMsg("DHT22 OK", "Temp+Humidity");
  oledMsg("SDS011 OK", "PM2.5 Sensor");
  delay(10000);
  oledMsg("SDS011 Ready", "Fan warmed up");
  oledMsg("Connecting...", ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 24) {
    delay(500); Serial.print("."); tries++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("[WiFi] Connected: " + WiFi.localIP().toString());
    oledMsg("WiFi OK!", WiFi.localIP().toString().c_str());
    timeClient.begin();
    timeClient.setUpdateInterval(60000);
    Serial.print("[NTP] Syncing");
    for (int i = 0; i < 10; i++) {
      if (timeClient.forceUpdate()) {
        Serial.println(" OK! Time: " + String(timeClient.getEpochTime()));
        break;
      }
      delay(1000); Serial.print(".");
    }
    oledMsg("Time synced!", "NTP OK");
  } else {
    Serial.println("[WiFi] Failed");
    oledMsg("WiFi failed.", "Offline mode.");
  }
  tone(BUZZER_PIN, 800, 120); delay(200);
  tone(BUZZER_PIN, 1100, 120); delay(250);
  noTone(BUZZER_PIN);
  oledMsg("Ready!", "Starting...");
}

void loop() {
  unsigned long now = millis();
  if (now - lastRead >= readEvery) {
    readSensors();
    showOLED();
    handleBuzzer();
    handleLED();
    Serial.print("T:"); Serial.print(temperature,1);
    Serial.print(" H:"); Serial.print(humidity,1);
    Serial.print(" PM:"); Serial.print(pm25Value,1);
    Serial.print(" CO2:"); Serial.print(co2Value);
    Serial.print(" AQI:"); Serial.println(aqiValue);
    lastRead = now;
  }
  if (now - lastSend >= sendEvery) {
    sendToDashboard();
    lastSend = now;
  }
}