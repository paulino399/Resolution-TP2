/*
*************************************************************************************

							SCANASTUDIO 2 DECODER

The following commented block allows some related informations to be displayed online

<DESCRIPTION>

	Consumer Electronics Control (CEC) is an HDMI feature designed to allow the user to command and control up to 15 CEC-enabled devices, that are connected through HDMI.

</DESCRIPTION>

<RELEASE_NOTES>

	V1.0:  Initial release - Decoder, Generator and Example

</RELEASE_NOTES>

<AUTHOR_URL>

	mailto:n.bastit@ikalogic.com

</AUTHOR_URL>

<HELP_URL>



</HELP_URL>

*************************************************************************************
*/

/* The decoder name as it will apear to the users of this script 
*/
function get_dec_name()
{
	return "HDMI-CEC";
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
	return "Nicolas BASTIT";
}

/*
*************************************************************************************
							    GLOBAL VARIABLES
*************************************************************************************
*/
var inter_transaction_silence;
var spb;
/*
*************************************************************************************
								   DECODER
*************************************************************************************
*/


/* Graphical user interface for this decoder 
*/
function gui()
{
	ui_clear();	// clean up the User interface before drawing a new one.
		
	ui_add_ch_selector( "ch", "Channel to decode", "HDMI-CEC" );
}

