#include <18f4520.h>
#fuses HS, NOLVP
#use delay(crystal=8MHz)

// Configuration de la communication s�rie RS232
//
//////////////////////////////////////////////////////////////////////////////
//La carte PIC n�2 doit �mettre un mot de 8 bits (DATA2) image d'une tension 
//comprise entre 0V et 5V ET recevoirun mot de 8 bits (DATA1) en le visualisant
//sur 8 leds.
///////////////////////////////////////////////////////////////////////////////
#use rs232(baud=57600, parity=N, bits=8, stop=1, xmit=PIN_C6, rcv=PIN_C7)
// D�claration des variables
unsigned int8 DATA2; // Variable DATA2 en 8 bits

void main()
{
    DATA2 = 0;
    
    port_d(0);
    
    while (1)
    {
        if (kbhit()) // V�rifier si des donn�es sont disponibles en r�ception
        {
            DATA1 = getc(); // Lire DATA1 via RS232
            port_d(DATA1);
        }
        
        // G�n�rer DATA2 � partir de la tension ou d'autres sources
        // Assurez-vous de le mettre dans DATA2
        
        putc(DATA2); // �mettre DATA2 via RS232
    }
}

