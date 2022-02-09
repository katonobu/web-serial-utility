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

const serialConnectButton = (()=>{
    let currentPort = undefined;
    return ({
        connectButton,
        getSelectedPort,
        openPort,
        closePort,
        openOption = {
            baudRate: 115200, 
            dataBits: 8,
            parity: "none",
            stopBits: 1,
            flowControl:"none",
        },
    })=>{
        const onOpenUpdate = ()=>{
            connectButton.disabled = false;
            connectButton.textContent = 'Disconnect';
        }
        const onCloseUpdate = ()=>{
            currentPort = undefined;
            connectButton.disabled = false;
            connectButton.textContent = 'Connect';
        }

        connectButton.addEventListener('click', async () => {
            if (currentPort) {
                connectButton.disabled = true;
                connectButton.textContent = 'Disconnecting..';
                closePort()
            } else {
                currentPort = await getSelectedPort();
                if (currentPort) {
                    connectButton.disabled = true;
                    connectButton.textContent = 'Connecting..';
                    openPort(currentPort, openOption);
                }
            }
        });
    
        return {
            onOpenUpdate,
            onCloseUpdate
        };  
    };
})()
