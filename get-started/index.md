# Getting Started
// Define the BCD inputs and the segment outputs
int BCD_A = 2; // Pin 7 on CD4511
int BCD_B = 3; // Pin 1 on CD4511
int BCD_C = 4; // Pin 2 on CD4511
int BCD_D = 5; // Pin 6 on CD4511

void setup() {
  // Set all the BCD pins to output
  pinMode(BCD_A, OUTPUT);
  pinMode(BCD_B, OUTPUT);
  pinMode(BCD_C, OUTPUT);
  pinMode(BCD_D, OUTPUT);
}

void loop() {
  // Loop through numbers 0-9 and display on 7-segment
  for (int number = 0; number < 10; number++) {
    displayNumber(number);
    delay(1000); // Wait for 1 second
  }
}

void displayNumber(int number) {
  // Use bitwise operators to isolate each bit of the number
  digitalWrite(BCD_A, number & 0x01);
  digitalWrite(BCD_B, number & 0x02);
  digitalWrite(BCD_C, number & 0x04);
  digitalWrite(BCD_D, number & 0x08);
}
