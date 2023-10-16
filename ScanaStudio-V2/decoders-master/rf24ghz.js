/*
*************************************************************************************

							SCANASTUDIO 2 DECODER

The following commented block allows some related informations to be displayed online

<DESCRIPTION>

	RF (Radio Frenquency) 2.4 GHz Protocol Decoder.

</DESCRIPTION>
<RELEASE_NOTES>

		V1.0:  Initial release

</RELEASE_NOTES>
<AUTHOR_URL>

	mailto:a.debien@ikalogic.com

</AUTHOR_URL></AUTHOR_URL>

<HELP_URL>



</HELP_URL>

*************************************************************************************
*/

/* The decoder name as it will apear to the users of this script 
*/
function get_dec_name()
{
	return "RF (2.4 GHZ)";
}

/* The decoder version 
*/
function get_dec_ver()
{
	return "1.0";
}

/* Author 
*/
function get_dec_auth()
{
	return "IKALOGIC";
}

/* Graphical user interface for this decoder 
*/
function gui()
{
	ui_clear();	// clean up the User interface before drawing a new one.
		
	ui_add_txt_combo("uiDevice", "Device");
	for (var k in DEVICE_TABLE)
    {
        var dev = DEVICE_TABLE[k];

        if (k == 0)
        {
            ui_add_item_to_txt_combo(dev.str, true);
        }
        else
        {
            ui_add_item_to_txt_combo(dev.str);
        }
    }
		
	ui_add_ch_selector("ch_mosi","MOSI (Master Out) Line","MOSI");
	ui_add_ch_selector("ch_miso","MISO (Slave Out) Line","MISO");
	ui_add_ch_selector("ch_clk","CLOCK Line","SCLK");
	ui_add_ch_selector("ch_cs","Chip Select (Slave select)","CS");
	ui_add_ch_selector("ch_ce","Chip Enable","CE");
	
	ui_add_num_combo("plength","Payload length", 1, 32, 32);	 	
			
	ui_add_txt_combo("n_to_decode","Decode");
		ui_add_item_to_txt_combo("Only first 500 data words");
		ui_add_item_to_txt_combo("Only first 1000 data words");
		ui_add_item_to_txt_combo("Only first 5000 data words",true);
		ui_add_item_to_txt_combo("Only first 10000 data words");
		ui_add_item_to_txt_combo("Everything");
				
}

var DEVICE_TABLE =
{
	nRF24L01_plus	:	{uiId: 0, grp: 1, str: "nRF24L01+"},
	nRF24L01		:	{uiId: 1, grp: 1, str: "nRF24L01"}
}

var SPI_COMMAND_TABLE =
{
	R_REGISTER		: 0x00,
	W_REGISTER		: 0x20,
	R_RX_PAYLOAD	: 0x61,
	W_TX_PAYLOAD	: 0xA0,
	FLUSH_TX		: 0xE1,
	FLUSH_RX		: 0xE2,
	REUSE_TX_PL		: 0xE3,
	ACTIVATE		: 0x50,
	R_RX_PL_WILD	: 0x60,
	NOP				: 0xFF,
	W_TX_PAYLOAD_NO_ACK	: 0xB0
	
}

var RF_REGISTER_TABLE =
["CONFIG","EN AA","EN RXADDR", "SETUP AW","SETUP RETR","RF CH","RF_SETUP","STATUS","OBSERVE TX","RPD","RX ADDR P0","RX ADDR P1","RX ADDR P2",
 "RX ADDR P3","RX ADDR P4","RX ADDR P5","TX ADDR","RX PW P0","RX PW P1","RX PW P2","RX PW P3","RX PW P4","RX PW P5","FIFO_STATUS","DYNPD",
 "FEATURE"]

var tab_data = [];

/* Global variables
*/
var objCnt;
var decBuf;
var RFdata;
var Device;
var data_registre = false;
var data_payload = false;
var cnt_data = 0;
var no_mosi = false;
var start_pkt = true;
var end_pkt = false;
var packet_title = "";
var packet_data = "";
var tmp_int = 0;
var payload_rx = false;
var registre_rx = false;
var command = false;
var data_commmand_rx = false;
var data_commmand_tx = false;
var register_rx = "";
var register_tx = "";

var PKT_COLOR_DATA_MOSI;
var PKT_COLOR_DATA_MISO;
var PKT_COLOR_DATA_STATUS_TITLE;
var PKT_COLOR_DATA;
var PKT_COLOR_DATA_PAYLOAD_TITLE;

