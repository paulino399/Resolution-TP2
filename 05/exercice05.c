////////////////////////////////////////////////////////////////////////////////
//On désire émettre d'une 1ère carte PIC un mot de 8 bits généré à l'aide d'une
//carte avec 8 interrupteurs ET de recevoir sur une 2ème carte PIC ce mot de 
//8 bits qui sera visualisé à l'aide d'une carte avec 8 leds.
//On désire transmettre ce mot au format de 8 bits en liaison série de type 
//RS232 de niveau TTL à 9600 bauds sans bit de parité et un bit de stop.
////////////////////////////////////////////////////////////////////////////////
// Réception d'une trame série de type RS232 avec l'UART(AVEC interruption)
// Entrée : PortC : RX=RC7 (pour info TX=RC6)
// Sortie : PortD avec 8 leds
#include <18f4520.h>
#use delay (crystal=8MHz)
#use rs232(baud=9600, PARITY=N, BITS=8, STOP=1, xmit=PIN_C6, rcv=PIN_C7)
// Déclaration des variables
unsigned int16 TEMPO; // variable TEMPO en 16 bits
unsigned int8 DATA; // variable DATA en 8 bits
/////////////////////////////// INTERRUPTIONS /////////////////////////////////////////
// Interruption pour lire le buffer de l'UART (réception faite)
#INT_RDA // Interruption => Une donnée a été reçue
VOID RX_DATA (VOID)
{
 IF(kbhit()) // Test si le buffer (tampon) est plein
{ 
 DATA = getc(); // Lecture de la donnée reçue dans le buffer (tampon) de réception
 output_d(DATA) ; // Envoi de DATA sur les leds du PortD 
 }
}
// PROGRAMME PRINCIPAL
void main()
{
 DATA=0 ;
enable_interrupts(GLOBAL); // Activation des interruptions globales
enable_interrupts(INT_RDA); // Activation de l'interruption de réception de donnée UART
 
 while(TRUE)
 {
   RX_DATA();
  }
}
