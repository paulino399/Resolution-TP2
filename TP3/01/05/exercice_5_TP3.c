/////////////////////////////////////////////////////////////////////////////
//On d�sire toujours afficher sur les leds d'une carte EB004 (LED board) 
//connect�e � un port du MCU, l'�tat desinterrupteurs de la carte avec 8 INTER 
//connect�e au circuit PCF8574. MAIS on vous demande de cr�er une fonction 
//� input_portF(...) � qui permet de recevoir un octet sur le portcr�� par le
//circuit PCF8574.
///////////////////////////////////////////////////////////////////////////////
#include <18f4520.h>
#use delay(crystal=20MHz)
#use i2c(master, sda=PIN_C3, scl=PIN_C4)
unsigned int8 DATA0;