function decode()
{
	get_ui_vals();                // Update the content of user interface variables
	clear_dec_items();            // Clears all the the decoder items and its content
	
	PKT_COLOR_DATA_MOSI = get_ch_light_color(ch_mosi);
	PKT_COLOR_DATA_MISO = get_ch_light_color(ch_miso);
	PKT_COLOR_DATA = light_colors.gray;
	PKT_COLOR_DATA_STATUS_TITLE = dark_colors.blue;
	PKT_COLOR_DATA_PAYLOAD_TITLE = light_colors.green;
	
	if (!check_scanastudio_support())
    {
        add_to_err_log("Please update your ScanaStudio software to the latest version to use this decoder");
        return;
    }

	for (var k in DEVICE_TABLE)
    {
        var dev = DEVICE_TABLE[k];

        if (dev.uiId == uiDevice)
        {
            Device = dev;
        }
    }

	plength += 1;

	decBuf = pre_decode("spi.js", "ch_mosi = " + ch_mosi + ";" + "ch_miso = " + ch_miso + ";" + "ch_clk = " + ch_clk + ";" + 
						"ch_cs = " + ch_cs + ";" + "nbits = " + 7 + ";" + "order = " + 0 + ";" + "cpol = " + 0 + ";" + 
						"cpha = " + 0 + ";" + "cspol = " + 0 + ";" + "opt = " + 0 + ";" + "opt_cs = " + 0 + ";" + 
						"n_to_decode = " + n_to_decode);
						
						
	objCnt = 0;
	
	var t = trs_get_first(ch_cs);
	var t_end =  new transition(0,0);
	
	var truc = 0x46;
	debug(charCodeAt(truc));
	
	while(decBuf.length > objCnt)
	{
		RFdata = decBuf[objCnt];
		objCnt++;
		
		if(start_pkt == true)
		{
			pkt_start("RF");
			start_pkt = false;
		}

		if(RFdata.k == 0)
		{
			no_mosi = false;
			dec_item_new(ch_mosi, RFdata.start_s, RFdata.end_s);
			hex_add_byte(ch_mosi, -1, -1, RFdata.data);
		
			Decode_MOSI();
		}
		else if (no_mosi == false)
		{
			dec_item_new(ch_miso, RFdata.start_s, RFdata.end_s);
			hex_add_byte(ch_miso, -1, -1, RFdata.data);
			Decode_MISO();
		}
		else if ((no_mosi == true) && (end_pkt == true))
		{
			start_pkt = true;
			pkt_end();
			end_pkt = false;
		}
	}
	
}

/*
*/
function int_to_str_hex (num) 
{
	var temp = "0x";

	if (num < 0x10)
	{
		temp += "0";
	}

	temp += num.toString(16).toUpperCase();

	return temp;
}

/*
*/
function hex_to_str_bin (num) 
{
	var temp = "";
	var inc = 0x80;
	var no_first = false;
	
	while(inc < 0x81)
	{
		if(num&inc)
		{
			temp += "1";
			no_first = true;
		}
		else if (no_first == true)
		{
			temp +="0";
		}
		
		inc = inc>>1;
		if(inc == 0x00)
		{
			inc = 0x82;
		}
	}
	if (temp == "")
	{
		temp += "0";
	}
	
	return temp;
}

/*
*/
function check_scanastudio_support()
{
    if (typeof(pkt_start) != "undefined")
    { 
        return true;
    }
    else
    {
        return false;
    }
}


/*
*/
function get_ch_light_color (k)
{
    var chColor = get_ch_color(k);

    chColor.r = (chColor.r * 1 + 255 * 3) / 4;
    chColor.g = (chColor.g * 1 + 255 * 3) / 4;
    chColor.b = (chColor.b * 1 + 255 * 3) / 4;

    return chColor;
}

