#include <18f4520.h>
#fuses HS, NOLVP
#use delay(crystal=8MHz)

// Configuration de la communication s�rie RS232
#use rs232(baud=57600, parity=N, bits=8, stop=1, xmit=PIN_C6, rcv=PIN_C7)

// D�claration des variables
unsigned int8 DATA2; // Variable DATA2 en 8 bits

void main()
{
    DATA2 = 0;
    
    // Initialiser vos LEDs ici
    
    while (1)
    {
        if (kbhit()) // V�rifier si des donn�es sont disponibles en r�ception
        {
            DATA1 = getc(); // Lire DATA1 via RS232
            // Afficher DATA1 sur les LEDs (vous devez �crire le code pour cette partie)
        }
        
        // G�n�rer DATA2 � partir de la tension ou d'autres sources
        // Assurez-vous de le mettre dans DATA2
        
        putc(DATA2); // �mettre DATA2 via RS232
    }
}

