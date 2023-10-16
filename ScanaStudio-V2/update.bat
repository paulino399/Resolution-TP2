echo ScanaStudio update script
ping 1.1.1.1 -n 1 -w 2500 > nul
DEL ScanaStudio.exe
RENAME ScanaStudio.exe_ ScanaStudio.exe 
START scanastudio.exe
