#include <18f4520.h>
#use delay(crystal=20MHz)
#use i2c(master, sda=PIN_C3, scl=PIN_C4)

unsigned int8 DATA0;
unsigned int16 AD_MEM;

// Fonction pour envoyer un octet au PCF8574
void output_portF(unsigned int8 data) {
    i2c_start();
    i2c_write(0b01000000); // Adresse du PCF8574 en mode �criture
    i2c_write(data);       // Envoi de l'octet de donn�es
    i2c_stop();
}

void main() {
    output_float(PIN_C3);
    output_float(PIN_C4);
    AD_MEM = 0x40;
    DATA0 = 90;

    while (true) {
        // Appel de la fonction pour envoyer l'octet vers le PCF8574
        output_portF(0b10100101); // Configuration pour allumer les LEDs 1, 3, 4 et 6
        delay_ms(10);
    }
}