function Decode_MOSI()
{
	var i;
	command = false;

	if((data_registre == false) && (data_payload == false))
	{
		if((RFdata.data&0xE0)== SPI_COMMAND_TABLE.R_REGISTER)
		{
			data_registre = true;
			packet_title = "READ ";
			for (i= 0x00; i<0x1E; i++)
			{
				if ((RFdata.data&0x1F) == i)
				{
					dec_item_add_pre_text("READ "+RF_REGISTER_TABLE[i]+" REGISTER");
					dec_item_add_pre_text("READ REGISTER");
					dec_item_add_pre_text("R REGISTER");
					dec_item_add_pre_text("R REG");
					packet_title += RF_REGISTER_TABLE[i]+" REGISTER";
					register_rx += RF_REGISTER_TABLE[i];
				}
			}
			registre_rx =true;
			command = true;
		}
		else if (((RFdata.data&0xE0) == SPI_COMMAND_TABLE.W_REGISTER))
		{
			data_registre = true;
			packet_title = "WRITE ";
			for (i= 0x00; i<0x1E; i++)
			{
				if ((RFdata.data&0x1F) == i)
				{
					dec_item_add_pre_text("WRITE "+RF_REGISTER_TABLE[i]+ " REGISTER");
					dec_item_add_pre_text("WRITE REGISTER");
					dec_item_add_pre_text("W REGISTER");
					dec_item_add_pre_text("W REG");
					packet_title += RF_REGISTER_TABLE[i]+" REGISTER";
					register_tx = RF_REGISTER_TABLE[i];
					data_commmand_tx = true;
				}
			}
			registre_rx = false;
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.R_RX_PAYLOAD)
		{
			dec_item_add_pre_text("READ RX PAYLOAD");
			dec_item_add_pre_text("R RX PAYLOAD");
			dec_item_add_pre_text("R PAYLOAD");
			dec_item_add_pre_text("R PL");
			dec_item_add_pre_text("RP");
			data_payload = true;
			payload_rx = true;
			packet_title = "READ RX PAYLOAD";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.W_TX_PAYLOAD)
		{
			dec_item_add_pre_text("WRITE TX PAYLOAD");
			dec_item_add_pre_text("W TX PAYLOAD");
			dec_item_add_pre_text("W PAYLOAD");
			dec_item_add_pre_text("W PL");
			dec_item_add_pre_text("WP");
			data_payload = true;
			payload_rx = false;
			packet_title = "WRITE TX PAYLOAD";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.FLUSH_TX)
		{
			dec_item_add_pre_text("FLUSH TX");
			dec_item_add_pre_text("FTX");
			end_pkt = true;
			packet_title = "FLUSH TX";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.FLUSH_RX)
		{
			dec_item_add_pre_text("FLUSH RX");
			dec_item_add_pre_text("FRX");
			end_pkt = true;
			packet_title = "FLUSH RX";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.REUSE_TX_PL)
		{
			dec_item_add_pre_text("REUSE TX PAYLOAD");
			dec_item_add_pre_text("REUSE TX PL");
			dec_item_add_pre_text("REUSE TX");
			dec_item_add_pre_text("RTX");
			end_pkt = true;
			packet_title = "REUSE TX PL";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.ACTIVATE)
		{
			dec_item_add_pre_text("ACTIVATE");
			dec_item_add_pre_text("ACTV");
			end_pkt = true;
			packet_title = "ACTIVATE";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.R_RX_PL_WILD)
		{
			dec_item_add_pre_text("READ RX PAYLOAD WILD");
			dec_item_add_pre_text("R RX PL WILD");
			dec_item_add_pre_text("R PL WILD");
			dec_item_add_pre_text("RPW");
			end_pkt = true;
			packet_title = "R RX PL WILD";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.NOP)
		{
			dec_item_add_pre_text("NOP");
			end_pkt = true;
			packet_title = "NOP";
			command = true;
		}
		else if (RFdata.data == SPI_COMMAND_TABLE.W_TX_PAYLOAD_NO_ACK)
		{
			dec_item_add_pre_text("WRITE TX PAYLOAD NO ACK");
			dec_item_add_pre_text("W TX PAYLOAD NO ACK");
			dec_item_add_pre_text("W PAYLOAD NO ACK");
			dec_item_add_pre_text("W PAYLOAD !ACK");
			dec_item_add_pre_text("W PL !ACK");
			dec_item_add_pre_text("WPL!A");
			dec_item_add_pre_text("WP!");
			end_pkt = true;
			packet_title = "W TX PAYLOAD NO ACK";
			command = true;
		}
	}
	else if (data_payload == true)
	{	
		if(payload_rx == false)
		{
			no_mosi = true;
			tmp_int = int_to_str_hex(+RFdata.data);	
			tab_data[cnt_data] = tmp_int;
			//pkt_add_item(-1,-1, tmp_int, "",PKT_COLOR_DATA_MOSI,PKT_COLOR_DATA_MISO,true);
		}
		else
		{
			tmp_int = int_to_str_hex(+RFdata.data);	
			tab_data[cnt_data] = tmp_int;
			//packet_title = tmp_int;
		}
		
		cnt_data++;
		if(cnt_data == (plength))
		{
			cnt_data = 0;
			payload_packet();
			data_payload = false;
			end_pkt = true;
		}
		
		dec_item_add_data(RFdata.data);	
	}
	else if (data_registre == true)
	{
		if(registre_rx == false)
		{
			tmp_int = int_to_str_hex(+RFdata.data);
			pkt_add_item(-1,-1, tmp_int, "",PKT_COLOR_DATA_MOSI,PKT_COLOR_DATA_MISO,true);
			no_mosi = true;
			
		}
		else
		{
			tmp_int = int_to_str_hex(+RFdata.data);
			packet_title = tmp_int;
			data_commmand_rx = true;
		}
		if (data_commmand_tx == true)
		{
			dec_item_add_pre_text(register_tx+" = ");
			data_commmand_tx = false;
		}
		
		data_registre = false;
		end_pkt = true;
		dec_item_add_data(RFdata.data);
	}
}

