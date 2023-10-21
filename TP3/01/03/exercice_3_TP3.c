#include <18f4520.h>
#use delay(crystal=20MHz)
#use i2c(master, sda=PIN_C3, scl=PIN_C4)

unsigned int8 pcf8574_address = 0b01000000; // Adresse du PCF8574 en mode �criture
unsigned int8 pcf8574_data;

// Fonction pour lire l'�tat des interrupteurs du PCF8574
unsigned int8 read_switches() {
    i2c_start();
    i2c_write(0b01000000); // Envoyer l'adresse du PCF8574 en mode �criture
    i2c_start();
    i2c_write(0b01000000 | 1); // Envoyer l'adresse du PCF8574 en mode lecture
    pcf8574_data = i2c_read(0); // Lire les donn�es et envoyer un NACK (0) � la fin
    i2c_stop();
    return pcf8574_data;
}

void main() {
    output_float(PIN_C3);
    output_float(PIN_C4);

    while (true) {
        // Lire l'�tat des interrupteurs depuis le PCF8574
        pcf8574_data = read_switches();

        // Afficher l'�tat des interrupteurs sur les LED
        output_b(pcf8574_data); // Affichez l'�tat des interrupteurs sur les LED de la carte EB004

        delay_ms(100); // Attendre un certain temps avant de lire � nouveau les interrupteurs
    }
}

