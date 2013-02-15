@echo off
REM Store the host file in a variable because I'm not typing that 20 times.
set HOSTSFILE=%SYSTEMROOT%\system32\drivers\etc\hosts

echo Click Upon Dots emulator Hosts changer
echo.
echo This file will append a localhost lookup for the flash game's domain to your
echo hosts file. This will allow you to play on the emulator rather than on the 
echo official server.
echo .
echo To remove it, remove the line that mentions jiggmin2.com from
echo   %HOSTSFILE%
echo.
echo This must be run as an administrator for it to work.
echo Press any key to apply the changes, or Ctrl-C to cancel.
pause >nul

REM Well, they accepted. Better do what we said.

REM Write two lines, because append apparently appends to the previous line
REM Rather than appending a new line or something???
echo. >> %HOSTSFILE%
echo. >> %HOSTSFILE%
echo # Click Upon Dots server emulator line >> %HOSTSFILE%
echo # Remove this to connect to official servers >> %HOSTSFILE%
echo 127.0.0.1  jiggmin2.com >> %HOSTSFILE%

REM Flush the DNS resolver cache just incase.
ipconfig /flushdns >nul

echo.
echo.
echo Done.
pause