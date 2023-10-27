////////////////////////////////////////////////////////////////////////////////////////////
//Cahier des charges : On désire faire clignoter à 2Hz les 8 leds de la carte 8
//LEDS connectée au circuit PCF8574.
#include <18f4520.h>
#use delay(crystal=20MHz)
#use i2c(master, sda=PIN_C3, scl=PIN_C4)
unsigned int8 DATA0;
