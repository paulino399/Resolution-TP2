///////////////////////////////////////////////////////////////////////////////
// On d�sire *recevoir* et afficher sur des leds une donn�e au format de 8 bits 
//en liaison s�rie de type RS232 de niveau TTL � 4800 bauds sans bit de parit� 
//et un bit de stop.
//Entr�e : PortC : RX=RC7 (pour info TX=RC6)
// Sortie : PortD avec 8 leds
///////////////////////////////////////////////////////////////////////////////
#include <18f4520.h>
#use delay (crystal=20MHz)
#use rs232(baud=4800, PARITY=N, BITS=8, STOP=1, xmit=PIN_C6, rcv=PIN_C7)
// D�claration des variables
unsigned int8 DATA; // variable DATA en 8 bits
unsigned int8 TEMPO; //variable TEMPO
// PROGRAMME PRINCIPAL
void main()
{

 TEMPO=10;
 //DATA=0x95;//0b10010101 Mot binaire � transmettre;
 while(TRUE)
 {
 DATA = getc(); // Lecture de la donn�e re�ue sur l'UART
 output_d(DATA) ; // Envoi de DATA sur les leds du PortD
  }
}