function decode()
{
	var m; 					// margin between blocks
	var t;					// navigator througt trnasition
	var t_sample;			// actual sample of the transition
	var t_next_sample;		// next transition sample
	var test_start=false;	// =true if start bit is detected, if frame isn't completed, =false
	var EOM=false;			// =true if all the message is completed
	var data_b;				// contain the data of a byte
	var data_start_sample;	// first sample of the data_b
	var i=0;				
	var first_byte=false;	// use to detect the initiator and follower addresses
						
	get_ui_vals();                // Update the content of user interface variables

	var PKT_COLOR_DATA         = get_ch_light_color(ch);
	var PKT_COLOR_DATA_TITLE   = dark_colors.gray;
	var PKT_COLOR_START_TITLE  = dark_colors.blue;
	var PKT_COLOR_EOM_TITLE = dark_colors.orange;
	var PKT_COLOR_ACK_TITLE   = dark_colors.green;
	
	clear_dec_items();            // Clears all the the decoder items and its content
	
	t = trs_get_first(ch);
	
	baud=416;
	
	spb = sample_rate / baud; 		// calculate the number of Samples Per Bit.
	m = spb / 10; 					// margin = 1 tenth of a bit time (expressed in number of samples)
	
	while (trs_is_not_last(ch))		//run through all the samples and decode
	{
		if (abort_requested() == true)
		{
			pkt_end();
			return false;
		}
		test_start=false;
				
		while(!test_start)			// search for a start bit
		{
			if (t.val!=FALLING)
			{
				t = get_next_falling_edge (ch, t); 		// search start falling edge
			}
			t_sample=t.sample;
			
			if (t == false)
			{
				return;
			}
	
			if (trs_is_not_last(ch) == false)
			{
				break;
			}
			
			t = get_next_rising_edge(ch, t);
			t_next_sample = t.sample;
			
			if( ( (t_next_sample - t_sample) < spb*37.2/24 ) && ( (t_next_sample - t_sample) > spb*36.8/24 ) ) 	//is this bit a start bit ?
			{
				t = get_next_falling_edge(ch, t);
				t_next_sample = t.sample;
				if ( ( (t_next_sample - t_sample) < spb*45.2/24 ) && ( (t_next_sample - t_sample) > spb*44.8/24 ) )
				{
					test_start=true;
					first_byte=true;
					//debug("test true");
					pkt_start("HDMI-CEC (CH " + (ch+1) + ")");
					dec_item_new(ch, t_sample +m,t.sample -m); 		// add the start bit item
					dec_item_add_pre_text("Start");	
					dec_item_add_pre_text("S");
					dec_item_add_comment("Start");
					
					
					pkt_add_item(-1, -1, "START", " ", PKT_COLOR_START_TITLE, PKT_COLOR_DATA, true);
				}
			}
		}		//if no start bit found, reloop
		
		//debug("sortie de boucle",t_sample);
					
		if (trs_is_not_last(ch) == false)
		{
			break;
		}
		
		data_b=0;
		EOM=false;
		i=0;
		while(i<10)		// if start bit found, try to found data bits, EOM bit and ACK bit
		{
			if (t.val!=FALLING)
			{
				t = get_next_falling_edge (ch, t); 
			}
			t_sample=t.sample;
			
			if(i==0)
			{
				data_start_sample=t_sample;
				//debug("rentr?e dans la boucle",t_sample);
			}
			
			if (trs_is_not_last(ch) == false)
			{
				break;
			}
			
			t = get_next_rising_edge(ch, t);
			t_next_sample = t.sample;
			
			if(i<9)		//searching for a data or EOM bit
			{
				if (t_next_sample - t_sample > spb/2)
				{
					if( ( (t_next_sample - t_sample) < spb*17/24 ) && ( (t_next_sample - t_sample) > spb*13/24 ) ) 	
					{
						t = get_next_falling_edge(ch, t);
						t_next_sample = t.sample;
						if ( ( (t_next_sample - t_sample) < spb*27.5/24 ) && ( (t_next_sample - t_sample) > spb*20.5/24 ) ) //bit = 1
						{
							if(i<8)	//	is it a data bit ?
							{
								data_b=data_b*2;
							}
							if(i==8) // is it EOM bit ?
							{
								EOM=false;
								dec_item_new(ch, t_sample+m,t_next_sample-m); 		
								dec_item_add_pre_text("Not End Of Message");	
								dec_item_add_pre_text("EOM = 0");
								dec_item_add_pre_text("!EOM");
								dec_item_add_pre_text("!E");
								dec_item_add_comment("!E");
								pkt_add_item(-1, -1, "EOM", "no EOM", PKT_COLOR_EOM_TITLE, PKT_COLOR_DATA, true);
							}
						}
						else
							i=100;
					}
					else
						i=100;
				}
				else
				{
					if( ( (t_next_sample - t_sample) < spb*8/24 ) && ( (t_next_sample - t_sample) > spb*4/24 ) ) 	
					{
						t = get_next_falling_edge(ch, t);
						t_next_sample = t.sample;
						if ( ( (t_next_sample - t_sample) < spb*27.5/24 ) && ( (t_next_sample - t_sample) > spb*20.5/24 ) ) //bit = 1
						{
							if(i<8) // is it data bit ?
							{
								data_b=data_b*2 +1;
							}
							if(i==8) // is it EOM bit ?
							{
								EOM=true;
								dec_item_new(ch, t_sample +m,t_next_sample-m); 		
								dec_item_add_pre_text("End Of Message");	
								dec_item_add_pre_text("EOM = 1");
								dec_item_add_pre_text("EOM");
								dec_item_add_pre_text("E");
								dec_item_add_comment("E");
								pkt_add_item(-1, -1, "EOM", "End of Message", PKT_COLOR_EOM_TITLE, PKT_COLOR_DATA, true);
							}
						}
						else
							i=100;
					}
					else
						i=100;
				}
			}
			
			if(i==7) //	all data are completely sent, show packet decoder on the screen
			{
				hex_add_byte(ch, -1, -1, data_b);
				if(first_byte)	//data_b is @init and @folo
				{
					dec_item_new(ch, data_start_sample+m,(data_start_sample+t_next_sample)/2 -m); 		
					decode_address((data_b & 0xf0)>>4);
				
					if((data_b&0x0F)!=0x0F)
					{
						dec_item_new(ch, (data_start_sample+t_next_sample)/2 +m, t_next_sample-m); 		
						decode_address(data_b&0x0F);
					}
					else
					{
						dec_item_new(ch, (data_start_sample+t_next_sample)/2 +m, t_next_sample-m); 		
						dec_item_add_pre_text("Broadcast");			
						dec_item_add_pre_text("Broad");		
						dec_item_add_pre_text("@All");
						dec_item_add_pre_text((data_b&0x0F).toString(16).toUpperCase())
						pkt_add_item(-1, -1, "FOLLOWER", "Broadcast " + (data_b&0x0F).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					}
					first_byte=false;
				}
				else	//data_b is data
				{
					dec_item_new(ch, data_start_sample+m,t_next_sample-m); 		
					dec_item_add_pre_text("Data " + int_to_str_hex(data_b) + " = '" + String.fromCharCode(data_b) + "'");	
					dec_item_add_pre_text(int_to_str_hex(data_b) + " = '" + String.fromCharCode(data_b) + "'");	
					dec_item_add_pre_text(int_to_str_hex(data_b) + " '" + String.fromCharCode(data_b) + "'");	
					dec_item_add_pre_text(int_to_str_hex(data_b));
					dec_item_add_pre_text("'" + String.fromCharCode(data_b) + "'");
					pkt_add_item(-1, -1, "DATA", int_to_str_hex(data_b) + " '" + String.fromCharCode(data_b) + "'", PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
				}
			}
			if(i==9)	//find ACK bit ?
			{
				if ( ( (t_next_sample - t_sample) < spb*8/24 ) && ( (t_next_sample - t_sample) > spb*4/24 ) )
				{
					dec_item_new(ch, t_sample+m,t_sample+spb-m); 		
					dec_item_add_pre_text("No Acknowledge");	
					dec_item_add_pre_text("No ACK");	
					dec_item_add_pre_text("NACK");	
					dec_item_add_pre_text("!ACK");
					dec_item_add_pre_text("!");	
					pkt_add_item(-1, -1, "ACK", "NoAck", PKT_COLOR_ACK_TITLE, PKT_COLOR_DATA, true);
				}
				else
				{
					dec_item_new(ch, t_sample+m,t_sample+spb-m); 		
					dec_item_add_pre_text("Acknowledge");	
					dec_item_add_pre_text("ACK");	
					dec_item_add_pre_text("A");
					pkt_add_item(-1, -1, "ACK", "Ack", PKT_COLOR_ACK_TITLE, PKT_COLOR_DATA, true);
				}
			}
			
			i++;
			if(i==10 && !EOM) // if no EOM, reloop
			{
				i=0;
				data_b=0;
			}
		}
		pkt_end();//end of frame, reloop to find other message beginning with a start bit
	}
}


/*
*************************************************************************************
							     Signal Generator
*************************************************************************************
*/

function generator_template()
{
	/*
		Configuration part : !! Configure this part !!
		(Do not change variables names)
	*/
	
	ch = 0; 				// The channel on wich signal are genrated
	baud = 1/0.0024;		// The baudrate of the communication (usualy 416bps)
	var initiator =	0x2;	//	@ of the sender (4bits)
	var follower =	0xA;	//	@ of the receiver (4bits) (0xF to broadcast)
	var data_str =	"Hey";		//	data transmitted
	
	inter_transaction_silence = 0.5;	//time in ?s spend between two packet of the frame
	
	/*#################### DO NOT CHANGE CODE UNDER THIS LINE ####################*/
	spb=get_sample_rate()/baud;
	
	start_bit();
	var header=initiator*16+follower;
	data_str = String.fromCharCode(header) + data_str;
	write_str(data_str);
	standby(3);
}


/*
*************************************************************************************
							     DEMO BUILDER
*************************************************************************************
*/

/*
*/
function build_demo_signals()
{
	
	ch = 0; 				// The channel on wich signal are genrated
	baud = 1/0.0024;		// The baudrate of the communication (usualy 416bps)
	var initiator =	0x2;	//	@ of the sender (4bits)
	var follower =	0xA;	//	@ of the receiver (4bits) (0xF to broadcast)
	var data_str =	"Hey";		//	data transmitted
	
	inter_transaction_silence = 0.5;	//time in bit spend between two packet of the frame
	
	spb=get_sample_rate()/baud;
	
	start_bit();
	var header=initiator*16+follower;
	data_str = String.fromCharCode(header) + data_str;
	write_str(data_str);
	standby(3);
} 


/*
*************************************************************************************
							       TRIGGER
*************************************************************************************
*/
var smpl_rate;
/* Graphical user interface for the trigger configuration
*/
function trig_gui()
{
	trig_ui_clear();
	
	trig_ui_add_alternative("alt_start", "Trigger on any frame", true);
		trig_ui_add_label("lab0", "Trigger on any frame. In other words, this alternative will trigger on any start sequence");
		
	trig_ui_add_alternative("alt_initiator", "Trigger on Initiator address", false);
		trig_ui_add_combo("trig_initiator","Initiator address: ")
			trig_ui_add_item_to_combo( "TV (0x0)", true);
			trig_ui_add_item_to_combo( "Recording Device 1 (0x1)" );
			trig_ui_add_item_to_combo( "Recording Device 2 (0x2)" );
			trig_ui_add_item_to_combo( "Tuner 1 (0x3)" );
			trig_ui_add_item_to_combo( "Playback Device 1 (0x4)" );
			trig_ui_add_item_to_combo( "Audio System (0x5)" );
			trig_ui_add_item_to_combo( "Tuner 2 (0x6)" );
			trig_ui_add_item_to_combo( "Tuner 3 (0x7)" );
			trig_ui_add_item_to_combo( "Playback Device 2 (0x8)" );
			trig_ui_add_item_to_combo( "Recording Device 3 (0x9)" );
			trig_ui_add_item_to_combo( "Tuner 4 (0xA)" );
			trig_ui_add_item_to_combo( "Playback Device 3 (0xB)" );
			
	trig_ui_add_alternative("alt_follower", "Trigger on Initiator and Follower address", false);
		trig_ui_add_combo("trig_initiator","Initiator address: ")
			trig_ui_add_item_to_combo( "TV (0x0)", true);
			trig_ui_add_item_to_combo( "Recording Device 1 (0x1)" );
			trig_ui_add_item_to_combo( "Recording Device 2 (0x2)" );
			trig_ui_add_item_to_combo( "Tuner 1 (0x3)" );
			trig_ui_add_item_to_combo( "Playback Device 1 (0x4)" );
			trig_ui_add_item_to_combo( "Audio System (0x5)" );
			trig_ui_add_item_to_combo( "Tuner 2 (0x6)" );
			trig_ui_add_item_to_combo( "Tuner 3 (0x7)" );
			trig_ui_add_item_to_combo( "Playback Device 2 (0x8)" );
			trig_ui_add_item_to_combo( "Recording Device 3 (0x9)" );
			trig_ui_add_item_to_combo( "Tuner 4 (0xA)" );
			trig_ui_add_item_to_combo( "Playback Device 3 (0xB)" );
		trig_ui_add_combo("trig_follower","Follower address: ")
			trig_ui_add_item_to_combo( "TV (0x0)", true);
			trig_ui_add_item_to_combo( "Recording Device 1 (0x1)" );
			trig_ui_add_item_to_combo( "Recording Device 2 (0x2)" );
			trig_ui_add_item_to_combo( "Tuner 1 (0x3)" );
			trig_ui_add_item_to_combo( "Playback Device 1 (0x4)" );
			trig_ui_add_item_to_combo( "Audio System (0x5)" );
			trig_ui_add_item_to_combo( "Tuner 2 (0x6)" );
			trig_ui_add_item_to_combo( "Tuner 3 (0x7)" );
			trig_ui_add_item_to_combo( "Playback Device 2 (0x8)" );
			trig_ui_add_item_to_combo( "Recording Device 3 (0x9)" );
			trig_ui_add_item_to_combo( "Tuner 4 (0xA)" );
			trig_ui_add_item_to_combo( "Playback Device 3 (0xB)" );
}

/*
*/
function trig_seq_gen()
{
	var i=0;
	
	flexitrig_clear();
	get_ui_vals();
	smpl_rate = get_sample_rate();
	
	if (alt_start == true)
		build_trig_bit_start();
	
	if (alt_initiator == true)
	{
		build_trig_bit_start();
		for (i=3;i>=0;i++)
		{
			if ((trig_initiator>>i)&0x1)
				build_trig_bit_1();
			else
				build_trig_bit_0();
		}
	}
	if (alt_follower == true)
	{
		build_trig_bit_start();
		for (i=3;i>=0;i++)
		{
			if ((trig_initiator>>i)&0x1)
				build_trig_bit_1();
			else
				build_trig_bit_0();
		}
		for (i=3;i>=0;i++)
		{
			if ((trig_follower>>i)&0x1)
				build_trig_bit_1();
			else
				build_trig_bit_0();
		}
	}
}

function build_trig_bit_start()
{
	var step = "";
	var i;
	for (i = 0; i < get_device_max_channels(); i++)
	{	
		if (i == ch)
		{
			step = "F" + step;
		}
		else
		{
			step = "X" + step;
		}	
	}
	flexitrig_append(step,-1,-1);
	
	step = "";
	for (i = 0; i < get_device_max_channels(); i++)
	{	
		if (i == ch)
		{
			step = "R" + step;
		}
		else
		{
			step = "X" + step;
		}	
	}
	flexitrig_append(step,0.0035*smpl_rate,0.0039*smpl_rate);
	
	step = "";
	for (i = 0; i < get_device_max_channels(); i++)
	{	
		if (i == ch)
		{
			step = "F" + step;
		}
		else
		{
			step = "X" + step;
		}	
	}
	flexitrig_append(step,0.0004*smpl_rate,0.0012*smpl_rate);
}

function build_trig_bit_1()
{
	var step = "";
	var i;
	
	for (i = 0; i < get_device_max_channels(); i++)
	{	
		if (i == ch)
		{
			step = "R" + step;
		}
		else
		{
			step = "X" + step;
		}	
	}
	flexitrig_append(step,0.0004*smpl_rate,0.0008*smpl_rate);
	
	step = "";
	for (i = 0; i < get_device_max_channels(); i++)
	{	
		if (i == ch)
		{
			step = "F" + step;
		}
		else
		{
			step = "X" + step;
		}	
	}
	flexitrig_append(step,0.0009*smpl_rate,0.00235*smpl_rate);
}

function build_trig_bit_0()
{
	var step = "";
	var i;
	
	for (i = 0; i < get_device_max_channels(); i++)
	{	
		if (i == ch)
		{
			step = "R" + step;
		}
		else
		{
			step = "X" + step;
		}	
	}
	flexitrig_append(step,0.0013*smpl_rate,0.0017*smpl_rate);
	
	step = "";
	for (i = 0; i < get_device_max_channels(); i++)
	{	
		if (i == ch)
		{
			step = "F" + step;
		}
		else
		{
			step = "X" + step;
		}	
	}
	flexitrig_append(step,0.00025*smpl_rate,0.00145*smpl_rate);
}

/*
*************************************************************************************
							        UTILS
*************************************************************************************
*/

function standby(b)
{
	add_samples(ch,1,b*spb);
}

function start_bit()
{
	standby(inter_transaction_silence);
	add_samples(ch,0,spb*37/24);
	add_samples(ch,1,spb*8/24);
}

function data_high()
{
	add_samples(ch,0,spb*6/24);
	add_samples(ch,1,spb*18/24);
}

function data_low()
{
	add_samples(ch,0,spb*15/24);
	add_samples(ch,1,spb*9/24);
}

function write_byte(data)
{
	var i=0;
	var bit_t = [];
	
	for(i=7;i>=0;i--)
	{
		bit_t[i]=data % 2;
		data=(data-bit_t[i])/2;
	}
	
	for(i=0;i<8;i++)
	{
		if (bit_t[i]==1)
			data_high();
		else
			data_low();
	}
}

function write_str(str)
{
	var i;
	for(i=0;i<str.length;i++)
	{
		write_byte(str.charCodeAt(i));
		if (i!=str.length-1)
			data_low();		//EOM
		else
			data_high();	//EOM
		data_high();		//ACK
		
		standby(inter_transaction_silence);
	}
}


/* Get next transition with falling edge
*/
function get_next_falling_edge (ch, trStart)
{
	var tr = trStart;
	
	while ((tr.val != FALLING) && (trs_is_not_last(ch) == true))
	{
		tr = trs_get_next(ch);	// Get the next transition
	}

	if (trs_is_not_last(ch) == false) tr = false;

	return tr;
}

/*	Get next transition with rising edge
*/
function get_next_rising_edge (ch, trStart)
{
	var tr = trStart;
	
	while ((tr.val != RISING) && (trs_is_not_last(ch) == true))
	{
		tr = trs_get_next(ch);	// Get the next transition
	}

	if (trs_is_not_last(ch) == false) tr = false;

	return tr;
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

function decode_address (addr)
{
	var PKT_COLOR_DATA         = get_ch_light_color(ch);
	var PKT_COLOR_DATA_TITLE   = dark_colors.gray;
	switch (addr)
	{
		case 0 : 	dec_item_add_pre_text("Televisor 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("TV 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("TV");
					pkt_add_item(-1, -1, "DEVICE", "TV 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 1 : 	dec_item_add_pre_text("Recording Device 1 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Record Dev 1 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Rec Dev 1 0x" + (addr).toString(16).toUpperCase())
					dec_item_add_pre_text("RD1 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("RD1");
					pkt_add_item(-1, -1, "DEVICE", "Recording Device 1 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 2 : 	dec_item_add_pre_text("Recording Device 2 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Record Dev 2 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Rec Dev 2 0x" + (addr).toString(16).toUpperCase())
					dec_item_add_pre_text("RD2 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("RD2");
					pkt_add_item(-1, -1, "DEVICE", "Recording Device 2 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 3 : 	dec_item_add_pre_text("Tuner 1 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Tun 1 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Tun1");
					pkt_add_item(-1, -1, "DEVICE", "Tuner 1 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 4 : 	dec_item_add_pre_text("Playing Device 1 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Play Dev 1 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("PlDv1 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("PD1");
					pkt_add_item(-1, -1, "DEVICE", "Playing Device 1 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 5 : 	dec_item_add_pre_text("Audio System 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Audio Sys 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Aud Sys 0x" + (addr).toString(16).toUpperCase())
					dec_item_add_pre_text("AS 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("AS");
					pkt_add_item(-1, -1, "DEVICE", "Audio System 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 6 : 	dec_item_add_pre_text("Tuner 2 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Tun 2 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Tun2");
					pkt_add_item(-1, -1, "DEVICE", "Tuner 2 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 7 : 	dec_item_add_pre_text("Tuner 3 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Tun 3 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Tun3");
					pkt_add_item(-1, -1, "DEVICE", "Tuner 3 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 8 : 	dec_item_add_pre_text("Playing Device 2 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Play Dev 2 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("PlDv2 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("PD2");
					pkt_add_item(-1, -1, "DEVICE", "Playing Device 2 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 9 : 	dec_item_add_pre_text("Recording Device 3 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Record Dev 3 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Rec Dev 3 0x" + (addr).toString(16).toUpperCase())
					dec_item_add_pre_text("RD3 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("RD3");
					pkt_add_item(-1, -1, "DEVICE", "Recording Device 3 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 10 : 	dec_item_add_pre_text("Tuner 3 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Tun 3 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("Tun3");
					pkt_add_item(-1, -1, "DEVICE", "Tuner 3 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		case 11 : 	dec_item_add_pre_text("Playing Device 3 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("Play Dev 3 0x" + (addr).toString(16).toUpperCase());		
					dec_item_add_pre_text("PlDv3 0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text("PD3");
					pkt_add_item(-1, -1, "DEVICE", "Playing Device 3 0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
		default :	dec_item_add_pre_text("Address Device 0x" + (addr).toString(16).toUpperCase());			
					dec_item_add_pre_text("@ Device 0x" + (add).toString(16).toUpperCase());		
					dec_item_add_pre_text("@Dev 0x" + (addr).toString(16).toUpperCase())
					dec_item_add_pre_text("@0x" + (addr).toString(16).toUpperCase());
					dec_item_add_pre_text((addr).toString(16).toUpperCase());
					pkt_add_item(-1, -1, "DEVICE", "0x" + (addr).toString(16).toUpperCase(), PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true);
					break;
	}
}




