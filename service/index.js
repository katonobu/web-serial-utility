// MIT License
//
// Copyright (c) 2021-2022 Nobuo Kato (katonobu4649@gmail.com)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const term = new Terminal({
    scrollback: 10_000,
});

document.addEventListener('DOMContentLoaded', async () => {

    const {
        openPort,
        closePort,
        sendMessage
    } = webSerialIo({
        onOpen:()=>{
            console.log("OnOpen");
            onOpenUpdate();
        },
        onClose:()=>{
            console.log("OnClose");
            onCloseUpdate()
        },
        onMessage:(msg)=>{
            service(msg);
        },
        onError:(e)=>{console.log("OnError:",e)},
    });

    const {
        service
    } = pseudoSerialService({
        sendMessage:sendMessage, 
        logWrite:(str)=>term.writeln(str),
        lineSeparator:'\r\n'
    });

    // UI
    const terminalElement = document.getElementById('terminal');
    if (terminalElement) {
        term.open(terminalElement);
    }
    
    const portSelector = document.getElementById('ports');
    const {
        getSelectedPort
    } = serialPortSelector({
        portSelector,
        requestPortOption:{filters: [
            {usbVendorId:0x2341, usbProductId:0x8054}, // Arduino MKR WIFI1010
            {usbVendorId:0x0483, usbProductId:0x374B}, // ST-Link
            {usbVendorId:0x0403, usbProductId:0x6001}, // Pmod USBUART
        ]},
    });

    const connectButton = document.getElementById('connect');
    const {
        onOpenUpdate,
        onCloseUpdate
    } = serialConnectButton({
        connectButton,
        getSelectedPort,
        openPort,
        closePort,
        openOption:{
            baudRate: 115200, 
            dataBits: 8,
            parity: "none",
            stopBits: 1,
            flowControl:"none",
        },
    });
 
});