function Decode_MISO()
{
	var packet_pipe;

	dec_item_add_data(RFdata.data);
	tmp_int = int_to_str_hex(+RFdata.data);
	
	pkt_add_item(-1,-1, packet_title, tmp_int,PKT_COLOR_DATA_MOSI,PKT_COLOR_DATA_MISO,true);
		
	if(command == true)
	{	
		dec_item_add_pre_text("STATUS = ");
		
		pkt_start("Status register bits description");
			pkt_add_item(-1,-1, "Reserved", "0", PKT_COLOR_DATA_STATUS_TITLE,PKT_COLOR_DATA,true);
			pkt_add_item(-1,-1, "Data Read RX Fifo", (RFdata.data&0x40)>>6, PKT_COLOR_DATA_STATUS_TITLE,PKT_COLOR_DATA,true);
			pkt_add_item(-1,-1, "Data Send TX Fifo", (RFdata.data&0x20)>>5, PKT_COLOR_DATA_STATUS_TITLE,PKT_COLOR_DATA,true);
			pkt_add_item(-1,-1, "Max numb of TX retransmits interrupt", (RFdata.data&0x10)>>4, PKT_COLOR_DATA_STATUS_TITLE,PKT_COLOR_DATA,true);
			packet_pipe = hex_to_str_bin((+RFdata.data&0x0E)>>1);
			pkt_add_item(-1,-1, "Data pipe numb for pl availabe", packet_pipe, PKT_COLOR_DATA_STATUS_TITLE,PKT_COLOR_DATA,true);
			pkt_add_item(-1,-1, "TX Fifo full flag", (RFdata.data&0x01), PKT_COLOR_DATA_STATUS_TITLE,PKT_COLOR_DATA,true);
		pkt_end();
	}
	else if (data_commmand_rx == true)
	{
		dec_item_add_pre_text(register_rx+" = ");
		data_commmand_rx = false;
	}
	
	if(end_pkt == true)
	{
		start_pkt = true;
		pkt_end();
		end_pkt = false;
	}
}

function payload_packet()
{
	var data = "";
	var l,p,x;
	var ligne = 0;

	pkt_add_item(-1,-1,"Payload",tab_data[0]+"  "+tab_data[1]+"  "+tab_data[2]+" . . .",PKT_COLOR_DATA_MOSI,PKT_COLOR_DATA_MISO,true); //faire une diff�rence entre le rx et tx
	
	if (plength % 4)
	{
		x = Math.floor(plength/4)+1;
	}
	else
	{
		x = plength/4;
	}
	
	for (p=0; p<x; p++)
	{
		for (l=0; l<4; l++)
		{
			data += tab_data[l+ligne]+" ";
		}
		
		data += " | ";
		
		for (l=0; l<4; l++)
		{
			if((tab_data[l+ligne]>0x1F)&&(tab_data[l+ligne] < 0x7F))
				data += "";
			else
				data += ".";
		}
		
		data += "\n\r";
		
		ligne += 4;
	}

	pkt_start("Payload");
		pkt_add_item(-1,-1,"DATA : ",data,PKT_COLOR_DATA,PKT_COLOR_DATA_PAYLOAD_TITLE,true);
	pkt_end();
}







