// Ecriture dans la mémoire EEPROM 24LC64
// sorties : PortC : RC4... = SCL et RC3... = SDA
#include <18f4520.h>
#use delay(crystal=20MHz)
#use i2c(master, sda=PIN_C3, scl=PIN_C4) // configuration du bus I2C en MAITRE avec utilisation du module I2C interne
unsigned int8 DATA0,DATA1;
unsigned int16 AD_MEM;
void main()
{
output_float(PIN_C3); // mise en sortie collecteur ouvert de la broche RC...
output_float(PIN_C4); // mise en sortie collecteur ouvert de la broche RC...
AD_MEM =0x40;// 0x01F0; // adresse mémoire où l'on veut stocker la donnée
DATA0 = 90; // donnée à stocker
// Ecriture en mémoire à l'adresse AD_MEM de la donnée DATA0

  //le code pour le cahier de charge 1 on doit le modifier de fa�on � l'adaputeur au codigo r�el
while(true)
{
i2c_start();
i2c_write(0b01000000); //i2c_write(0b10100000);  // CONTROL BYTE = adresse 0b1010000 + 0 pour l'écriture (=0xA0=160)
i2c_write(DATA0); // �criture de la donn�e � l'adresse d�finie auparavant
i2c_stop();
output_portF(DATA0);
delay_ms(10);
}
}
