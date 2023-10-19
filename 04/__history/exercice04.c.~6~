///////////////////////////////////////////////////////////////////////////////
// On désire recevoir et afficher sur des leds une donnée au format de 8 bits 
//en liaison série de type RS232 de niveau TTL à 4800 bauds sans bit de parité 
//et un bit de stop.
///////////////////////////////////////////////////////////////////////////////
#include <18f4520.h>
#use delay (crystal=20MHz)
#use rs232(baud=4800, PARITY=N, BITS=8, STOP=1, xmit=PIN_C6, rcv=PIN_C7)
// Déclaration des variables
unsigned int8 DATA; // variable DATA en 8 bits
// PROGRAMME PRINCIPAL
void main()
{
 DATA=0; //0b01001010; // Mot binaire à transmettre;
 while(TRUE)
 {
 DATA = getc(); // Lecture de la donnée reçue sur l'UART
 output_d(DATA) ; // Envoi de DATA sur les leds du PortD 
  }
}
