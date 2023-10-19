#include <18f4520.h>
#fuses HS, NOLVP
#use delay(crystal=8MHz)

// Configuration de la communication série RS232
#use rs232(baud=57600, parity=N, bits=8, stop=1, xmit=PIN_C6, rcv=PIN_C7)

// Déclaration des variables
unsigned int8 DATA1; // Variable DATA1 en 8 bits

void main()
{
    DATA1 = 0;
    
    // Initialiser votre LCD ici
    
    while (1)
    {
        // Lire DATA2 depuis les interrupteurs ou d'autres sources
        // Assurez-vous de le mettre dans DATA2
        
        putc(DATA2); // Émettre DATA2 via RS232
        
        // Afficher DATA1 sur le LCD (vous devez écrire le code pour cette partie)
    }
}

