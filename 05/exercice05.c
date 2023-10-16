////////////////////////////////////////////////////////////////////////////////
//On d�sire �mettre d'une 1�re carte PIC un mot de 8 bits g�n�r� � l'aide d'une
//carte avec 8 interrupteurs ET de recevoir sur une 2�me carte PIC ce mot de 
//8 bits qui sera visualis� � l'aide d'une carte avec 8 leds.
//On d�sire transmettre ce mot au format de 8 bits en liaison s�rie de type 
//RS232 de niveau TTL � 9600 bauds sans bit de parit� et un bit de stop.
////////////////////////////////////////////////////////////////////////////////
// R�ception d'une trame s�rie de type RS232 avec l'UART(AVEC interruption)
// Entr�e : PortC : RX=RC7 (pour info TX=RC6)
// Sortie : PortD avec 8 leds
#include <18f4520.h>
#use delay (crystal=8MHz)
#use rs232(baud=9600, PARITY=N, BITS=8, STOP=1, xmit=PIN_C6, rcv=PIN_C7)
// D�claration des variables
unsigned int16 TEMPO; // variable TEMPO en 16 bits
unsigned int8 DATA; // variable DATA en 8 bits
/////////////////////////////// INTERRUPTIONS /////////////////////////////////////////
// Interruption pour lire le buffer de l'UART (r�ception faite)
#INT_RDA // Interruption => Une donn�e a �t� re�ue
VOID RX_DATA (VOID)
{
 IF(kbhit()) // Test si le buffer (tampon) est plein
{ 
 DATA = getc(); // Lecture de la donn�e re�ue dans le buffer (tampon) de r�ception
 output_d(DATA) ; // Envoi de DATA sur les leds du PortD 
 }
}
// PROGRAMME PRINCIPAL
void main()
{
 DATA=0 ;
enable_interrupts(GLOBAL); // Activation des interruptions globales
enable_interrupts(INT_RDA); // Activation de l'interruption de r�ception de donn�e UART
 
 while(TRUE)
 {
   RX_DATA();
  }
}
