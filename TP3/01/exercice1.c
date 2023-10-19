// Ecriture dans la m�moire EEPROM 24LC64
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
AD_MEM = 0x01F0; // adresse m�moire o� l'on veut stocker la donn�e
DATA0 = 75; // donn�e � stocker
// Ecriture en m�moire � l'adresse AD_MEM de la donn�e DATA0
i2c_start();
i2c_write(0b10100000); // CONTROL BYTE = adresse 0b1010000 + 0 pour l'�criture (=0xA0=160)
i2c_write(AD_MEM>>8); // ADRESS HIGH BYTE (ici 0x01)
i2c_write(AD_MEM); // ADRESS LOW BYTE (ici 0xF0)
i2c_write(DATA0); // �criture de la donn�e � l'adresse d�finie auparavant
i2c_stop();
while(true)
{
//
}
}
