///////////////////////////////////////////////////////////////////////////////
//On d�sire toujours allumer les leds 1, 3, 4 et 6 sur la carte 8 LEDS par 
//l'interm�diaire d'un bus I2C et le composantPCF8574.MAIS on vous demande de 
//cr�er une fonction � output_portF(...) � qui permet d'envoyer un octet sur le 
//port de 8 bits cr�� par l'interm�diaire du circuit PCF8574.
///////////////////////////////////////////////////////////////////////////////

#include <18f4520.h>
#use delay(crystal=20MHz)
#use i2c(master, sda=PIN_C3, scl=PIN_C4)

unsigned int8 DATA;

// Fonction pour envoyer un octet au PCF8574
void output_portF(unsigned int8 DATA) {
    i2c_start();
    i2c_write(0b01000000); // Adresse du PCF8574 en mode �criture
    i2c_write(DATA);       // Envoi de l'octet de donn�es
    i2c_stop();
}

void main() {
    output_float(PIN_C3);
    output_float(PIN_C4);
    

    while (true) {
        // Appel de la fonction pour envoyer l'octet vers le PCF8574
        DATA= input_b();
        output_portF(DATA); // Configuration pour allumer les LEDs 1, 3, 4 et 6
        delay_ms(10);
    }
}

